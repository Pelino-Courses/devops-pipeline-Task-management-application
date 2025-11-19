const express = require('express');
const router = express.Router();
const db = require('../db');

function requireAuth(req, res, next) {
    if (!req.user) return res.status(401).json({ error: "Login required" });
    next();
}

router.get('/', requireAuth, (req, res) => {
    db.all(`SELECT * FROM tasks WHERE user_id=? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
        res.json(rows);
    });
});

router.post('/', requireAuth, (req, res) => {
    const { title, description, priority, due_date } = req.body;

    db.run(
        `INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES (?,?,?,?,?)`,
        [req.user.id, title, description, priority, due_date],
        function (err) {
            db.get(`SELECT * FROM tasks WHERE id=?`, [this.lastID], (err, row) => {
                res.json(row);
            });
        }
    );
});

module.exports = router;
