from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Enum, func
from sqlalchemy.orm import relationship
from database.database import Base
import enum

class SenderEnum(str, enum.Enum):
    user = "user"
    ai = "ai"

class User(Base):
    __tablename__ = "users"  # 對應到你創建的 users table

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), unique=True, nullable=False)  # VARCHAR(150)
    password_hash = Column(String(255), nullable=False)          # VARCHAR(255)
    created_at = Column(DateTime, server_default=func.now())     # TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    # ORM 關聯，一個 user 可以有多個 messages
    messages = relationship("Message", back_populates="user", cascade="all, delete")

class Message(Base):
    __tablename__ = "messages"  # 對應到 messages table

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    sender = Column(Enum(SenderEnum), nullable=False)  # ENUM('user', 'ai')
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # ORM 關聯，多個 messages 屬於同一個 user
    user = relationship("User", back_populates="messages")
