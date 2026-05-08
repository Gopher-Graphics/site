import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getProjects } from "./api/projects";
import { Orbs } from "./components/Orbs";
import { Nav } from "./components/Nav";
import { LoginModal } from "./components/LoginModal";
import { UploadProjectModal } from "./components/UploadProjectModal";
import { HomePage } from "./pages/HomePage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { AboutPage } from "./pages/AboutPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { MessagesPage } from "./pages/MessagesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { user, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  const existingTags = projectsData?.tags.map(t => t.name) || ["C++", "Ray Tracing", "Blender", "OpenGL", "Art", "Animation"];

  if (isLoading) {
    return <div className="min-h-screen bg-[#050002] text-white flex items-center justify-center font-ui">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen relative">
        <Orbs />
        <div className="relative z-10">
          <Nav user={user} onSignIn={() => setShowLogin(true)} />

          <Routes>
            <Route path="/"         element={<HomePage />} />
            <Route path="/home"     element={<Navigate to="/" replace />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/about"    element={<AboutPage />} />
            <Route path="/user/:username" element={<UserProfilePage />} />

            <Route path="/messages" element={
              user
                ? <MessagesPage />
                : <Navigate to="/" replace />
            } />

            <Route path="/dashboard" element={
              user
                ? <DashboardPage onUpload={() => setShowUpload(true)} />
                : <Navigate to="/" replace />
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {showLogin  && <LoginModal onClose={() => setShowLogin(false)} />}
          {showUpload && <UploadProjectModal onClose={() => setShowUpload(false)} existingTags={existingTags} />}
        </div>
      </div>
    </BrowserRouter>
  );
}
