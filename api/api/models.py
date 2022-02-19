from typing import List
from pydantic import BaseModel


class Crime(BaseModel):
    type: str
    lat: float
    lon: float
    city: str
    state: str
    country: str
    pincode: str
    description: str


class CloseContact(BaseModel):
    first_name: str
    last_name: str
    contact_no: int


class User(BaseModel):
    email: str
    first_name: str
    last_name: str
    contact_no: int
    address: str
    close_contacts: List[CloseContact]
