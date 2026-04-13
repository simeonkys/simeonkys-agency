// Cart management
let cart = JSON.parse(localStorage.getItem('simeonkys-cart')) || [];

// Base t-shirt colors
const shirtColors = {
    white: '#ffffff',
    black: '#000000',
    blue: '#1e3a8a',
    green: '#10b981'
};

// Canvas context
const canvas = document.getElementById('tshirt-canvas');
const ctx = canvas.getContext('2d');

// Update cart count and total
function updateCartDisplay() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').textContent = total.toFixed(2) + '€';
    
    document.getElementById('checkout-btn').disabled = cartCount === 0;
    
    renderCartItems();
}

// Render cart items
function renderCartItems() {
    const cartItems = document.getElementById('cart-items');
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Votre panier est vide</p>';
        return;
    }
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image || canvas.toDataURL()}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.size || 'Standard'} | ${item.customText ? item.customText : 'Sans personnalisation'}</p>
                <p>${(item.price * item.quantity).toFixed(2)}€</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="updateQuantity(${index}, -1)">-</button>
                <span style="margin: 0 10px; font-weight: bold;">${item.quantity}</span>
                <button onclick="updateQuantity(${index}, 1)">+</button>
                <button onclick="removeItem(${index})">Supprimer</button>
            </div>
        </div>
    `).join('');
}

// Update quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem('simeonkys-cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Remove item
function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('simeonkys-cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Add to cart from products
document.querySelectorAll('.btn-add-cart').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        const productCard = btn.closest('.product-card');
        const productData = JSON.parse(productCard.dataset.product);
        productData.quantity = 1;
        
        const existingIndex = cart.findIndex(item => 
            item.name === productData.name && 
            (!item.customText || item.customText === '') &&
            (!item.size || item.size === 'M')
        );
        
        if (existingIndex >= 0) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push(productData);
        }
        
        localStorage.setItem('simeonkys-cart', JSON.stringify(cart));
        updateCartDisplay();
        
        // Visual feedback
        btn.textContent = 'Ajouté!';
        setTimeout(() => btn.textContent = 'Ajouter au Panier', 1500);
    });
});

// Customization
let currentCustomImage = null;

function drawTshirt() {
    const baseColor = shirtColors[document.getElementById('base-shirt').value];
    const customText = document.getElementById('custom-text').value;
    const textColor = document.getElementById('text-color').value;
    const size = document.getElementById('size').value;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw t-shirt base
    ctx.fillStyle = baseColor;
    ctx.fillRect(30, 50, 240, 300); // T-shirt body
    
    // Neckline
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(80, 50, 140, 40);
    
    // Sleeves
    ctx.beginPath();
    ctx.moveTo(30, 120);
    ctx.lineTo(10, 150);
    ctx.lineTo(20, 220);
    ctx.lineTo(30, 220);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(270, 120);
    ctx.lineTo(290, 150);
    ctx.lineTo(280, 220);
    ctx.lineTo(270, 220);
    ctx.fill();
    
    // Draw custom text
    if (customText) {
        ctx.font = 'bold 28px Roboto';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(customText.toUpperCase(), 150, 200);
    }
    
    // Draw custom image
    if (currentCustomImage) {
        ctx.drawImage(currentCustomImage, 100, 150, 100, 100);
    }
    
    // Size label
    ctx.font = '16px Roboto';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'left';
    ctx.fillText(`Taille: ${size}`, 40, 380);
    
    // Update price
    let basePrice = 29.99;
    if (size === 'XL') basePrice += 5;
    if (customText || currentCustomImage) basePrice += 10;
    document.getElementById('custom-price').textContent = basePrice.toFixed(2) + '€';
}

// Event listeners for customization
document.getElementById('base-shirt').addEventListener('change', drawTshirt);
document.getElementById('custom-text').addEventListener('input', drawTshirt);
document.getElementById('text-color').addEventListener('change', drawTshirt);
document.getElementById('size').addEventListener('change', drawTshirt);

document.getElementById('custom-image').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            currentCustomImage = new Image();
            currentCustomImage.onload = () => drawTshirt();
            currentCustomImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Add customized to cart
document.querySelector('.btn-customize-save').addEventListener('click', () => {
    const base = document.getElementById('base-shirt').value;
    const size = document.getElementById('size').value;
    const customText = document.getElementById('custom-text').value;
    
    const customProduct = {
        name: `T-shirt Indusa Personnalisé (${base})`,
        price: parseFloat(document.getElementById('custom-price').textContent),
        size: size,
        customText: customText,
        image: canvas.toDataURL(),
        quantity: 1
    };
    
    cart.push(customProduct);
    localStorage.setItem('simeonkys-cart', JSON.stringify(cart));
    updateCartDisplay();
    
    // Reset form partially
    document.getElementById('custom-text').value = '';
    currentCustomImage = null;
    drawTshirt();
    
    alert('T-shirt personnalisé ajouté au panier!');
});

// Checkout
document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length > 0) {
        alert(`Merci pour votre commande de ${cart.reduce((sum, item) => sum + item.quantity, 0)} article(s)! Total: ${document.getElementById('cart-total').textContent}`);
        cart = [];
        localStorage.removeItem('simeonkys-cart');
        updateCartDisplay();
    }
});

// Mobile menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Initial loads
updateCartDisplay();
drawTshirt();

