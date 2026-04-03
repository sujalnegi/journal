from flask import Flask, render_template, jsonify, request, session
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/editor.html")
def editor():
    return render_template("editor.html")


@app.route("/api/auth/verify", methods=["POST"])
def verify_token():
    data = request.get_json()
    id_token = data.get("idToken", "")

    if not id_token:
        return jsonify({"error": "No token provided"}), 400

    return jsonify({"status": "stub", "message": "Token received — verification not yet implemented"}), 200


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
