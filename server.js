require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- SERVE FRONTEND (index.html) ---
app.use(express.static(path.join(__dirname)));

// --- SERVE STATIC PDF BOOKS ---
app.use('/books', express.static(path.join(__dirname, 'bookworm-books')));

// --- DATABASE CONFIGURATION ---
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test Database Connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database Connection Failed:', err.message);
    } else {
        console.log('✅ Connected to MySQL Database!');
        connection.release();
    }
});

// --- HELPER ---
const handleDbError = (res, err, customMessage = 'Database error occurred') => {
    console.error(`[DB Error]: ${err.message}`);
    return res.status(500).json({ success: false, message: customMessage, error: err.message });
};

// ==========================================
//               API ROUTES
// ==========================================

// 1. GET ALL APPROVED BOOKS
app.get('/api/books', (req, res) => {
    const query = "SELECT * FROM books WHERE status = 'approved'";
    db.query(query, (err, results) => {
        if (err) return handleDbError(res, err);
        res.json({ success: true, data: results });
    });
});

// 2. GET BOOKS BY GENRE
app.get('/api/books/genre/:genre', (req, res) => {
    const genre = req.params.genre;
    const query = "SELECT * FROM books WHERE genre = ? AND status = 'approved'";
    db.query(query, [genre], (err, results) => {
        if (err) return handleDbError(res, err);
        res.json({ success: true, data: results });
    });
});

// 3. GET A SINGLE BOOK BY ID
app.get('/api/books/:id', (req, res) => {
    const bookId = req.params.id;
    if (isNaN(bookId)) {
        return res.status(400).json({ success: false, message: 'Invalid book ID format' });
    }
    const query = "SELECT * FROM books WHERE book_id = ?";
    db.query(query, [bookId], (err, results) => {
        if (err) return handleDbError(res, err);
        if (results.length === 0) return res.status(404).json({ success: false, message: 'Book not found' });
        res.json({ success: true, data: results[0] });
    });
});

// 4. UPLOAD A BOOK (status = 'pending')
app.post('/api/upload', (req, res) => {
    const { title, author, genre, pdf_path, uploaded_by } = req.body;
    if (!title || !author || !genre || !pdf_path || !uploaded_by) {
        return res.status(400).json({ success: false, message: 'All fields are required!' });
    }
    const query = `
        INSERT INTO books (title, author, genre, pdf_path, uploaded_by, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    db.query(query, [title, author, genre, pdf_path, uploaded_by], (err, result) => {
        if (err) return handleDbError(res, err, 'Failed to upload book');
        res.status(201).json({
            success: true,
            message: 'Book uploaded successfully! Pending admin approval.',
            bookId: result.insertId
        });
    });
});

// 5. GET PENDING BOOKS (Admin)
app.get('/api/pending', (req, res) => {
    const query = "SELECT * FROM books WHERE status = 'pending'";
    db.query(query, (err, results) => {
        if (err) return handleDbError(res, err);
        res.json({ success: true, data: results });
    });
});

// 6. APPROVE A BOOK (Admin)
app.post('/api/approve/:id', (req, res) => {
    const bookId = req.params.id;
    const { approved_by } = req.body;
    if (isNaN(bookId)) {
        return res.status(400).json({ success: false, message: 'Invalid book ID format' });
    }
    const query = "UPDATE books SET status = 'approved', approved_by = ? WHERE book_id = ?";
    db.query(query, [approved_by || null, bookId], (err, result) => {
        if (err) return handleDbError(res, err, 'Failed to approve book');
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }
        res.json({ success: true, message: 'Book approved successfully!' });
    });
});

// 7. REGISTER USER
app.post('/api/register', (req, res) => {
    const { username, email } = req.body;
    if (!username || !email) return res.status(400).json({ success: false, message: "Username and email required" });
    db.query("INSERT INTO users (username, email) VALUES (?, ?)", [username, email], (err, result) => {
        if (err) return res.json({ success: false, message: "User already exists or DB error" });
        res.json({ success: true, message: "Registered successfully" });
    });
});

// 8. LOGIN USER
app.post('/api/login', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return handleDbError(res, err);
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.json({ success: false, message: "User not found" });
        }
    });
});

// 9. GET REVIEWS
app.get('/api/reviews/:bookId', (req, res) => {
    db.query('SELECT * FROM reviews WHERE book_id = ?', [req.params.bookId], (err, results) => {
        if (err) return handleDbError(res, err);
        res.json({ success: true, data: results });
    });
});

// 10. ADD REVIEW
app.post('/api/reviews', (req, res) => {
    const { user_id, book_id, review_text, rating } = req.body;
    if (!user_id || !book_id || !review_text || !rating) {
        return res.status(400).json({ success: false, message: "All review fields required" });
    }
    db.query("INSERT INTO reviews (user_id, book_id, review_text, rating) VALUES (?, ?, ?, ?)",
        [user_id, book_id, review_text, rating], (err, result) => {
        if (err) return handleDbError(res, err);
        res.json({ success: true, message: "Review added!" });
    });
});

// --- CATCH ALL: Serve index.html for any unknown route ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 BookWorm server running on port ${PORT}`);
});