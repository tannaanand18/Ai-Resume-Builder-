import os
from groq import Groq

def generate_summary(data):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set")
    client = Groq(api_key=api_key)

    prompt = f"""
    Write a professional resume summary for the following profile:
    Name: {data.get('full_name', '')}
    Professional Title: {data.get('professional_title', '')}

    CRITICAL INSTRUCTIONS:
    1. Length: Write EXACTLY 3 to 4 sentences. Keep it concise.
    2. NO Name: DO NOT include the applicant's name in the summary.
    3. Start Strong: Start the very first sentence directly with a strong adjective or the professional title (e.g., "Results-driven Data Scientist with..." or "Detail-oriented professional..."). Do NOT use the words "I am" or "Smit".
    4. NO Fake Experience: DO NOT invent years of experience (e.g., NEVER say "5+ years of experience"). Focus entirely on their expertise, problem-solving skills, and the value they bring.
    5. Format: Return ONLY the raw paragraph. Do not start with bullet points, hyphens, or the word "Summary:". 
    6. NO Markdown: DO NOT use any bolding, asterisks (**), or markdown formatting. Return plain text only.
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are an expert resume writer. Return only the requested text following all formatting rules."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=300,
    )
    
    return response.choices[0].message.content.strip()

def generate_experience_description(data):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set")
    client = Groq(api_key=api_key)

    prompt = f"""
    Based on the following details, write ONLY the description section for a resume work experience.

    Role: {data.get('role', '')}
    Company: {data.get('company', '')}
    Start Date: {data.get('start_date', '')}
    End Date: {data.get('end_date', 'Present')}

    CRITICAL INSTRUCTIONS: 
    1. Length: Write EXACTLY 3 to 4 strong, ATS-friendly sentences MAXIMUM. Do not exceed 4 lines.
    2. Format: DO NOT use any bullet points, hyphens (-), asterisks (*), or dots. Just provide the raw text sentences.
    3. No Headers: DO NOT include the Role, Company Name, or Dates in your final output. Start immediately with strong action verbs.
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a professional resume writer. Return only raw text sentences."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=300,
    )

    return response.choices[0].message.content.strip()

def generate_project_description(data):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set")
    client = Groq(api_key=api_key)

    prompt = f"""
    Based on the following details, write ONLY the description section for a resume project.

    Project Title: {data.get('title', '')}
    Tech Stack: {data.get('tech_stack', '')}

    CRITICAL INSTRUCTIONS: 
    1. Length: Write EXACTLY 2 to 3 strong sentences (Maximum 3 lines). 
    2. Format: DO NOT use any bullet points, hyphens (-), asterisks (*), or dots. Just provide the raw text sentences.
    3. No Headers: DO NOT include the Project Title or Tech Stack as a header. Naturally integrate the technologies used into the sentences.
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a professional resume writer. Return only raw text sentences."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=300,
    )
    return response.choices[0].message.content.strip()

def check_ats_score(resume_data, job_description):
    import json
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set")
    client = Groq(api_key=api_key)

    prompt = f"""
You are an expert ATS (Applicant Tracking System) analyzer.

Analyze this resume against the job description and return ONLY a valid JSON object.

JOB DESCRIPTION:
{job_description}

RESUME:
Name: {resume_data.get('full_name', '')}
Title: {resume_data.get('professional_title', '')}
Summary: {resume_data.get('summary', '')}
Experience: {resume_data.get('experience', '')}
Education: {resume_data.get('education', '')}
Skills: {resume_data.get('skills', '')}
Projects: {resume_data.get('projects', '')}
Certifications: {resume_data.get('certifications', '')}

Return ONLY this JSON (no markdown, no extra text):
{{
  "score": <number 0-100>,
  "grade": "<A/B/C/D/F>",
  "summary": "<2 sentence overall assessment>",
  "matched_keywords": ["keyword1", "keyword2"],
  "missing_keywords": ["keyword1", "keyword2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": [
    {{"section": "Summary", "issue": "...", "suggestion": "..."}},
    {{"section": "Skills", "issue": "...", "suggestion": "..."}},
    {{"section": "Experience", "issue": "...", "suggestion": "..."}}
  ],
  "quick_wins": ["tip1", "tip2", "tip3"]
}}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are an ATS expert. Return only valid JSON, no markdown, no extra text."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=1500,
    )

    raw = response.choices[0].message.content.strip()
    if "```" in raw:
        parts = raw.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("{"):
                raw = part
                break
    return json.loads(raw)
