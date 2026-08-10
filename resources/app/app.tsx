import { Routes, Route } from "react-router-dom";
import Landing from "./renderer/pages/landing/page";
import Dashboard from "./renderer/pages/dashboard/page";
import CourseOverviewPage from "./renderer/pages/course_overview/page";
import CourseHomepageWrapper from "./renderer/components/Courses/CourseHomepageWrapper";
import TaskHomepage from "./renderer/pages/tasks/[taskId]";
import "./renderer/styles/App.css";
import { useEffect, useState } from "react";
import { initGoogleAuth } from "@/services/google";

export default function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Block application route rendering until tokens are fully hydrated from physical storage
    initGoogleAuth().then(() => {
      setIsAuthReady(true);
    });
  }, []);

  if (!isAuthReady) {
    return (
      <div className="w-full h-full bg-[#18181b] flex items-center justify-center">
        <p className="text-white/60 text-sm">Hydrating active profiles...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-transparent">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courseoverview" element={<CourseOverviewPage />} />
        <Route path="/courses/:courseId" element={<CourseHomepageWrapper />} />
        <Route path="/tasks/:taskId" element={<TaskHomepage />} />
      </Routes>
    </div>
  );
}
