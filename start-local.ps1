# Local dev launcher (no Docker)
# Starts ML (Flask), API (Node), and Client (React) with Atlas URI

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# Start ML service
Start-Process -NoNewWindow powershell -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-Command","cd `"$root\ml_service`"; python -m pip install -r requirements.txt; python app.py" | Out-Null
Start-Sleep -Seconds 3

# Start API
$env:ML_SERVICE_URL = "http://localhost:8000"
$env:MONGO_URI = "mongodb+srv://aarchigarg50_db_user:cje3cPtI34u4EVij@cluster0.o1jeqta.mongodb.net/deepfakeDB?retryWrites=true&w=majority&appName=Cluster0"
Start-Process -NoNewWindow powershell -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-Command","cd `"$root\server`"; npm install; npm start" | Out-Null
Start-Sleep -Seconds 2

# Start Client
Start-Process -NoNewWindow powershell -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-Command","cd `"$root\client`"; npm install; npm start" | Out-Null

Write-Host "Local stack started: Client http://localhost:3000 · API http://localhost:5000 · ML http://localhost:8000" -ForegroundColor Green
