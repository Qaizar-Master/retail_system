from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import ChatRequest, Message
from .agents import SalesAgent
from .services import db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await db.connect()
        print("Database connected.")
    except Exception as e:
        print(f"Database connection failed: {e}")
    yield
    # Shutdown
    await db.disconnect()

# Initialize with lifespan
app = FastAPI(lifespan=lifespan)

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sales_agent = SalesAgent()

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        user_message = request.messages[-1]
        if user_message.role != "user":
            raise HTTPException(status_code=400, detail="Last message must be from user")
            
        # Await the agent process
        response_text = await sales_agent.process(user_message.content, request.context)
        
        return {
            "role": "assistant",
            "content": response_text,
            "context": request.context
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
