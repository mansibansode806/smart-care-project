# 🏥 SmartCare – Intelligent Healthcare Platform

## 📌 Project Overview

SmartCare is an AI-powered healthcare platform that connects patients and hospitals through a single system.

It helps patients book appointments, view hospital-reported bed availability, check queues, estimate waiting time, find nearby hospitals with ICU availability, and receive general health guidance through an AI Health Assistant.

For hospitals, SmartCare provides dashboards to manage doctors, appointments, queues, and hospital resource availability.

The system follows a simple approach:

**See → Decide → Reach**

---

## 🚀 Key Features

### 👨‍⚕️ Patient Features

- Doctor search by hospital and specialization
- Online appointment booking
- Doctor availability and time-slot selection
- Queue visibility
- AI-based waiting-time prediction
- Hospital bed and ICU availability
- Emergency hospital finder
- AI Health Assistant
- Appointment status tracking

### 🏥 Hospital Features

- Hospital registration
- Hospital admin login
- Hospital dashboard
- Doctor management
- Doctor schedule management
- Appointment management
- Accept / Reject / Complete appointments
- Update bed and ICU availability
- Update emergency bed availability
- Update queue count

### 🔐 Admin Features

- Admin login
- View hospital registration requests
- Approve or reject hospital registrations
- Hospital management

### 🤖 AI & ML Features

- Random Forest Regression for waiting-time prediction
- ML-based future bed/ICU demand prediction
- AI Health Assistant using Gemini API
- Symptom-based general health guidance
- Haversine distance calculation for nearby hospital discovery

---

## 🧠 AI / ML

### 1. Waiting-Time Prediction

SmartCare uses **Random Forest Regression** to estimate patient waiting time.

The model can use factors such as:

- Queue size
- Patients ahead
- Priority
- Doctor-related information
- Hospital-related information
- Appointment timing
- Consultation-related data

The output is an **estimated waiting time**, not a guaranteed value.

### 2. Bed / ICU Demand Prediction

SmartCare uses machine learning to estimate future hospital resource demand using historical training data.

This can help hospitals understand possible future requirements and improve resource planning.

### 3. AI Health Assistant

The AI Health Assistant provides general health information and guidance based on user queries.

It is designed as a **decision-support and guidance tool, not a replacement for a doctor or a definitive diagnosis system.**

---

## 🚑 Emergency Finder

In an emergency, SmartCare helps users find nearby hospitals that have ICU availability.

### Workflow

```text
Emergency Request
       ↓
Check Hospital ICU Availability
       ↓
Filter Suitable Hospitals
       ↓
Calculate Distance
       ↓
Haversine Distance Algorithm
       ↓
Display Nearby Hospitals

The system uses hospital location coordinates to calculate geographical distance.

🔄 System Workflow
Patient / Hospital
       ↓
Frontend – React
       ↓
REST API
       ↓
Node.js + Express.js
       ↓
MySQL Database
       ↓
AI / ML Processing
       ↓
Predictions / Hospital Information
       ↓
Displayed to User
Patient Flow
Login / Signup
      ↓
Search Hospital / Doctor
      ↓
Check Availability
      ↓
Select Date & Time
      ↓
Book Appointment
      ↓
Appointment Stored in MySQL
      ↓
Hospital Receives Appointment
      ↓
Accept / Reject / Complete
🛠️ Technology Stack
Frontend
React
TypeScript
Tailwind CSS
Vite
React Router DOM
Lucide React
Backend
Node.js
Express.js
REST API
CORS
Database
MySQL
mysql2
AI / Machine Learning
Python
Scikit-learn
Random Forest Regression
Gemini API
Algorithms
Random Forest Regression
Haversine Distance Algorithm
Rule-based symptom prioritization
Development Tools
Git
GitHub
Postman
Figma
VS Code
📂 Project Structure
smart-care-project/
│
├── backend/
│   ├── ml/
│   │   ├── bed_demand_data.csv
│   │   ├── bed_demand_model.pkl
│   │   ├── predict_bed_demand.py
│   │   ├── predict_waiting_time.py
│   │   ├── train_bed_demand_model.py
│   │   ├── train_waiting_model.py
│   │   ├── waiting_time_data.csv
│   │   └── waiting_time_model.pkl
│   │
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── ChatbotWidget.tsx
│   │   ├── LoginModal.tsx
│   │   └── SignupModal.tsx
│   │
│   ├── pages/
│   │   ├── AIPrediction.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminLogin.tsx
│   │   ├── EmergencyPage.tsx
│   │   ├── HospitalDashboard.tsx
│   │   ├── HospitalLogin.tsx
│   │   ├── HospitalRegister.tsx
│   │   ├── LandingPage.tsx
│   │   ├── PatientDashboard.tsx
│   │   └── QueuePage.tsx
│   │
│   └── App.tsx
│
├── .gitignore
├── package.json
└── README.md
⚙️ Installation & Setup
1. Clone the repository
git clone https://github.com/mansibansode806/smart-care-project.git
cd smart-care-project
2. Install frontend dependencies
npm install
3. Install backend dependencies
cd backend
npm install
4. Configure environment variables

Create a .env file inside the backend folder:

GEMINI_API_KEY=your_api_key_here

Do not upload the .env file to GitHub.

5. Start the backend

From the backend folder:

node server.js
6. Start the frontend

Open another terminal and run from the project root:

npm run dev
🗄️ Database

SmartCare uses MySQL to store structured healthcare data.

Main database entities include:

Hospitals
Hospital Users
Patients
Doctors
Doctor Schedules
Appointments
Beds
Hospital Status
Hospital Registration Requests
🔐 Security

The system includes authentication and role-based access concepts for:

Patients
Hospitals
Administrators

Sensitive configuration such as API keys is stored using environment variables and excluded from Git using .gitignore.

For production deployment, additional security measures such as password hashing, HTTPS, secure authentication tokens/sessions, input validation, and database access controls should be implemented.

📊 Data & ML Disclaimer

The current prototype uses structured synthetic data for ML training and testing where real historical hospital datasets are not available.

These values should not be interpreted as live hospital statistics.

For real-world deployment, verified hospital data would need to be collected with appropriate authorization, privacy protection, and data validation.

🌟 Future Scope
🚑 Ambulance tracking and emergency response
🏥 Integration with multiple hospitals
🔔 Real-time notifications
🌐 Multi-language support
📊 Advanced predictive hospital resource planning
📱 Mobile application
🔗 Integration with verified healthcare databases
🤖 Improved AI-based health guidance
🔐 Advanced production-level security
🎯 Learning Outcomes

Through this project, we gained experience in:

Full-stack web development
React and TypeScript
Node.js and Express.js
REST API development
MySQL database management
Machine learning model development
AI integration
Healthcare system design
Authentication and role-based access
Git and GitHub
Problem-solving and system design
🎓 Project Information

Project: SmartCare – Intelligent Healthcare Platform

SIH Problem Statement: SIH26198

Category: Software

Theme: MedTech / BioTech / HealthTech

Team: HealthSync

Tagline:

Know where to go, when to go, and what to expect.

📎 Project Repository

https://github.com/mansibansode806/smart-care-project

👩‍💻 Author

Manasi Bansode

Aspiring AI & Software Developer
