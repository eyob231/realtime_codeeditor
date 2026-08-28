# Realtime Code Editor

A collaborative browser-based code editor built with React, Monaco Editor, Express, PostgreSQL, and WebSockets.

Users can create or join a room using a room ID. Changes are broadcast to other users in the same room immediately and saved to PostgreSQL after a short pause in typing.

## Features

- Create a new room with a UUID
- Join an existing room by room ID
- Monaco code editor with JavaScript syntax highlighting
- Realtime room updates through WebSockets
- Debounced room persistence in PostgreSQL
- Responsive editor-style interface

## Project Structure

```text
backend/     Express API, WebSocket server, database access, migrations
frontend/    React, TypeScript, Vite, Monaco Editor
```

## Requirements

- Node.js 18 or newer
- PostgreSQL database
- npm

## Local Setup

Clone the repository:

```bash
git clone https://github.com/eyob231/realtime_codeeditor.git
cd realtime_codeeditor
```

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL=your_postgresql_connection_string
```

Create `frontend/.env` for local development:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the URL shown by Vite, usually `http://localhost:5173`.

## Database

Generate migrations after changing the Drizzle schema:

```bash
cd backend
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

## Deployment

### Backend on Render

Create a Render Web Service with:

```text
Root Directory: backend
Build Command: npm install
Start Command: node src/index.js
```

Add this environment variable in Render:

```env
DATABASE_URL=your_postgresql_connection_string
```

The backend uses Render's `PORT` value and serves both HTTP and WebSocket traffic on the same port.

### Frontend on Vercel

Set these Vercel environment variables:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_WS_URL=wss://your-backend.onrender.com
```

Build settings:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

## API Endpoints

```text
GET  /text/:id     Read a room's saved text
PUT  /text/:id     Create or update a room's text
POST /text         Create text with an ID in the request body
```

WebSocket clients connect using:

```text
wss://your-backend.onrender.com?roomId=ROOM_ID
```

## Author

Built by [eyob231](https://github.com/eyob231).
