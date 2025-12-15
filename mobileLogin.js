const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// Replace with actual microservice URL
const MICROSERVICE_URL = process.env.MICROSERVICE_URL || 'http://localhost:3000/api/login';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key'; // replace later
const TOKEN_EXPIRY = '30m'; // 30 minutes

app.post('/login', async (req, res) => {
  const { comp_code, emp_id } = req.body;

  if (!comp_code || !emp_id) {
    return res.status(400).json({ message: 'comp_code and emp_id are required' });
  }

  try {
    // Forward credentials to microservice
    const response = await axios.post(MICROSERVICE_URL, {
      comp_code,
      emp_id
    });

    if (response.data.valid !== true) {
      return res.status(401).json({ message: 'Invalid company code or employee ID' });
    }

    const token = jwt.sign(
      { comp_code, emp_id },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return res.json({
      message: 'Login successful',
      token,
      expiresIn: TOKEN_EXPIRY
    });

  } catch (error) {
    console.error('Login error:', error.message);
    if (error.response) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
});
