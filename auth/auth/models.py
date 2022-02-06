from pydantic import BaseModel


class Auth(BaseModel):
    auth_type: str


class NewUser(BaseModel):
    email: str
    first_name: str
    last_name: str
    password: str
