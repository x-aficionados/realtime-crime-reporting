import time
import json
import uuid

from kafka import KafkaProducer, KafkaConsumer
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
import requests

from .dependency import JWTBearer
from .constants import KAFKA_CRIME_TOPIC, MONGODB_NAME, MONGODB_URL


class Crime(BaseModel):
    type: str
    lat: float
    lon: float


app = FastAPI()


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


class MongoDB(object):
    def __init__(self, collection_name):
        self.client = AsyncIOMotorClient(MONGODB_URL)
        self.db = self.client[MONGODB_NAME]
        self.collection = self.db[collection_name]

    @staticmethod
    def create_mongo_sink():
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

    def add_data_to_mongo(self, post):
        # add/append/new single record
        self.collection.insert_one(post)

    async def get_crimes_for_user(self, user_id):
        # TODO: add support for pagination
        crimes = []
        cursor = self.collection.find({"user_id": user_id}, {"_id": 0, "user_id": 0})
        for record in await cursor.to_list(length=100):
            crimes.append(record)
        return crimes

    async def get_crime_for_user(self, crime_id, user_id):
        return await self.collection.find_one(
            {"_id": crime_id, "user_id": user_id},
            {"_id": 0, "user_id": 0, "crime_id": 0},
        )

    def close(self):
        self.client.close()


@app.on_event("startup")
async def startup_kafka_db_clients():
    app.kafka_client = Kafka(KAFKA_CRIME_TOPIC)
    app.mongo_client = MongoDB(collection_name="raw_crime_info")

    app.mongo_client.create_mongo_sink()


@app.on_event("shutdown")
async def shutdown_kafka_db_clients():
    app.mongo_client.close()


@app.post("/crimes")
async def report_crime(crime: Crime, user_id: str = Depends(JWTBearer())):
    # status should be later set to open from kafka consumer
    crime = {
        **crime.dict(),
        "created_at": int(time.time()),
        "status": "open",
        "user_id": user_id,
    }
    crime["_id"] = crime["crime_id"] = str(uuid.uuid4())

    app.kafka_client.send_data_to_kafka(crime)

    return {"id": crime["_id"]}


# TODO: add full access for admin role
@app.get("/crimes")
async def get_crimes(user_id: str = Depends(JWTBearer())):
    return await app.mongo_client.get_crimes_for_user(user_id)


@app.get("/crimes/{crime_id}")
async def get_crime_by_id(crime_id, user_id: str = Depends(JWTBearer())):
    return await app.mongo_client.get_crime_for_user(crime_id, user_id)
