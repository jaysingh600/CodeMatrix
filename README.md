# CodeMatrix

**CodeMatrix** is an advanced, fully-integrated, AI-powered collaborative coding platform designed for competitive programming, interview preparation, and computer science education. Built using the MERN stack, it features a rich LeetCode-style UI with real-time gamification, robust analytics, and a multi-agent AI mentoring system.

---

## 🌟 Key Features

### 1. Robust Coding Engine
- **Monaco Editor Integration:** Syntax highlighting, autocomplete, and thematic customization.
- **Judge0 Execution:** Secure compilation and execution of Java, C++, Python, and JavaScript against hidden test cases.
- **Code Evolution Tracker:** A Git-style version history automatically recording every code attempt, with inline diffing and complexity analysis.

### 2. AI Mentorship
- **AI Hint Generator:** Socratic tutoring via 10 distinct hint types (Concept, Pattern, Complexity, Debug, etc.) without revealing the direct solution.
- **Interactive AI Mentor:** A dedicated chat interface for continuous problem-solving dialogue.

### 3. Real-Time Gamification & Collaboration
- **Gamification Engine:** Earn XP, level up dynamically, and unlock tiered achievements (Common, Rare, Epic, Legendary).
- **Global Leaderboard:** Compete with peers globally.
- **Live Chat Rooms:** Discuss algorithms in real time via Socket.IO.
- **Contest System:** Participate in timed, ICPC-scored competitive programming contests.

### 4. Advanced Analytics & Developer Tools
- **Analytics Dashboard:** GitHub-style contribution heatmaps, topic mastery charts, and platform KPIs (powered by MongoDB Aggregation pipelines).
- **Algorithm Visualizer Lab:** Step-by-step interactive animations of Sorting, Searching, and Graph algorithms.
- **Developer Notes:** A Notion-style markdown workspace to document learnings.

---

## 🛠️ Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui, Redux Toolkit, Framer Motion, Recharts, Monaco Editor.
- **Backend:** Node.js, Express.js, Socket.IO.
- **Database:** MongoDB, Mongoose.
- **Services:** Judge0 CE (Code Execution), Google Gemini API (AI Services).
- **Security:** JWT Authentication, bcrypt, Helmet, Express-Rate-Limit, Express-Mongo-Sanitize, HPP.

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Judge0 API endpoint (or locally hosted instance)
- Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/your-username/codematrix.git
cd codematrix
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JUDGE0_URL=your_judge0_api_url
GEMINI_API_KEY=your_gemini_api_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```

---

## 🛡️ Security Posture
- **XSS & Injection Protection:** Inputs sanitized using `express-mongo-sanitize` and HTTP parameter pollution prevented via `hpp`.
- **Rate Limiting:** Protects `/api` endpoints against DDoS and brute force attacks.
- **Authentication:** Stateless, secure JWT-based auth via HTTP-only cookies (or Bearer tokens) with strict Admin/User role separation.

## 📄 License
This project is licensed under the MIT License.
