// Server setup for Shop Quần Áo
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/products', (req, res) => {
    // This would normally fetch from database
    res.json([
        { id: 1, name: 'T-Shirt Basic', price: 15.99, category: 'tops' },
        { id: 2, name: 'Jeans Casual', price: 39.99, category: 'bottoms' },
        { id: 3, name: 'Summer Dress', price: 29.99, category: 'dresses' },
        { id: 4, name: 'Winter Jacket', price: 59.99, category: 'outerwear' }
    ]);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to see your shop`);
});