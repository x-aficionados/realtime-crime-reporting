import uuid
import jwt

from typing import Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, Header, Response, Body, Cookie, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from starlette.status import (
    HTTP_401_UNAUTHORIZED,
    HTTP_400_BAD_REQUEST,
)
from motor.motor_asyncio import AsyncIOMotorClient
from google.oauth2 import id_token
from google.auth.transport import requests
from passlib.context import CryptContext

from .models import Auth, NewUser
from .constants import (
    GAUTH_CLIENT_ID,
    JWT_REFRESH_EXP_DELTA_SECONDS,
    JWT_REFRESH_PUBLIC,
    JWT_REFRESH_SECRET,
    JWT_SECRET,
    JWT_ALGORITHM,
    JWT_EXP_DELTA_SECONDS,
    MONGODB_URL,
    MONGODB_NAME,
)

app = FastAPI()
security = HTTPBasic()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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


@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(MONGODB_URL)
    app.mongodb = app.mongodb_client[MONGODB_NAME]


@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


async def produce_jwt_token(user_id: str):

    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(seconds=JWT_EXP_DELTA_SECONDS),
    }
    jwt_token = jwt.encode(payload, JWT_SECRET, JWT_ALGORITHM)

    payload.update(
        {"exp": datetime.utcnow() + timedelta(seconds=JWT_REFRESH_EXP_DELTA_SECONDS)}
    )
    jwt_refresh_token = jwt.encode(payload, JWT_REFRESH_SECRET, JWT_ALGORITHM)
    return jwt_token, jwt_refresh_token


@app.post("/login")
async def login(
    response: Response, credentials: HTTPBasicCredentials = Depends(security)
):
    user_in_db = await app.mongodb.users.find_one(
        {"email": credentials.username, "auth_type": "local"}
    )
    if not user_in_db or not verify_password(
        credentials.password, user_in_db["hashed_password"]
    ):
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    access_token, refresh_token = await produce_jwt_token(user_in_db["_id"])
    response.set_cookie(
        key="jref",
        value=refresh_token,
        expires=JWT_REFRESH_EXP_DELTA_SECONDS,
        httponly=True,
        samesite="strict",
    )
    return {"access_token": access_token}


@app.post("/oauth/callback")
async def auth_google_callback(
    response: Response, authorization: str = Header(None), auth: Auth = Body(...)
):
    try:
        if auth.auth_type != "google":
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST, detail="Invalid auth type."
            )
        idinfo = id_token.verify_oauth2_token(
            authorization, requests.Request(), GAUTH_CLIENT_ID, clock_skew_in_seconds=20
        )
    except ValueError:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )
    else:
        # ID token is valid. Get the user's Google Account ID from the decoded token.
        user_id = idinfo["sub"]
        user_data = {
            "email": idinfo["email"],
            "first_name": idinfo["given_name"],
            "last_name": idinfo["family_name"],
            "auth_type": auth.auth_type,
        }

        # Check if user exists in database
        user_in_db = await app.mongodb.users.find_one(user_id)
        if user_in_db is None:
            # Create new user
            await app.mongodb.users.insert_one({**user_data, "_id": user_id})
        else:
            # Update user
            await app.mongodb.users.update_one({"_id": user_id}, {"$set": user_data})

        access_token, refresh_token = await produce_jwt_token(user_id)
        response.set_cookie(
            key="jref",
            value=refresh_token,
            expires=JWT_REFRESH_EXP_DELTA_SECONDS,
            httponly=True,
            samesite="strict",
        )
        return {"access_token": access_token}


@app.post("/signup")
async def signup(
    response: Response,
    credentials: NewUser = Body(...),
):
    if not all(
        [
            credentials.password,
            credentials.email,
            credentials.first_name,
            credentials.last_name,
        ]
    ):
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST, detail="Field values cannot be empty."
        )
    user_in_db = await app.mongodb.users.find_one({"email": credentials.email})
    if user_in_db:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST, detail="User already exists."
        )
    user_id = uuid.uuid4().hex
    user_data = {
        "email": credentials.email,
        "first_name": credentials.first_name,
        "last_name": credentials.last_name,
        "hashed_password": get_password_hash(credentials.password),
        "auth_type": "local",
    }
    await app.mongodb.users.insert_one({**user_data, "_id": user_id})
    access_token, refresh_token = await produce_jwt_token(user_id)
    response.set_cookie(
        key="jref",
        value=refresh_token,
        expires=JWT_REFRESH_EXP_DELTA_SECONDS,
        httponly=True,
        samesite="strict",
    )
    return {"access_token": access_token}


@app.post("/refresh_token")
async def refresh_token(jref: Optional[str] = Cookie(None)):
    if jref:
        try:
            payload = jwt.decode(jref, JWT_REFRESH_PUBLIC, algorithms=[JWT_ALGORITHM])
        except (jwt.DecodeError, jwt.ExpiredSignatureError):
            raise HTTPException(
                status_code=HTTP_400_BAD_REQUEST, detail="Invalid refresh token"
            )
    else:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Login required")

    payload = {
        "user_id": payload["user_id"],
        "exp": datetime.utcnow() + timedelta(seconds=JWT_EXP_DELTA_SECONDS),
    }
    jwt_token = jwt.encode(payload, JWT_SECRET, JWT_ALGORITHM)
    return {"access_token": jwt_token}
