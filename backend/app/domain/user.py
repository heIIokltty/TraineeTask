from pydantic import BaseModel


class User(BaseModel):
    email: str
    name: str
    picture: str | None = None
