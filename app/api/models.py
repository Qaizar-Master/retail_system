from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union

class Message(BaseModel):
    role: str # "user", "assistant", "system"
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    context: Dict[str, Any] = {} # e.g., {"channel": "mobile_app", "userId": "123"}

class Product(BaseModel):
    id: str
    sku: str
    name: str
    description: str
    price: float
    category: str
    imageUrl: Optional[str] = None
    inStock: bool = True

class Order(BaseModel):
    id: str
    items: List[Product]
    total: float
    status: str
