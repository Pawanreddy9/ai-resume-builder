import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { uploadResume, createResume } from '../api';

export default function Landing({ onCreateNew, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      toast.error('Please upload a PDF or DOCX file');
      return;
    }
    setUploading(true);
    try {
      const data = await uploadResume(file);
      toast.success('Resume parsed successfully!');
      onUploadComplete(data);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="landing">
      <div className="container">
        <div className="landing-hero">
          <h2>Build Your <span>Perfect Resume</span></h2>
          <p>Upload an existing resume for AI-powered parsing, or start fresh with our intuitive editor. Choose from 5 professional templates and export to ATS-friendly PDF.</p>
        </div>

        <div className="landing-options">
          <div
            className={`card landing-option upload-area ${dragging ? 'dragging' : ''}`}
            onClick={() => !uploading && fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {uploading ? (
              <>
                <div className="icon"><div className="spinner" style={{ width: 48, height: 48, borderWidth: 3, borderColor: 'rgba(79,70,229,0.2)', borderTopColor: '#4f46e5' }} /></div>
                <h3>Processing your resume...</h3>
                <p>AI is extracting and structuring your data</p>
              </>
            ) : (
              <>
                <div className="icon">📄</div>
                <h3>Upload Resume</h3>
                <p>Drop a PDF or DOCX file here, or click to browse</p>
                <p style={{ marginTop: 8, fontSize: '0.8rem', color: '#94a3b8' }}>AI will parse your resume into editable fields</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          <div className="card landing-option" onClick={onCreateNew}>
            <div className="icon">✏️</div>
            <h3>Start From Scratch</h3>
            <p>Create a new resume with our guided editor</p>
            <p style={{ marginTop: 8, fontSize: '0.8rem', color: '#94a3b8' }}>Fill in your details and pick a template</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <h3 style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 500 }}>5 Professional Templates Available</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { icon: '🎨', name: 'Modern' },
              { icon: '💼', name: 'Professional' },
              { icon: '✨', name: 'Minimal' },
              { icon: '🚀', name: 'Creative' },
              { icon: '🏥', name: 'Healthcare' },
            ].map(t => (
              <div key={t.name} style={{ background: 'white', padding: '12px 20px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                <span style={{ marginRight: 6 }}>{t.icon}</span>{t.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
