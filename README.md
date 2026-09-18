# Career Copilot - Architecture & Getting Started

Career Copilot is an AI-powered Career Strategist featuring an ATS Resume Analyzer, real-time Mock Interview Simulator with Bar Raiser scorecard, and Multi-Agent Career Coaching in a modern Bento Grid UI.

This project is organized into a clean, decoupled **Frontend** and **Backend** architecture.

---

## Project Structure

```text
career-copilot/
├── backend/                   # Standalone Express + TypeScript API server
│   ├── src/
│   │   ├── services/
│   │   │   └── geminiService.ts  # Gemini API & AI analysis services
│   │   └── server.ts             # Express REST API endpoints & CORS
│   ├── .env.example              # Sample backend environment variables
│   ├── Dockerfile                # Production container for backend
│   ├── package.json
│   └── tsconfig.json
├── frontend/                  # Standalone React 19 + Vite 6 + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/           # UI components (Resume Analyzer, Mock Interview, etc.)
│   │   ├── data/                 # Static data & questions
│   │   ├── utils/                # PDF/Docx parsers, storage utilities
│   │   ├── App.tsx               # Main application view container
│   │   ├── index.css             # Tailwind v4 styles & custom scrollbars
│   │   └── main.tsx              # React DOM entry point
│   ├── index.html                # HTML entry point
│   ├── .env.example              # Sample frontend environment variables
│   ├── Dockerfile                # Multi-stage container for frontend (Nginx)
│   ├── nginx.conf                # Nginx proxy & SPA routing config
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts            # Vite config with dev proxy to backend (:5000)
├── docker-compose.yml         # Compose configuration to run fullstack services
├── package.json               # Root orchestrator scripts
└── README.md
```

---

## Quick Start (Run Both Together)

### 1. Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **npm** or **bun** / **yarn**
- A **Google Gemini API Key** (get one free at [Google AI Studio](https://aistudio.google.com/))

### 2. Install Dependencies
Run the install command from the root directory:
```bash
npm run install:all
```
*(Or install inside `backend/` and `frontend/` individually using `npm install`)*

### 3. Configure Environment Variables
1. Copy the sample environment file in `backend/`:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Add your Gemini API key in `backend/.env`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

### 4. Start Development Servers
From the root directory, run:
```bash
npm run dev
```
This starts:
- **Backend**: `http://localhost:5000` (API server with hot reload via `tsx`)
- **Frontend**: `http://localhost:3000` (Vite dev server with hot module replacement)

Open your browser at [http://localhost:3000](http://localhost:3000).

---

## Running Frontend & Backend Individually

### Running the Backend Only
```bash
cd backend
npm install
npm run dev
```
- Server starts on `http://localhost:5000`.
- Test health check:
  ```bash
  curl http://localhost:5000/api/status
  ```

### Running the Frontend Only
```bash
cd frontend
npm install
npm run dev
```
- Client starts on `http://localhost:3000`.
- Any requests to `/api/*` are automatically forwarded to `http://localhost:5000` via Vite's dev proxy.

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Backend health check & Gemini key detection |
| `POST` | `/api/analyze-resume` | Analyzes resume text against target role & ATS criteria |
| `POST` | `/api/mock-interview-turn` | Evaluates user response and generates the next dynamic interview turn |
| `POST` | `/api/match-jd` | Matches resume against a specific Job Description |
| `POST` | `/api/bar-raiser-scorecard` | Generates comprehensive Bar Raiser scorecard & hire/no-hire decision |
| `POST` | `/api/chat-agent` | Multi-agent conversational career coaching |

---

## Docker & Docker Compose

To run the entire fullstack setup using Docker:

1. Create a `.env` file in the root with your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
2. Run with Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.
