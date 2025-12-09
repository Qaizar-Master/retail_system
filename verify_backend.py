import requests
import json
import time

def test_chat():
    url = "http://localhost:8001/api/chat"
    
    # Test 1: Health check
    try:
        r = requests.get("http://localhost:8001/api/health")
        print(f"Health Check: {r.status_code} {r.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")
        return

    # Test 2: Recommendation
    payload = {
        "messages": [{"role": "user", "content": "I need running shoes"}],
        "context": {"channel": "mobile"}
    }
    r = requests.post(url, json=payload)
    print("Test 2 (Recommendation):", r.json()['content'])

    # Test 3: Inventory
    payload = {
        "messages": [{"role": "user", "content": "is the red nike in stock?"}],
        "context": {"channel": "mobile"}
    }
    r = requests.post(url, json=payload)
    print("Test 3 (Inventory):", r.json()['content'])

    # Test 4: Payment mock
    payload = {
        "messages": [{"role": "user", "content": "I want to buy it"}],
        "context": {"channel": "mobile"}
    }
    r = requests.post(url, json=payload)
    print("Test 4 (Payment):", r.json()['content'])

if __name__ == "__main__":
    # Wait for server to start
    time.sleep(2)
    test_chat()
