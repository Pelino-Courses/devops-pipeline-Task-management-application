const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(__dirname, 'data.sqlite');
const MIGRATION = path.join(__dirname, 'migrations', 'init.sql');

const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) return console.error('DB error:', err);
    console.log('Connected to SQLite DB');
});

try {
    const sql = fs.readFileSync(MIGRATION, 'utf8');
    db.exec(sql, (err) => {
        if (err) console.error('Migration failed:', err);
        else console.log('Migration applied');
    });
} catch (err) {
    console.error('Migration missing:', err.message);
}

module.exports = db;
