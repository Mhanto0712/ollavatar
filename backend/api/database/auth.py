import os
import bcrypt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException,Request,Response
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt, ExpiredSignatureError
from datetime import datetime, timedelta,timezone

load_dotenv(dotenv_path="../.env")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/login", auto_error=False)

async def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def create_refresh_token(response: Response, data: dict):
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = data.copy()
    to_encode.update({"exp": expire, "type": "refresh"})
    refresh_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    # 將 Refresh token 存到 HttpOnly Cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

    return refresh_token

async def token_refresh(request: Request,response: Response):
    refresh_token = request.cookies.get("refresh_token")
    try:
        if not refresh_token:
            raise HTTPException(status_code=401, detail="更新憑證不存在")
        
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        
        new_access_token = await create_access_token(data={"sub": payload.get("sub")})
        new_refresh_token = await create_refresh_token(data={"sub": payload.get("sub")}, response=response)
        return {
            "message": "換發成功！", 
            "access_token": new_access_token,
            "token_type": "bearer"
            }
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="更新憑證已過期")
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f'JWTError: {e}')
    except HTTPException:  
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"伺服器錯誤：{str(e)}")

async def get_current_user(access_token: str|None = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
        return user_id
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f'JWTError: {e}')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"伺服器錯誤：{str(e)}")
    
async def isToken(access_token: str|None = Depends(oauth2_scheme)):
    return access_token

async def hash_password(password):
    bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hash = bcrypt.hashpw(bytes, salt)
    return hash # 產生 bcrypt 雜湊

async def verify_password(plain_password, hashed_password) -> bool:
    return bcrypt.checkpw(plain_password, hashed_password)