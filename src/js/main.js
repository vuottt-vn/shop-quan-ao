// JavaScript for Shop Quần Áo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Shop Quần Áo is loaded');

    // Sample products data
    const products = [
        { id: 1, name: 'T-Shirt Basic', price: 15.99, category: 'tops' },
        { id: 2, name: 'Jeans Casual', price: 39.99, category: 'bottoms' },
        { id: 3, name: 'Summer Dress', price: 29.99, category: 'dresses' },
        { id: 4, name: 'Winter Jacket', price: 59.99, category: 'outerwear' }
    ];

    // Function to display products
    function displayProducts(productsToDisplay) {
        const productList = document.querySelector('.product-list');
        if (!productList) return;

        productList.innerHTML = '';

        productsToDisplay.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product';
            productElement.innerHTML = `
                <h3>${product.name}</h3>
                <p>Price: $${product.price.toFixed(2)}</p>
                <p>Category: ${product.category}</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            `;

            productList.appendChild(productElement);
        });
    }

    // Display all products on load
    displayProducts(products);

    // Add to cart function
    window.addToCart = function(productId) {
        console.log(`Product ${productId} added to cart`);
        alert(`Product added to cart!`);
    };

    // Filter products by category
    function filterProducts(category) {
        if (category === 'all') {
            displayProducts(products);
        } else {
            const filteredProducts = products.filter(product => product.category === category);
            displayProducts(filteredProducts);
        }
    }

    // Add filter functionality if filter buttons exist
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterProducts(category);
        });
    });
});