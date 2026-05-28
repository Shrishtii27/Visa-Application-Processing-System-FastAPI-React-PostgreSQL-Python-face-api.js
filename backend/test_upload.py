import json
import urllib.request
import urllib.error
import urllib.parse
from PIL import Image
import os

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMzgxZjlmMy00ZjY2LTQ1MDEtYTVkMi03NDEzZmFlNDUxM2IiLCJyb2xlIjoidXNlciIsImV4cCI6MTc3OTg3OTA2MH0.94Dl25Y3T-VJ9McC12E3CoYdWEJQBKopKti19Fyn-_w"
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# 1. Create Application
req = urllib.request.Request("http://localhost:8000/api/applications", headers=headers, data=b"{}")
try:
    with urllib.request.urlopen(req) as response:
        app_data = json.loads(response.read().decode())
        app_id = app_data["id"]
        print(f"Created app: {app_id}")
except urllib.error.URLError as e:
    print(f"Failed to create app: {e}")
    exit(1)

# 2. Create Dummy Fake File and Real Image
with open("fake.txt", "w") as f:
    f.write("This is not a real image")

img = Image.new('RGB', (100, 100))
img.save("real.jpg")

print("Run curl commands to test upload manually with app_id:", app_id)
