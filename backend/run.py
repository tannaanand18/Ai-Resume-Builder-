from app import create_app
from flask import jsonify
from app.extensions import db
from sqlalchemy import text
import os


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
