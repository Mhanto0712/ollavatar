import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

DATABASE_URL = os.getenv("DATABASE_URL")

# 建立資料庫引擎（連接 MariaDB / MySQL）
engine = create_engine(DATABASE_URL)

# 建立 session
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# Base class 用來讓 SQLAlchemy 建立 table 與 ORM model
Base = declarative_base()

# Dependency: 在 FastAPI 中用 Depends(get_db) 拿 session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
