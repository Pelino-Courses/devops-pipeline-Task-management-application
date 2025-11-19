const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || "supersecretkey";

router.post('/register', async (req, res) => {
    const { username, password, display_name } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "missing fields" });

    const hash = await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO users (username, password, display_name) VALUES (?,?,?)`,
        [username, hash, display_name || null],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const user = { id: this.lastID, username, display_name };
            const token = jwt.sign(user, SECRET);

            res.json({ user, token });
        }
    );
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, row) => {
        if (!row) return res.status(401).json({ error: "Invalid credentials" });

        const ok = await bcrypt.compare(password, row.password);
        if (!ok) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: row.id, username }, SECRET);
        res.json({ user: row, token });
    });
});

module.exports = router;
