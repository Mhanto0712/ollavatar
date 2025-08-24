from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from ollama import chat
from pydantic import BaseModel
from database.auth import get_current_user
from typing import List, Literal, Dict

router = APIRouter()

# 定義訊息物件
class Message(BaseModel):
    role: Literal['user', 'assistant']
    content: str

# 定義前端傳入的資料結構
class OllamaData(BaseModel):
    model: str
    messages: List[Message]

# Stream response settings
def ollama_streamer(res):
    for chunk in res:
        # print(chunk['message']['content'], end='', flush=True)
        yield chunk['message']['content']

# API router
@router.post("/")
async def ollama(ollama_data: OllamaData, user_id = Depends(get_current_user)):
    try:
        # print(user_id)
        # print(ollama_data)
        stream_res = chat(
            model=ollama_data.model,
            messages=[msg.model_dump() for msg in ollama_data.messages],
            stream=True,
        )
        return StreamingResponse(ollama_streamer(stream_res), media_type='text/event-stream')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"伺服器錯誤: {str(e)}")