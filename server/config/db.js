import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Create a new pool using the environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper functions for the pool
const db = {
  /**
   * Connect to the database
   * @returns {Promise} Pool connection
   */
  connect: async () => {
    try {
      const client = await pool.connect();
      client.release();
      return pool;
    } catch (err) {
      throw err;
    }
  },
  
  /**
   * Execute a query
   * @param {string} text - SQL query text
   * @param {Array} params - Query parameters
   * @returns {Promise} Query result
   */
  query: async (text, params) => {
    try {
      const start = Date.now();
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      
      console.log('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (err) {
      console.error('Error executing query', err.stack);
      throw err;
    }
  },
  
  /**
   * Get a client from the pool with a transaction
   * @returns {Promise} Client with transaction
   */
  getClient: async () => {
    const client = await pool.connect();
    const originalQuery = client.query;
    const release = client.release;
    
    // Set a timeout of 5 seconds to release the client
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!');
      console.error(`The last executed query was: ${client.lastQuery}`);
    }, 5000);
    
    // Override the release method
    client.release = () => {
      clearTimeout(timeout);
      client.release = release;
      return release.apply(client);
    };
    
    // Override the query method
    client.query = (...args) => {
      client.lastQuery = args;
      return originalQuery.apply(client, args);
    };
    
    return client;
  }
};

export default db;