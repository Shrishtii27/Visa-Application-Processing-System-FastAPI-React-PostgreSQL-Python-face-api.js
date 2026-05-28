import requests

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMzgxZjlmMy00ZjY2LTQ1MDEtYTVkMi03NDEzZmFlNDUxM2IiLCJyb2xlIjoidXNlciIsImV4cCI6MTc3OTg3OTA2MH0.94Dl25Y3T-VJ9McC12E3CoYdWEJQBKopKti19Fyn-_w"
headers = {"Authorization": f"Bearer {token}"}

# 1. Create Application
res1 = requests.post("http://localhost:8000/api/applications", headers=headers, json={})
print("POST Response:", res1.status_code, res1.text)

if res1.status_code == 201:
    app_id = res1.json()["id"]
    # 2. Patch Application
    # Using dummy visa_type_id
    res2 = requests.patch(f"http://localhost:8000/api/applications/{app_id}/country", headers=headers, json={
        "country_code": "US",
        "visa_type_id": "f67a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
        "applicant_nationality": "IND"
    })
    print("PATCH Response:", res2.status_code, res2.text)
