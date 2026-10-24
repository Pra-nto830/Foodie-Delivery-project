// -- SWIPER CONFIG --
var swiper = new Swiper(".mySwiper", {
    loop: true,
    navigation: {
        nextEl: "#next",
        prevEl: "#prev",
    },
});

// -- SELECTORS --
const cartIcon = document.querySelector('.cart-icon');
const cartTab = document.querySelector('.cart-tab');
const closeBtn = document.querySelector('.close-btn');
const cardList = document.querySelector('.card-list');
const vegCardList = document.querySelector('.veg-card-list'); 
const cartList = document.querySelector('.cart-list');
const cartTotal = document.querySelector('.cart-total');
const cartValue = document.querySelector('.cart-value');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

const signupForm = document.getElementById('signup-form');
const signinBtns = document.querySelectorAll('.signin-btn-el'); 
const logoutBtn = document.getElementById('logoutBtn');
const mobileLogoutBtn = document.querySelector('.mobile-logout');
const signupModal = document.getElementById('signupModal');
const closeModalBtn = document.querySelector('.close-modal-btn');

const checkoutBtn = document.querySelector('.checkout-btn');
const paymentModal = document.getElementById('paymentModal');
const closePaymentBtn = document.getElementById('closePayment');
const payNowBtn = document.getElementById('payNowBtn');

const foodSearch = document.getElementById('foodSearch');
const searchBtn = document.querySelector('.search-btn');
const typeFilter = document.getElementById('typeFilter');
const priceFilter = document.getElementById('priceFilter');
const priceVal = document.getElementById('priceVal');

// --- AUTH LOGIC ---
const openModal = e => { if(e) e.preventDefault(); signupModal.classList.add('active'); };
const closeModal = e => { if(e) e.preventDefault(); signupModal.classList.remove('active'); };

if (signupForm) {
    signupForm.onsubmit = (e) => {
        e.preventDefault();
        localStorage.setItem("isLoggedIn", "true");
        closeModal();
        initApp();
        alert("Account created! Enjoy our menu.");
    };
}

const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("isLoggedIn");
    location.reload();
};

if (logoutBtn) logoutBtn.onclick = handleLogout;
if (mobileLogoutBtn) mobileLogoutBtn.onclick = handleLogout;
signinBtns.forEach(btn => btn.onclick = openModal);
if (closeModalBtn) closeModalBtn.onclick = closeModal;

// --- CART & NAVIGATION ---
cartIcon.onclick = () => cartTab.classList.add('cart-tab-active');
closeBtn.onclick = () => cartTab.classList.remove('cart-tab-active');
hamburger.onclick = () => {
    mobileMenu.classList.toggle('mobile-menu-active');
    hamburger.querySelector('i').classList.toggle('fa-xmark');
};

let productList = [];
let cartProduct = [];

function renderCart() {
    cartList.innerHTML = '';
    let subtotal = 0;
    let qty = 0;

    cartProduct.forEach((p, index) => {
        const price = parseFloat(p.price.replace('$', ''));
        subtotal += price * p.quantity;
        qty += p.quantity;

        cartList.innerHTML += `
            <div class="item flex between" style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; margin-bottom: 10px;">
                <div class="detail">
                    <h4 style="color: white;">${p.name}</h4>
                    <p style="color: #f2bd12;">$${(price * p.quantity).toFixed(2)}</p>
                </div>
                <div class="quantity-control flex" style="gap: 10px;">
                    <button onclick="changeQty(${index}, -1)" style="cursor:pointer; background:#f2bd12; border:none; border-radius:50%; width:20px;">-</button>
                    <span style="color: white;">${p.quantity}</span>
                    <button onclick="changeQty(${index}, 1)" style="cursor:pointer; background:#f2bd12; border:none; border-radius:50%; width:20px;">+</button>
                </div>
            </div>`;
    });

    // Delivery Logic
    const deliveryLimit = 20;
    const deliveryCharge = 2.00;
    const finalFee = (subtotal > 0 && subtotal < deliveryLimit) ? deliveryCharge : 0;
    const totalWithDelivery = subtotal + finalFee;

    // Update the UI Elements
    document.getElementById('subtotal-val').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('delivery-fee-val').innerText = finalFee === 0 ? "FREE" : `$${finalFee.toFixed(2)}`;
    document.querySelector('.cart-total').innerText = `$${totalWithDelivery.toFixed(2)}`;
    cartValue.innerText = qty;

    // Update Progress Bar
    const progressFill = document.getElementById('progress-fill');
    const deliveryMsg = document.getElementById('delivery-msg');
    const percent = Math.min((subtotal / deliveryLimit) * 100, 100);
    
    progressFill.style.width = percent + "%";
    if(subtotal >= deliveryLimit) {
        deliveryMsg.innerHTML = "🎉 You've earned <span>FREE Delivery!</span>";
    } else {
        deliveryMsg.innerHTML = `Add <span>$${(deliveryLimit - subtotal).toFixed(2)}</span> more for FREE Delivery!`;
    }
    
}

// Add this helper function if you don't have it
function changeQty(index, amount) {
    cartProduct[index].quantity += amount;
    if(cartProduct[index].quantity <= 0) cartProduct.splice(index, 1);
    renderCart();
}

function showProducts() {
    cardList.innerHTML = '';
    vegCardList.innerHTML = '';
    productList.forEach(p => {
        const card = document.createElement('div');
        card.className = 'order-card text-center';
        card.innerHTML = `<img src="${p.image}"><h4>${p.name}</h4><h4 class="price">${p.price}</h4><a href="#" class="btn">Add to Cart</a>`;
        card.querySelector('.btn').onclick = e => { e.preventDefault(); const exists = cartProduct.find(cp => cp.id === p.id); if (exists) exists.quantity++; else cartProduct.push({ ...p, quantity: 1 }); renderCart(); };
        (p.type === 'veg' ? vegCardList : cardList).appendChild(card);
    });
}


// Filter Function
function filterMenu() {
    const searchTerm = foodSearch.value.toLowerCase();
    const selectedType = typeFilter.value;
    const maxPrice = parseFloat(priceFilter.value);

    // Update the displayed price value next to the slider
    if(priceVal) priceVal.textContent = maxPrice;

    const filteredProducts = productList.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm);
        const matchesType = (selectedType === 'all') || (p.type === selectedType);
        const matchesPrice = parseFloat(p.price.replace('$', '')) <= maxPrice;

        return matchesSearch && matchesType && matchesPrice;
    });

    renderFilteredProducts(filteredProducts);
}

// New Render Function for Filtered Results
function renderFilteredProducts(list) {
    cardList.innerHTML = '';
    vegCardList.innerHTML = '';

    if (list.length === 0) {
        const noResults = '<div class="text-center" style="grid-column: 1/-1; padding: 2rem;"><h3>No items found matching your criteria.</h3></div>';
        cardList.innerHTML = noResults;
        return;
    }

    list.forEach(p => {
        const card = document.createElement('div');
        card.className = 'order-card text-center';
        card.innerHTML = `<img src="${p.image}"><h4>${p.name}</h4><h4 class="price">${p.price}</h4><a href="#" class="btn">Add to Cart</a>`;

        card.querySelector('.btn').onclick = e => { 
            e.preventDefault(); 
            const exists = cartProduct.find(cp => cp.id === p.id); 
            if (exists) exists.quantity++; 
            else cartProduct.push({ ...p, quantity: 1 }); 
            renderCart(); 
        };

        (p.type === 'veg' ? vegCardList : cardList).appendChild(card);
    });
}

// Event Listeners for search and filters
if(searchBtn) searchBtn.addEventListener('click', filterMenu);
if(foodSearch) foodSearch.addEventListener('input', filterMenu);
if(typeFilter) typeFilter.addEventListener('change', filterMenu);
if(priceFilter) priceFilter.addEventListener('input', filterMenu);

// --- CHECKOUT ---
if (checkoutBtn) {
    checkoutBtn.onclick = e => {
        e.preventDefault();
        if (cartProduct.length === 0) return alert("Cart is empty");
        paymentModal.classList.add('active');
    };
}
if (closePaymentBtn) closePaymentBtn.onclick = () => paymentModal.classList.remove('active');

if (payNowBtn) {
    payNowBtn.onclick = () => {
        const method = document.querySelector('input[name="payment"]:checked');
        if (!method) return alert("Select payment method");
        const orders = JSON.parse(localStorage.getItem("orders")) || [];
        orders.push({ id: Date.now(), items: cartProduct, total: cartTotal.textContent, payment: method.value, status: "Pending", date: new Date().toLocaleString() });
        localStorage.setItem("orders", JSON.stringify(orders));
        cartProduct = []; renderCart(); paymentModal.classList.remove('active'); cartTab.classList.remove('cart-tab-active');
        alert("Order placed successfully!");
    };
}

// --- INITIALIZE & GATE ---
const initApp = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const data = localStorage.getItem("products");

    if (isLoggedIn) {
        signinBtns.forEach(btn => btn.style.display = 'none');
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'block';
        if (data) { productList = JSON.parse(data); showProducts(); }
    } else {
        signinBtns.forEach(btn => btn.style.display = 'block');
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
        const msg = `<div class="text-center" style="grid-column: 1/-1; padding: 2rem;"><h3>Please <a href="#" onclick="openModal(event)" style="color:#f2bd12; text-decoration:underline;">Sign In</a> to view the menu!</h3></div>`;
        cardList.innerHTML = msg; vegCardList.innerHTML = msg;
    }
};
// --- NEW: HEADER SCROLL INTERACTION ---
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

initApp();

// --- DYNAMIC SNOW GENERATOR ---
function createSnowflake() {
    const container = document.getElementById('snow-container');
    if (!container) return;

    const snowflake = document.createElement('div');
    const size = Math.random() * 4 + 2 + 'px'; // Random sizes 2px to 6px
    const startX = Math.random() * 100; // Random starting horizontal position
    const delay = Math.random() * 5; // Random start delay
    const duration = Math.random() * 5 + 5 + 's'; // Falling speed (5-10 seconds)

    snowflake.classList.add('snowflake');
    snowflake.style.left = startX + 'vw';
    snowflake.style.width = size;
    snowflake.style.height = size;
    snowflake.style.animationDuration = duration;
    snowflake.style.animationDelay = delay + 's';
    snowflake.style.opacity = Math.random() * 0.7 + 0.3; // Random transparency

    container.appendChild(snowflake);

    // Remove snowflake after it finishes falling to keep the site fast
    setTimeout(() => {
        snowflake.remove();
    }, (parseFloat(duration) + parseFloat(delay)) * 1000);
}

// --- DYNAMIC SNOW GENERATOR ---
function createSnowflake() {
    const container = document.getElementById('snow-container');
    if (!container) return;

    const snowflake = document.createElement('div');
    const size = Math.random() * 4 + 2 + 'px'; // Random sizes 2px to 6px
    const startX = Math.random() * 100; // Random starting horizontal position
    const delay = Math.random() * 5; // Random start delay
    const duration = Math.random() * 5 + 5 + 's'; // Falling speed (5-10 seconds)

    snowflake.classList.add('snowflake');
    snowflake.style.left = startX + 'vw';
    snowflake.style.width = size;
    snowflake.style.height = size;
    snowflake.style.animationDuration = duration;
    snowflake.style.animationDelay = delay + 's';
    snowflake.style.opacity = Math.random() * 0.7 + 0.3; // Random transparency

    container.appendChild(snowflake);

    // Remove snowflake after it finishes falling to keep the site fast
    setTimeout(() => {
        snowflake.remove();
    }, (parseFloat(duration) + parseFloat(delay)) * 1000);
}

// Create a new snowflake every 200ms for a steady shower
setInterval(createSnowflake, 200);

function filterMenu() {
    const searchTerm = foodSearch.value.toLowerCase();
    // ... existing filter logic ...
    
    const filteredProducts = productList.filter(p => {
        // ... filter return logic ...
    });

    // Add this line to update a counter (add <span id="resCount"></span> in HTML)
    const countEl = document.getElementById('resCount');
    if(countEl) countEl.innerText = `${filteredProducts.length} items found`;

    renderFilteredProducts(filteredProducts);
}
function renderFilteredProducts(list) {
    cardList.innerHTML = '';
    vegCardList.innerHTML = '';
    
    // Add a results counter
    const resultsHeader = document.querySelector('#menu h2');
    if (resultsHeader) {
        resultsHeader.innerHTML = list.length > 0 
            ? `Found ${list.length} Delicious Items` 
            : "No items match your search";
    }

    if (list.length === 0) {
        cardList.innerHTML = '<div class="text-center" style="width:100%;"><h3>Try a different keyword! 🍔</h3></div>';
        return;
    }
    // ... rest of your existing render logic [cite: 337]
}


// Change this at the top of your file
let productList = []; 

async function loadMenuFromServer() {
    try {
        // 1. Fetch data from your Node.js API
        const response = await fetch('http://localhost:5000/api/products');
        productList = await response.json();

        // 2. Clear your current UI lists
        const cardList = document.querySelector('.card-list');
        const vegCardList = document.querySelector('.veg-card-list');
        
        cardList.innerHTML = "";
        if(vegCardList) vegCardList.innerHTML = "";

        // 3. Render the products
        productList.forEach(product => {
            // NOTE: Use product._id (with underscore) because MongoDB uses _id
            createProductCard(product); 
        });

        console.log("✅ Menu synced with MongoDB");
    } catch (error) {
        console.error("❌ Connection to Backend failed:", error);
    }
}

// Call this when the page loads
window.addEventListener('DOMContentLoaded', loadMenuFromServer);


payNowBtn.onclick = async () => {
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    if (!selectedPayment) return alert("Select a payment method");

    const orderData = {
        items: cart, // your cart array
        total: cartTotal.innerText,
        paymentMethod: selectedPayment.value
    };

    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            alert("Order Placed Successfully! Admin will see it now.");
            cart = [];
            updateCartUI();
            paymentModal.classList.remove('active');
        }
    } catch (err) {
        alert("Failed to send order to server.");
    }
};