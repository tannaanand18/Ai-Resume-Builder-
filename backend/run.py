import os
import sys

# Ensure the backend directory is in the Python path
# This handles both running from repo root and backend/ directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from flask import jsonify
from app.extensions import db
from sqlalchemy import text


app = create_app()   # FIRST create app

@app.route("/")
def home():
    return jsonify({"message": "Backend is working", "db_configured": bool(app.config.get("SQLALCHEMY_DATABASE_URI"))})

@app.route("/test-db")
def test_db():
    try:
        db.session.execute(text("SELECT 1"))
        return {"message": "Database connected successfully"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
