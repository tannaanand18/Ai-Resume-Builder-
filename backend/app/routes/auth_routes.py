from flask import Blueprint, request, jsonify,make_response
from app.extensions import db, bcrypt, mail
from app.models.user import User
from flask_mail import Message
import secrets
from datetime import datetime, timedelta
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity, 
    get_jwt,
    unset_jwt_cookies  # ✅ NEW: For logout
)


auth = Blueprint("auth", __name__)


# -------------------------------
# Register
# -------------------------------
@auth.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    new_user = User(
        name=name,
        email=email,
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


# -------------------------------
# Login
# -------------------------------
@auth.route("/login", methods=["POST"])
def login():
    """
    Login user and set JWT token in httpOnly cookie
    """
    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({"error": "Invalid credentials"}), 401

        if not bcrypt.check_password_hash(user.password, password):
            return jsonify({"error": "Invalid credentials"}), 401

        # Create JWT token with 7-day expiry
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "email": user.email,
                "role": user.role
            },
            expires_delta=timedelta(days=7)  # ✅ Token expires in 7 days
        )

        # ✅ CREATE RESPONSE WITH COOKIE
        response = make_response(jsonify({
            "message": "Login successful",
            "email": user.email,
            "role": user.role,
            "user_id": user.id
        }), 200)

        # ✅ SET HTTPONLY COOKIE (Secure & Auto-sent)
        response.set_cookie(
            key="access_token_cookie",      # Cookie name
            value=access_token,             # JWT token
            httponly=True,                  # 🔒 JavaScript can't access it (XSS protection)
            secure=False,                   # Set True in production with HTTPS
            samesite="Lax",                 # CSRF protection
            max_age=7*24*60*60,            # 7 days in seconds
            path="/"                        # Available for all routes
        )

        print(f"✅ Login successful for {email}, cookie set")
        return response

    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return jsonify({"error": "Login failed"}), 500
    
#########################Logout Route#########################
@auth.route("/logout", methods=["POST"])
def logout():
    """
    Logout user by clearing the JWT cookie
    """
    try:
        response = make_response(jsonify({
            "message": "Logged out successfully"
        }), 200)
        
        # ✅ DELETE THE COOKIE
        response.set_cookie(
            key="access_token_cookie",
            value="",                       # Empty value
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=0,                      # Expires immediately
            path="/"
        )
        
        print("✅ User logged out, cookie cleared")
        return response

    except Exception as e:
        print(f"❌ Logout error: {str(e)}")
        return jsonify({"error": "Logout failed"}), 500    



# -------------------------------
# Profile
# -------------------------------
@auth.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    claims = get_jwt()

    return jsonify({
        "id": user_id,
        "email": claims["email"],
        "role": claims["role"]
    })


# -------------------------------
# Admin Test
# -------------------------------
@auth.route("/admin-test", methods=["GET"])
@jwt_required()
def admin_test():
    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    return jsonify({
        "message": "Welcome Admin",
        "email": claims["email"],
        "role": claims["role"]
    })


# -------------------------------
# Forgot Password
# -------------------------------
@auth.route("/forgot-password", methods=["POST"])
def forgot_password():

    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "If email exists, reset link sent"}), 200

    token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(minutes=15)

    user.reset_token = token
    user.reset_token_expiry = expiry
    db.session.commit()

    reset_link = f"http://localhost:5173/reset-password/{token}"

    msg = Message(
        subject="Reset Your ResumeAI Password",
        recipients=[email],
        body=f"""
Click the link below to reset your password:

{reset_link}

This link will expire in 15 minutes.
"""
    )

    try:
        mail.send(msg)
        print("EMAIL SENT SUCCESSFULLY")

    except Exception as e:
        print("EMAIL ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Reset email sent"}), 200


# -------------------------------
# Reset Password
# -------------------------------
@auth.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):

    data = request.get_json()
    new_password = data.get("password")

    if not new_password:
        return jsonify({"error": "Password is required"}), 400

    user = User.query.filter_by(reset_token=token).first()

    if not user:
        return jsonify({"error": "Invalid token"}), 400

    if user.reset_token_expiry < datetime.utcnow():
        return jsonify({"error": "Token expired"}), 400

    hashed_password = bcrypt.generate_password_hash(new_password).decode("utf-8")

    user.password = hashed_password
    user.reset_token = None
    user.reset_token_expiry = None

    db.session.commit()

    return jsonify({"message": "Password reset successful"}), 200