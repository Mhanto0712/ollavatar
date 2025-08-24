import os
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from database.auth import token_refresh, isToken
from jose import JWTError, jwt, ExpiredSignatureError
from dotenv import load_dotenv

router = APIRouter()

load_dotenv(dotenv_path="../.env")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))

@router.get("/")
async def token( request: Request, response: Response, access_token: str|None = Depends(isToken)):
    try:
        if not access_token:
            # print("存取憑證不存在")
            refresh_result = await token_refresh(request,response)
            access_token = refresh_result["access_token"]
            return access_token
        else:
            jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
            # print("存取憑證尚有效")
            return None
    except ExpiredSignatureError:
        # print("存取憑證已過期")
        refresh_result = await token_refresh(request,response)
        access_token = refresh_result["access_token"]
        return access_token
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f'JWTError: {e}')
    except HTTPException:  
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"伺服器錯誤: {str(e)}")
