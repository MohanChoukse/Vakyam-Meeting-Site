#Vakyam Meeting Site

> A full-stack video conferencing web application built using MERN stack, WebRTC, and Socket.io.

---

## Project Overview

**Vakyam Meeting** is a complete video conferencing solution — front-end built with React, back-end powered by Node.js, and WebRTC-based real-time communication via Socket.io.

---

## Features

- Real-time video and audio communication \
- Support for multiple participants in a single room \
- Mute/unmute audio and toggle video on/off \
- Room management: create and join rooms via unique IDs \
- Modular and scalable architecture with clear separation of frontend and backend

---

## Tech Stack

- **Frontend:** React, Socket.io-client \
- **Backend:** Node.js, Express, Socket.io-server \
- **Communication:** WebRTC for peer-to-peer media streaming \
- **Others:** HTML, CSS, REST APIs, environment variables

---

## Project Structure

├── backend/
│ ├── server.js
│ ├── routes/
│ └── controllers/
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── App.js
│ │ └── index.js
│ ├── public/
│ └── package.json
└── README.md

---

## Getting Started (Locally)

### 1. Clone the repo

```bash
git clone https://github.com/MohanChoukse/Vakyam-Meeting-Site
cd

2. Setup Backend

cd backend
npm install
# Create a .env file (if needed) with necessary variables, e.g.:
# PORT=5000

npm start

3. Setup Frontend

cd ../frontend
npm install
npm start
```
