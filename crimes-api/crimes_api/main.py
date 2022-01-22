from typing import Optional

import time
import json
import uuid

from kafka import KafkaProducer, KafkaConsumer
from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient


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
except Exception as e:
    print("Could not connect to MongoDB: {}".format(e))


@app.post("/crimes")
def report_crime(crime: Crime):
    # status should be later set to open from kafka consumer
    crime = {**crime.dict(), "timestamp": time.time(), "id": str(uuid.uuid4())}
    producer.send("crime", crime)
    producer.flush()
    return {"id": crime["id"]}


@app.get("/crimes")
def get_crimes():
    crimes = []
    inserted = []
    for msg in consumer:
        crimes.append(msg.value)
        record = msg.value
        crime_id = record['id']
        email_id = record['email_id']
        lat = record['lat']
        long = record['lon']
        type = record['type']
        timestamp = record['timestamp']
        status = "open"
        crimes.append(msg.value)
        try:
            crime_rec = {'crime_id': crime_id, 'email_id': email_id, 'lat': lat,
                         'long': long, 'type': type, 'timestamp': timestamp, 'status': status}
            inserted.append(json.dumps(crime_rec))
            collection_name = db["raw_crime_info"]
            collection_name.insert_one(crime_rec)
        except Exception as e:
            # pass
            print("Could not insert into MongoDB: {}".format(e))
    return ({"crimes": crimes},{"inserted": inserted})