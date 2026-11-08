
"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

type Experience = {
  company: string;
  startDate: string;
  endDate: string;
};

type Profile = {
  fullName: string;
  phone: string;
  email: string;
  linkedin: string;
  degree: string;
  university: string;
  educationDates: string;
  certifications: string;
  experience: Experience[];
};

type Props = {
  profile: Profile;
  resume: string;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingBottom: 20,
    paddingHorizontal: 18,
    fontFamily: "Helvetica",
    fontSize: 9.2,
    lineHeight: 1.13,
    color: "#000000",
  },
  header: {
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 17,
    textAlign: "center",
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
    textAlign: "center",
    marginBottom: 2,
  },
  heading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginTop: 7,
    marginBottom: 3,
  },
  paragraph: {
    fontSize: 9.2,
    marginBottom: 2,
  },
  skillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 2,
  },
  skillLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.2,
  },
  skillValue: {
    fontSize: 9.2,
  },
  jobHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    marginTop: 5,
    marginBottom: 3,
  },
  bulletRow: {
    flexDirection: "row",
    paddingLeft: 8,
    marginBottom: 2,
  },
  bulletMark: {
    width: 10,
    fontSize: 9.2,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.2,
  },
});

const sectionNames = [
  "TARGET JOB TITLE",
  "PROFESSIONAL SUMMARY",
  "EDUCATION",
  "TECHNICAL SKILLS",
  "WORK EXPERIENCE",
  "CERTIFICATIONS",
] as const;

type SectionName = (typeof sectionNames)[number];

function parseSections(text: string) {
  const result: Record<SectionName, string[]> = {
    "TARGET JOB TITLE": [],
    "PROFESSIONAL SUMMARY": [],
    EDUCATION: [],
    "TECHNICAL SKILLS": [],
    "WORK EXPERIENCE": [],
    CERTIFICATIONS: [],
  };

  let current: SectionName | null = null;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw
      .trim()
      .replace(/^\*\*(.*?)\*\*$/, "$1")
      .replace(/^#{1,6}\s+/, "");

    if (!line) continue;

    const normalized = line
      .replace(/:$/, "")
      .toUpperCase();

    const section = sectionNames.find(
      (name) => name === normalized
    );

    if (section) {
      current = section;
      continue;
    }

    if (current) {
      result[current].push(line);
    }
  }

  return result;
}

function clean(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/^[-*•]\s*/, "")
    .trim();
}

function SectionHeading({
  title,
}: {
  title: string;
}) {
  return (
    <Text style={styles.heading}>
      {title}
    </Text>
  );
}

export default function ResumePDF({
  profile,
  resume,
}: Props) {
  const sections = parseSections(resume);

  const targetTitle =
    clean(sections["TARGET JOB TITLE"][0] || "") ||
    "Software Engineer";

  const summary = sections["PROFESSIONAL SUMMARY"]
    .map(clean)
    .join(" ");

  const skills = sections["TECHNICAL SKILLS"];

  const experienceLines =
    sections["WORK EXPERIENCE"];

  const jobs = profile.experience.map((job) => {
    const company = job.company.trim();

    const startIndex = experienceLines.findIndex(
      (line) =>
        line.toLowerCase().includes(
          `@ ${company}`.toLowerCase()
        ) ||
        line.toLowerCase().startsWith(
          `${company} |`.toLowerCase()
        )
    );

    const nextIndex =
      startIndex < 0
        ? -1
        : experienceLines.findIndex(
            (line, index) =>
              index > startIndex &&
              profile.experience.some(
                (other) =>
                  other.company !== company &&
                  line.toLowerCase().includes(
                    other.company.toLowerCase()
                  )
              )
          );

    const jobLines =
      startIndex < 0
        ? []
        : experienceLines.slice(
            startIndex + 1,
            nextIndex < 0
              ? undefined
              : nextIndex
          );

    const bullets = jobLines
      .filter((line) =>
        /^[-*•]\s+/.test(line)
      )
      .map(clean)
      .filter(Boolean)
      .slice(0, 5);

    return {
      ...job,
      bullets,
    };
  });

  const certifications = profile.certifications
    .split(/\r?\n/)
    .map(clean)
    .filter(Boolean);

  return (
    <Document
      title={`${profile.fullName} - ${targetTitle}`}
      author={profile.fullName}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>
            {profile.fullName.trim().replace(/\s+/g, " ")} - {targetTitle}
          </Text>

          <Text style={styles.contact}>
            {profile.phone} | {profile.email} | United States
          </Text>

          <Text style={styles.contact}>
            {profile.linkedin}
          </Text>
        </View>

        {summary && (
          <View>
            <SectionHeading title="PROFESSIONAL SUMMARY" />
            <Text style={styles.paragraph}>
              {summary}
            </Text>
          </View>
        )}

        <View wrap={false}>
          <SectionHeading title="EDUCATION" />
          <Text style={styles.paragraph}>
            {profile.degree} — {profile.university} |{" "}
            {profile.educationDates}
          </Text>
        </View>

        {skills.length > 0 && (
          <View>
            <SectionHeading title="TECHNICAL SKILLS" />

            {skills.map((line, index) => {
              const cleaned = clean(line);
              const colon = cleaned.indexOf(":");

              if (colon < 0) {
                return (
                  <Text
                    key={index}
                    style={styles.paragraph}
                  >
                    {cleaned}
                  </Text>
                );
              }

              return (
                <View
                  key={index}
                  style={styles.skillRow}
                >
                  <Text style={styles.skillLabel}>
                    {cleaned.slice(0, colon + 1)}{" "}
                  </Text>
                  <Text style={styles.skillValue}>
                    {cleaned.slice(colon + 1).trim()}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <View>
          <SectionHeading title="WORK EXPERIENCE" />

          {jobs.map((job, index) => (
            <View key={index}>
              <Text style={styles.jobHeading}>
                {targetTitle} @ {job.company} |{" "}
                {job.startDate} – {job.endDate}
              </Text>

              {job.bullets.map((bullet, bulletIndex) => (
                <View
                  key={bulletIndex}
                  style={styles.bulletRow}
                >
                  <Text style={styles.bulletMark}>
                    {"\u2022"}
                  </Text>
                  <Text style={styles.bulletText}>
                    {bullet}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {certifications.length > 0 && (
          <View wrap={false}>
            <SectionHeading title="CERTIFICATIONS" />

            {certifications.map((cert, index) => (
              <Text
                key={index}
                style={styles.paragraph}
              >
                {cert}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
