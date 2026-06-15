# 🌟 NayePankh Foundation — Volunteer Management Platform

A full-stack Volunteer Management Platform built for **NayePankh Foundation**, a UP Government Registered NGO (80G & 12A).

---

## 📁 Folder Structure

```
NayePankhProject/
├── client/                    # React (Vite) Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # Sticky nav with mobile menu
│   │   │   └── Footer.jsx     # Footer with social links
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx    # Hero, Mission, Benefits, CTA
│   │   │   ├── RegisterPage.jsx   # 2-step volunteer registration
│   │   │   └── DashboardPage.jsx  # Volunteer listing & details
│   │   ├── services/
│   │   │   └── api.js         # Axios API service
│   │   ├── App.jsx            # Root component with routing
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles (Tailwind + custom)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/                    # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # MongoDB connection
│   │   ├── controllers/
│   │   │   └── volunteerController.js  # Business logic
│   │   ├── models/
│   │   │   └── Volunteer.js   # Mongoose schema
│   │   ├── routes/
│   │   │   └── volunteerRoutes.js  # API routes
│   │   └── index.js           # Express app entry
│   ├── .env                   # ⚠️ Add your MongoDB URI here
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ installed
- A [MongoDB Atlas](https://cloud.mongodb.com) free account

### Step 1 — Clone / Navigate to project
```bash
cd NayePankhProject
```

### Step 2 — Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → Create a free M0 cluster
2. Create a database user with password
3. Whitelist your IP address (or `0.0.0.0/0` for development)
4. Get your connection string

### Step 3 — Set up environment variables

Edit `server/.env` and replace the placeholder:
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.XXXXX.mongodb.net/nayepankh_volunteers?retryWrites=true&w=majority
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Step 4 — Install dependencies

**Option A — Install separately:**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

**Option B — From root:**
```bash
npm run install:all
```

### Step 5 — Start the development servers

Open **two terminal windows**:

**Terminal 1 — Start Backend:**
```bash
cd server
npm run dev
```
> Server will start at `http://localhost:5000`

**Terminal 2 — Start Frontend:**
```bash
cd client
npm run dev
```
> App will open at `http://localhost:5173`

---

## 🔌 API Reference

### Base URL
`http://localhost:5000/api`

### Endpoints

| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| `POST` | `/api/volunteers`     | Register a new volunteer     |
| `GET`  | `/api/volunteers`     | Get all volunteers           |
| `GET`  | `/api/volunteers/:id` | Get a single volunteer by ID |

### POST `/api/volunteers` — Register Volunteer

**Request Body:**
```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "city": "Lucknow",
  "skills": ["Teaching/Tutoring", "Social Media"],
  "interests": ["Education & Literacy", "Child Welfare"],
  "availability": "weekends"
}
```

**availability** values: `weekdays` | `weekends` | `both` | `flexible`

**Success Response (201):**
```json
{
  "success": true,
  "message": "Volunteer registered successfully! Welcome to the NayePankh family 🎉",
  "data": { /* volunteer object */ }
}
```

### GET `/api/volunteers` — List All Volunteers

**Query Params (optional):**
- `page` — Page number (default: 1)
- `limit` — Results per page (default: 10)
- `city` — Filter by city name
- `availability` — Filter by availability

**Success Response (200):**
```json
{
  "success": true,
  "data": [ /* array of volunteers */ ],
  "pagination": {
    "total": 42,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

---

## 🗄️ MongoDB Schema

```js
Volunteer {
  fullName:     String  (required, 2–100 chars)
  email:        String  (required, unique, valid email)
  phone:        String  (required, 10-digit Indian mobile)
  city:         String  (required)
  skills:       [String]
  interests:    [String]
  availability: String  (enum: weekdays | weekends | both | flexible)
  status:       String  (pending | approved | rejected, default: pending)
  createdAt:    Date    (auto)
  updatedAt:    Date    (auto)
}
```

---

## 🎨 Features

### Landing Page
- ✅ Hero section with animated gradient background
- ✅ NGO mission section with 4 impact pillars
- ✅ 6 volunteer benefit cards with icons
- ✅ Animated statistics counter
- ✅ CTA buttons → Registration page

### Registration Form (2-Step)
- ✅ Step 1: Full Name, Email, Phone (+91), City
- ✅ Step 2: Skills (multi-select chips), Interests (multi-select), Availability (radio cards)
- ✅ Frontend validation with inline error messages
- ✅ Duplicate email detection
- ✅ Loading spinner during submission
- ✅ Redirects to Dashboard on success

### Volunteer Dashboard
- ✅ Shows all registered volunteers
- ✅ Real-time search (name, city, email)
- ✅ Filter by availability
- ✅ Stats: total volunteers, cities, newly joined (last 7 days)
- ✅ Expandable volunteer cards with full details
- ✅ Skeleton loading state
- ✅ Success banner for newly registered volunteer
- ✅ Newly registered volunteer highlighted at the top

### UI / Design
- ✅ Dark NGO theme with warm orange brand accents
- ✅ Glassmorphism cards
- ✅ Smooth animations (fade-in, float, pulse)
- ✅ Fully responsive — mobile, tablet, desktop
- ✅ Sticky navbar with scroll effect + mobile hamburger menu
- ✅ Custom scrollbar

---

## 🛠️ Tech Stack

| Layer     | Technology                |
|-----------|---------------------------|
| Frontend  | React 18, Vite, Tailwind CSS v3 |
| Routing   | React Router DOM v6       |
| HTTP      | Axios                     |
| Backend   | Node.js, Express.js       |
| Database  | MongoDB Atlas + Mongoose  |
| Fonts     | Google Fonts — Poppins    |

---

## 📞 NayePankh Foundation

- 🌐 Website: [nayepankh.com](https://nayepankh.com)
- 📷 Instagram: [@nayepankhfoundation](https://www.instagram.com/nayepankhfoundation)
- 💼 LinkedIn: [nayepankh](https://www.linkedin.com/company/nayepankh)
- 📺 YouTube: [@nayepankhfoundation](https://www.youtube.com/@nayepankhfoundation)
