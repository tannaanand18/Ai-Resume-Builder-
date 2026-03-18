import os
import pymysql
pymysql.install_as_MySQLdb()

from flask import Flask, request, jsonify
from werkzeug.middleware.proxy_fix import ProxyFix
from .config import Config
from .extensions import db, jwt, bcrypt, mail
from flask_cors import CORS

from .routes.auth_routes import auth
from .routes.resume_routes import resume_bp
from .routes.education_routes import education_bp
from .routes.experience_routes import experience_bp
from .routes.skills_routes import skill_bp
from .routes.project_routes import project_bp
from .routes.certification_routes import certification_bp
from .routes.ai_routes import ai_bp
from .routes.admin_routes import admin_bp


def create_app(test_config=None):
    app = Flask(__name__)

    app.config.from_object(Config)
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    if test_config:
        app.config.update(test_config)

    # Read allowed frontend URL from environment
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        frontend_url,"https://resumebuilder-kappa-nine.vercel.app",
    ]

    # Remove duplicates and empty strings
    allowed_origins = list(set([o for o in allowed_origins if o]))

    CORS(
        app,
        supports_credentials=True,
        origins=allowed_origins,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        expose_headers=["Set-Cookie"],
        max_age=600
    )

    # Handle OPTIONS preflight requests manually
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            origin = request.headers.get("Origin", "")
            if origin in allowed_origins:
                response = jsonify({"status": "ok"})
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
                return response, 200

    jwt.init_app(app)
    db.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth, url_prefix="/api/auth")
    app.register_blueprint(resume_bp, url_prefix="/api/resume")
    app.register_blueprint(education_bp, url_prefix="/api/education")
    app.register_blueprint(experience_bp, url_prefix="/api/experience")
    app.register_blueprint(skill_bp, url_prefix="/api/skills")
    app.register_blueprint(project_bp, url_prefix="/api/projects")
    app.register_blueprint(certification_bp, url_prefix="/api/certifications")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    return app