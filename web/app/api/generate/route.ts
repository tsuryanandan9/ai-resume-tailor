
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { company, jobDescription, profile } =
      await request.json();

    if (
      typeof company !== "string" ||
      !company.trim() ||
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {
      return NextResponse.json(
        { error: "Company and job description are required." },
        { status: 400 }
      );
    }

    if (
      !profile?.fullName ||
      !Array.isArray(profile?.experience) ||
      profile.experience.length === 0
    ) {
      return NextResponse.json(
        { error: "Please save My Profile first." },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",

      instructions: `
You are an expert resume-writing and ATS analysis
assistant building a resume demonstration application.

The output is a HYPOTHETICAL SAMPLE RESUME for
testing how resume content matches a job description.

The user wants rich, detailed, realistic sample
content rather than a minimal resume.

IMPORTANT RULES:

1. Use the candidate's saved name, employer names,
employment dates, education, and certifications
as fixed reference information.

2. Extract the target job title from the JD.

3. Write professional, role-relevant sample content
that demonstrates how an ATS-tailored resume
could be written.

4. You may create hypothetical technical skills,
projects, responsibilities, and accomplishments
for this demonstration.

5. These hypothetical details are NOT verified
employment claims. Do not describe them as verified.

6. Do not invent a new employer, degree,
certification, or employment period.

7. Never repeat the candidate's name, phone,
email, LinkedIn, or location in the generated body.

8. Do not include explanations, suggestions,
placeholder notes, or Markdown decorations.

9. Use natural professional language.
Avoid repeating JD keywords unnaturally.

10. Use concise content appropriate for an
A4 resume. Prioritize important requirements.

OUTPUT EXACTLY THESE SECTIONS:

TARGET JOB TITLE
One line containing only the target job title.

PROFESSIONAL SUMMARY
Write a compelling paragraph using the target
role and the most relevant technical capabilities.
Aim for approximately 65-95 words, adjusting
to the complexity of the JD.

EDUCATION
Leave this section empty. The PDF inserts the
saved education information.

TECHNICAL SKILLS
Write approximately 5-7 category-based lines.

Example format:
Programming Languages: Python, Java, TypeScript
Backend Technologies: FastAPI, Django, REST APIs
Frontend Technologies: React, HTML, CSS
Databases: PostgreSQL, MySQL
Cloud & DevOps: AWS, Docker, CI/CD

Select categories and technologies based
on the target JD.

WORK EXPERIENCE
For every saved employer, write a heading:

Target Job Title @ Company Name | Start Date – End Date

Under each employer, write 5-7 substantial
hypothetical achievement bullets.

Each bullet must start with "- ".

Bullets should demonstrate:
- Technical implementation
- Relevant frameworks and tools
- Architecture and development practices
- Testing, performance, or reliability
- Collaboration and business outcomes

Use JD keywords where appropriate.
Avoid fabricated numerical metrics unless
clearly presented as hypothetical examples.

Keep company names and dates exactly
as supplied in the profile.

CERTIFICATIONS
Leave this section empty. The PDF inserts
the saved certifications.

OUTPUT RULES:
Plain text only.
No Markdown bold or asterisks.
No horizontal separators.
No introductory or closing commentary.
Use the exact section headings specified.
`,

      input: `
TARGET COMPANY:
${company}

JOB DESCRIPTION:
${jobDescription}

SAVED PROFILE:
${JSON.stringify(profile, null, 2)}

Create a detailed, hypothetical, ATS-targeted
sample resume for demonstration purposes.
`,
    });

    const resume = response.output_text?.trim();

    if (!resume) {
      throw new Error("No resume content returned.");
    }

    return NextResponse.json({
      resume,
      demo: true,
    });
  } catch (error) {
    console.error("Resume generation error:", error);

    return NextResponse.json(
      {
        error: "Unable to generate resume. Please try again.",
      },
      { status: 500 }
    );
  }
}
