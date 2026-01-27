import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app

@pytest.fixture
def mock_supabase(mocker):
    mock = MagicMock()
    mocker.patch("app.routes.auth.supabase", mock)
    return mock

def test_signup_success(mock_supabase):
    # Arrange
    mock_supabase.auth.sign_up.return_value.user.id = "user-123"
    mock_supabase.auth.sign_up.return_value.session = {"access": "token"}

    client = TestClient(app)

    # Act
    response = client.post("/auth/signup", json={
        "email": "unit@example.com",
        "password": "Test@1234",
        "username": "unit",
        "first_name": "Unit",
        "last_name": "Test"
    })

    # Assert
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["user"]["email"] == "unit@example.com"

    mock_supabase.table.assert_called_with("users")


def test_signup_duplicate_email(mock_supabase):
    # Arrange
    mock_supabase.auth.sign_up.return_value.user = None

    client = TestClient(app)

    # Act
    response = client.post("/auth/signup", json={
        "email": "unit@example.com",
        "password": "Test@1234"
    })

    # Assert
    assert response.status_code == 409
    assert "already" in response.json()["detail"].lower()


def test_signup_missing_password(mock_supabase):
    client = TestClient(app)

    response = client.post("/auth/signup", json={
        "email": "unit@example.com"
    })

    assert response.status_code == 400

def test_signup_missing_password(mock_supabase):
    client = TestClient(app)

    response = client.post("/auth/signup", json={
        "email": "unit@example.com"
    })

    assert response.status_code == 400

def test_login_success(mock_supabase):
    mock_supabase.auth.sign_in_with_password.return_value.user.id = "user-123"
    mock_supabase.auth.sign_in_with_password.return_value.session = {
        "access_token": "token"
    }

    client = TestClient(app)

    response = client.post("/auth/login", json={
        "email": "unit@example.com",
        "password": "Test@1234"
    })

    assert response.status_code == 200
    assert "access_token" in response.json()["session"]

def test_login_invalid_password(mock_supabase):
    mock_supabase.auth.sign_in_with_password.return_value.user = None

    client = TestClient(app)

    response = client.post("/auth/login", json={
        "email": "unit@example.com",
        "password": "wrong"
    })

    assert response.status_code == 401


def test_me_unauthorized():
    client = TestClient(app)
    response = client.get("/auth/me")
    assert response.status_code == 401
