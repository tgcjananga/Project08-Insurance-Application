# Ceylinco Life Insurance Platform

A full-stack insurance management system built with **MERN stack** (MongoDB, Express, React, Node.js) demonstrating **NoSQL database** concepts.

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
git clone https://github.com/cjcodesolutions/Project08-Insurance-Application.git
cd ceylinco-insurance
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Create `.env` file in `backend/`
```env
PORT=5000
MONGODB_URI=your_mongodb_url
JWT_SECRET=your_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

### 5. Create `.env` file in `frontend/`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ Run Application

### Terminal 1 - Start Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Start Frontend
```bash
cd frontend
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Demo Credentials

**Admin:**
- Email: `admin@ceylinco.com`
- Password: `admin123`

**Customer:**
- Register a new account or use an existing one.

---

## 📚 Tech Stack

**Backend:** Node.js, Express, MongoDB, Cloudinary  
**Frontend:** React, Vite, Axios  
**Database:** MongoDB Atlas (NoSQL)  
**Storage:** Cloudinary

---

## 🎯 Features

### Customer:
- Browse insurance plans.
- Request policies with beneficiaries.
- File claims with document upload functionality.
- Track the status of policies and claims.

### Admin:
- Manage insurance plans (CRUD operations).
- Approve or reject policy requests.
- Review and process customer claims.
- View detailed customer information.

---

## 🗂️ Project Structure

```
ceylinco-insurance/
├── backend/
│   ├── models/         # MongoDB schemas
│   ├── controllers/    # Business logic
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth & validation
│   └── config/         # DB & Cloudinary setup
│
└── frontend/
    └── src/
        ├── pages/        # React pages
        ├── components/   # Reusable components
        ├── services/     # API calls
        └── context/      # Auth context
```

---

## 📝 NoSQL Concepts Demonstrated

- **Flexible Schema** - Dynamic document structure allows for variations in data.  
- **Embedding** - Beneficiary details and document links are nested within policies and claims.  
- **Referencing** - User and Policy relationships are maintained through references.  
- **Document-Oriented** - Data is stored in a JSON-like (BSON) format.

---

## 🐛 Troubleshooting

### MongoDB Connection Error:
- Check the `MONGODB_URI` in your `.env` file.
- Ensure your current IP is whitelisted in MongoDB Atlas (`0.0.0.0/0` for development).

### File Upload Issues:
- Verify your Cloudinary credentials in the `.env` file.
- Check for file size limits (current max: 5MB).

### Port Already in Use:
- Change the `PORT` in the backend `.env` file.
- Update `VITE_API_URL` in the frontend `.env` to match the new backend port.

---

## 📄 License

Educational project for learning purposes.  
