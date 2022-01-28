from typing import Collection, Optional

import time
import json
import uuid

from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient


class User(BaseModel):
    email_id: str
    name: str
    contact_no: int
    address: str
    close_contacts: dict


app = FastAPI()


class MongoDB(object):
    def __init__(self, database_name, collection_name, host="mongo-db", port=27017):
        try:
            self.connection = MongoClient(host=host, port=port)
        except Exception as e:
            raise Exception(e)
        self.database = self.connection[database_name]
        self.collection = self.database[collection_name]

    def add_data_to_mongo(self, post):
        # add/append/new single record
        self.collection.insert_one(post)

    def update_data_in_mongodb(self, id, query, post):
        self.collection.update_one(id, {query: post})

    def read_data_from_mongo(self):
        users = []
        cursor = self.collection.find({}, {"_id": 0})
        for record in cursor:
            users.append(record)
        return users

    def read_single_data_from_mongo(self, params):
        return self.collection.find_one(params, {"_id": 0})


mongo_obj = MongoDB(database_name="user_info", collection_name="all_user_info")


@app.post("/userinfo/{email_id}")
def add_edit_user(user: User, email_id):
    user = {**user.dict(), "timestamp": time.time()}
    # if user exists, update the existing
    if(mongo_obj.read_single_data_from_mongo({"email_id": email_id})):
        str = "Updated existing user with email_id: " + email_id
        mongo_obj.update_data_in_mongodb({"_id": email_id}, "$set", user)
    else:
        # else add new user
        str = "Added new user with email_id: " + email_id
        user["_id"] = email_id
        user["admin"] = False
        mongo_obj.add_data_to_mongo(user)
    return str


@app.get("/users")
def get_users():
    return mongo_obj.read_data_from_mongo()


@app.get("/userinfo/{email_id}")
def get_user(email_id):
    return mongo_obj.read_single_data_from_mongo({"_id": email_id})
