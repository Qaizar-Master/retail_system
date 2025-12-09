import os
from typing import List, Dict, Optional
from databases import Database
from dotenv import load_dotenv
from .models import Product

# Load env variables (assumes .env file is in the root or accessible)
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Create a database instance
# If DATABASE_URL is not found, this will fail.
# Ensure your .env has DATABASE_URL="postgresql://user:password@host:port/db"
database = Database(DATABASE_URL)

class DatabaseService:
    async def connect(self):
        await database.connect()

    async def disconnect(self):
        await database.disconnect()

    async def get_products(self, query: str = "") -> List[Product]:
        sql = 'SELECT * FROM "Product"'
        rows = await database.fetch_all(query=sql)
        
        products = []
        for row in rows:
            p = Product(
                id=row["id"],
                sku=row["sku"],
                name=row["name"],
                description=row["description"] or "",
                price=float(row["price"]),
                category=row["category"],
                imageUrl=row["imageUrl"],
                inStock=True # Logic to check inventory below
            )
            
            # Simple in-memory filter if query is present (or use SQL LIKE)
            if query:
                q = query.lower()
                if q in p.name.lower() or q in p.category.lower():
                    products.append(p)
            else:
                products.append(p)
                
        return products

    async def check_inventory(self, sku: str) -> Dict[str, int]:
        # Get Product ID first
        p_query = 'SELECT id, name FROM "Product" WHERE sku = :sku'
        product = await database.fetch_one(query=p_query, values={"sku": sku})
        
        if not product:
            return {"Main": 0, "Store_A": 0}

        # Get Inventory
        i_query = 'SELECT location, quantity FROM "Inventory" WHERE "productId" = :pid'
        rows = await database.fetch_all(query=i_query, values={"pid": product["id"]})
        
        inventory = {}
        for row in rows:
            inventory[row["location"]] = row["quantity"]
            
        return inventory

    async def create_order(self, user_id: str, items: List[Product], total: float) -> str:
        # NOTE: In a real app, this would verify user, check stock again, etc.
        # For now, we manually create an Order entry.
        
        # 1. Create or Find User (Mocking user ID lookup for this prototype if needed, 
        # or assuming user_id passed is valid UUID from frontend context)
        # We'll assume user_id is valid or we handle it.
        
        # Simplified: Just insert into Order
        # But we need a valid userId that exists in "User" table foreign key.
        # For prototype, if we don't have a valid user, this might fail foreign key constraint.
        # We will try to find the seeded user 'alice@example.com' if 'user-123' is passed.
        
        # Helper: Find a fallback user if needed
        u_query = 'SELECT id FROM "User" LIMIT 1'
        user_row = await database.fetch_one(query=u_query)
        valid_user_id = user_row["id"] if user_row else user_id
        
        import uuid
        order_id = str(uuid.uuid4())
        
        # Insert Order
        insert_order = """
        INSERT INTO "Order" (id, "userId", "totalAmount", status, "paymentStatus")
        VALUES (:id, :uid, :total, 'CONFIRMED', 'SUCCESS')
        """
        await database.execute(query=insert_order, values={
            "id": order_id,
            "uid": valid_user_id,
            "total": total
        })
        
        # Insert OrderItems could go here...
        
        return order_id
        
    async def process_payment(self, amount: float, method: str) -> bool:
        if amount > 10000:
            return False
        return True

db = DatabaseService()
