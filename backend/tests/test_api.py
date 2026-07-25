"""Integration tests for API endpoints."""

import pytest
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Test health check endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["service"] == "PRAMAAN AI"


def test_user_registration(client: TestClient, sample_user_data):
    """Test user registration."""
    response = client.post("/api/v1/auth/register", json=sample_user_data)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == sample_user_data["email"]


def test_user_login(client: TestClient, sample_user_data):
    """Test user login."""
    # First register the user
    client.post("/api/v1/auth/register", json=sample_user_data)
    
    # Then login
    login_data = {
        "email": sample_user_data["email"],
        "password": sample_user_data["password"]
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == sample_user_data["email"]


def test_duplicate_registration(client: TestClient, sample_user_data):
    """Test that duplicate registration fails."""
    # Register user first time
    client.post("/api/v1/auth/register", json=sample_user_data)
    
    # Try to register again with same email
    response = client.post("/api/v1/auth/register", json=sample_user_data)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_invalid_login(client: TestClient):
    """Test login with invalid credentials."""
    login_data = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401


def test_get_current_user(client: TestClient, sample_user_data):
    """Test getting current user info with authentication."""
    # Register and login
    register_response = client.post("/api/v1/auth/register", json=sample_user_data)
    token = register_response.json()["access_token"]
    
    # Get current user
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == sample_user_data["email"]


def test_verification_endpoint(client: TestClient, sample_user_data, sample_verification_data):
    """Test verification endpoint with authentication."""
    reg_res = client.post("/api/v1/auth/register", json=sample_user_data)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/api/v1/verify", json=sample_verification_data, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "verification_id" in data
    assert data["status"] in ["queued", "processing", "completed"]


def test_get_nonexistent_report(client: TestClient, sample_user_data):
    """Test getting report for non-existent verification."""
    reg_res = client.post("/api/v1/auth/register", json=sample_user_data)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/api/v1/report/99999", headers=headers)
    assert response.status_code == 404


def test_history_endpoint(client: TestClient, sample_user_data):
    """Test verification history endpoint."""
    reg_res = client.post("/api/v1/auth/register", json=sample_user_data)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/api/v1/history", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "verifications" in data


def test_rate_limiting(client: TestClient):
    """Test rate limiting middleware."""
    pytest.skip("Rate limiting stress loop skipped in unit test suite for performance")
