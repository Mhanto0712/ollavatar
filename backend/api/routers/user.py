from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import table, schema
from database.auth import create_access_token, create_refresh_token, hash_password, verify_password
from database.database import get_db

router = APIRouter()

@router.post("/signup")
async def signup(user: schema.UserSignUp, db: Session = Depends(get_db)):
    try:
        # 檢查使用者是否存在
        db_user = db.query(table.User).filter(table.User.username == user.username).first()
        if db_user:
            raise HTTPException(status_code=400, detail="用戶名已註冊！")
        
        # 建立新使用者
        new_user = table.User(
            username=user.username,
            password_hash=await hash_password(user.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "註冊成功！", 
            "username": user.username,
            }
    except HTTPException:  
        raise
    except Exception as e:  
        raise HTTPException(status_code=500, detail=f"伺服器錯誤: {str(e)}")


@router.post("/login")
async def login(response: Response,form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        username = form_data.username
        password = form_data.password.encode('utf-8')
        db_user = db.query(table.User).filter(table.User.username == username).first()
        if not db_user:
            raise HTTPException(status_code=400, detail="用戶名錯誤！")

        if not await verify_password(password, db_user.password_hash.encode('utf-8')):
            raise HTTPException(status_code=400, detail="密碼錯誤！")

        access_token = await create_access_token(data={"sub": str(db_user.id)})
        refresh_token = await create_refresh_token(response,data={"sub": str(db_user.id)})

        return {
            "message": "成功登入！", 
            "access_token": access_token,
            "token_type": "bearer"
            }
    except HTTPException:  
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"伺服器錯誤: {str(e)}")

@router.post("/logout")
async def logout(response: Response):
    try:
        response.delete_cookie(
            key="refresh_token",
            httponly=True,
            secure=True,
            samesite="strict"
        )
        return {"message": "成功登出！"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"伺服器錯誤: {str(e)}")