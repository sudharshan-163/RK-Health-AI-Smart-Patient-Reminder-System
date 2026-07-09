🏥 RK Health AI Smart Patient Reminder System

A web-based healthcare management system that helps manage patient appointments, medications, reports, and AI-generated health summaries using Google Apps Script and Google Sheets as the backend.

📌 Project Overview

RK Health AI Smart Patient Reminder System is a full-stack healthcare management application developed as part of the SmartBridge Internship.

The application enables healthcare staff to manage patient appointments, medication schedules, generate health reports, and view AI-based patient summaries through an intuitive web interface.

The frontend is hosted on GitHub Pages, while the backend is built using Google Apps Script with Google Sheets serving as the database.

🚀 Live Demo

GitHub Pages:https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/

📂 GitHub Repository:
https://github.com/YOUR_USERNAME/YOUR_REPOSITORY

✨ Features
📊 Dashboard
Dynamic statistics
Recent appointments
Recent patients
Live data from Google Sheets

📅 Appointment Management
Add Appointment
Edit Appointment
Delete Appointment
Search Appointments
Filter Appointments
Pagination
Date & Time Formatting

💊 Medication Management
Add Medication
Edit Medication
Delete Medication
Search Medications
Filter Medications
Reminder Information

📄 Reports
Generate Reports
Dynamic Report List
Search Reports
CSV Export
PDF Export
Print Reports

🤖 AI Summary
Patient Health Summary
Health Score
Medication Score
Risk Level
Recommendations
Search
Export CSV

🛠️ Technologies Used
Frontend
HTML5
CSS3
JavaScript (ES6)
Backend
Google Apps Script
Database
Google Sheets
Hosting
GitHub Pages
Version Control
Git
GitHub

📁 Project Structure
RK-Health-AI-Smart-Patient-Reminder-System/

│
├── css/
│   ├── style.css
│   └── ...
│
├── js/
│   ├── appointment.js
│   ├── medication.js
│   ├── dashboard.js
│   ├── report.js
│   ├── summary.js
│   ├── config.js
│   └── ...
│
├── backend/
│   └── Code.gs
│
├── index.html
├── appointment.html
├── medication.html
├── report.html
├── summary.html
└── README.md

🏗️ System Architecture
User
   │
   ▼
GitHub Pages
(HTML/CSS/JavaScript)
   │
   ▼
Google Apps Script API
   │
   ▼
Google Sheets Database

⚙️ Setup Instructions
1. Clone Repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

2. Open Project

Open the project in VS Code.

3. Create Google Spreadsheet

Create the required sheets:

Appointments
Medications
Reports
4. Deploy Google Apps Script
Open Apps Script
Copy Code.gs
Deploy as Web App
Copy Deployment URL
5. Configure Backend URL

Update:
const CONFIG = {
    SCRIPT_URL: "YOUR_DEPLOYED_APPS_SCRIPT_URL"
};

6. Open Website

Run locally or deploy using GitHub Pages.

📊 Modules
Dashboard

Displays

Total Appointments
Pending Medications
Reports
AI Summaries
Appointment Module

Supports

Create
Read
Update
Delete
Search
Filters
Medication Module

Supports

Create
Read
Update
Delete
Search
Filters
Reports

Supports

Dynamic Reports
Export CSV
Export PDF
Print
AI Summary

Displays

Patient Summary
Health Score
Medication Score
Risk Level
Recommendation

🔄 Application Workflow
User

↓

Frontend (GitHub Pages)

↓

JavaScript Fetch API

↓

Google Apps Script

↓

Google Sheets

↓

Response

↓

Frontend Updates UI

🎯 Key Functionalities
CRUD Operations
Dynamic Dashboard
Google Sheets Integration
REST-style API Communication
Search & Filtering
Pagination
Export Features
Print Support
Responsive UI

📚 Challenges Solved

During development, several real-world software engineering challenges were addressed:

GitHub deployment issues
Google Apps Script integration
CORS errors
CRUD synchronization
Date & time formatting
Frontend/backend data mapping
Google Sheets synchronization
Dynamic data loading
API request handling
UI debugging and testing
🚀 Future Enhancements
User Authentication
Role-Based Access Control
Email Notifications
SMS Appointment Reminders
Real AI Integration
Doctor Management
Patient Management
Analytics Dashboard
Cloud Database (google sheets)
👨‍💻 Author

Sudharshan K

B.Tech Computer Science & Engineering

Sri Venkateswara College of Engineering, Tirupati

GitHub: (https://github.com/sudharshan-163)

LinkedIn: (https://www.linkedin.com/in/sudharshankacharla/)

📄 License

This project was developed for educational purposes as part of the SmartBridge Internship.