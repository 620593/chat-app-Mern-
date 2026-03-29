<div align="center">

# 🌐 NEXUS CHAT
**Production-Grade Real-Time MERN Chat Application**

![React Focus](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-4A3C31?style=for-the-badge&logo=react&logoColor=white)

</div>

---

## 🌟 Overview

A high-performance, real-time chat application built on the **MERN** stack (MongoDB, Express, React, Node.js). 
Designed with a premium glassmorphism UI, the app goes beyond basic chat functionality to offer **WebRTC-powered Video & Voice Calls**, real-time typing indicators, and WhatsApp-style read receipts.

The backend is strictly engineered for production reliability, featuring robust Socket.IO connection management, JWT-based socket authentication, and automatic exponential reconnect logic.

---

## 🚀 Key Features

- **💬 Real-Time Messaging:** Instant delivery using Socket.IO rooms. 
- **📞 Video & Voice Calls:** Peer-to-Peer encrypted calling using WebRTC.
- **✓✓ Read Receipts:** WhatsApp-style instant updates (Sent -> Delivered -> Seen).
- **📝 Typing Indicators:** Live tracking of when users are currently typing.
- **🎨 Premium UI/UX:** Stunning Glassmorphism aesthetics powered by Tailwind CSS & Framer Motion.
- **🔐 Hardened Security:** HttpOnly JWT cookies with strict middleware verifying all HTTPS and WebSocket requests.
- **📱 Responsive:** Fully optimized for both Mobile and Desktop experiences.
- **🔄 Multi-Tab Support:** Uses `Map<userId, Set<socketId>>` to allow users to stay reliably connected across multiple browser tabs simultaneously.

---

## 🛠️ Technology Stack

| Category | Technology | Description |
|---|---|---|
| **Frontend** | React (Vite) | Lightning fast frontend framework. |
| **Styling & UI** | Tailwind CSS + Framer Motion | Utility-friendly styling and micro-animations. |
| **State Management** | Zustand | Clean and un-opinionated state control. |
| **Backend** | Node.js + Express | Highly scalable and modular server architecture. |
| **Database** | MongoDB + Mongoose | NoSQL data modeling for rapid query access. |
| **Real-Time Engine**| Socket.IO (+ WebRTC) | Event-driven architecture for messaging and media streaming. |

---

## 🚦 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed on your machine.
You will also need a MongoDB Cluster (like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)) and a Cloudinary account (for image uploads, if applicable).

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/nexus-chat.git
cd nexus-chat
```

### 2. Install Dependencies
Install dependencies for both the backend and frontend simultaneously:
```bash
npm install 
cd Frontend
npm install
cd ..
```

### 3. Environment Variables
Create a `.env` file in the root directory and add the following:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

### 4. Run the Application
You can run both servers concurrently (if `concurrently` is installed globally or configured in `package.json`), or run them in separate terminals:

**Terminal 1 (Backend):**
```bash
npm run server
```

**Terminal 2 (Frontend):**
```bash
cd Frontend
npm run dev
```

The app will be available at `http://localhost:3000` (or `5173` depending on your Vite config).

---

## 🏗️ Architecture Architecture Notes

* **Room-Based Emit Scheme**: Uses `chatId` rooms for text messaging, providing scalability for group chats, and `user:<userId>` rooms to reliably deliver incoming calls to *all active instances* of a user.
* **Optimistic UI**: Frontend updates the DOM immediately when sending messages (under a `temp_` ID), deduplicating silently behind the scenes once the server verifies the database persistence.
* **Resilient Connection Handling**: Employs an exponential connection backoff jitter (1s → 30s) to prevent a "thundering herd" server crash during mass reboot sequences.

---

<div align="center">
Made with ❤️ by an enthusiastic developer.
</div>
