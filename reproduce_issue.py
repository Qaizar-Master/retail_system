import asyncio
import websockets
import json
import sys
import io

# Fix encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def test_reproduction():
    uri = "ws://localhost:8012/ws/chat"
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected to {uri}")
            
            # 1. Broad Query
            await websocket.send(json.dumps({
                "type": "user_message",
                "data": {"content": "casual wear", "channel": "test"}
            }))
            
            # Consume until options
            while True:
                data = await websocket.recv()
                resp = json.loads(data)
                if resp.get("type") == "final":
                    if resp.get("options"):
                        break
            
            # 2. Select Women
            print("Sending 'Women'...")
            await websocket.send(json.dumps({
                "type": "user_message",
                "data": {"content": "Women", "channel": "test"}
            }))
            
            # Check products
            while True:
                data = await websocket.recv()
                resp = json.loads(data)
                if resp.get("type") == "final":
                    products = resp.get("products", [])
                    print(f"Products returned: {len(products)}")
                    names = [p['name'] for p in products]
                    for n in names:
                        print(f" - {n}")
                    
                    irrelevant = ["SmartPhone Z", "Urban Sneakers"]
                    found_irrelevant = [n for n in names if n in irrelevant]
                    
                    if found_irrelevant:
                        print(f"❌ FAILURE: Found irrelevant items: {found_irrelevant}")
                    else:
                        print("✅ SUCCESS: Only relevant items found.")
                    break
                    
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_reproduction())
