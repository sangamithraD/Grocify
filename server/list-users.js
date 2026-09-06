const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/grocify',
});

async function listUsers() {
  try {
    const res = await pool.query('SELECT id, email, created_at FROM users ORDER BY created_at DESC');
    console.log('\n=========================================');
    console.log(`📋 Grocify Registered Users (Total: ${res.rows.length})`);
    console.log('=========================================');
    res.rows.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Joined: ${new Date(user.created_at).toLocaleString()}`);
      console.log('-----------------------------------------');
    });
  } catch (err) {
    console.error('Error fetching users:', err);
  } finally {
    await pool.end();
  }
}

listUsers();
