require('dotenv').config();
const connectToMongo = require('./db')
connectToMongo();

const express = require('express')
const app = express()
const port = process.env.PORT || 3001

const cors = require('cors')
const router = require('./Routes/router')

// Configure CORS - Allow all origins in development/production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:30002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:30002',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`[CORS] Allowing origin: ${origin}`);
      callback(null, true); // Allow all origins for now
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
// Mount router on /api to match Nginx proxy
app.use('/api', router);
// Keep root router for direct access if needed
app.use(router);

// Prometheus Metrics
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

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


