import time
import json
import uuid

import requests

from kafka import KafkaProducer, KafkaConsumer
from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

from .dependency import JWTBearer
from .constants import (
    KAFKA_CRIME_TOPIC,
    MONGODB_NAME,
    MONGODB_URL,
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
)
from .models import Crime, User

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:19006",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Kafka:
    def __init__(
        self,
        topic,
        bootstrap_servers="kafka:9092",
        consumer_timeout_ms=1000,
        max_block_ms=10000,
    ):
        self.topic = topic
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            api_version=(1, 0, 0),
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            max_block_ms=max_block_ms,
        )

        self.consumer = KafkaConsumer(
            topic,
            bootstrap_servers="kafka:9092",
            api_version=(1, 0, 0),
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
            consumer_timeout_ms=consumer_timeout_ms,
        )

    def send_data_to_kafka(self, data):
        future = self.producer.send(self.topic, data)
        result = future.get(timeout=10)
        return result

    def consume_data_from_kafka(self):
        crimes = []
        for msg in self.consumer:
            crimes.append(msg.value)
        return crimes

    def close(self):
        self.consumer.close()
        self.producer.close()


@app.on_event("startup")
async def startup_kafka_db_clients():
    app.kafka_client = Kafka(KAFKA_CRIME_TOPIC)
    app.mongodb_client = AsyncIOMotorClient(MONGODB_URL)
    app.mongodb = app.mongodb_client[MONGODB_NAME]
    app.twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    # register mongo-sink connector to kafka-connect
    url = "http://mongo-connect:8083/connectors/mongo-sink/config"
    payload = {
        "connector.class": "com.mongodb.kafka.connect.MongoSinkConnector",
        "tasks.max": "1",
        "topics": KAFKA_CRIME_TOPIC,
        "connection.uri": MONGODB_URL,
        "database": MONGODB_NAME,
        "collection": "raw_crime_info",
        "key.converter": "org.apache.kafka.connect.storage.StringConverter",
        "value.converter": "org.apache.kafka.connect.json.JsonConverter",
        "value.converter.schemas.enable": "false",
    }
    headers = {"Content-Type": "application/json"}

    try:
        requests.request("PUT", url, headers=headers, data=json.dumps(payload))
    except Exception as e:
        import traceback

        print("Could not post request to sink {}".format(traceback.format_exc(e)))


@app.on_event("shutdown")
async def shutdown_kafka_db_clients():
    app.mongodb_client.close()
    app.kafka_client.close()


async def alert_contacts(user_id, crime_info):
    user_info = await app.mongodb.users.find_one(
        user_id, {"_id": 0, "hashed_password": 0, "auth_type": 0}
    )
    close_contacts = user_info.get("close_contacts", [])

    def send_sms(to_number, body):
        print("sending message to {}".format(to_number))
        return app.twilio_client.messages.create(
            from_=TWILIO_PHONE_NUMBER, to=to_number, body=body
        )

    for contact in close_contacts:
        if contact.get("contact_no"):
            # validate phone number
            # ref: https://www.twilio.com/blog/validate-phone-number-input
            try:
                app.twilio_client.lookups.v1.phone_numbers("+15108675310").fetch()
                send_sms(contact["contact_no"], json.dumps(crime_info, indent=2))
            except TwilioRestException as e:
                print("Invalid phone number: {}".format(contact.get("contact_no")))
                print("Response: {}".format(e))


################# Crimes #######################


@app.post("/crimes")
async def report_crime(
    crime: Crime, background_tasks: BackgroundTasks, user_id: str = Depends(JWTBearer())
):
    # status should be later set to open from kafka consumer
    crime = {
        **crime.dict(),
        "created_at": int(time.time()),
        "status": "open",
        "user_id": user_id,
    }
    crime["_id"] = crime["crime_id"] = uuid.uuid4().hex

    app.kafka_client.send_data_to_kafka(crime)

    background_tasks.add_task(alert_contacts, user_id, crime)
    return {"id": crime["_id"]}


# TODO: add full access for admin role
@app.get("/crimes")
async def get_crimes(user_id: str = Depends(JWTBearer())):
    # TODO: add support for pagination
    crimes = []
    cursor = app.mongodb.raw_crime_info.find(
        {"user_id": user_id}, {"_id": 0, "user_id": 0}
    )
    for record in await cursor.to_list(length=100):
        crimes.append(record)
    return crimes


@app.get("/crimes/{crime_id}")
async def get_crime_by_id(crime_id, user_id: str = Depends(JWTBearer())):
    return await app.mongodb.raw_crime_info.find_one(
        {"_id": crime_id, "user_id": user_id},
        {"_id": 0, "user_id": 0, "crime_id": 0},
    )


################# Users #######################


@app.get("/userinfo")
async def get_user(user_id: str = Depends(JWTBearer())):
    return await app.mongodb.users.find_one(
        user_id, {"_id": 0, "hashed_password": 0, "auth_type": 0}
    )


@app.post("/userinfo")
async def add_edit_user(user: User, user_id: str = Depends(JWTBearer())):
    user_data = {**user.dict(), "timestamp": int(time.time())}
    # TODO: verify email address before updating in DB
    res = await app.mongodb.users.update_one({"_id": user_id}, {"$set": user_data})
    if res.modified_count > 0:
        return {"message": "User information updated successfully"}
