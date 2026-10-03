"""
Sample Legacy App - Audit Log Service
Clean reference module implementing structured compliance event tracking.
"""
from typing import Optional, Dict, Any, List
import json
from . import db_utils

def record_audit_event(
    actor_id: str,
    action: str,
    resource_id: str,
    metadata: Optional[Dict[str, Any]] = None,
    created_at: str = "2026-10-01T12:00:00Z",
    db_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Persist immutable compliance event via parameterized query.
    """
    conn = db_utils.get_raw_connection(db_path)
    cursor = conn.cursor()
    meta_json = json.dumps(metadata or {})
    
    cursor.execute(
        "INSERT INTO audit_events (actor_id, action, resource_id, metadata_json, created_at) VALUES (?, ?, ?, ?, ?)",
        (actor_id, action, resource_id, meta_json, created_at)
    )
    event_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "event_id": event_id,
        "actor_id": actor_id,
        "action": action,
        "resource_id": resource_id,
        "created_at": created_at,
        "status": "persisted"
    }

def get_audit_logs_for_actor(actor_id: str, db_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieve audit events by actor with safe parameterized query.
    """
    conn = db_utils.get_raw_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, actor_id, action, resource_id, metadata_json, created_at FROM audit_events WHERE actor_id = ?", (actor_id,))
    rows = cursor.fetchall()
    conn.close()
    
    events = []
    for r in rows:
        events.append({
            "id": r["id"],
            "actor_id": r["actor_id"],
            "action": r["action"],
            "resource_id": r["resource_id"],
            "metadata": json.loads(r["metadata_json"] or "{}"),
            "created_at": r["created_at"]
        })
    return events
