from flask import Blueprint, request, jsonify, session
from app import db
from app.models import User, ActivityLog
from flask_bcrypt import Bcrypt

auth_bp = Blueprint("auth", __name__)
bcrypt = Bcrypt()

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    requested_role = data.get("role", "patient")

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    # Determine role
    if email == "admin@gmail.com":
        role = "admin"
    elif requested_role in ("caregiver", "admin"):
        role = requested_role
    else:
        role = "patient"

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(name=name, email=email, password_hash=hashed_password, role=role)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully", "role": role}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        session["user_id"] = user.id
        session["role"] = user.role

        log = ActivityLog(user_id=user.id, action="User logged in")
        db.session.add(log)
        db.session.commit()

        return jsonify({
            "message": "Login successful",
            "role": user.role,
            "name": user.name,
            "user_id": user.id
        }), 200

    return jsonify({"message": "Invalid credentials"}), 401

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200

@auth_bp.route("/me", methods=["GET"])
def get_me():
    """Get current user info"""
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"success": True, "user": user.to_dict()}), 200