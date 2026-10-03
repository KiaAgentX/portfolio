import json, urllib.request
BASE = "http://localhost:8000"
def post(path, payload):
    req = urllib.request.Request(BASE + path, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, json.loads(r.read().decode())
    except Exception as e:
        return -1, {"error": str(e)}
def get(path):
    try:
        with urllib.request.urlopen(BASE + path, timeout=10) as r:
            return r.status, r.read().decode()[:200]
    except Exception as e:
        return -1, str(e)
tests = []
s, b = get("/api/health")
tests.append(("1-health", s == 200, b))
s, b = post("/api/chat", {"message": "Hello, who are you?", "history": []})
ok = s == 200 and "choices" in b
tests.append(("2-chat-simple", ok, str(b)[:300]))
s, b = post("/api/chat", {"message": "What did I just ask?", "history": [{"role": "user", "content": "My name is Ali"}, {"role": "assistant", "content": "Hi Ali!"}]})
tests.append(("3-chat-history", s == 200 and "choices" in b, str(b)[:300]))
s, b = post("/api/decisions", {"state": "Help! My payouts have been failing for 3 days!"})
ok = s == 200 and "answers" in b
tests.append(("4-decisions-default", ok, str(b)[:500]))
s, b = post("/api/decisions", {"state": "I love your product!", "questions": {"sentiment": {"type": "choice", "instructions": "Sentiment?", "criteria": {"pos": "positive", "neg": "negative"}}}})
tests.append(("5-decisions-custom", s == 200 and "answers" in b, str(b)[:500]))
print("=" * 60)
passed = 0
for name, ok, body in tests:
    st = "PASS" if ok else "FAIL"
    if ok: passed += 1
    print(f"{name}: {st}\n  -> {body}\n")
print(f"RESULT: {passed}/5 passed")
