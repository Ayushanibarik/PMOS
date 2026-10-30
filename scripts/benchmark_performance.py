import time
import statistics
import concurrent.futures
import httpx
import json

BASE_URL = "http://localhost:8000"

def benchmark_endpoint(client, name, method, url, headers=None, json_body=None, count=50):
    latencies = []
    errors = 0
    for _ in range(count):
        t0 = time.perf_counter()
        try:
            if method == "GET":
                r = client.get(url, headers=headers)
            else:
                r = client.post(url, headers=headers, json=json_body)
            elapsed_ms = (time.perf_counter() - t0) * 1000
            if r.status_code in (200, 201):
                latencies.append(elapsed_ms)
            else:
                errors += 1
        except Exception:
            errors += 1
    
    if not latencies:
        return {"name": name, "count": count, "errors": errors, "mean_ms": 0, "p50_ms": 0, "p95_ms": 0, "p99_ms": 0}

    latencies.sort()
    p50 = statistics.median(latencies)
    p95 = latencies[int(len(latencies) * 0.95)]
    p99 = latencies[int(len(latencies) * 0.99)]
    return {
        "name": name,
        "count": count,
        "errors": errors,
        "mean_ms": round(statistics.mean(latencies), 2),
        "min_ms": round(min(latencies), 2),
        "p50_ms": round(p50, 2),
        "p95_ms": round(p95, 2),
        "p99_ms": round(p99, 2),
        "max_ms": round(max(latencies), 2)
    }

def benchmark_concurrency(token, concurrency=25, total_requests=100):
    url = f"{BASE_URL}/api/v1/cycles/analytics"
    headers = {"Authorization": f"Bearer {token}"}
    
    def fetch_one():
        t0 = time.perf_counter()
        with httpx.Client(timeout=10.0) as client:
            r = client.get(url, headers=headers)
            elapsed = (time.perf_counter() - t0) * 1000
            return r.status_code, elapsed

    t_start = time.perf_counter()
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [executor.submit(fetch_one) for _ in range(total_requests)]
        results = [f.result() for f in futures]
    t_total = time.perf_counter() - t_start

    successes = sum(1 for status, _ in results if status == 200)
    latencies = [lat for status, lat in results if status == 200]
    rps = round(total_requests / t_total, 2)
    p95 = round(sorted(latencies)[int(len(latencies) * 0.95)], 2) if latencies else 0

    return {
        "concurrency": concurrency,
        "total_requests": total_requests,
        "duration_sec": round(t_total, 2),
        "requests_per_sec": rps,
        "success_rate_pct": round((successes / total_requests) * 100, 1),
        "p95_latency_ms": p95
    }

def main():
    print("Starting CycleAware Performance & Load Benchmark against Docker Container...")
    with httpx.Client(timeout=10.0) as client:
        # 1. Health check
        bench_health = benchmark_endpoint(client, "Health Check", "GET", f"{BASE_URL}/health", count=50)

        # 2. Login
        login_payload = {"email": "patient@cycleaware.local", "password": "DemoPatient123!"}
        bench_login = benchmark_endpoint(client, "User Login (Argon2 Verify + JWT)", "POST", f"{BASE_URL}/api/v1/auth/login", json_body=login_payload, count=30)

        # Obtain token
        login_res = client.post(f"{BASE_URL}/api/v1/auth/login", json=login_payload)
        token = login_res.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # 3. Cycle Analytics
        bench_analytics = benchmark_endpoint(client, "Cycle Analytics & Prediction Engine", "GET", f"{BASE_URL}/api/v1/cycles/analytics", headers=auth_headers, count=50)

        # 4. Pattern Alignment Index
        bench_obs = benchmark_endpoint(client, "Pattern Alignment Index & Rules Engine", "GET", f"{BASE_URL}/api/v1/observations", headers=auth_headers, count=50)

        # 5. TreeSHAP Inference
        ml_payload = {
            "age": 26.0, "years_post_menarche": 13.0, "mean_cycle_length": 42.0, "cycle_length_std": 8.0,
            "skipped_cycles_per_year": 3, "hirsutism_score": 3, "acne_severity": 3, "hair_thinning_severity": 2,
            "bmi": 26.5, "waist_cm": 84.0, "fasting_glucose": 95.0
        }
        bench_shap = benchmark_endpoint(client, "ML Inference + Exact TreeSHAP", "POST", f"{BASE_URL}/api/v1/ml/experimental-inference", headers=auth_headers, json_body=ml_payload, count=30)

        # 6. Concurrency stress
        concurrency_results = benchmark_concurrency(token, concurrency=25, total_requests=100)

    summary = {
        "endpoints": [bench_health, bench_login, bench_analytics, bench_obs, bench_shap],
        "concurrency_stress": concurrency_results
    }
    print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    main()
