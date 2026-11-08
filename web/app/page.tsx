
"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import ResumePDF from "./ResumePDF";
import { analyzeATS } from "./atsAnalyzer";

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

export default function Home() {
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");

  // Keep the JD used to generate the displayed resume.
  const [generatedJD, setGeneratedJD] = useState("");

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [savedProfile, setSavedProfile] =
    useState<Profile | null>(null);

  const atsResult =
    resume.trim() && generatedJD.trim()
      ? analyzeATS(generatedJD, resume)
      : null;

  async function generateResume() {
    setLoading(true);
    setError("");
    setResume("");
    setGeneratedJD("");
    setSavedProfile(null);

    try {
      const storedProfile =
        localStorage.getItem("resumeProfile");

      if (!storedProfile) {
        throw new Error(
          "Please save your details in My Profile first."
        );
      }

      const profile = JSON.parse(
        storedProfile
      ) as Profile;

      if (
        !profile.fullName ||
        !Array.isArray(profile.experience)
      ) {
        throw new Error(
          "Your saved profile is incomplete. Please update My Profile."
        );
      }

      const currentCompany = company.trim();
      const currentJD = jobDescription.trim();

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: currentCompany,
          jobDescription: currentJD,
          profile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Resume generation failed."
        );
      }

      if (
        typeof data.resume !== "string" ||
        !data.resume.trim()
      ) {
        throw new Error(
          "No resume text was returned."
        );
      }

      setSavedProfile(profile);
      setGeneratedJD(currentJD);
      setResume(data.resume);

      // Save resume history in this browser.
      try {
        const savedHistory = JSON.parse(
          localStorage.getItem("resumeHistory") || "[]"
        );

        const newHistoryItem = {
          id: crypto.randomUUID(),
          company: currentCompany,
          jobDescription: currentJD,
          resume: data.resume,
          profile,
          createdAt: new Date().toISOString(),
        };

        const updatedHistory = [
          newHistoryItem,
          ...(Array.isArray(savedHistory)
            ? savedHistory
            : []),
        ];

        localStorage.setItem(
          "resumeHistory",
          JSON.stringify(updatedHistory)
        );
      } catch (historyError) {
        console.error(
          "Could not save resume history:",
          historyError
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function downloadResumePDF() {
    if (!savedProfile || !resume) {
      alert("Please generate a resume first.");
      return;
    }

    setDownloading(true);

    try {
      const blob = await pdf(
        <ResumePDF
          profile={savedProfile}
          resume={resume}
        />
      ).toBlob();

      if (blob.size === 0) {
        throw new Error("PDF is empty.");
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        const dataUrl = reader.result;

        if (typeof dataUrl !== "string") {
          setDownloading(false);
          alert("Could not prepare PDF preview.");
          return;
        }

        const pdfWindow = window.open("", "_blank");

        if (pdfWindow) {
          pdfWindow.document.write(`
            <html>
              <head>
                <title>Resume PDF Preview</title>
              </head>
              <body style="margin:0">
                <iframe
                  src="${dataUrl}"
                  style="width:100%;height:100vh;border:0"
                ></iframe>
              </body>
            </html>
          `);

          pdfWindow.document.close();
        } else {
          alert(
            "Allow pop-ups for this website and try again."
          );
        }

        setDownloading(false);
      };

      reader.onerror = () => {
        console.error("Could not read PDF blob");
        setDownloading(false);
        alert("PDF file reading failed.");
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("PDF error:", err);
      setDownloading(false);
      alert("PDF generation failed.");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="hidden w-64 bg-slate-900 p-6 text-white md:block">
        <h2 className="mb-10 text-2xl font-bold">
          Resume AI
        </h2>

        <nav className="space-y-4">
          <a
            href="/"
            className="block rounded-lg bg-indigo-600 p-3 text-white"
          >
            Resume Generator
          </a>

          <a
            href="/profile"
            className="block rounded-lg p-3 text-gray-300 hover:bg-slate-800 hover:text-white"
          >
            My Profile
          </a>

          <a
            href="/history"
            className="block rounded-lg p-3 text-gray-300 hover:bg-slate-800 hover:text-white"
          >
            Resume History
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-5 md:p-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">
            AI Resume Generator
          </h1>

          <p className="mt-2 text-gray-500">
            Generate a tailored resume using OpenAI
          </p>

          {/* Generator Form */}
          <div className="mt-8 rounded-xl bg-white p-6 shadow-sm md:p-8">
            <label
              htmlFor="candidate"
              className="block font-medium"
            >
              Select Candidate
            </label>

            <select
              id="candidate"
              className="mb-6 mt-2 w-full rounded-lg border p-3"
              defaultValue="surya"
            >
              <option value="surya">
                Surya Nandan Tammina
              </option>
            </select>

            <label
              htmlFor="company"
              className="block font-medium"
            >
              Company Name
            </label>

            <input
              id="company"
              type="text"
              className="mb-6 mt-2 w-full rounded-lg border p-3"
              placeholder="Enter company name"
              value={company}
              onChange={(e) =>
                setCompany(e.target.value)
              }
            />

            <label
              htmlFor="jobDescription"
              className="block font-medium"
            >
              Job Description
            </label>

            <textarea
              id="jobDescription"
              className="mt-2 w-full rounded-lg border p-3"
              rows={10}
              placeholder="Paste the complete job description..."
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(e.target.value)
              }
            />

            <label
              htmlFor="aiModel"
              className="mt-6 block font-medium"
            >
              AI Model
            </label>

            <select
              id="aiModel"
              className="mt-2 w-full rounded-lg border p-3"
              defaultValue="openai"
            >
              <option value="openai">
                OpenAI GPT
              </option>
            </select>

            <button
              type="button"
              onClick={generateResume}
              disabled={
                loading ||
                !company.trim() ||
                !jobDescription.trim()
              }
              className="mt-8 w-full rounded-lg bg-indigo-600 p-4 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Generating Resume..."
                : "Generate Resume"}
            </button>

            {error && (
              <p className="mt-5 text-red-600">
                {error}
              </p>
            )}
          </div>

          {/* Generated Resume */}
          {resume && (
            <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">
                Generated Resume Draft
              </h2>

              <pre className="whitespace-pre-wrap font-sans text-sm leading-7">
                {resume}
              </pre>

              {/* PDF Preview */}
              {savedProfile && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={downloadResumePDF}
                    disabled={downloading}
                    className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {downloading
                      ? "Preparing PDF..."
                      : "Download Resume PDF"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ATS Match Analysis */}
          {atsResult && (
            <div className="mt-6 rounded-xl bg-white p-8 shadow-sm text-gray-900">
              <h2 className="mb-4 text-xl font-bold">
                ATS Keyword Match Analysis
              </h2>

              <p className="text-4xl font-bold text-blue-600">
                {atsResult.score}%
              </p>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${atsResult.score}%`,
                  }}
                />
              </div>

              <p className="mt-4">
                Matched Keywords:{" "}
                {atsResult.matchedKeywords.length} /{" "}
                {atsResult.totalKeywords}
              </p>

              <h3 className="mt-5 font-bold">
                Matched Skills
              </h3>

              <p className="mt-2 text-sm leading-6">
                {atsResult.matchedKeywords.join(", ") ||
                  "None"}
              </p>

              <h3 className="mt-5 font-bold">
                Missing Skills
              </h3>

              <p className="mt-2 text-sm leading-6">
                {atsResult.missingKeywords.join(", ") ||
                  "None"}
              </p>

              {atsResult.totalKeywords === 0 && (
                <p className="mt-4 text-sm text-amber-700">
                  No keywords from the predefined technical
                  skills list were detected in this job
                  description. The score is not meaningful
                  for this JD.
                </p>
              )}

              <p className="mt-5 text-xs text-gray-500">
                This percentage measures technical keyword
                coverage against a predefined list. It is
                not an official employer ATS score.
                Verify all skills and experience before
                using a resume for real applications.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
