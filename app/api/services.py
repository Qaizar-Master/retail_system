# server/services.py
import os
import uuid
from typing import List, Dict, Optional
from dataclasses import dataclass
from dotenv import load_dotenv
from .models import Product as ProductModel  # pydantic model used by the rest of the app

load_dotenv()
DATABASE_URL = os.getenv("PYTHON_DATABASE_URL")

# -------------------------
# Mock DB implementation
# -------------------------
@dataclass
class _MockProduct:
    id: str
    sku: str
    name: str
    description: str
    price: float
    category: str
    gender: Optional[str] = None
    imageUrl: Optional[str] = None

class MockDatabaseService:
    def __init__(self):
        # Seeded products that mirror your Prisma seed.js
        self._products: List[_MockProduct] = [
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="DRS-RED-001",
                name="Summer Floral Red Dress",
                description="A breezy red dress with floral patterns.",
                price=1999.00,
                category="Apparel",
                gender="Women",
                imageUrl="/summer_red_floral.png"
            ),
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="DRS-YLW-002",
                name="Sunny Yellow Floral Dress",
                description="Lightweight yellow dress with soft floral prints.",
                price=1899.00,
                category="Apparel",
                gender="Women",
                imageUrl="/yellow_floral_dress.png"
            ),
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="DRS-BLU-003",
                name="Sky Blue A-Line Dress",
                description="Flowy A-line dress perfect for summer outings.",
                price=2099.00,
                category="Apparel",
                gender="Women",
                imageUrl="/blue_aline_dress.png"
            ),
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="DRS-PNK-004",
                name="Blush Pink Casual Dress",
                description="Soft pink casual dress with a relaxed fit.",
                price=1799.00,
                category="Apparel",
                gender="Women",
                imageUrl="/pink_casual_dress.png"
            ),
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="DRS-GRN-005",
                name="Mint Green Summer Dress",
                description="Breathable cotton dress ideal for warm days.",
                price=1999.00,
                category="Apparel",
                gender="Women",
                imageUrl="/mint_green_dress.png"
            ),
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="SHR-BLU-002",
                name="Classic Denim Shirt",
                description="Rugged blue denim shirt.",
                price=1299.00,
                category="Apparel",
                gender="Men",
                imageUrl="/denim_shirt.png"
            ),
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="TSH-GRY-004",
                name="Grey Cotton Casual T-Shirt",
                description="Soft breathable cotton t-shirt for everyday wear.",
                price=699.00,
                category="Apparel",
                gender="Men",
                imageUrl="/grey_cotton_tshirt.png"
            ),
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="SHR-CHK-005",
                name="Casual Checkered Shirt",
                description="Relaxed-fit checkered shirt for casual outings.",
                price=1499.00,
                category="Apparel",
                gender="Men",
                imageUrl="/checkered_shirt.png"
            ),
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="POLO-NVY-006",
                name="Navy Blue Polo T-Shirt",
                description="Classic polo t-shirt with a comfortable fit.",
                price=999.00,
                category="Apparel",
                gender="Men",
                imageUrl="/navy_polo.png"
            ),
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="RUN-PRO-001",
                name="Runner Pro Shoes",
                description="Lightweight running shoes.",
                price=4999.00,
                category="Footwear",
                gender="Men",
                imageUrl="/runner.png"
            ),
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="SNK-BLK-002",
                name="Urban Sneakers",
                description="Comfortable black sneakers for daily wear.",
                price=3499.00,
                category="Footwear",
                gender="Unisex",
                imageUrl="/urban_sneakers.png"
            ),
             # New Shoe Items
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="SHOE-RUN-003",
                name="Speedster Running Shoes",
                description="High-performance running shoes for athletes.",
                price=4599.00,
                category="Footwear",
                gender="Men",
                imageUrl="/running_shoes.png"
            ),
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="SHOE-FRM-004",
                name="Classic Leather Oxford",
                description="Elegant black leather formal shoes.",
                price=5999.00,
                category="Footwear",
                gender="Men",
                imageUrl="/formal_shoes.png"
            ),
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="SHOE-CNV-005",
                name="Red Canvas Loafers",
                description="Casual canvas loafers for weekend vibes.",
                price=1299.00,
                category="Footwear",
                gender="Women",
                imageUrl="/canvas_loafers.png"
            ),
             _MockProduct(
                id=str(uuid.uuid4()),
                sku="SHOE-HL-006",
                name="Elegant Stiletto Heels",
                description="Premium stiletto heels for parties.",
                price=3999.00,
                category="Footwear",
                gender="Women",
                imageUrl="/heels.png"
            ),
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="SP-Z-003",
                name="SmartPhone Z",
                description="Good camera, long battery",
                price=29999.00,
                category="Electronics",
                imageUrl="/smartphone.png"
            ),
            _MockProduct(
                id=str(uuid.uuid4()),
                sku="TSH-WHT-003",
                name="Basic White T-Shirt",
                description="Soft cotton everyday t-shirt.",
                price=599.00,
                category="Apparel",
                # CHANGED to Men as per request
                gender="Men",
                imageUrl="/white_tshirt.png"
            )
        ]

        # inventory keyed by sku -> location -> qty
        self._inventory: Dict[str, Dict[str, int]] = {
            "DRS-RED-001": {"Mall of India": 5, "Main Warehouse": 0},
            "SHR-BLU-002": {"Main Warehouse": 10},
            "RUN-PRO-001": {"Store_A": 10, "Warehouse": 5},
            "SP-Z-003": {"Main Warehouse": 4, "Store_B": 2},
            # New Women's items
            "DRS-YLW-002": {"Main Warehouse": 15},
            "DRS-BLU-003": {"Mall of India": 8},
            "DRS-PNK-004": {"Store_A": 12},
            "DRS-GRN-005": {"Warehouse": 20},
            # New Men's items
            "TSH-GRY-004": {"Main Warehouse": 30},
            "SHR-CHK-005": {"Store_B": 10},
            "POLO-NVY-006": {"Mall of India": 25},
            # New Shoe items
            "SHOE-RUN-003": {"Store_A": 15},
            "SHOE-FRM-004": {"Store_B": 8},
            "SHOE-CNV-005": {"Main Warehouse": 50},
            "SHOE-HL-006": {"Mall of India": 12},
        }

        self._orders: List[Dict] = []
        self._connected = False

    async def connect(self):
        # Nothing to do for mock but we keep API parity
        self._connected = True
        print("[MockDB] connected")

    async def disconnect(self):
        self._connected = False
        print("[MockDB] disconnected")

    async def get_products(self, query: str = "") -> List[ProductModel]:
        """
        Return a list of Product pydantic models.
        Optional `query` will filter by name/category substring (case-insensitive).
        """
        results = []
        q = (query or "").strip().lower()

        for p in self._products:
            if q:
                if q in p.name.lower() or q in p.category.lower() or q in p.sku.lower():
                    results.append(self._to_pydantic(p))
            else:
                results.append(self._to_pydantic(p))
        return results

    async def check_inventory(self, sku: str) -> Dict[str, int]:
        """
        Return inventory per location for given SKU.
        If SKU not found, returns empty dict.
        """
        sku_upper = sku.strip()
        # try exact match, then case-insensitive fallback
        if sku_upper in self._inventory:
            return self._inventory[sku_upper]
        # fallback: case-insensitive key search
        for k, v in self._inventory.items():
            if k.lower() == sku_upper.lower():
                return v
        return {}

    async def create_order(self, user_id: str, items: List[Dict], total: float) -> str:
        """
        Create a simple order record and return its id.
        `items` is expected to be list of dicts: {"sku":..., "quantity":..., "price":...}
        """
        order_id = str(uuid.uuid4())
        order = {
            "id": order_id,
            "userId": user_id,
            "items": items,
            "totalAmount": float(total),
            "status": "PAID" if float(total) == 0.0 else "PAID",
            "paymentStatus": "SUCCESS",
        }
        self._orders.append(order)

        # reduce inventory for each item (best-effort)
        for it in items:
            sku = it.get("sku")
            qty = int(it.get("quantity", 1))
            if sku and sku in self._inventory:
                # subtract from first location that has enough stock, otherwise subtract where available
                for loc, cur in list(self._inventory[sku].items()):
                    if cur >= qty:
                        self._inventory[sku][loc] = cur - qty
                        break
                    elif cur > 0:
                        # consume partial stock and continue
                        qty -= cur
                        self._inventory[sku][loc] = 0
        return order_id

    async def process_payment(self, amount: float, method: str) -> bool:
        # simple rule: fail if amount > 10000
        return False if amount > 10000 else True

    def _to_pydantic(self, mp: _MockProduct) -> ProductModel:
        # ProductModel is the pydantic model in server.models
        return ProductModel(
            id=mp.id,
            sku=mp.sku,
            name=mp.name,
            description=mp.description or "",
            price=float(mp.price),
            category=mp.category,
            gender=mp.gender,
            imageUrl=mp.imageUrl or None,
            inStock=(sum(self._inventory.get(mp.sku, {}).values()) > 0)
        )


# -------------------------
# Real DB stub (keeps the same interface)
# -------------------------
# NOTE: This is a small wrapper hint showing how you'd implement a "real" service.
# We keep it minimal here since you already have a version using `databases` package in your repo.
class RealDatabaseService:
    def __init__(self, database):
        self._db = database

    async def connect(self):
        await self._db.connect()

    async def disconnect(self):
        await self._db.disconnect()

    async def get_products(self, query: str = "") -> List[ProductModel]:
        # You already have an implementation in your original services.py that uses SQL.
        # Leave that in place if you want to use a real DB. This class is only a wrapper.
        raise NotImplementedError("Use your existing Real DB implementation here.")

    async def check_inventory(self, sku: str) -> Dict[str, int]:
        raise NotImplementedError()

    async def create_order(self, user_id: str, items: List[Dict], total: float) -> str:
        raise NotImplementedError()

    async def process_payment(self, amount: float, method: str) -> bool:
        raise NotImplementedError()


# -------------------------
# Export `db` variable expected by agents.py (keep same name)
# Choose Mock if DATABASE_URL not set.
# -------------------------
if DATABASE_URL:
    # If you want, you can instantiate your DatabaseService here and export as `db`
    # For now we fallback to Mock for safety unless you already wired the `databases` instance.
    try:
        # try to import an existing real DatabaseService from a legacy file if present
        from .real_services_impl import DatabaseService as LegacyDatabaseService  # optional
        db = LegacyDatabaseService()
    except Exception:
        # If you prefer to use the databases library implementation, import it here
        # from .services_real import DatabaseService
        # db = DatabaseService()
        # For now, default to mock to avoid runtime errors if env misconfigured.
        db = MockDatabaseService()
else:
    db = MockDatabaseService()
