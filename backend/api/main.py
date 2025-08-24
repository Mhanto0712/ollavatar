from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.user import router as user_router
from routers.message import router as message_router
from routers.ollama import router as ollama_router
from routers.token import router as token_router

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/api/user", tags=["user"])
app.include_router(message_router, prefix="/api/message", tags=["message"])
app.include_router(ollama_router, prefix="/api/ollama", tags=["ollama"])
app.include_router(token_router, prefix="/api/token", tags=["token"])
