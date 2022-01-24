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

producer = KafkaProducer(
    bootstrap_servers="kafka:9092",
    api_version=(0, 10, 1),
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    max_block_ms=10000,
)
consumer = KafkaConsumer(
    "crime",
    bootstrap_servers="kafka:9092",
    api_version=(0, 10, 1),
    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    consumer_timeout_ms=1000,
)

try:
    client = MongoClient('mongo-db', 27017)
    db = client.crime_info
    db2 = client.crime_info_test
    collection_name = db["raw_crime_info"]
    collection_name_test = db2["raw_crime_info_test"]
except Exception as e:
    print("Could not connect to MongoDB: {}".format(e))

try:
    # collection_name = db["raw_crime_info"]
    url = "http://localhost:8083/connectors"

    payload = {"name": "mongo-sink2",
               "config": {"connector.class":"com.mongodb.kafka.connect.MongoSinkConnector",
                          "tasks.max":"1",
                          "topics":"crime",
                          "connection.uri":"mongodb://mongo-db:27017",
                          "database":"crime_info_test",
                          "collection":"raw_crime_info_test",
                          "key.converter": "org.apache.kafka.connect.storage.StringConverter",
                          "value.converter": "org.apache.kafka.connect.json.JsonConverter",
                          "value.converter.schemas.enable": "false"
                         }
               }
    headers = {
      'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
except Exception as e:
    print("Could not post request to sink {}".format(e))


@app.post("/crimes")
def report_crime(crime: Crime):
    # status should be later set to open from kafka consumer
    crime = {**crime.dict(), "timestamp": time.time(), "id": str(uuid.uuid4())}
    producer.send("crime", crime)
    producer.flush()
    crimes = []
    inserted = []
    for msg in consumer:
        crimes.append(msg.value)
    #     record = msg.value
    #     crime_id = record['id']
    #     email_id = record['email_id']
    #     lat = record['lat']
    #     long = record['lon']
    #     type = record['type']
    #     timestamp = record['timestamp']
    #     status = "open"
    #     crimes.append(msg.value)
    #     try:
    #         crime_rec = {'crime_id': crime_id, 'email_id': email_id, 'lat': lat,
    #                      'long': long, 'type': type, 'timestamp': timestamp, 'status': status}
    #         inserted.append(json.dumps(crime_rec))
    #         collection_name.insert_one(crime_rec)
    #     except Exception as e:
    #         # pass
    #         print("Could not insert into MongoDB: {}".format(e))
    return ({"id": crime["id"]}, {"crimes": crimes}, {"inserted": inserted})


@app.get("/crimes")
def get_crimes():
    # crimes = []
    col = db["raw_crime_info"]
    x = col.find({"_id": 0})
    return x


@app.get("/crimes/{crime_id}")
def get_crime(crime_id):
    # col = db["raw_crime_info"]
    return (collection_name.find_one({"crime_id": crime_id}, {"_id": 0}), db.list_collection_names())
