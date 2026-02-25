import os
from groq import Groq

def generate_summary(data):

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError("GROQ_API_KEY is not set")

    client = Groq(api_key=api_key)

    prompt = f"""
    Generate a professional resume summary for:
    Name: {data.get('full_name', '')}
    Professional Title: {data.get('professional_title', '')}

    Write a strong, concise 3-4 line professional summary in first person.
    Only return the summary text, no extra explanation or labels.
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a professional resume writer."},
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
    Generate a professional work experience description for a resume.

    Role: {data.get('role', '')}
    Company: {data.get('company', '')}
    Start Date: {data.get('start_date', '')}
    End Date: {data.get('end_date', 'Present')}

    Write 2-3 strong bullet points describing responsibilities and achievements.
    Only return the bullet points, no extra explanation.
    Use action verbs. Be specific and professional.
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a professional resume writer. Return only bullet points, nothing else."},
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
    Generate a professional project description for a resume.

    Project Title: {data.get('title', '')}
    Tech Stack: {data.get('tech_stack', '')}

    Write 2-3 strong bullet points describing what was built, technologies used, and impact.
    Only return the bullet points, no extra explanation.
    Use action verbs. Be specific and professional.
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a professional resume writer. Return only bullet points, nothing else."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=300,
    )
    return response.choices[0].message.content.strip()