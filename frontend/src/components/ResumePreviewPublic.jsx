// ── ResumePreviewPublic.jsx ──
// Simple template renderer for public/shared resume views.
// Uses the same templates as ResumeBuilder.jsx.

import ResumeBuilderDefault, {
  TEMPLATE_MAP,
  TemplateCorporate,
} from "../pages/ResumeBuilder";

export default function ResumePreviewPublic({
  resume,
  experiences,
  educations,
  skills,
  projects,
  certs,
  templateStyle,
}) {
  const activeKey = templateStyle || resume?.template_name || "corporate";
  const TemplateComponent = TEMPLATE_MAP[activeKey] || TemplateCorporate;

  // Map API response field names to what templates expect
  const mappedSkills = (skills || []).map(s => ({
    ...s,
    skill_name: s.name || s.skill_name,
  }));

  const mappedProjects = (projects || []).map(p => ({
    ...p,
    project_title: p.title || p.project_title,
  }));

  return (
    <TemplateComponent
      resume={resume}
      experiences={experiences || []}
      educations={educations || []}
      skills={mappedSkills}
      projects={mappedProjects}
      certs={certs || []}
    />
  );
}
