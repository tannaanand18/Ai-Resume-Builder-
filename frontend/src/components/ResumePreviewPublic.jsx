import { ResumePreview } from "../pages/ResumeBuilder";

export default function ResumePreviewPublic({ resume, experiences, educations, skills, projects, certs, templateStyle }) {
  // Map API response field names to what templates expect
  // API returns: skill_name, project_title etc.
  // Templates expect: skill_name, project_title (same - good!)
  
  const mappedSkills = (skills || []).map(s => ({
    ...s,
    skill_name: s.name || s.skill_name,
  }));

  const mappedProjects = (projects || []).map(p => ({
    ...p,
    project_title: p.title || p.project_title,
  }));

  return (
    <ResumePreview
      resume={resume}
      experiences={experiences || []}
      educations={educations || []}
      skills={mappedSkills}
      projects={mappedProjects}
      certs={certs || []}
      templateStyle={templateStyle}
    />
  );
}
