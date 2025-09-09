// src/components/Dashboard.tsx
import { useState } from "react";
import electron from "electron"

export default function Dashboard() {
  const [filePath, setFilePath] = useState<string>("");
  const [course, setCourse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFilePath(e.target.files[0].path);
    }
  };

  const handleExtract = async () => {
    setError(null);
    setCourse(null);

    if (!filePath) {
      setError("Please select a PDF file first");
      return;
    }

    try {
      // Call the IPC handler to extract course from PDF
      const result = await window.electronAPI.extractCourseFromPDF(filePath);


      if (result.success) {
        setCourse(result.course);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>PDF NLP Test Dashboard</h1>

      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleExtract} style={{ marginLeft: "1rem" }}>
        Extract Course Info
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {course && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Extracted Course Info</h2>
          <pre>{JSON.stringify(course, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
