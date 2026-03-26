import React, { useState } from "react";
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

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [users, setUsers] = useState(FAKE_USERS);
  const [channels, setChannels] = useState(CHANNELS);
  const [messagesByChannel, setMessagesByChannel] = useState(SEED_MESSAGES);
  const [directMessages, setDirectMessages] = useState({}); // { "otherUserX500": [messages...] }

  function handleLogin(u) { setUser(u); setShowLogin(false); }
  function handleSignOut() { setUser(null); }

  function handleCreateAccount(newU) {
    setUsers(prev => [...prev, newU]);
    setUser(newU);
    setShowLogin(false);
  }

  function handleUpdateUser(updatedData) {
    setUser(prev => ({ ...prev, ...updatedData }));
    setUsers(prev => prev.map(u => u.x500 === user.x500 ? { ...u, ...updatedData } : u));
  }

  function handleAddProject(project) {
    const newProject = { ...project, author: user.name };
    setProjects(prev => [newProject, ...prev]);
  }

  // Collect all unique tags from existing projects
  const allTags = Array.from(new Set(projects.flatMap(p => p.tags)));

  return (
    <BrowserRouter>
      <div style={{ minHeight:"100vh", position:"relative" }}>
        <Orbs />
        <div style={{ position:"relative", zIndex:1 }}>
          <Nav user={user} onSignIn={()=>setShowLogin(true)} onSignOut={handleSignOut} />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/projects" element={<ProjectsPage projects={projects} />} />
            <Route path="/about" element={<AboutPage />} />
            
            <Route 
              path="/messages" 
              element={user ? <MessagesPage user={user} users={users} channels={channels} setChannels={setChannels} messagesByChannel={messagesByChannel} setMessagesByChannel={setMessagesByChannel} directMessages={directMessages} setDirectMessages={setDirectMessages} /> : <Navigate to="/" replace />} 
            />
            
            <Route 
              path="/dashboard" 
              element={user ? <DashboardPage user={user} projects={projects} onUpload={()=>setShowUpload(true)} onUpdateUser={handleUpdateUser} onSignOut={handleSignOut} /> : <Navigate to="/" replace />} 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {showLogin && <LoginModal onClose={()=>setShowLogin(false)} onLogin={handleLogin} onCreateAccount={handleCreateAccount} users={users} />}
          {showUpload && <UploadProjectModal onClose={()=>setShowUpload(false)} onSubmit={handleAddProject} existingTags={allTags} />}
        </div>
      </div>
    </BrowserRouter>
  );
}
