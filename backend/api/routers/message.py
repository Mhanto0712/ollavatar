from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import table, schema
from database.database import get_db
from database.auth import get_current_user
from typing import List

router = APIRouter()

# 儲存訊息
@router.post("/", response_model=schema.MessageResponse)
async def create_message(message: schema.MessageCreate, db: Session = Depends(get_db), user_id = Depends(get_current_user)):
    try:
        # 先查詢使用者目前訊息總數
        messages = (
            db.query(table.Message)
            .filter(table.Message.user_id == user_id)
            .order_by(table.Message.created_at.asc())  # 最舊的在前
            .all()
        )

        # 如果超過 201 則，需要刪掉「最舊的一組 (user+ai)」
        if len(messages) >= 201:
            # 找到第一組 user+ai
            first_user_msg = None
            first_ai_msg = None
            for msg in messages:
                if msg.sender == "user" and not first_user_msg:
                    first_user_msg = msg
                elif msg.sender == "ai" and first_user_msg and not first_ai_msg:
                    first_ai_msg = msg
                    break  # 找到一組就結束

            # 刪除最舊的一組
            if first_user_msg and first_ai_msg:
                db.delete(first_user_msg)
                db.delete(first_ai_msg)
                db.commit()

        new_message = table.Message(
            user_id=user_id,
            sender=message.sender,
            content=message.content
        )
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        return new_message
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"伺服器錯誤：{str(e)}")

# 查詢該使用者的歷史訊息
@router.get("/history")
async def get_user_messages(
    db: Session = Depends(get_db),
    user_id = Depends(get_current_user)
):
    try:
        messages = (
            db.query(table.Message)
            .filter(table.Message.user_id == user_id)
            .order_by(table.Message.created_at.asc())
            .all()
        )
        if not messages:
            return []

        # 轉成 Ollama chat 格式
        prompt = [
            {"sender": "user" if msg.sender == "user" else "ai", "content": msg.content,"created_at": msg.created_at}
            for msg in messages
        ]

        return prompt
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"伺服器錯誤：{str(e)}")