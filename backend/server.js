const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('./db');

const RateLimit = require('express-rate-limit');
const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up rate limiter: max 100 requests per 15 minutes per IP
const limiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter); // apply rate limiting middleware globally, including JWT middleware

app.use('/api/auth', authRouter);

app.use((req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return next();

    const [bearer, token] = auth.split(' ');
    if (bearer !== 'Bearer') return next();

    const jwt = require('jsonwebtoken');
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    } catch {}

    next();
});

app.use('/api/tasks', tasksRouter);

app.get('/view', (req, res) => {
    res.sendFile(path.join(__dirname, 'view.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(3000, () => console.log("TaskApp running on http://localhost:3000"));
