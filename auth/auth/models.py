from pydantic import BaseModel


class Auth(BaseModel):
    auth_type: str
