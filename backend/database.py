import sqlite3
import json
from datetime import datetime
from typing import Dict, List, Optional, Any

DB_FILE = "urbanpulse.db"

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS issues (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        department TEXT NOT NULL,
        severity INTEGER NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        device_lat REAL NOT NULL,
        device_lng REAL NOT NULL,
        is_on_site INTEGER NOT NULL,
        photo_url TEXT NOT NULL,
        depth_cm TEXT DEFAULT 'N/A',
        is_water_filled INTEGER DEFAULT 0,
        depth_advisory TEXT DEFAULT '',
        impact_ambulance TEXT NOT NULL,
        impact_ev TEXT NOT NULL,
        impact_two_wheeler TEXT NOT NULL,
        impact_four_wheeler TEXT NOT NULL,
        impact_pedestrian TEXT NOT NULL,
        true_votes INTEGER DEFAULT 1,
        false_votes INTEGER DEFAULT 0,
        trust_score INTEGER DEFAULT 100,
        status TEXT DEFAULT 'ACTIVE',
        is_escalated INTEGER DEFAULT 0,
        ticket_id TEXT DEFAULT '',
        ticket_receipt_json TEXT DEFAULT '',
        timestamp TEXT NOT NULL
    )
    """)
    conn.commit()

    cursor.execute("SELECT COUNT(*) FROM issues")
    count = cursor.fetchone()[0]

    if count == 0:
        now_iso = datetime.utcnow().isoformat() + "Z"
        
        pre_seeded = [
            {
                "id": "iss-tn-001",
                "title": "Muddy Road Crater near Bus Stop",
                "category": "ROAD_TRANSIT",
                "department": "Highways & PWD",
                "severity": 4,
                "lat": 12.0945,
                "lng": 78.1852,
                "device_lat": 12.0944,
                "device_lng": 78.1853,
                "is_on_site": 1,
                "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
                "depth_cm": ">10 cm (Severe Blind Hazard)",
                "is_water_filled": 1,
                "depth_advisory": "Opaque turbid water concealing cavity floor. High risk of vehicle stalling, tire rupture, and two-wheeler overturning.",
                "impact_ambulance": "Priority Emergency Clearance Required",
                "impact_ev": "High Battery Immersion Risk (>6 inches water)",
                "impact_two_wheeler": "CRITICAL: Severe Skidding and Overturn Hazard",
                "impact_four_wheeler": "Risk of Underbody Scraping and Rim Denting",
                "impact_pedestrian": "Unsafe for Walking / Slip Risk",
                "true_votes": 4,
                "false_votes": 0,
                "trust_score": 100,
                "status": "ACTIVE",
                "is_escalated": 0,
                "ticket_id": "",
                "ticket_receipt_json": "",
                "timestamp": now_iso
            },
            {
                "id": "iss-tn-002",
                "title": "Burst Clean Drinking Water Mainline",
                "category": "WATER_DRAINAGE",
                "department": "TWAD Water Board",
                "severity": 4,
                "lat": 12.0910,
                "lng": 78.1820,
                "device_lat": 12.0911,
                "device_lng": 78.1821,
                "is_on_site": 1,
                "photo_url": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
                "depth_cm": "N/A",
                "is_water_filled": 0,
                "depth_advisory": "Pressurized potable water pipe ruptured under pedestrian verge.",
                "impact_ambulance": "Passable with Minor Slowdown",
                "impact_ev": "Normal Safe Passability",
                "impact_two_wheeler": "CRITICAL: Severe Skidding and Overturn Hazard",
                "impact_four_wheeler": "Passable",
                "impact_pedestrian": "Unsafe for Walking / Slip Risk",
                "true_votes": 6,
                "false_votes": 0,
                "trust_score": 100,
                "status": "OFFICIALLY_ESCALATED",
                "is_escalated": 1,
                "ticket_id": "TN-TWA-2026-8812",
                "ticket_receipt_json": json.dumps({
                    "ticket_id": "TN-TWA-2026-8812",
                    "portal_status": "ACKNOWLEDGED_201_CREATED",
                    "sla_deadline": "24 Hours (Emergency Response)",
                    "assigned_ward_officer": "Assistant Executive Engineer - Zone 4",
                    "dispatch_timestamp": now_iso
                }),
                "timestamp": now_iso
            },
            {
                "id": "iss-tn-003",
                "title": "Broken Dark Streetlight Cluster",
                "category": "ELECTRICAL_LIGHTING",
                "department": "TANGEDCO Electricity Board",
                "severity": 3,
                "lat": 12.0960,
                "lng": 78.1830,
                "device_lat": 12.0961,
                "device_lng": 78.1829,
                "is_on_site": 1,
                "photo_url": "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80",
                "depth_cm": "N/A",
                "is_water_filled": 0,
                "depth_advisory": "Luminaire failure and dangling secondary cable wire.",
                "impact_ambulance": "Passable with Minor Slowdown",
                "impact_ev": "Normal Safe Passability",
                "impact_two_wheeler": "Passable with Caution",
                "impact_four_wheeler": "Passable",
                "impact_pedestrian": "Unsafe for Walking / Slip Risk",
                "true_votes": 2,
                "false_votes": 0,
                "trust_score": 100,
                "status": "ACTIVE",
                "is_escalated": 0,
                "ticket_id": "",
                "ticket_receipt_json": "",
                "timestamp": now_iso
            },
            {
                "id": "iss-tn-004",
                "title": "Overflowing Waste Dump on Market Road",
                "category": "SANITATION_WASTE",
                "department": "Municipal Sanitation",
                "severity": 3,
                "lat": 12.0925,
                "lng": 78.1870,
                "device_lat": 12.0924,
                "device_lng": 78.1869,
                "is_on_site": 1,
                "photo_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
                "depth_cm": "N/A",
                "is_water_filled": 0,
                "depth_advisory": "Uncollected organic waste blocking roadside gutter channel.",
                "impact_ambulance": "Passable with Minor Slowdown",
                "impact_ev": "Normal Safe Passability",
                "impact_two_wheeler": "Passable with Caution",
                "impact_four_wheeler": "Passable",
                "impact_pedestrian": "Unsafe for Walking / Slip Risk",
                "true_votes": 3,
                "false_votes": 1,
                "trust_score": 75,
                "status": "ACTIVE",
                "is_escalated": 0,
                "ticket_id": "",
                "ticket_receipt_json": "",
                "timestamp": now_iso
            }
        ]

        for item in pre_seeded:
            cursor.execute("""
            INSERT INTO issues (
                id, title, category, department, severity,
                lat, lng, device_lat, device_lng, is_on_site,
                photo_url, depth_cm, is_water_filled, depth_advisory,
                impact_ambulance, impact_ev, impact_two_wheeler,
                impact_four_wheeler, impact_pedestrian,
                true_votes, false_votes, trust_score,
                status, is_escalated, ticket_id, ticket_receipt_json, timestamp
            ) VALUES (
                :id, :title, :category, :department, :severity,
                :lat, :lng, :device_lat, :device_lng, :is_on_site,
                :photo_url, :depth_cm, :is_water_filled, :depth_advisory,
                :impact_ambulance, :impact_ev, :impact_two_wheeler,
                :impact_four_wheeler, :impact_pedestrian,
                :true_votes, :false_votes, :trust_score,
                :status, :is_escalated, :ticket_id, :ticket_receipt_json, :timestamp
            )
            """, item)
        conn.commit()
    conn.close()

def add_issue(issue_dict: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO issues (
        id, title, category, department, severity,
        lat, lng, device_lat, device_lng, is_on_site,
        photo_url, depth_cm, is_water_filled, depth_advisory,
        impact_ambulance, impact_ev, impact_two_wheeler,
        impact_four_wheeler, impact_pedestrian,
        true_votes, false_votes, trust_score,
        status, is_escalated, ticket_id, ticket_receipt_json, timestamp
    ) VALUES (
        :id, :title, :category, :department, :severity,
        :lat, :lng, :device_lat, :device_lng, :is_on_site,
        :photo_url, :depth_cm, :is_water_filled, :depth_advisory,
        :impact_ambulance, :impact_ev, :impact_two_wheeler,
        :impact_four_wheeler, :impact_pedestrian,
        :true_votes, :false_votes, :trust_score,
        :status, :is_escalated, :ticket_id, :ticket_receipt_json, :timestamp
    )
    """, issue_dict)
    conn.commit()
    conn.close()
    return issue_dict

def fetch_all_issues() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM issues ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def fetch_issue_by_id(issue_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM issues WHERE id = ?", (issue_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def record_vote(issue_id: str, vote_type: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT true_votes, false_votes, status FROM issues WHERE id = ?", (issue_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    
    true_votes = row["true_votes"]
    false_votes = row["false_votes"]
    current_status = row["status"]

    if vote_type.upper() == "TRUE":
        true_votes += 1
    else:
        false_votes += 1

    total = true_votes + false_votes
    trust_score = round((true_votes / total) * 100) if total > 0 else 100

    new_status = current_status
    if false_votes >= 3 and false_votes > true_votes:
        new_status = "FLAGGED_FAKE"
    elif current_status != "OFFICIALLY_ESCALATED":
        new_status = "ACTIVE"

    cursor.execute("""
    UPDATE issues
    SET true_votes = ?, false_votes = ?, trust_score = ?, status = ?
    WHERE id = ?
    """, (true_votes, false_votes, trust_score, new_status, issue_id))
    conn.commit()
    conn.close()

    return fetch_issue_by_id(issue_id)

def set_escalated(issue_id: str, ticket_id: str, receipt_json: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE issues
    SET is_escalated = 1, status = 'OFFICIALLY_ESCALATED', ticket_id = ?, ticket_receipt_json = ?
    WHERE id = ?
    """, (ticket_id, receipt_json, issue_id))
    conn.commit()
    conn.close()
    return fetch_issue_by_id(issue_id)
