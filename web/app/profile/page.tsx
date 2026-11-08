
"use client";

import { useEffect, useState } from "react";


type Experience = {
  company: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
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
  technicalSkills: string;
  experience: Experience[];
};

const defaultProfile: Profile = {
  fullName: "Surya Nandan Tammina",
  phone: "314 339 9829",
  email: "suryanandan.tammina@gmail.com",
  linkedin: "https://www.linkedin.com/in/tsuryanandan",
  degree: "Master's in Computer and Information Sciences",
  university: "Saint Louis University",
  educationDates: "August 2024 – May 2026",
  certifications: "Full Stack Java\nProgramming with Python",
  technicalSkills: "",
  experience: [
    {
      company: "DoorDash",
      startDate: "January 2026",
      endDate: "Present",
      responsibilities: "",
    },
    {
      company: "HCL Technologies",
      startDate: "September 2021",
      endDate: "July 2024",
      responsibilities: "",
    },
  ],
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("resumeProfile");

      if (stored) {
        const oldProfile = JSON.parse(stored);

        setProfile({
          ...defaultProfile,
          ...oldProfile,
          technicalSkills: oldProfile.technicalSkills ?? "",
          experience: Array.isArray(oldProfile.experience)
            ? oldProfile.experience.map(
                (item: Partial<Experience>) => ({
                  company: item.company ?? "",
                  startDate: item.startDate ?? "",
                  endDate: item.endDate ?? "",
                  responsibilities: item.responsibilities ?? "",
                })
              )
            : defaultProfile.experience,
        });
      }
    } catch (error) {
      console.error("Unable to load saved profile:", error);
    }
  }, []);

  function updateField(
    field: keyof Profile,
    value: string
  ) {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);
  }

  function updateExperience(
    index: number,
    field: keyof Experience,
    value: string
  ) {
    setProfile((previous) => ({
      ...previous,
      experience: previous.experience.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      ),
    }));

    setSaved(false);
  }

  function saveProfile() {
    try {
      localStorage.setItem(
        "resumeProfile",
        JSON.stringify(profile)
      );
      setSaved(true);
    } catch (error) {
      console.error("Unable to save profile:", error);
      alert("Could not save your profile.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 p-3 text-gray-900";

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
        <a href="/" className="text-indigo-600">
          ← Resume Generator
        </a>

        <h1 className="mb-2 mt-6 text-3xl font-bold">
          My Profile
        </h1>

        <p className="mb-8 text-gray-500">
          Save your permanent resume information.
          The AI will use your verified skills and
          experience to tailor resumes.
        </p>

        <div className="space-y-5">
          {(
            [
              ["fullName", "Full Name"],
              ["phone", "Phone Number"],
              ["email", "Email"],
              ["linkedin", "LinkedIn URL"],
              ["degree", "Master's Degree"],
              ["university", "University"],
              ["educationDates", "Education Dates"],
            ] as const
          ).map(([field, label]) => (
            <div key={field}>
              <label className="mb-2 block font-medium">
                {label}
              </label>

              <input
                className={inputClass}
                value={profile[field]}
                onChange={(event) =>
                  updateField(field, event.target.value)
                }
              />
            </div>
          ))}

          <div>
            <label className="mb-2 block font-medium">
              Certifications (one per line)
            </label>

            <textarea
              rows={4}
              className={inputClass}
              value={profile.certifications}
              onChange={(event) =>
                updateField(
                  "certifications",
                  event.target.value
                )
              }
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Technical Skills
            </label>

            <p className="mb-2 text-sm text-gray-500">
              Enter only skills you actually have.
              You can group them by category.
            </p>

            <textarea
              rows={7}
              className={inputClass}
              placeholder={
                "Programming: Python, Java\n" +
                "Backend: Spring Boot, Django\n" +
                "Cloud: AWS, Docker"
              }
              value={profile.technicalSkills}
              onChange={(event) =>
                updateField(
                  "technicalSkills",
                  event.target.value
                )
              }
            />
          </div>

          <h2 className="pt-5 text-xl font-bold">
            Work Experience
          </h2>

          <p className="text-sm text-gray-500">
            Keep your actual company names and dates.
            Add the responsibilities and achievements
            you can accurately describe.
          </p>

          {profile.experience.map((item, index) => (
            <div
              key={index}
              className="space-y-4 rounded-lg border p-5"
            >
              <h3 className="font-semibold">
                Experience {index + 1}
              </h3>

              {(
                [
                  ["company", "Company Name"],
                  ["startDate", "Start Date"],
                  ["endDate", "End Date"],
                ] as const
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-medium">
                    {label}
                  </label>

                  <input
                    className={inputClass}
                    value={item[field]}
                    onChange={(event) =>
                      updateExperience(
                        index,
                        field,
                        event.target.value
                      )
                    }
                  />
                </div>
              ))}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Responsibilities and Achievements
                </label>

                <p className="mb-2 text-sm text-gray-500">
                  Enter your actual work, one item per line.
                </p>

                <textarea
                  rows={7}
                  className={inputClass}
                  placeholder={
                    "Describe your actual projects, tools, " +
                    "responsibilities, and measurable results."
                  }
                  value={item.responsibilities}
                  onChange={(event) =>
                    updateExperience(
                      index,
                      "responsibilities",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={saveProfile}
            className="w-full rounded-lg bg-indigo-600 p-4 font-semibold text-white hover:bg-indigo-700"
          >
            Save My Profile
          </button>

          {saved && (
            <p className="text-center font-medium text-green-700">
              Profile saved successfully!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
