import json

from kafka import KafkaProducer, KafkaConsumer
from fastapi import FastAPI

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


@app.get("/")
def read_root():
    return {"Hello": "World!"}


@app.post("/crimes")
def report_crime():
    producer.send("crime", {"crime": "Robbery"})
    producer.flush()
    return {"result": "Successfully sent message to Kafka"}


@app.get("/crimes")
def get_crimes():
    crimes = []
    for msg in consumer:
        crimes.append(msg.value)
    return {"crimes": crimes}
