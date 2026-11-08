
const technicalKeywords = [
  "Python", "Java", "JavaScript", "TypeScript",
  "React", "Angular", "Node.js", "Next.js",
  "FastAPI", "Django", "Flask", "Spring Boot",
  "SQL", "PostgreSQL", "MySQL", "MongoDB",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes",
  "Terraform", "Jenkins", "GitHub Actions",
  "CI/CD", "Git", "Linux", "Bash",
  "REST APIs", "GraphQL", "Microservices",
  "PyTest", "JUnit", "Selenium",
  "OAuth", "JWT", "Agile", "Scrum",
  "Machine Learning", "TensorFlow", "PyTorch",
  "Pandas", "NumPy", "Datadog", "CrowdStrike",
];

function containsKeyword(
  text: string,
  keyword: string
): boolean {
  const normalizedText = text.toLowerCase();
  const normalizedKeyword = keyword.toLowerCase();

  const escaped = normalizedKeyword.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const pattern = new RegExp(
    `(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`,
    "i"
  );

  return pattern.test(normalizedText);
}

export function analyzeATS(
  jobDescription: string,
  resume: string
) {
  const requiredKeywords = technicalKeywords.filter(
    (keyword) => containsKeyword(jobDescription, keyword)
  );

  const matchedKeywords = requiredKeywords.filter(
    (keyword) => containsKeyword(resume, keyword)
  );

  const missingKeywords = requiredKeywords.filter(
    (keyword) => !containsKeyword(resume, keyword)
  );

  const score =
    requiredKeywords.length === 0
      ? 0
      : Math.round(
          (matchedKeywords.length /
            requiredKeywords.length) *
            100
        );

  return {
    score,
    matchedKeywords,
    missingKeywords,
    totalKeywords: requiredKeywords.length,
  };
}
