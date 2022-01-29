from pydantic import BaseModel


class User(BaseModel):
    first_name: str
    last_name: str
    email: str
    auth_type: str