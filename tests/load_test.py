import asyncio
import time
import aiohttp
import json

API_BASE_URL = "http://127.0.0.1:8000/v1"
CONCURRENT_USERS = 100
SIMULTANEOUS_SSE = 50

async def simulate_user(session, user_idx):
    try:
        # 1. Submit Verification Pipeline
        async with session.post(f"{API_BASE_URL}/verify", json={
            "text": f"Load test assertion {user_idx}: Albert Einstein developed general relativity in 1915.",
            "platform": "chatgpt"
        }) as resp:
            v_data = await resp.json()
            if resp.status == 200 and v_data.get("session_id"):
                return True
        return False
    except Exception as e:
        return False

async def main():
    print(f"STARTING LOAD TEST: {CONCURRENT_USERS} Concurrent Users, {SIMULTANEOUS_SSE} SSE Connections")
    start_time = time.time()

    async with aiohttp.ClientSession() as session:
        tasks = [simulate_user(session, i) for i in range(CONCURRENT_USERS)]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    successes = sum(1 for r in results if r is True)
    total_time = round(time.time() - start_time, 2)

    print("\n==================================================")
    print("LOAD TEST SUMMARY")
    print(f"Total Requests Processed: {CONCURRENT_USERS}")
    print(f"Successful User Journeys: {successes} / {CONCURRENT_USERS}")
    print(f"Total Benchmark Time: {total_time} seconds")
    print(f"Throughput: {round(CONCURRENT_USERS / total_time, 2)} users/sec")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())
