from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .models import ChatRequest, Message
from .agents import SalesAgent
from .services import db
import json
import asyncio

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

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    session_context = {}  # Persistent context for this connection
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received data: {data}")
            payload = json.loads(data)
            
            if payload.get("type") == "user_message":
                user_content = payload["data"]["content"]
                print(f"Processing message: {user_content}")
                
                # Merge incoming data into persistent context
                session_context.update(payload.get("data", {}))
                
                try:
                    # In a real LLM setting, this would be streaming tokens
                    response_payload = await sales_agent.process(user_content, session_context)
                    print(f"Generated response: {response_payload}")

                    response_text = response_payload.get("content", "")
                    options = response_payload.get("options", [])
                except Exception as proc_error:
                    print(f"Error processing message: {proc_error}")
                    import traceback
                    traceback.print_exc()
                    response_text = "I encountered an error processing your request."
                    options = []
                
                # Mock streaming effect
                chunk_size = 5
                for i in range(0, len(response_text), chunk_size):
                    chunk = response_text[i:i+chunk_size]
                    await websocket.send_json({
                        "type": "partial",
                        "chunk": chunk
                    })
                    await asyncio.sleep(0.05)
                
                # Send final message
                await websocket.send_json({
                    "type": "final",
                    "content": response_text,
                    "options": options,
                    "products": response_payload.get("products", []),
                    "product_context": response_payload.get("product_context"),
                    "agentName": response_payload.get("agent_name")
                })
                
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
