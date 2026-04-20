import React, { useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { TEMPLATES, renderTemplate } from '../templates';
import { generatePDF } from '../pdfGenerator';

export default function PreviewModal({ resume, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [exporting, setExporting] = useState(false);

  const previewHTML = useMemo(() => {
    return renderTemplate(selectedTemplate, resume);
  }, [selectedTemplate, resume]);

  const handleExport = useCallback(() => {
    setExporting(true);
    try {
      const pdf = generatePDF(selectedTemplate, resume);
      const name = (resume.personal?.name || 'resume').replace(/\s+/g, '_');
      pdf.save(`${name}_${selectedTemplate}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  }, [selectedTemplate, resume]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" style={{ maxWidth: 1000 }}>
        <div className="modal-header">
          <h2>📄 Preview & Export</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="template-grid">
            {TEMPLATES.map(t => (
              <div
                key={t.id}
                className={`template-card ${selectedTemplate === t.id ? 'active' : ''}`}
                onClick={() => setSelectedTemplate(t.id)}
              >
                <div className="icon">{t.icon}</div>
                <div className="name">{t.name}</div>
              </div>
            ))}
          </div>
          <div
            className="preview-container"
            dangerouslySetInnerHTML={{ __html: previewHTML }}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handleExport} disabled={exporting}>
            {exporting ? <><span className="spinner" /> Generating...</> : '📥 Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
