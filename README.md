# RTCRS - Real-Time Crime Reporting System

RTCRS is a full-stack web application designed to help citizens report crimes, send SOS alerts, and allow police/admin authorities to monitor incidents in real time. The platform focuses on faster reporting, location-based crime visibility, role-based access, and real-time emergency response support.

## Overview

The Real-Time Crime Reporting System provides a centralized platform where citizens can report crimes with evidence, track their reports, and raise SOS alerts during emergencies. Admins and sub-admins can manage users, review crime reports, monitor alerts, and analyze crime activity through interactive dashboards and maps.

This project was built to demonstrate practical full-stack development, real-time communication, authentication, geolocation, file upload handling, and role-based dashboard design.

## Key Features

- Citizen registration, login, and profile management
- Crime report submission with evidence upload
- Real-time SOS alert system
- Admin and sub-admin dashboards
- Role-based authentication and authorization
- City-based access control for sub-admins
- Interactive crime map using Leaflet
- Crime severity and priority classification
- User, report, and SOS alert management
- Cloudinary integration for media uploads
- Real-time updates using Socket.IO
- Responsive React frontend

## Tech Stack

### Frontend
- React.js
- React Router
- Tailwind CSS
- Axios
- Leaflet / React Leaflet
- Socket.IO Client
- Framer Motion
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Cloudinary
- Socket.IO
- Nodemailer
- bcrypt / bcryptjs

## Setup Instructions

### 1. Clone the repository
git clone https://github.com/your-username/rtcrs.git

### 2. Install dependencies

Backend:
cd backend
npm install

Frontend:
cd frontend
npm install

### 3. Setup environment variables

Create a `.env` file in the backend folder using `.env.example`.

### 4. Run the project

Backend:
npm start

Frontend:
npm start


## Project Structure

```text
rtcrs/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── app.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md

