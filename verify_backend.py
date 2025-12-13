import asyncio
import websockets
import json

async def test_chat():
    uri = "ws://localhost:8000/ws/chat"
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected to {uri}")
            
            # Test Fuzzy Match
            print("\n--- Testing Fuzzy Match ('runing shos') ---")
            await websocket.send(json.dumps({
                "type": "user_message",
                "data": {"content": "I need runing shos", "channel": "test"}
            }))
            
            while True:
                resp = json.loads(await websocket.recv())
                if resp.get("type") == "final":
                    print(f"Response: {resp['content']}")
                    break

            # Test Context ("buy it")
            print("\n--- Testing Context ('buy it') ---")
            await websocket.send(json.dumps({
                "type": "user_message",
                "data": {"content": "buy it", "channel": "test"}
            }))
            
            while True:
                resp = json.loads(await websocket.recv())
                if resp.get("type") == "final":
                    print(f"Response: {resp['content']}")
                    break
                    
    except ConnectionRefusedError:
        print("Connection failed. Is the backend running on port 8000?")
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_chat())
