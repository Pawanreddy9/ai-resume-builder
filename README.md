# AI Resume Builder

A full-stack web application for building professional resumes with AI-powered parsing, 5 template designs, and ATS-friendly PDF export.

## Features

- **AI Resume Parsing**: Upload PDF or DOCX files — the AI extracts structured data (personal info, experience, education, skills, certifications, summary)
- **Interactive Editor**: Clean, responsive form-based editor with add/remove capabilities for all sections
- **5 Professional Templates**: Modern, Professional, Minimal, Creative, Healthcare
- **ATS-Friendly PDF Export**: Text-based PDF generation via jsPDF (no canvas/images for text)
- **Template Preview Modal**: Live preview before exporting
- **Toast Notifications**: Real-time feedback for save/error states
- **MongoDB Storage**: Persistent resume storage with full CRUD API

## Tech Stack

### Backend
- **Node.js / Express** — REST API server
- **pdf-parse** — PDF text extraction
- **mammoth** — DOCX text extraction
- **OpenAI API** — AI-powered resume parsing (with fallback parser)
- **MongoDB** — Resume storage (with in-memory fallback)
- **multer** — File upload handling

### Frontend
- **React 18** — UI framework
- **Vite** — Build tool
- **jsPDF** — Client-side PDF generation
- **react-hot-toast** — Toast notifications

## Project Structure

```
ai-resume-builder/
├── backend/
│   ├── src/
│   │   ├── index.js          # Server entry point
│   │   ├── app.js            # Express app setup
│   │   ├── db.js             # MongoDB connection
│   │   ├── parser.js         # PDF/DOCX text extraction
│   │   ├── aiService.js      # AI parsing + fallback parser
│   │   └── routes/
│   │       └── resume.js     # Resume CRUD routes
│   ├── __tests__/
│   │   ├── api.test.js       # API endpoint tests
│   │   └── parser.test.js    # Parser unit tests
│   ├── uploads/              # Temp upload directory
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── main.jsx          # React entry
│   │   ├── App.jsx           # Root component
│   │   ├── index.css         # Global styles
│   │   ├── api.js            # API client
│   │   ├── templates.js      # 5 HTML template renderers
│   │   ├── pdfGenerator.js   # jsPDF-based PDF generation
│   │   └── components/
│   │       ├── Landing.jsx   # Landing page (upload/create)
│   │       ├── Editor.jsx    # Resume editor form
│   │       └── PreviewModal.jsx  # Template preview & export
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (optional — app falls back to in-memory storage)
- OpenAI API key (optional — app uses fallback parser without it)

### Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env .env.local
# Edit .env.local with your settings:
#   PORT=4000
#   MONGODB_URI=mongodb://localhost:27017/ai-resume-builder
#   OPENAI_API_KEY=your-key-here

npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev      # Development (http://localhost:5173)
npm run build    # Production build (output in dist/)
```

### Run Tests

```bash
cd backend
npm test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resumes/upload` | Upload PDF/DOCX, AI-parse to structured JSON |
| POST | `/api/resumes` | Create resume from JSON body |
| GET | `/api/resumes` | List all resumes |
| GET | `/api/resumes/:id` | Get resume by ID |
| PUT | `/api/resumes/:id` | Update resume |
| DELETE | `/api/resumes/:id` | Delete resume |

## Templates

1. **Modern** — Gradient header, accent color sidebar borders, pill-shaped skill tags
2. **Professional** — Traditional serif fonts, centered layout, double-line separators
3. **Minimal** — Light typography, generous whitespace, understated design
4. **Creative** — Colorful gradient header, rounded cards, emoji accents
5. **Healthcare** — Teal color scheme, medical cross icon, clinical section labels
