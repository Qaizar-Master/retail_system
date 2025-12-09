import re
from typing import List, Dict, Any
from .models import Message, Product
from .services import db

class Agent:
    def __init__(self, name: str):
        self.name = name

    async def process(self, input_text: str, context: Dict[str, Any]) -> str:
        raise NotImplementedError

class RecommendationAgent(Agent):
    async def process(self, input_text: str, context: Dict[str, Any]) -> str:
        # Simple keyword matching for recommendations
        products = await db.get_products()
        matches = []
        input_lower = input_text.lower()
        
        for p in products:
            if p.category.lower() in input_lower or p.name.lower() in input_lower or "recommend" in input_lower:
                matches.append(p)
        
        if not matches:
            # Fallback to showing everything if specific keywords found, or top items
            if "shoes" in input_lower:
                matches = [p for p in products if "Footwear" in p.category]
            elif "jeans" in input_lower:
                matches = [p for p in products if "Apparel" in p.category]
            else:
               return "I can recommend running shoes, casual wear, or electronics. What are you interested in?"

        if not matches:
             return "I couldn't find any specific products matching that description."

        response = "Here are some recommendations for you:\n"
        for p in matches[:3]:
            response += f"- {p.name} (${p.price}): {p.description}\n"
        return response

class InventoryAgent(Agent):
    async def process(self, input_text: str, context: Dict[str, Any]) -> str:
        # Extract product name or SKU (mock logic)
        input_lower = input_text.lower()
        products = await db.get_products()
        target_product = None
        
        for p in products:
            if p.name.lower() in input_lower:
                target_product = p
                break
        
        if not target_product:
            return "Which product would you like to check inventory for?"
            
        stock = await db.check_inventory(target_product.sku)
        total_stock = sum(stock.values())
        
        if total_stock > 0:
            details = ", ".join([f"{k}: {v}" for k,v in stock.items()])
            return f"We have {total_stock} '{target_product.name}' in stock. ({details})"
        else:
            return f"Sorry, '{target_product.name}' is currently out of stock."

class PaymentAgent(Agent):
    async def process(self, input_text: str, context: Dict[str, Any]) -> str:
        if "buy" in input_text.lower() or "pay" in input_text.lower():
            return "I can help you with that. Would you like to use your saved card ending in 4242?"
        if "yes" in input_text.lower() and context.get("last_agent") == "PaymentAgent":
             # Create order
             # For a real implementation we need proper user context to get user ID
             try:
                order_id = await db.create_order("user-123", [], 0.0)
                return f"Payment successful! Your order ({order_id}) has been placed."
             except Exception as e:
                return f"Payment failed: {str(e)}"

        return "I can assist with payments. Do you want to checkout?"

class FulfillmentAgent(Agent):
    async def process(self, input_text: str, context: Dict[str, Any]) -> str:
        return "Your order will be shipped to your registered address. You can also pick it up at Store A."

class SalesAgent(Agent):
    def __init__(self):
        super().__init__("SalesAgent")
        self.workers = {
            "recommendation": RecommendationAgent("RecommendationAgent"),
            "inventory": InventoryAgent("InventoryAgent"),
            "payment": PaymentAgent("PaymentAgent"),
            "fulfillment": FulfillmentAgent("FulfillmentAgent"),
        }

    def route(self, input_text: str, context: Dict[str, Any]) -> Agent:
        text = input_text.lower()
        if "stock" in text or "available" in text or "have" in text:
            return self.workers["inventory"]
        elif "buy" in text or "pay" in text or "checkout" in text:
            return self.workers["payment"]
        elif "ship" in text or "deliver" in text or "pickup" in text:
            return self.workers["fulfillment"]
        elif "recommend" in text or "looking for" in text or "want" in text or "need" in text:
            return self.workers["recommendation"]
        
        # Default fallback
        last_agent_name = context.get("last_agent")
        if last_agent_name == "PaymentAgent" and ("yes" in text or "no" in text):
             return self.workers["payment"]

        return self.workers["recommendation"]

    async def process(self, input_text: str, context: Dict[str, Any]) -> str:
        worker = self.route(input_text, context)
        context["last_agent"] = worker.name
        
        response = await worker.process(input_text, context)
        return f"[{worker.name}]: {response}"
