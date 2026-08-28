import express from 'express';
import { pool } from './db/db.js';
import cors from 'cors';
import { WebSocket, WebSocketServer } from 'ws';
import { createServer } from 'node:http';


const PORT = process.env.PORT || 3000;
const root = express();
root.use(express.json());
const server = createServer(root);
const wss = new WebSocketServer({ server });
root.use(cors());

const broadcastTextUpdate = (payload, roomId) => {
  const message = JSON.stringify({ type: 'text-update', ...payload });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && (!roomId || client.roomId === roomId)) {
      client.send(message);
    }
  });
};

root.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "users"');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

root.post('/text', async (req, res) => {
  const { id = 28, text } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO "text" (id, text)
       VALUES ($1, $2)
       RETURNING id, text`,
      [id, text]
    );

    const saved = result.rows[0];
    res.status(200).json({ id: saved.id, text: saved.text });
    broadcastTextUpdate({ id: saved.id, text: saved.text }, saved.id);
  } catch (err) {
    console.error('Error saving text:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


root.get('/text/:id', async (req, res) => {
  const {id} = req.params;
  try {
    const result = await pool.query(
      'SELECT id, text FROM "text" WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(200).json({ id, text: '' });
    }
    res.status(200).json(result.rows[0]);
  }
  catch (err) {
    console.error('Error saving text:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
})


root.put('/text/:id' , async (req,res) => {
  const {id} = req.params;
  const {text} = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO "text" (id, text)
       VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text
       RETURNING id, text`,
      [id, text]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Text not found' });
    }

    const updated = result.rows[0];

    broadcastTextUpdate({
      id: updated.id,
      text: updated.text
    }, updated.id);

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating text:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


wss.on('connection', async (socket, request) => {
  const roomId = new URL(request.url, 'ws://localhost').searchParams.get('roomId');
  let latest;

  try {
    latest = await pool.query(
      'SELECT text FROM "text" WHERE id = $1 LIMIT 1',
      [roomId]
    );
  } catch (error) {
    console.error('Error loading room:', error.message);
    socket.close(1011, 'Unable to load room');
    return;
  }

  if (latest.rows[0]) {
    socket.send(JSON.stringify({
      type: 'text-update',
      text: latest.rows[0].text
    }));
  }
  socket.roomId = roomId;
  socket.on('message', (raw) => {
    const message = JSON.parse(raw.toString());
    broadcastTextUpdate({ text: message.text }, roomId);
  });
});

root.post('/register', async (req,res) =>{
  const { username , email , password } = req.body
  try{
    const result = `INSERT INTO "users" (username, email, password) VALUES ($1, $2, $3) RETURNING id`;
    const values = [username, email, password];
    const response = await pool.query(result, values);
    res.status(201).json({ id: response.rows[0].id });
  }catch(err){
    console.error('Error registering user:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
})

root.get('/txt',async (req,res) => {
   try {
    const result = await pool.query('SELECT * FROM "text" WHERE id = 1');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
})



server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    await pool.query('SELECT 1');
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } 

});