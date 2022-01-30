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
    email_id: str
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
        # result = future.get(timeout=10)
        return data

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
        print(MONGODB_NAME)
        self.db = self.client[MONGODB_NAME]
        self.collection = self.db[collection_name]

    def create_mongo_sink(self, url, headers, payload, method="PUT"):
        try:
            requests.request(method, url, headers=headers, data=json.dumps(payload))
        except Exception as e:
            import traceback

            print("Could not post request to sink {}".format(traceback.format_exc(e)))

    def add_data_to_mongo(self, post):
        # add/append/new single record
        self.collection.insert_one(post)

    async def read_data_from_mongo(self):
        crimes = []
        cursor = self.collection.find({}, {"_id": 0})
        for record in await cursor.to_list(length=100):
            crimes.append(record)
        return crimes

    async def read_single_data_from_mongo(self, params):
        return await self.collection.find_one(params)

    def close(self):
        self.client.close()


@app.on_event("startup")
async def startup_kafka_db_clients():
    app.kafka_client = Kafka(KAFKA_CRIME_TOPIC)
    app.mongo_client = MongoDB(collection_name="raw_crime_info")

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
    app.mongo_client.create_mongo_sink(url, headers, payload)


@app.on_event("shutdown")
async def shutdown_kafka_db_clients():
    app.mongo_client.close()


@app.post("/crimes", dependencies=[Depends(JWTBearer())])
async def report_crime(crime: Crime):
    # status should be later set to open from kafka consumer
    crime = {
        **crime.dict(),
        "timestamp": time.time(),
        "crime_id": str(uuid.uuid4()),
        "status": "open",
    }
    crime["_id"] = crime["crime_id"]
    post_data = {}
    mongo_crime = await app.mongo_client.read_single_data_from_mongo(
        {"_id": crime["crime_id"]}
    )
    print(mongo_crime)
    if mongo_crime is None:
        print("posting to kafka")
        post_data = app.kafka_client.send_data_to_kafka(crime)
    else:
        print("already exists")
        post_pata = {crime["crime_id"]: "Key already exists"}
    return post_data


@app.get("/crimes", dependencies=[Depends(JWTBearer())])
async def get_crimes():
    return await app.mongo_client.read_data_from_mongo()


@app.get("/crimes/{crime_id}", dependencies=[Depends(JWTBearer())])
async def get_crimes(crime_id):
    return await app.mongo_client.read_single_data_from_mongo({"_id": crime_id})
