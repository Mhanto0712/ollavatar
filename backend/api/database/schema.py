from pydantic import BaseModel,ConfigDict
from datetime import datetime
import enum

class SenderEnum(str, enum.Enum):
    user = "user"
    ai = "ai"

# -------- User --------
class UserSignUp(BaseModel):
    username: str
    password: str

class UserLogIn(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    username: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# -------- Message --------
class MessageCreate(BaseModel):
    sender: SenderEnum
    content: str

class MessageResponse(BaseModel):
    sender: SenderEnum
    content: str
    created_at: datetime

class PromptResponse(BaseModel):
    sender: SenderEnum
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
