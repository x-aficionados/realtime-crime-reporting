from typing import Optional

import time
import json
import uuid

from kafka import KafkaProducer, KafkaConsumer
from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient
import requests


class Crime(BaseModel):
    type: str
    email_id: str
    lat: float
    lon: float


app = FastAPI()


class Kafka():
    def __init__(self, topic, bootstrap_servers="kafka:9092", consumer_timeout_ms=1000, max_block_ms=10000):
        self.topic = topic
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            api_version=(0, 10, 1),
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            max_block_ms=max_block_ms,
        )

        self.consumer = KafkaConsumer(
            topic,
            bootstrap_servers="kafka:9092",
            api_version=(0, 10, 1),
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
            consumer_timeout_ms=consumer_timeout_ms,
        )

    def send_data_to_kafka(self, topic, data):
        self.producer.send(topic, data)
        self.producer.flush()
        return data

    def consume_data_from_kafka(self):
        crimes = []
        for msg in self.consumer:
            crimes.append(msg.value)
        return crimes


class MongoDB(object):
    def __init__(self, database_name, collection_name, host="mongo-db", port=27017):
        try:
            self.connection = MongoClient(host=host, port=port)
        except Exception as e:
            raise Exception(e)
        self.database = self.connection[database_name]
        self.collection = self.database[collection_name]

    def create_mongo_sink(self, url, headers, payload, method="POST"):
        try:
            requests.request(method, url, headers=headers, data=payload)
        except Exception as e:
            print("Could not post request to sink {}".format(e))

    def add_data_to_mongo(self, post):
        # add/append/new single record
        post_id = self.collection.insert_one(post).inserted_id
        return post_id

    def read_data_from_mongo(self):
        crimes = []
        cursor = self.collection.find({}, {"_id": 0})
        for record in cursor:
            crimes.append(record)
        return crimes

    def read_single_data_from_mongo(self, params):
        return self.collection.find_one(params, {"_id": 0})


topic = "crime"
kafka_obj = Kafka(topic)
mongo_obj = MongoDB(database_name="crime_info", collection_name="raw_crime_info")
url = "http://connect:8083/connectors"

payload="\n  {\"name\": \"mongo-sink\",\n   \"config\": {\n     \"connector.class\":\"com.mongodb.kafka.connect.MongoSinkConnector\",\n     \"tasks.max\":\"1\",\n     \"topics\":\"crime\",\n     \"connection.uri\":\"mongodb://mongo-db:27017\",\n     \"database\":\"crime_info\",\n     \"collection\":\"raw_crime_info\",\n     \"key.converter\": \"org.apache.kafka.connect.storage.StringConverter\",\n     \"value.converter\": \"org.apache.kafka.connect.json.JsonConverter\",\n     \"value.converter.schemas.enable\": \"false\"\n}}"
headers = {
  'Content-Type': 'application/json'
}
mongo_obj.create_mongo_sink(url, payload, headers)


@app.post("/crimes")
def report_crime(crime: Crime):
    # status should be later set to open from kafka consumer
    crime = {**crime.dict(), "timestamp": time.time(), "crime_id": str(uuid.uuid4()), "status": "open"}
    post_data = kafka_obj.send_data_to_kafka(topic, crime)
    return post_data


@app.get("/crimes")
def get_crimes():
    return mongo_obj.read_data_from_mongo()


@app.get("/crimes/{crime_id}")
def get_crimes(crime_id):
    return mongo_obj.read_single_data_from_mongo({"crime_id": crime_id})
