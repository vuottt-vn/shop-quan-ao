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

// In-memory data stores (would be replaced by database in production)
let products = [
    { id: 1, name: 'T-Shirt Basic', price: 15.99, category: 'tops', stock: 50 },
    { id: 2, name: 'Jeans Casual', price: 39.99, category: 'bottoms', stock: 30 },
    { id: 3, name: 'Summer Dress', price: 29.99, category: 'dresses', stock: 25 },
    { id: 4, name: 'Winter Jacket', price: 59.99, category: 'outerwear', stock: 15 },
    { id: 5, name: 'Sport Shorts', price: 19.99, category: 'bottoms', stock: 40 }
];

let orders = [];
let customers = [];
let nextId = {
    product: 6,
    order: 1,
    customer: 1
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes for Products
app.get('/api/products', (req, res) => {
    // Support query parameters for filtering
    const { category, minPrice, maxPrice } = req.query;

    let filteredProducts = [...products];

    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
    }

    res.json(filteredProducts);
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
});

app.post('/api/products', (req, res) => {
    const { name, price, category, stock } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    const newProduct = {
        id: nextId.product++,
        name,
        price: parseFloat(price),
        category,
        stock: stock !== undefined ? parseInt(stock) : 0
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const { name, price, category, stock } = req.body;
    if (name !== undefined) products[productIndex].name = name;
    if (price !== undefined) products[productIndex].price = parseFloat(price);
    if (category !== undefined) products[productIndex].category = category;
    if (stock !== undefined) products[productIndex].stock = parseInt(stock);

    res.json(products[productIndex]);
});

app.delete('/api/products/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const deletedProduct = products.splice(productIndex, 1)[0];
    res.json(deletedProduct);
});

// API Routes for Customers
app.get('/api/customers', (req, res) => {
    res.json(customers);
});

app.get('/api/customers/:id', (req, res) => {
    const customer = customers.find(c => c.id === parseInt(req.params.id));
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
});

app.post('/api/customers', (req, res) => {
    const { name, email, phone, address } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    const newCustomer = {
        id: nextId.customer++,
        name,
        email,
        phone: phone || '',
        address: address || '',
        createdAt: new Date().toISOString()
    };

    customers.push(newCustomer);
    res.status(201).json(newCustomer);
});

// API Routes for Orders
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
});

app.post('/api/orders', (req, res) => {
    const { customerId, items, totalAmount } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
        return res.status(400).json({ error: 'CustomerId, items array, and totalAmount are required' });
    }

    // Verify customer exists
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }

    // Verify products exist and have enough stock
    for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
            return res.status(404).json({ error: `Product with id ${item.productId} not found` });
        }

        if (product.stock < item.quantity) {
            return res.status(400).json({ error: `Not enough stock for product ${product.name}. Requested: ${item.quantity}, Available: ${product.stock}` });
        }
    }

    // Deduct stock
    for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        product.stock -= item.quantity;
    }

    const newOrder = {
        id: nextId.order++,
        customerId,
        items,
        totalAmount: parseFloat(totalAmount),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    orders.push(newOrder);
    res.status(201).json(newOrder);
});

app.put('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    const { status } = req.body;
    if (status) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
    }

    res.json(order);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  GET    /api/products     - Get all products`);
    console.log(`  GET    /api/products/:id - Get specific product`);
    console.log(`  POST   /api/products     - Create new product`);
    console.log(`  PUT    /api/products/:id - Update product`);
    console.log(`  DELETE /api/products/:id - Delete product`);
    console.log(`  GET    /api/customers    - Get all customers`);
    console.log(`  POST   /api/customers    - Create new customer`);
    console.log(`  GET    /api/orders       - Get all orders`);
    console.log(`  POST   /api/orders       - Create new order`);
    console.log(`  PUT    /api/orders/:id   - Update order status`);
    console.log(`  GET    /health           - Health check`);
    console.log(`Visit http://localhost:${PORT} to see your shop`);
});