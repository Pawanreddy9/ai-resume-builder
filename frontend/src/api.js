const API_BASE = '/api/resumes';

// Check if backend is available
let backendAvailable = null;

async function checkBackend() {
  if (backendAvailable !== null) return backendAvailable;
  try {
    const res = await fetch(API_BASE, { method: 'GET', signal: AbortSignal.timeout(2000) });
    backendAvailable = res.ok;
  } catch {
    backendAvailable = false;
  }
  return backendAvailable;
}

// Local storage fallback
const LS_KEY = 'ai_resume_builder_resumes';

function getLocalResumes() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalResumes(resumes) {
  localStorage.setItem(LS_KEY, JSON.stringify(resumes));
}

function generateId() {
  return 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

export async function uploadResume(file) {
  const online = await checkBackend();
  if (online) {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  }
  throw new Error('Backend not available. Please start the backend server for file upload, or create a resume from scratch.');
}

export async function createResume(data) {
  const online = await checkBackend();
  if (online) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create resume');
    return res.json();
  }
  // Local fallback
  const resume = {
    id: generateId(),
    personal: data.personal || { name: '', email: '', phone: '', location: '', linkedin: '', website: '' },
    summary: data.summary || '',
    experience: data.experience || [],
    education: data.education || [],
    skills: data.skills || [],
    certifications: data.certifications || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const resumes = getLocalResumes();
  resumes.push(resume);
  saveLocalResumes(resumes);
  return resume;
}

export async function fetchResume(id) {
  const online = await checkBackend();
  if (online) {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('Resume not found');
    return res.json();
  }
  const resumes = getLocalResumes();
  const found = resumes.find(r => r.id === id);
  if (!found) throw new Error('Resume not found');
  return found;
}

export async function fetchResumes() {
  const online = await checkBackend();
  if (online) {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch resumes');
    return res.json();
  }
  return getLocalResumes();
}

export async function updateResume(id, data) {
  const online = await checkBackend();
  if (online) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update resume');
    return res.json();
  }
  // Local fallback
  const resumes = getLocalResumes();
  const idx = resumes.findIndex(r => r.id === id);
  if (idx === -1) throw new Error('Resume not found');
  resumes[idx] = { ...resumes[idx], ...data, updatedAt: new Date().toISOString() };
  saveLocalResumes(resumes);
  return resumes[idx];
}

export async function deleteResume(id) {
  const online = await checkBackend();
  if (online) {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete resume');
    return res.json();
  }
  const resumes = getLocalResumes();
  const filtered = resumes.filter(r => r.id !== id);
  saveLocalResumes(filtered);
  return { message: 'Deleted' };
}
