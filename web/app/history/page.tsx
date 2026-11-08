
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ResumePDF from "../ResumePDF";

type HistoryItem = {
  id: string;
  company: string;
  jobDescription: string;
  resume: string;
  createdAt: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("resumeHistory");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch {
      console.error("Could not load resume history");
    }
  }, []);

  function deleteResume(id: string) {
    if (!window.confirm("Delete this saved resume?")) return;

    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("resumeHistory", JSON.stringify(updated));

    if (selected?.id === id) {
      setSelected(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-indigo-600">
          ← Resume Generator
        </Link>

        <h1 className="mt-8 text-3xl font-bold">
          Resume History
        </h1>

        <p className="mt-2 text-gray-500">
          View your previously generated resumes.
        </p>

        {history.length === 0 ? (
          <div className="mt-8 rounded-xl bg-white p-8 shadow-sm">
            <p>No saved resumes yet.</p>
            <p className="mt-2 text-gray-500">
              Your generated resumes will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-gray-900">
                  {item.company || "Untitled Company"}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleString()}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setSelected(item)}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
                  >
                    View Resume
                  </button>

                  <button
                    onClick={() => deleteResume(item.id)}
                    className="rounded-lg border border-red-300 px-4 py-2 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {selected.company} — Resume
            </h2>

            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-gray-900">
              {selected.resume}
            </pre>

            <button
              onClick={() => setSelected(null)}
              className="mt-6 text-indigo-600"
            >
              
{(() => {
  const savedProfile = localStorage.getItem("resumeProfile");

  if (!savedProfile) {
    return (
      <p className="mt-4 text-red-600">
        Please save your profile first to download the PDF.
      </p>
    );
  }

  const profile = JSON.parse(savedProfile);

  return (
    <div className="mt-6">
      <PDFDownloadLink
        document={
          <ResumePDF
            profile={profile}
            resume={selected.resume}
          />
        }
        fileName={`${selected.company || "Resume"}_Resume.pdf`}
        className="inline-block rounded-lg bg-indigo-600 px-5 py-3 text-white"
      >
        {({ loading }) =>
          loading ? "Preparing PDF..." : "Download PDF"
        }
      </PDFDownloadLink>
    </div>
  );
})()}

Close Preview
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
