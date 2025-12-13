import asyncio
import websockets
import json
import sys
import io

# Fix encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

async def test_shoes():
    uri = "ws://localhost:8016/ws/chat"
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected to {uri}")
            
            # Query for shoes
            print("Sending 'recommend shoes'...")
            await websocket.send(json.dumps({
                "type": "user_message",
                "data": {"content": "recommend shoes", "channel": "test"}
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
                    
                    expected = ["Speedster Running Shoes", "Classic Leather Oxford", "Red Canvas Loafers", "Elegant Stiletto Heels"]
                    found = [n for n in names if n in expected]
                    
                    if len(found) >= 3: # allow for fuzzy match variance, but expect most
                        print(f"✅ SUCCESS: Found new shoe items: {found}")
                    else:
                        print(f"❌ FAILURE: expected {expected} but found {found}")
                    break
                    
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_shoes())
