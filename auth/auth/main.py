import jwt

from typing import Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, Header, Response, Body, Cookie, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_400_BAD_REQUEST
from motor.motor_asyncio import AsyncIOMotorClient
from google.oauth2 import id_token
from google.auth.transport import requests

from .models import Auth
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


@app.post("/login")
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

        payload = {
            "user_id": user_id,
            "exp": datetime.utcnow() + timedelta(seconds=JWT_EXP_DELTA_SECONDS),
        }
        jwt_token = jwt.encode(payload, JWT_SECRET, JWT_ALGORITHM)

        payload.update(
            {
                "exp": datetime.utcnow()
                + timedelta(seconds=JWT_REFRESH_EXP_DELTA_SECONDS)
            }
        )
        jwt_refresh_token = jwt.encode(payload, JWT_REFRESH_SECRET, JWT_ALGORITHM)
        response.set_cookie(
            key="jref",
            value=jwt_refresh_token,
            expires=JWT_REFRESH_EXP_DELTA_SECONDS,
            httponly=True,
            samesite="strict",
        )
        return {"access_token": jwt_token}
    except ValueError:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )


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
