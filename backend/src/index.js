import express from 'express';
import { pool } from './db/db.js';
import cors from 'cors'

const root = express()
root.use(express.json())
root.use(cors())

root.get('/', (req, res) => {
  res.send('Hello World!');
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

root.listen(3000, async () => {
  console.log('Server is running on port 3000');

  try {
    await pool.query('SELECT 1');
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } 

});