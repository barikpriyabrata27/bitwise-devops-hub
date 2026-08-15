from app import app


def test_index_includes_service_metadata():
    response = app.test_client().get("/")

    assert response.status_code == 200
    assert response.json["message"] == "Hello from docker-k8s-cicd!"
    assert response.json["version"]


def test_healthz_reports_healthy_status():
    response = app.test_client().get("/healthz")

    assert response.status_code == 200
    assert response.json == {"status": "ok"}


def test_metrics_exposes_prometheus_counter():
    response = app.test_client().get("/metrics")

    assert response.status_code == 200
    assert response.mimetype == "text/plain"
    assert "# TYPE http_requests_total counter" in response.text
    assert "http_requests_total " in response.text