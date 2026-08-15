import os
import socket
from threading import Lock

from flask import Flask, Response, jsonify

app = Flask(__name__)

APP_VERSION = os.environ.get("APP_VERSION", "1.0.0")
request_count = 0
request_count_lock = Lock()


@app.before_request
def count_request():
    global request_count
    with request_count_lock:
        request_count += 1


@app.route("/")
def index():
    return jsonify(
        message="Hello from docker-k8s-cicd!",
        hostname=socket.gethostname(),
        version=APP_VERSION,
    )


@app.route("/healthz")
def healthz():
    return jsonify(status="ok")


@app.route("/metrics")
def metrics():
    with request_count_lock:
        current_request_count = request_count
    return Response(
        "# HELP http_requests_total Total HTTP requests served by the application.\n"
        "# TYPE http_requests_total counter\n"
        f"http_requests_total {current_request_count}\n",
        mimetype="text/plain; version=0.0.4; charset=utf-8",
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
