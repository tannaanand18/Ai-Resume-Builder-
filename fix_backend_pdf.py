fix_backend_pdf = """
@resume_bp.route("/public-pdf/<int:resume_id>", methods=["GET"])
def download_public_pdf(resume_id):
    try:
        resume = Resume.query.filter_by(id=resume_id).first()
        if not resume:
            return jsonify({"error": "Resume not found"}), 404
        requested_template = request.args.get("template", None)
        if requested_template:
            original = resume.template_name
            resume.template_name = requested_template
            pdf = generate_resume_pdf(resume_id)
            resume.template_name = original
        else:
            pdf = generate_resume_pdf(resume_id)
        name = resume.full_name or resume.title or "resume"
        filename = f"{name.replace(' ', '_')}_Resume.pdf"
        return send_file(pdf, as_attachment=True, download_name=filename, mimetype="application/pdf")
    except Exception as e:
        return jsonify({"error": f"Failed to generate PDF: {str(e)}"}), 500
"""

with open("backend/app/routes/resume_routes.py", "r", encoding="utf-8") as f:
    content = f.read()

if "request.args" not in content:
    # Find and replace the old public-pdf route
    import re
    pattern = r'@resume_bp\.route\("/public-pdf.*?(?=@resume_bp\.route|\Z)'
    new_route = fix_backend_pdf.strip() + "\n\n\n"
    result = re.sub(pattern, new_route, content, flags=re.DOTALL)
    with open("backend/app/routes/resume_routes.py", "w", encoding="utf-8") as f:
        f.write(result)
    print("Fixed!")
else:
    print("Already fixed!")
