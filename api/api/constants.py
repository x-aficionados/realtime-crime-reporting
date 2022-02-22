import os

JWT_SECRET = open("api/jwt-key.pub").read()
JWT_ALGORITHM = os.environ["JWT_ALGORITHM"]

KAFKA_CRIME_TOPIC = os.environ.get("KAFKA_CRIME_TOPIC")

MONGODB_URL = os.environ.get("MONGODB_URL")
MONGODB_NAME = os.environ.get("MONGODB_NAME")

TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER")
