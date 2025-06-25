const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3054;

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'new_employee_db',
  password: 'admin123',
  port: 5432,
});

// Middleware
app.use(cors({
  origin: ['http://51.21.167.155:8219', 'http://51.21.167.155:8220'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
 credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    await client.query(`
      drop table if exists offboarding;
      CREATE TABLE IF NOT EXISTS offboarding (
        id SERIAL PRIMARY KEY,
        emp_id VARCHAR(7) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        department VARCHAR(50) NOT NULL,
        role VARCHAR(50) NOT NULL,
        laptop_returned VARCHAR(3) NOT NULL,
        phone_returned VARCHAR(3) NOT NULL,
        access_cards_returned VARCHAR(3) NOT NULL,
        final_paycheck INTEGER NOT NULL,
        benefits_cleared VARCHAR(3) NOT NULL,
        exit_interview TEXT NOT NULL,
        reason_for_leaving VARCHAR(50) NOT NULL,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    client.release();
    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  }
}

// Submit offboarding form
app.post('/api/offboarding/submit', async (req, res) => {
  const {
    empId, name, email, department, role, laptopReturned, phoneReturned,
    accessCardsReturned, finalPaycheck, benefitsCleared, exitInterview, reasonForLeaving
  } = req.body;

  // Validation: Ensure no undefined or missing values
  if (!empId || !name || !email || !department || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log('📌 Received Offboarding Data:', req.body);

    const result = await pool.query(
      `INSERT INTO offboarding (
        emp_id, name, email, department, role, laptop_returned, phone_returned,
        access_cards_returned, final_paycheck, benefits_cleared, exit_interview,
        reason_for_leaving
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (emp_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        department = EXCLUDED.department,
        role = EXCLUDED.role,
        laptop_returned = EXCLUDED.laptop_returned,
        phone_returned = EXCLUDED.phone_returned,
        access_cards_returned = EXCLUDED.access_cards_returned,
        final_paycheck = EXCLUDED.final_paycheck,
        benefits_cleared = EXCLUDED.benefits_cleared,
        exit_interview = EXCLUDED.exit_interview,
        reason_for_leaving = EXCLUDED.reason_for_leaving,
        submission_date = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        empId, name, email, department, role, laptopReturned, phoneReturned,
        accessCardsReturned, finalPaycheck, benefitsCleared, exitInterview, reasonForLeaving
      ]
    );

    res.status(200).json({ message: '✅ Offboarding form submitted successfully', record: result.rows[0] });
  } catch (err) {
    console.error('❌ Submission error:', err.stack);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Get all offboarding records
app.get('/api/offboarding/all', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT emp_id, name, email, department, role, laptop_returned, phone_returned,
             access_cards_returned, final_paycheck, benefits_cleared, exit_interview,
             reason_for_leaving, submission_date
      FROM offboarding
      ORDER BY submission_date DESC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Fetch error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Start server
pool.connect()
  .then(() => {
    console.log('✅ Connected to database');
    initializeDatabase().then(() => {
      app.listen(port, () => {
        console.log(`🚀 Server running on http://51.21.167.155:${port}`);
        console.log(`📄 Offboarding Form: http://51.21.167.155:${port}/offboarding.html`);
        console.log(`📊 HR Offboarding Dashboard: http://51.21.167.155:${port}/hrOffboarding.html`);
      });
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
