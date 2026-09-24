import os
import json
import math
import uuid
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import database
from ai_engine import LocalAIEngine
from gov_dispatcher import dispatch_to_government_portal

app = FastAPI(
    title="UrbanPulse API",
    description="Local-AI Urban Infrastructure Sentinel & Automated Government Dispatch Engine",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files directory
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

ai_engine: Optional[LocalAIEngine] = None

@app.on_event("startup")
def startup_event():
    global ai_engine
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    database.init_db()
    print("[SERVER] Initializing Local AI Vision Engine...")
    ai_engine = LocalAIEngine()
    print("[SERVER] UrbanPulse Backend Ready on port 8000.")

def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates ground distance in meters between two GPS coordinates."""
    r = 6371000.0  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) *
         math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c

class VoteRequest(BaseModel):
    vote_type: str
    voter_lat: Optional[float] = 12.0932
    voter_lng: Optional[float] = 78.1841

@app.get("/api/issues")
def get_issues():
    return database.fetch_all_issues()

@app.get("/api/issues/{issue_id}")
def get_issue(issue_id: str):
    issue = database.fetch_issue_by_id(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue

@app.post("/api/report-issue")
async def report_issue(
    request: Request,
    image: UploadFile = File(...),
    lat: float = Form(...),
    lng: float = Form(...),
    device_lat: float = Form(...),
    device_lng: float = Form(...)
):
    global ai_engine
    if ai_engine is None:
        ai_engine = LocalAIEngine()

    # Read image bytes
    contents = await image.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty image payload")

    # Generate unique filename
    ext = os.path.splitext(image.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    # Base URL for uploaded photo
    base_url = str(request.base_url).rstrip("/")
    photo_url = f"{base_url}/uploads/{filename}"

    # Haversine distance check for on-site presence (<= 150m)
    distance_meters = calculate_haversine(lat, lng, device_lat, device_lng)
    is_on_site = 1 if distance_meters <= 150.0 else 0

    # AI Vision Analysis
    ai_result = ai_engine.analyze_image(contents)

    new_issue = {
        "id": f"iss-{uuid.uuid4().hex[:8]}",
        "title": ai_result["title"],
        "category": ai_result["category"],
        "department": ai_result["department"],
        "severity": ai_result["severity"],
        "lat": lat,
        "lng": lng,
        "device_lat": device_lat,
        "device_lng": device_lng,
        "is_on_site": is_on_site,
        "photo_url": photo_url,
        "depth_cm": ai_result["depth_cm"],
        "is_water_filled": ai_result["is_water_filled"],
        "depth_advisory": ai_result["depth_advisory"],
        "impact_ambulance": ai_result["impact_ambulance"],
        "impact_ev": ai_result["impact_ev"],
        "impact_two_wheeler": ai_result["impact_two_wheeler"],
        "impact_four_wheeler": ai_result["impact_four_wheeler"],
        "impact_pedestrian": ai_result["impact_pedestrian"],
        "true_votes": 1,
        "false_votes": 0,
        "trust_score": 100,
        "status": "ACTIVE",
        "is_escalated": 0,
        "ticket_id": "",
        "ticket_receipt_json": "",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

    saved_issue = database.add_issue(new_issue)
    return saved_issue

@app.post("/api/issues/{issue_id}/vote")
async def vote_issue(issue_id: str, vote_data: VoteRequest):
    updated = database.record_vote(issue_id, vote_data.vote_type)
    if not updated:
        raise HTTPException(status_code=404, detail="Issue not found")

    # If true_votes reached 5 and not yet escalated, automatically trigger government portal dispatch!
    if updated["true_votes"] >= 5 and updated["is_escalated"] == 0:
        receipt = await dispatch_to_government_portal(updated)
        updated = database.set_escalated(
            issue_id=issue_id,
            ticket_id=receipt["ticket_id"],
            receipt_json=json.dumps(receipt)
        )

    return updated

@app.post("/api/issues/{issue_id}/escalate-now")
async def escalate_now(issue_id: str):
    issue = database.fetch_issue_by_id(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    receipt = await dispatch_to_government_portal(issue)
    updated = database.set_escalated(
        issue_id=issue_id,
        ticket_id=receipt["ticket_id"],
        receipt_json=json.dumps(receipt)
    )
    return {
        "issue": updated,
        "receipt": receipt
    }

@app.get("/api/issues/{issue_id}/receipt")
def get_receipt(issue_id: str):
    issue = database.fetch_issue_by_id(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    if not issue["ticket_receipt_json"]:
        raise HTTPException(status_code=400, detail="Issue has not been escalated to government dispatch yet")

    try:
        receipt_obj = json.loads(issue["ticket_receipt_json"])
    except Exception:
        receipt_obj = {"raw": issue["ticket_receipt_json"]}

    return {
        "issue_id": issue_id,
        "ticket_id": issue["ticket_id"],
        "receipt": receipt_obj
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
