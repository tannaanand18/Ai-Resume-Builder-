from flask import Blueprint, jsonify, request
from app.models.experience import Experience
from app.models.education import Education
from app.models.skills import Skill
from app.models.project import Project
from app.models.certification import Certification
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.resume import Resume
from app.services.ai_service import generate_summary,generate_experience_description,generate_project_description,check_ats_score


ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/generate-summary/<int:resume_id>", methods=["GET"])
@jwt_required()
def ai_generate_summary(resume_id):   
    user_id = get_jwt_identity()

    resume = Resume.query.filter_by(id=resume_id, user_id=int(user_id)).first()
    if not resume:
        return jsonify({"error": "Resume not found"}), 404

    summary = generate_summary({
        "full_name": resume.full_name or "",
        "professional_title": resume.professional_title or ""
    })
    
    return jsonify({"ai_generated_summary": summary}), 200

@ai_bp.route("/generate-experience", methods=["POST"])
@jwt_required()
def ai_generate_experience():
    data = request.get_json()
    if not data.get("role") or not data.get("company"):
        return jsonify({"error": "role and company are required"}), 400

    description = generate_experience_description({
        "role": data.get("role"),
        "company": data.get("company"),
        "start_date": data.get("start_date", ""),
        "end_date": data.get("end_date", "Present")
    })
    return jsonify({"description": description}), 200

@ai_bp.route("/generate-project", methods=["POST"])
@jwt_required()
def ai_generate_project():
    data = request.get_json()
    if not data.get("title"):
        return jsonify({"error": "title is required"}), 400

    description = generate_project_description({
        "title": data.get("title"),
        "tech_stack": data.get("tech_stack", "")
    })
    return jsonify({"description": description}), 200

@ai_bp.route("/ats-check/<int:resume_id>", methods=["POST"])
@jwt_required()
def ai_ats_check(resume_id):
    try:
        user_id = get_jwt_identity()
        resume = Resume.query.filter_by(id=resume_id, user_id=int(user_id)).first()
        if not resume:
            return jsonify({"error": "Resume not found"}), 404

        data = request.get_json()
        job_description = data.get("job_description", "").strip()
        if not job_description:
            return jsonify({"error": "Job description is required"}), 400

        experiences = Experience.query.filter_by(resume_id=resume_id).all()
        educations = Education.query.filter_by(resume_id=resume_id).all()
        skills = Skill.query.filter_by(resume_id=resume_id).all()
        projects = Project.query.filter_by(resume_id=resume_id).all()
        certs = Certification.query.filter_by(resume_id=resume_id).all()

        resume_data = {
            "full_name": resume.full_name or "",
            "professional_title": resume.professional_title or "",
            "summary": resume.summary or "",
            "experience": " | ".join([f"{e.role} at {e.company}: {e.description or ''}" for e in experiences]),
            "education": " | ".join([f"{e.degree} from {e.institution}" for e in educations]),
            "skills": ", ".join([s.skill_name for s in skills]),
            "projects": " | ".join([f"{p.project_title} ({p.tech_stack or ''}): {p.description or ''}" for p in projects]),
            "certifications": ", ".join([c.title for c in certs]),
        }

        result = check_ats_score(resume_data, job_description)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": f"ATS check failed: {str(e)}"}), 500

@ai_bp.route("/ats-check-text", methods=["POST"])
@jwt_required()
def ai_ats_check_text():
    try:
        data = request.get_json()
        resume_text = data.get("resume_text", "").strip()
        job_description = data.get("job_description", "").strip()
        file_name = data.get("file_name", "Uploaded file")

        if not job_description:
            return jsonify({"error": "Job description is required"}), 400

        if not resume_text or len(resume_text) < 50:
            return jsonify({"error": "Could not read resume text. Please use a text-based PDF or select a saved resume instead."}), 400

        resume_data = {
            "full_name": file_name.replace(".pdf","").replace(".docx",""),
            "professional_title": "Uploaded Resume",
            "summary": resume_text[:600],
            "experience": resume_text[600:1800],
            "education": resume_text[1800:2400],
            "skills": resume_text[2400:3000],
            "projects": "",
            "certifications": "",
        }
        result = check_ats_score(resume_data, job_description)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"ATS check failed: {str(e)}"}), 500