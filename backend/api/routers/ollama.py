import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from ollama import Client
from pydantic import BaseModel, HttpUrl, ValidationError
from database import table
from database.auth import get_current_user
from database.database import get_db
from typing import List, Literal
from sqlalchemy.orm import Session
from urllib.parse import urljoin

router = APIRouter()

# 定義訊息物件
class Message(BaseModel):
    role: Literal['user', 'assistant']
    content: str

# 定義前端傳入的資料結構
class OllamaData(BaseModel):
    model: str
    messages: List[Message]

class OllamaUrl(BaseModel):
    url: str

# Stream response settings
def ollama_streamer(res):
    for chunk in res:
        # print(chunk['message']['content'], end='', flush=True)
        yield chunk['message']['content']

# 驗證使用者提供的 Ollama URL 是否可用
async def verify_ollama_url(url: HttpUrl|None):
    try:
        if not url:
            raise HTTPException(status_code=400, detail="請更新正確的 Ollama URL ！")
        async with httpx.AsyncClient(timeout=5.0) as client:
            headers = {"ngrok-skip-browser-warning": "true"}
            # 這裡用 /api/tags 作為測試
            res = await client.get(urljoin(url, "/api/tags"), headers=headers)
            print(res)
            res.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=400, detail="請更新正確的 Ollama URL ！")

# Ask Ollama
@router.post("/ask")
async def ask_ollama(ollama_data: OllamaData, user_id = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # print(user_id)
        # print(ollama_data)
        db_user = db.query(table.User).filter(table.User.id == user_id).first()
        ollama_url = db_user.ollama_ngrok_url
        await verify_ollama_url(ollama_url)

        client = Client(
            host=ollama_url,
        )

        stream_res = client.chat(
            model=ollama_data.model,
            messages=[msg.model_dump() for msg in ollama_data.messages],
            stream=True,
        )
        return StreamingResponse(ollama_streamer(stream_res), media_type='text/event-stream')
    except HTTPException:  
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"伺服器錯誤：{str(e)}")

# Update Ollama URL
@router.post("/update")
async def update_ollama_url(data: OllamaUrl, user_id=Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # 驗證是否為網址
        valid_url: HttpUrl = data.url

        await verify_ollama_url(data.url)

        db_user = db.query(table.User).filter(table.User.id == user_id).first()
        db_user.ollama_ngrok_url = data.url
        db.commit()
        db.refresh(db_user)
        
        return {"message": "成功連接本地 Ollama ！"}
    except ValidationError:
        raise HTTPException(status_code=422, detail="請輸入網址格式！")
    except HTTPException:  
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"伺服器錯誤：{str(e)}")
    
# Check If Ollama URL
@router.get("/check")
async def check_ollama_url(user_id=Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        db_user = db.query(table.User).filter(table.User.id == user_id).first()
        await verify_ollama_url(db_user.ollama_ngrok_url)
        
        return {"message": "成功連接本地 Ollama ！"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"伺服器錯誤：{str(e)}")