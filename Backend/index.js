require('dotenv').config();
const connectToMongo = require('./db')
connectToMongo();

const express = require('express')
const app = express()
const port = process.env.PORT || 3001

const cors = require('cors')
const router = require('./Routes/router')

// Configure CORS with environment variables
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(router);

// Health check endpoint for DevOps monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Inventory Management Backend'
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Inventory Management Backend listening on port ${port}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})


