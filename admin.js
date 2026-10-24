const users = [
    { email: "pranto@gmail.com", password: "pranto123", role: "admin" },
    { email: "creator@gmail.com", password: "creator123", role: "creator" }
];

let currentUser = null;
let allProducts = []; // Local cache to make searching fast

// --- LOGIN LOGIC ---
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        document.getElementById("loginError").innerText = "Invalid credentials";
        return;
    }

    currentUser = user;
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    loadProducts(); // Load from Database
    loadOrders();   // Load from localStorage (until you move orders to backend)
}

// --- PRODUCT MANAGEMENT (BACKEND) ---

// 1. Load & Filter Products
async function loadProducts(filter = "") {
    try {
        // Fetch from your Node.js server
        const response = await fetch('http://localhost:5000/api/products');
        allProducts = await response.json();
        
        const list = document.getElementById("orderTable"); // Ensure this ID matches your HTML table body
        const productListBody = document.querySelector(".product-form-premium").previousElementSibling.querySelector("tbody"); 
        // Note: Using the ID 'orderTable' for orders and a different target for products
        const targetList = document.getElementById("productList") || productListBody;

        targetList.innerHTML = "";

        allProducts.forEach(p => {
            if (p.name.toLowerCase().includes(filter.toLowerCase())) {
                const deleteBtn = (currentUser.role === "admin") 
                    ? `<button class="btn-premium-sm btn-premium-delete" onclick="deleteProduct('${p._id}')">
                        <i class="fas fa-trash"></i> Delete
                       </button>` 
                    : "";

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><img src="${p.image}" width="40" style="border-radius:8px"></td>
                    <td>${p.name}</td>
                    <td>$${p.price}</td>
                    <td><span class="badge ${p.type}">${p.type}</span></td>
                    <td>
                        <button class="btn-premium-sm btn-premium-edit" onclick="prepareEdit('${p._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        ${deleteBtn}
                    </td>
                `;
                targetList.appendChild(row);
            }
        });
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

// 2. Save Product to MongoDB
async function saveProduct() {
    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const image = document.getElementById("image").value;
    const type = document.getElementById("type").value;

    if(!name || !price || !image) return alert("Please fill all fields");

    const productData = { name, price: parseFloat(price), image, type };

    try {
        const response = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            alert("Product saved successfully!");
            clearForm();
            loadProducts(); // Refresh list
        }
    } catch (error) {
        console.error("Error saving product:", error);
    }
}

// 3. Delete Product from MongoDB
async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadProducts(); // Refresh list
        }
    } catch (error) {
        console.error("Error deleting product:", error);
    }
}

// --- HELPER FUNCTIONS ---

function prepareEdit(id) {
    const product = allProducts.find(p => p._id === id);
    if (product) {
        document.getElementById("name").value = product.name;
        document.getElementById("price").value = product.price;
        document.getElementById("image").value = product.image;
        document.getElementById("type").value = product.type;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("image").value = "";
}

function filterAdminProducts() {
    const searchTerm = document.getElementById('adminProductSearch').value;
    loadProducts(searchTerm);
}

function logout() { location.reload(); }

// --- UI ENHANCEMENTS (SNOW & ERRORS) ---

setInterval(createSnowflake, 200);

function createSnowflake() {
    const container = document.getElementById('snow-container');
    if (!container) return;
    const snowflake = document.createElement('div');
    const size = Math.random() * 4 + 2 + 'px';
    snowflake.classList.add('snowflake');
    snowflake.style.left = Math.random() * 100 + 'vw';
    snowflake.style.width = size;
    snowflake.style.height = size;
    snowflake.style.animationDuration = Math.random() * 5 + 5 + 's';
    snowflake.style.opacity = Math.random() * 0.7 + 0.3;
    container.appendChild(snowflake);
    setTimeout(() => snowflake.remove(), 10000);
}

// Order handling logic remains same as your localStorage version for now
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const table = document.getElementById("orderTable");
    if(!table) return;
    table.innerHTML = "";
    orders.forEach((o, i) => {
        table.innerHTML += `
            <tr>
                <td>${o.date}</td>
                <td>${o.items.map(it => `${it.name} x${it.quantity}`).join("<br>")}</td>
                <td><strong>${o.total}</strong></td>
                <td>${o.payment}</td>
                <td>${o.status}</td>
            </tr>`;
    });
}