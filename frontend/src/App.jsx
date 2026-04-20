import React, { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import Landing from './components/Landing';
import Editor from './components/Editor';
import './index.css';

const EMPTY_RESUME = {
  personal: { name: '', email: '', phone: '', location: '', linkedin: '', website: '' },
  summary: '',
  experience: [{ title: '', company: '', location: '', startDate: '', endDate: '', description: '' }],
  education: [{ degree: '', institution: '', location: '', startDate: '', endDate: '', gpa: '' }],
  skills: [],
  certifications: [],
};

export default function App() {
  const [resume, setResume] = useState(null);
  const [view, setView] = useState('landing');

  const handleCreateNew = useCallback(() => {
    setResume({ ...EMPTY_RESUME, id: null });
    setView('editor');
  }, []);

  const handleUploadComplete = useCallback((data) => {
    setResume(data);
    setView('editor');
  }, []);

  const handleBack = useCallback(() => {
    setView('landing');
    setResume(null);
  }, []);

  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '10px', background: '#1e293b', color: '#fff', fontSize: '0.9rem' },
        }}
      />
      <header className="app-header">
        <div className="container">
          <h1 onClick={handleBack} style={{ cursor: 'pointer' }}>
            <span>AI</span> Resume Builder
          </h1>
          {view === 'editor' && (
            <div className="header-actions">
              <button className="btn btn-ghost" onClick={handleBack">
                ← Back
              </button>
            </div>
          )}
        </div>
      </header>

      {view === 'landing' && (
        <Landing onCreateNew={handleCreateNew} onUploadComplete={handleUploadComplete} />
      )}
      {view === 'editor' && resume && (
        <Editor resume={resume} setResume={setResume} />
      )}
    </div>
  );
}
