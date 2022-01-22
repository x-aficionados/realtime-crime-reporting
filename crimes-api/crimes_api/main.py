from typing import Optional

import time
import json
import uuid

from kafka import KafkaProducer, KafkaConsumer
from fastapi import FastAPI, Header, HTTPException
from starlette.status import HTTP_401_UNAUTHORIZED
from pydantic import BaseModel

from .dependency import is_validate_google_id_token
from .constants import CLIENT_ID


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
    for msg in consumer:
        crimes.append(msg.value)
    return {"crimes": crimes}


@app.post("/auth/google/callback")
def auth_google_callback(authorization: Optional[str] = Header(None)):
    if is_validate_google_id_token(authorization):
        return {"message": "Login successful"}
    else:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
