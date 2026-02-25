from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import A4
from io import BytesIO
from app.models.resume import Resume
from app.models.experience import Experience
from app.models.education import Education
from app.models.skills import Skill
from app.models.project import Project
from app.models.certification import Certification


def generate_resume_pdf(resume_id):
    # ✅ Fetch all data from DB
    resume = Resume.query.get(resume_id)
    experiences = Experience.query.filter_by(resume_id=resume_id).all()
    educations = Education.query.filter_by(resume_id=resume_id).all()
    skills = Skill.query.filter_by(resume_id=resume_id).all()
    projects = Project.query.filter_by(resume_id=resume_id).all()
    certs = Certification.query.filter_by(resume_id=resume_id).all()

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    elements = []
    styles = getSampleStyleSheet()

    name_style = ParagraphStyle('NameStyle', parent=styles['Heading1'], fontSize=22, spaceAfter=4)
    sub_style = ParagraphStyle('SubStyle', parent=styles['Normal'], fontSize=11, textColor=colors.HexColor("#555555"), spaceAfter=4)
    contact_style = ParagraphStyle('ContactStyle', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor("#555555"), spaceAfter=6)
    section_style = ParagraphStyle('SectionStyle', parent=styles['Heading2'], fontSize=12, spaceBefore=10, spaceAfter=4, textColor=colors.HexColor("#111111"))
    normal_style = ParagraphStyle('NormalStyle', parent=styles['Normal'], fontSize=10, leading=14)
    bold_style = ParagraphStyle('BoldStyle', parent=styles['Normal'], fontSize=10, leading=14)
    small_style = ParagraphStyle('SmallStyle', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor("#666666"), leading=13)

    # ── HEADER ──
    elements.append(Paragraph(resume.full_name or resume.title or "Your Name", name_style))
    if resume.professional_title:
        elements.append(Paragraph(resume.professional_title, sub_style))

    # Contact line
    contact_parts = []
    if resume.email: contact_parts.append(resume.email)
    if resume.phone: contact_parts.append(resume.phone)
    if resume.location: contact_parts.append(resume.location)
    if resume.linkedin: contact_parts.append(resume.linkedin)
    if contact_parts:
        elements.append(Paragraph("  •  ".join(contact_parts), contact_style))

    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.black))
    elements.append(Spacer(1, 0.15 * inch))

    # ── SUMMARY ──
    if resume.summary:
        elements.append(Paragraph("PROFESSIONAL SUMMARY", section_style))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
        elements.append(Spacer(1, 0.08 * inch))
        elements.append(Paragraph(resume.summary, normal_style))
        elements.append(Spacer(1, 0.15 * inch))

    # ── EXPERIENCE ──
    if experiences:
        elements.append(Paragraph("WORK EXPERIENCE", section_style))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
        elements.append(Spacer(1, 0.08 * inch))
        for exp in experiences:
            elements.append(Paragraph(f"<b>{exp.role}</b>", bold_style))
            elements.append(Paragraph(f"{exp.company}  |  {exp.start_date} - {exp.end_date or 'Present'}", small_style))
            if exp.description:
                for line in exp.description.split("\n"):
                    if line.strip():
                        elements.append(Paragraph(f"• {line.strip().lstrip('•').strip()}", normal_style))
            elements.append(Spacer(1, 0.12 * inch))

    # ── EDUCATION ──
    if educations:
        elements.append(Paragraph("EDUCATION", section_style))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
        elements.append(Spacer(1, 0.08 * inch))
        for edu in educations:
            elements.append(Paragraph(f"<b>{edu.degree}</b>", bold_style))
            elements.append(Paragraph(f"{edu.institution}  |  {edu.start_year} - {edu.end_year}", small_style))
            elements.append(Spacer(1, 0.1 * inch))

    # ── SKILLS ──
    if skills:
        elements.append(Paragraph("SKILLS", section_style))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
        elements.append(Spacer(1, 0.08 * inch))
        skill_text = "  •  ".join([f"{s.skill_name} ({s.level})" if s.level else s.skill_name for s in skills])
        elements.append(Paragraph(skill_text, normal_style))
        elements.append(Spacer(1, 0.12 * inch))

    # ── PROJECTS ──
    if projects:
        elements.append(Paragraph("PROJECTS", section_style))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
        elements.append(Spacer(1, 0.08 * inch))
        for proj in projects:
            title_line = f"<b>{proj.project_title}</b>"
            if proj.tech_stack:
                title_line += f"  |  <i>{proj.tech_stack}</i>"
            elements.append(Paragraph(title_line, bold_style))
            if proj.link:
                elements.append(Paragraph(proj.link, small_style))
            if proj.description:
                for line in proj.description.split("\n"):
                    if line.strip():
                        elements.append(Paragraph(f"• {line.strip().lstrip('•').strip()}", normal_style))
            elements.append(Spacer(1, 0.12 * inch))

    # ── CERTIFICATIONS ──
    if certs:
        elements.append(Paragraph("CERTIFICATIONS", section_style))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
        elements.append(Spacer(1, 0.08 * inch))
        for cert in certs:
            text = f"<b>{cert.title}</b>"
            if cert.organization: text += f"  |  {cert.organization}"
            if cert.issue_year: text += f"  |  {cert.issue_year}"
            elements.append(Paragraph(text, normal_style))
            elements.append(Spacer(1, 0.08 * inch))

    doc.build(elements)
    buffer.seek(0)
    return buffer