const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { extractText } = require('../parser');
const { parseResumeWithAI } = require('../aiService');

let dbModule;
try {
  dbModule = require('../db');
} catch (e) {
  dbModule = null;
}

// In-memory store fallback when MongoDB is not available
const inMemoryStore = new Map();

async function getCollection() {
  if (dbModule) {
    try {
      const db = dbModule.getDb();
      return db.collection('resumes');
    } catch (e) {
      return null;
    }
  }
  return null;
}

module.exports = function resumeRoutes(upload) {
  const router = express.Router();

  // Upload and parse resume
  router.post('/upload', upload.single('resume'), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const text = await extractText(req.file.path, req.file.mimetype);

      // Clean up uploaded file
      fs.unlink(req.file.path, () => {});

      const parsed = await parseResumeWithAI(text);

      const resume = {
        id: uuidv4(),
        ...parsed,
        rawText: text,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const collection = await getCollection();
      if (collection) {
        await collection.insertOne({ _id: resume.id, ...resume });
      } else {
        inMemoryStore.set(resume.id, resume);
      }

      res.status(201).json(resume);
    } catch (err) {
      next(err);
    }
  });

  // Create resume from scratch (no file upload)
  router.post('/', async (req, res, next) => {
    try {
      const resume = {
        id: uuidv4(),
        personal: req.body.personal || { name: '', email: '', phone: '', location: '', linkedin: '', website: '' },
        summary: req.body.summary || '',
        experience: req.body.experience || [{ title: '', company: '', location: '', startDate: '', endDate: '', description: '' }],
        education: req.body.education || [{ degree: '', institution: '', location: '', startDate: '', endDate: '', gpa: '' }],
        skills: req.body.skills || [],
        certifications: req.body.certifications || [],
        rawText: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const collection = await getCollection();
      if (collection) {
        await collection.insertOne({ _id: resume.id, ...resume });
      } else {
        inMemoryStore.set(resume.id, resume);
      }

      res.status(201).json(resume);
    } catch (err) {
      next(err);
    }
  });

  // Get resume by ID
  router.get('/:id', async (req, res, next) => {
    try {
      const collection = await getCollection();
      let resume;
      if (collection) {
        resume = await collection.findOne({ _id: req.params.id });
      } else {
        resume = inMemoryStore.get(req.params.id);
      }

      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      res.json(resume);
    } catch (err) {
      next(err);
    }
  });

  // List all resumes
  router.get('/', async (req, res, next) => {
    try {
      const collection = await getCollection();
      let resumes;
      if (collection) {
        resumes = await collection.find({}).sort({ updatedAt: -1 }).toArray();
      } else {
        resumes = Array.from(inMemoryStore.values()).sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      }
      res.json(resumes);
    } catch (err) { 
      next(err);
    }
  });

  // Update resume
  router.put('/:id', async (req, res, next) => {
    try {
      const collection = await getCollection();
      let existing;

      if (collection) {
        existing = await collection.findOne({ _id: req.params.id });
      } else {
        existing = inMemoryStore.get(req.params.id);
      }

      if (!existing) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      const updated = {
        ...existing,
        personal: req.body.personal || existing.personal,
        summary: req.body.summary !== undefined ? req.body.summary : existing.summary,
        experience: req.body.experience || existing.experience,
        education: req.body.education || existing.education,
        skills: req.body.skills || existing.skills,
        certifications: req.body.certifications || existing.certifications,
        updatedAt: new Date().toISOString(),
      };

      if (collection) {
        await collection.updateOne({ _id: req.params.id }, { $set: updated });
      } else {
        inMemoryStore.set(req.params.id, updated);
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // Delete resume
  router.delete('/:id', async (req, res, next) => {
    try {
      const collection = await getCollection();
      if (collection) {
        const result = await collection.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Resume not found' });
        }
      } else {
        if (!inMemoryStore.has(req.params.id)) {
          return res.status(404).json({ error: 'Resume not found' });
        }
        inMemoryStore.delete(req.params.id);
      }
      res.json({ message: 'Resume deleted' });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
