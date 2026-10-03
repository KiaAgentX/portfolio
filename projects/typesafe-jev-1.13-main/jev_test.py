import os
import requests
import json
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
url = "https://openrouter.ai/api/alpha/decisions"
headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "https://localhost",
    "X-OpenRouter-Title": "Jev Test",
}
payload = {
    "model": "typesafe/jev-1.13",
    "state": "Help! My payouts have been failing for 3 days and customers are complaining.",
    "questions": {
        "is_urgent": {
            "type": "noul",
            "instructions": "Does this message express urgency or time-sensitivity?"
        },
        "department": {
            "type": "choice",
            "instructions": "Which team should handle this issue?",
            "criteria": {
                "billing": "Payments, invoicing, refunds, payouts",
                "technical": "Bugs, outages, integrations, system failures",
                "sales": "Pricing, upgrades, new accounts",
                "support": "General customer support questions"
            }
        },
        "severity_level": {
            "type": "score",
            "instructions": "How frustrated does the customer sound?",
            "criteria": [
                "Calm or neutral",
                "Mildly annoyed",
                "Clearly frustrated",
                "Very angry or aggressive"
            ]
        }
    }
}
response = requests.post(url, headers=headers, data=json.dumps(payload))
print(f"Status Code: {response.status_code}")
print("-" * 50)
if response.status_code == 200:
    result = response.json()
    print(json.dumps(result, indent=2, ensure_ascii=False))
else:
    print(response.text)
