import os
import socket

from flask import Flask, jsonify

app = Flask(__name__)

APP_VERSION = os.environ.get("APP_VERSION", "1.0.0")


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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
