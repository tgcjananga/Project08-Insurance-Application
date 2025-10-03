# Ceylinco Life Insurance Platform

A full-stack insurance management system built with MERN stack (MongoDB, Express, React, Node.js) demonstrating NoSQL database concepts.

---

## 🚀 Quick Setup

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)

---

## 📦 Installation

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd ceylinco-insurance
2. Backend Setup
bashcd backend
npm install
Create .env file in backend/:
envPORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ceylinco_insurance
JWT_SECRET=your_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
3. Frontend Setup
bashcd ../frontend
npm install
Create .env file in frontend/:
envVITE_API_URL=http://localhost:5000/api
4. Seed Database
bashcd backend
node scripts/createAdmin.js
node scripts/seedPlans.js

▶️ Run Application
Terminal 1 - Backend:
bashcd backend
npm run dev
Terminal 2 - Frontend:
bashcd frontend
npm run dev
Visit: http://localhost:5173

🔐 Demo Credentials
Admin:

Email: admin@ceylinco.com
Password: admin123

Customer:

Register new account or use existing


📚 Tech Stack
Backend: Node.js, Express, MongoDB, Cloudinary
Frontend: React, Vite, Axios
Database: MongoDB Atlas (NoSQL)
Storage: Cloudinary

🎯 Features
Customer:

Browse insurance plans
Request policies with beneficiaries
File claims with document upload
Track policy & claim status

Admin:

Manage plans (CRUD)
Approve/reject policies
Review & process claims
View customer details


🗂️ Project Structure
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & validation
│   └── config/          # DB & Cloudinary setup
│
└── frontend/
    ├── src/
    │   ├── pages/       # React pages
    │   ├── components/  # Reusable components
    │   ├── services/    # API calls
    │   └── context/     # Auth context

📝 NoSQL Concepts Demonstrated
✅ Flexible Schema - Dynamic document structure
✅ Embedding - Beneficiaries, documents nested
✅ Referencing - User/Policy relationships
✅ Document-Oriented - JSON-like data storage

🐛 Troubleshooting
MongoDB Connection Error:

Check MONGODB_URI in .env
Whitelist IP in Atlas (0.0.0.0/0 for dev)

File Upload Issues:

Verify Cloudinary credentials
Check file size limits (5MB max)

Port Already in Use:

Change PORT in backend .env
Update VITE_API_URL in frontend .env


📄 License
Educational project for learning purposes.

Built for: Decision Analytics - NoSQL Assignment