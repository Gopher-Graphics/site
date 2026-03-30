import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Orbs } from "./components/Orbs";
import { Nav } from "./components/Nav";
import { LoginModal } from "./components/LoginModal";
import { UploadProjectModal } from "./components/UploadProjectModal";
import { HomePage } from "./pages/HomePage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { AboutPage } from "./pages/AboutPage";
import { MessagesPage } from "./pages/MessagesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PROJECTS as INITIAL_PROJECTS, FAKE_USERS, CHANNELS, SEED_MESSAGES } from "./data/mockData";
import { User, Project, Channel, MessagesByChannel, DirectMessages } from "./types";

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [users, setUsers] = useState<User[]>(FAKE_USERS);
  const [channels, setChannels] = useState<Channel[]>(CHANNELS);
  const [messagesByChannel, setMessagesByChannel] = useState<MessagesByChannel>(SEED_MESSAGES);
  const [directMessages, setDirectMessages] = useState<DirectMessages>({});

  function handleLogin(u: User) { setUser(u); setShowLogin(false); }
  function handleSignOut() { setUser(null); }

  function handleCreateAccount(newU: User) {
    setUsers(prev => [...prev, newU]);
    setUser(newU);
    setShowLogin(false);
  }

  function handleUpdateUser(updatedData: Partial<User>) {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    setUsers(prev => prev.map(u => u.x500 === user.x500 ? updated : u));
  }

  function handleAddProject(project: any) {
    if (!user) return;
    const newProject: Project = { ...project, author: user.name };
    setProjects(prev => [newProject, ...prev]);
  }

  function handleDeleteProject(id: number) {
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  const allTags = Array.from(new Set(projects.flatMap(p => p.tags)));

  return (
    <BrowserRouter>
      <div className="min-h-screen relative">
        <Orbs />
        <div className="relative z-10">
          <Nav user={user} onSignIn={() => setShowLogin(true)} />

          <Routes>
            <Route path="/"         element={<HomePage />} />
            <Route path="/home"     element={<Navigate to="/" replace />} />
            <Route path="/projects" element={<ProjectsPage projects={projects} />} />
            <Route path="/about"    element={<AboutPage />} />

            <Route path="/messages" element={
              user
                ? <MessagesPage user={user} users={users} channels={channels} setChannels={setChannels}
                    messagesByChannel={messagesByChannel} setMessagesByChannel={setMessagesByChannel}
                    directMessages={directMessages} setDirectMessages={setDirectMessages} />
                : <Navigate to="/" replace />
            } />

            <Route path="/dashboard" element={
              user
                ? <DashboardPage user={user} projects={projects} onUpload={() => setShowUpload(true)}
                    onUpdateUser={handleUpdateUser} onSignOut={handleSignOut} onDeleteProject={handleDeleteProject} />
                : <Navigate to="/" replace />
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {showLogin  && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} onCreateAccount={handleCreateAccount} users={users} />}
          {showUpload && <UploadProjectModal onClose={() => setShowUpload(false)} onSubmit={handleAddProject} existingTags={allTags} />}
        </div>
      </div>
    </BrowserRouter>
  );
}
