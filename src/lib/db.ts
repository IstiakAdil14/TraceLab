import { Pool, QueryResultRow } from "pg";

/**
 * Direct PostgreSQL Connection Pool
 * Replaces Prisma ORM with native PostgreSQL driver (pg)
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/tracelab",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db = {
  /**
   * Execute raw SQL query with parameter binding
   */
  async query<T extends QueryResultRow = any>(text: string, params?: any[]) {
    const start = Date.now();
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development") {
      console.log("Executed SQL Query", { text, duration, rows: res.rowCount });
    }
    return res;
  },

  /**
   * Initialize native PostgreSQL table schemas for Users, Lessons, Progress & Achievements
   */
  async initSchema() {
    const schemaSql = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id VARCHAR(255) PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        explanation TEXT NOT NULL,
        code TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS progress (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        lesson_id VARCHAR(255) REFERENCES lessons(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
        quiz_passed BOOLEAN DEFAULT FALSE,
        score INT DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lesson_id)
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        badge_icon VARCHAR(255) NOT NULL,
        unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return this.query(schemaSql);
  },
};

export default db;
