from fastapi.testclient import TestClient

from backend.app import app


client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert "Cloud Assignment Submission Portal API is running" in data["message"]


def test_health_endpoint():
    response = client.get("/api/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"
    assert data["service"] == "backend"


def test_database_status_endpoint():
    response = client.get("/api/database-status")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "connected"
    assert data["database"] == "configured"


def test_protected_student_endpoint_requires_authentication():
    response = client.get("/api/auth/student-test")

    assert response.status_code == 401


def test_protected_teacher_endpoint_requires_authentication():
    response = client.get("/api/auth/teacher-test")

    assert response.status_code == 401