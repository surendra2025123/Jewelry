// Import the functions you need from the SDKs you need
const {
  initializeApp,
  getFirestore,
  doc,
  getDocs,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getAnalytics
} = window.firebaseModules;

import { getAnalytics } from "firebase/analytics";
import { 
    getFirestore, doc, collection, getDocs, setDoc, updateDoc, deleteDoc, 
    addDoc, query, orderBy, onSnapshot, writeBatch 
} from "firebase/firestore"; // <-- Added getFirestore and other firestore functions

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAuDx79oTuL2-fuwVziGMoh_ta9ZTVuGto",
    authDomain: "add-app-2f3a3.firebaseapp.com",
    projectId: "add-app-2f3a3",
    storageBucket: "add-app-2f3a3.firebasestorage.app",
    messagingSenderId: "137750127436",
    appId: "1:137750127436:web:c0e71a4db8c18f4e41a5e9",
    measurementId: "G-LLEDY8GTB4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // <-- Firestore Database Initialization

// Collection constants
const COLLECTION = {
    PRODUCTS: "products",
    ORDERS: "orders",
    SETTINGS: "settings"
};


// --- FIREBASE GLOBALS & INITIALIZATION ---
// à¤¯à¥‡ à¤—à¥à¤²à¥‹à¤¬à¤² à¤µà¥ˆà¤°à¤¿à¤¯à¥‡à¤¬à¤²à¥à¤¸ à¤…à¤¬ Firebase à¤²à¤¿à¤¸à¤¨à¤°à¥à¤¸ à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤ªà¥‰à¤ªà¥à¤²à¥‡à¤Ÿ à¤”à¤° à¤¸à¤¿à¤‚à¤• à¤•à¤¿à¤ à¤œà¤¾à¤à¤‚à¤—à¥‡à¥¤
let initialProducts = []; 
let products = [];
// Cart à¤…à¤­à¥€ à¤­à¥€ user à¤•à¥‡ à¤¬à¥à¤°à¤¾à¤‰à¤œà¤¼à¤° à¤®à¥‡à¤‚ à¤²à¥‹à¤•à¤² à¤°à¤¹à¥‡à¤—à¤¾ (Local Storage)
let currentCart = JSON.parse(localStorage.getItem('ghaba_cart')) || []; 
let currentProductId = 1; 
let heroLabels = {};
let homeLinksData = {};
let upiQrData = {};
let ADMIN_PASSWORD = "1234"; // à¤¯à¤¹ cloud à¤¸à¥‡ à¤²à¥‹à¤¡ à¤¹à¥‹à¤—à¤¾
let orders = [];
let adminSettings = {}; // Cloud à¤¸à¥‡ à¤²à¥‹à¤¡ à¤•à¥€ à¤—à¤ˆ à¤¸à¤­à¥€ à¤¸à¥‡à¤Ÿà¤¿à¤‚à¤—à¥à¤¸
const DEFAULT_QR_URL = "https://placehold.co/200x200/2a3c2a/ffc72c?text=SCAN+HERE"; 
let qrTimerInterval;

// Firebase à¤«à¤‚à¤•à¥à¤¶à¤¨à¥à¤¸ à¤•à¥‹ à¤…à¤¬ à¤¸à¥€à¤§à¥‡ module scope à¤¸à¥‡ à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¤¿à¤¯à¤¾ à¤œà¤¾à¤¤à¤¾ à¤¹à¥ˆ
if (!db) {
    console.error("Firebase Firestore is not initialized. Cloud features disabled.");
}


// --- CORE UTILITY FUNCTIONS ---
let pageHistory = []; 

function showPage(pageId, isBack = false) {
    const currentlyVisiblePage = document.querySelector('.page-content:not(.hidden)');
    const currentId = currentlyVisiblePage ? currentlyVisiblePage.id : (pageHistory.length > 0 ? pageHistory[pageHistory.length - 1] : 'home-page');

    if (!isBack && currentId && currentId !== pageId) {
        pageHistory.push(currentId);
    }
    
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });

    if (pageId === 'admin-page') {
        const adminContent = document.getElementById('admin-content');
        const loginContainer = document.getElementById('admin-login-container');
        
        if (adminContent && adminContent.classList.contains('hidden')) {
            loginContainer.classList.remove('hidden');
            populateAdminFields();
        } else if (adminContent) {
            loginContainer.classList.add('hidden');
            renderAdminPanel(); 
        }
    }
    
    // Contact/Privacy content logic
    if (pageId === 'contact-page' || pageId === 'privacy-page') {
        const contentId = pageId.replace('-page', '-content');
        const contentField = pageId === 'contact-page' ? 'contactPageContent' : 'privacyPageContent';
        const contentText = adminSettings[contentField] || 'Content not set yet. Please update from Admin Panel.';
        // <pre> tag whitespace à¤•à¥‹ à¤¬à¤¨à¤¾à¤ à¤°à¤–à¤¤à¤¾ à¤¹à¥ˆ (à¤œà¥ˆà¤¸à¥‡ à¤•à¤¿ à¤…à¤—à¤° à¤†à¤ªà¤¨à¥‡ à¤à¤¡à¤®à¤¿à¤¨ à¤ªà¥ˆà¤¨à¤² à¤®à¥‡à¤‚ à¤¨à¤ˆ à¤²à¤¾à¤‡à¤¨ à¤¡à¤¾à¤²à¥€ à¤¹à¥‹)
        document.getElementById(contentId).innerHTML = `<pre class="whitespace-pre-wrap">${contentText}</pre>`;
    }
    
    document.getElementById(pageId).classList.remove('hidden');
    window.scrollTo(0, 0); 
}

function goBack() {
    if (pageHistory.length > 0) {
        const previousPageId = pageHistory.pop();
        showPage(previousPageId, true);
    } else {
        showPage('home-page'); 
    }
}

function loginAdmin() {
    const passwordInput = document.getElementById('admin-password').value;
    const loginError = document.getElementById('login-error');
    const loginContainer = document.getElementById('admin-login-container');
    const adminContent = document.getElementById('admin-content');

    if (passwordInput === ADMIN_PASSWORD) {
        loginContainer.classList.add('hidden');
        adminContent.classList.remove('hidden');
        loginError.classList.add('hidden');
        alert('Welcome to Admin Panel! (à¤à¤¡à¤®à¤¿à¤¨ à¤ªà¥ˆà¤¨à¤² à¤®à¥‡à¤‚ à¤†à¤ªà¤•à¤¾ à¤¸à¥à¤µà¤¾à¤—à¤¤ à¤¹à¥ˆ!)');
        renderAdminPanel(); 
        populateAdminFields();
    } else {
        loginError.classList.remove('hidden');
        document.getElementById('admin-password').value = '';
    }
}

function toggleSearchInput() {
    const input = document.getElementById('search-input');
    const icon = document.getElementById('search-icon');
    if (input.classList.contains('hidden')) {
        input.classList.remove('hidden');
        input.focus();
        icon.classList.add('text-ghaba-green');
    } else {
        input.classList.add('hidden');
        input.value = '';
        icon.classList.remove('text-ghaba-green');
        products = [...initialProducts]; 
        renderProductGrid();
    }
}

function searchProducts(query) {
    const lowerCaseQuery = query.toLowerCase().trim();
    if (lowerCaseQuery === '') {
        products = [...initialProducts];
    } else {
        products = initialProducts.filter(p => 
            p.name.toLowerCase().includes(lowerCaseQuery) ||
            p.desc.toLowerCase().includes(lowerCaseQuery)
        );
    }
    renderProductGrid();
    showPage('collections-page'); 
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// --- RENDERING / DISPLAY LOGIC ---

function renderProducts(productArray = products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return; 

    grid.innerHTML = '';
    document.getElementById('product-count').textContent = productArray.length;
    
    if (productArray.length === 0) {
        grid.innerHTML = '<p class="text-xl text-gray-500 col-span-full text-center py-10">No products found. (à¤•à¥‹à¤ˆ à¤‰à¤¤à¥à¤ªà¤¾à¤¦ à¤¨à¤¹à¥€à¤‚ à¤®à¤¿à¤²à¤¾à¥¤)</p>';
        return;
    }
    
    productArray.forEach(product => {
        const discount = (product.originalPrice > product.price) ? 'Sale' : '';
        const card = document.createElement('div');
        card.className = "product-card bg-white rounded-xl shadow-2xl overflow-hidden transition hover:shadow-3xl hover:scale-[1.03] cursor-pointer";
        card.setAttribute('data-product-id', product.id);
        card.onclick = () => { showPage('product-page'); updateProductPage(product.id); };
        card.innerHTML = `
            <div class="relative bg-gray-50">
                <img src="${product.image}" alt="${product.name}" class="w-full h-auto object-cover transform transition duration-500 hover:scale-110 aspect-[3/4]">
                ${discount ? `<span class="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">SALE</span>` : ''}
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-lg text-gray-900 mb-1 truncate">${product.name}</h3>
                <div class="flex items-center space-x-2">
                    <p class="text-xl font-bold text-ghaba-green">â‚¹${product.price.toFixed(2)}</p>
                    ${product.originalPrice > product.price ? `<p class="text-sm line-through text-gray-400">â‚¹${product.originalPrice.toFixed(2)}</p>` : ''}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderProductGrid() {
    renderProducts(products);
}

function sortProducts(sortOption) {
    let sortedProducts = [...initialProducts];
    switch (sortOption) {
        case 'price-asc': sortedProducts.sort((a, b) => a.price - b.price); break;
        case 'price-desc': sortedProducts.sort((a, b) => b.price - a.price); break;
        case 'name-asc': sortedProducts.sort((a, b) => a.name.localeCompare(b.name)); break;
        default: sortedProducts = [...initialProducts]; break;
    }
    products = sortedProducts;
    renderProductGrid();
}

function updateProductPage(productId) {
    const product = initialProducts.find(p => p.id === productId);
    if (!product) {
        // If product not found, try to find the first product
        const firstProduct = initialProducts[0];
        if (firstProduct) {
             productId = firstProduct.id;
             currentProductId = productId;
             product = firstProduct;
        } else {
            // alert("Product not found and no other products available!");
            goBack();
            return;
        }
    }

    currentProductId = productId;
    document.getElementById('product-image').src = product.image;
    document.getElementById('product-detail-title').textContent = product.name;
    document.getElementById('product-detail-price').textContent = `â‚¹${product.price.toFixed(2)}`;
    document.getElementById('product-detail-original-price').textContent = product.originalPrice > product.price ? `â‚¹${product.originalPrice.toFixed(2)}` : '';
    document.getElementById('product-detail-desc').textContent = product.desc;
    document.getElementById('qty-input').value = 1;
    document.getElementById('qr-section').classList.add('hidden');
    document.getElementById('add-to-cart-product-btn').setAttribute('onclick', `addToCart('${product.id}', document.getElementById('qty-input').value); showPage('cart-page');`);
    document.getElementById('qty-plus').setAttribute('onclick', 'updateQty(1)');
    document.getElementById('qty-minus').setAttribute('onclick', 'updateQty(-1)');
}

function updateQty(change) {
    const input = document.getElementById('qty-input');
    let current = parseInt(input.value, 10);
    current += change;
    if (current < 1) current = 1;
    input.value = current;
    document.getElementById('qr-section').classList.add('hidden');
}


// --- CART/CHECKOUT LOGIC ---

function saveCart() {
    localStorage.setItem('ghaba_cart', JSON.stringify(currentCart));
}

function calculateCartTotal() {
    const subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { subtotal, total: subtotal };
}

function updateCartDisplay() {
    const { subtotal, total } = calculateCartTotal();
    const cartCountElement = document.getElementById('cart-count');
    const cartPageCountElement = document.getElementById('cart-page-count');
    const cartList = document.getElementById('cart-items-list');
    const itemCount = currentCart.reduce((sum, item) => sum + item.quantity, 0);

    cartCountElement.textContent = itemCount;
    if (cartPageCountElement) cartPageCountElement.textContent = itemCount;
    if (document.getElementById('cart-summary-item-count')) {
        document.getElementById('cart-summary-item-count').textContent = itemCount;
        document.getElementById('cart-summary-subtotal').textContent = 'â‚¹' + subtotal.toFixed(2);
        document.getElementById('cart-summary-total').textContent = 'â‚¹' + total.toFixed(2);
    }
    
    if (cartList) {
        cartList.innerHTML = '';
        if (currentCart.length === 0) {
            document.getElementById('cart-empty-message').classList.remove('hidden');
            if (document.getElementById('cart-summary')) document.getElementById('cart-summary').classList.add('hidden');
        } else {
            document.getElementById('cart-empty-message').classList.add('hidden');
            if (document.getElementById('cart-summary')) document.getElementById('cart-summary').classList.remove('hidden');
        }

        currentCart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md border border-gray-100';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg flex-shrink-0">
                <div class="flex-grow flex justify-between items-center">
                    <div>
                        <p class="font-bold text-lg text-gray-900">${item.name}</p>
                        <p class="text-ghaba-green font-bold text-md">â‚¹${item.price.toFixed(2)}</p>
                        <button class="text-sm text-red-500 mt-2 hover:text-red-700" onclick="removeFromCart('${item.id}')">Remove</button>
                    </div>
                    <div class="flex flex-col items-end">
                        <div class="flex items-center w-28 border border-gray-300 rounded-md overflow-hidden mb-2">
                            <button class="p-2 text-gray-600 hover:bg-gray-100 transition text-sm" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <input type="number" value="${item.quantity}" min="1" class="w-full text-center text-sm border-x p-2 focus:outline-none" onchange="updateCartQuantity('${item.id}', this.value)">
                            <button class="p-2 text-gray-600 hover:bg-gray-100 transition text-sm" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                        <p class="font-bold text-gray-800">Total: â‚¹${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `;
            cartList.appendChild(itemElement);
        });
    }
}

function addToCart(productId, quantity) {
    const product = initialProducts.find(p => p.id === productId);
    if (!product) return;

    const qty = parseInt(quantity, 10);
    if (qty < 1 || isNaN(qty)) return;

    const existingItemIndex = currentCart.findIndex(item => item.id === productId);

    if (existingItemIndex !== -1) {
        currentCart[existingItemIndex].quantity += qty;
    } else {
        currentCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: qty
        });
    }
    
    saveCart();
    updateCartDisplay(); 
    const messageElement = document.getElementById('cart-confirm-message');
    messageElement.classList.remove('hidden');
    setTimeout(() => { messageElement.classList.add('hidden'); }, 3000);
}

function updateCartQuantity(productId, newQty) {
    const qty = parseInt(newQty, 10);
    const itemIndex = currentCart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;

    if (qty < 1 || isNaN(qty)) {
        currentCart.splice(itemIndex, 1);
    } else {
        currentCart[itemIndex].quantity = qty;
    }

    saveCart();
    updateCartDisplay();
}

function removeFromCart(productId) {
    const itemIndex = currentCart.findIndex(item => item.id === productId);
    if (itemIndex !== -1) {
        currentCart.splice(itemIndex, 1);
        saveCart();
        updateCartDisplay();
    }
}

function setupCheckoutPage() {
    const { subtotal, total } = calculateCartTotal();
    
    if (total === 0) {
        alert("Your cart is empty. Please add items to proceed.");
        showPage('cart-page');
        return;
    }

    document.getElementById('checkout-summary-item-count').textContent = currentCart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('checkout-summary-subtotal').textContent = 'â‚¹' + subtotal.toFixed(2);
    document.getElementById('checkout-summary-total').textContent = 'â‚¹' + total.toFixed(2);
    document.getElementById('checkout-submit-total').textContent = 'â‚¹' + total.toFixed(2);
    
    document.getElementById('checkout-qr-section').classList.add('hidden');
    document.getElementById('checkout-submit-btn').classList.remove('hidden');
}

let timeRemaining = 180;

function startQrTimer() {
    timeRemaining = 180;
    const timerElement = document.getElementById('checkout-qr-timer');
    if (qrTimerInterval) clearInterval(qrTimerInterval);

    function updateTimer() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        if (timeRemaining <= 0) {
            clearInterval(qrTimerInterval);
            alert('Payment session expired. Please try again.');
            document.getElementById('checkout-qr-section').classList.add('hidden');
            document.getElementById('checkout-submit-btn').classList.remove('hidden');
            return;
        }
        timeRemaining--;
    }
    updateTimer();
    qrTimerInterval = setInterval(updateTimer, 1000);
}

function showQrCodeForCheckout() {
    const qrSection = document.getElementById('checkout-qr-section');
    const { total } = calculateCartTotal();
    
    qrSection.classList.remove('hidden');
    document.getElementById('checkout-upi-qr-code').src = upiQrData.qrUrl || DEFAULT_QR_URL;
    document.getElementById('checkout-qr-payment-amount').textContent = 'â‚¹' + total.toFixed(2);
    document.getElementById('checkout-submit-btn').classList.add('hidden');
    startQrTimer();
}

function handleCheckoutSubmit(form) {
    if (form.checkValidity()) {
        // Collect customer details first
        const customerDetails = {
            name: document.getElementById('checkout-name').value.trim(),
            phone: document.getElementById('checkout-phone').value.trim(),
            address: document.getElementById('checkout-address').value.trim(),
            city: document.getElementById('checkout-city').value.trim(),
            pincode: document.getElementById('checkout-pincode').value.trim()
        };
        // Store details temporarily or use them directly
        window.checkoutDetails = customerDetails;
        
        // Show QR code for payment
        showQrCodeForCheckout();
    } else {
        form.reportValidity();
    }
}

function confirmPayment() {
    if (qrTimerInterval) clearInterval(qrTimerInterval);
    
    const { total } = calculateCartTotal();
    const customerDetails = window.checkoutDetails; 
    
    if (!customerDetails) {
        alert("Customer details missing. Please re-enter your details.");
        setupCheckoutPage();
        return;
    }
    
    placeOrder(customerDetails, total);
}


// --- FIREBASE DATA MANAGEMENT (C.R.U.D) ---

async function saveProduct() {
    const editId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const price = parseFloat(document.getElementById('edit-price').value);
    const originalPrice = parseFloat(document.getElementById('edit-original-price').value) || price;
    const desc = document.getElementById('edit-desc').value.trim();
    let imageUrl = document.getElementById('edit-image-url').value.trim();
    const imageFile = document.getElementById('edit-image-file');

    if (imageFile.files.length > 0) {
        try {
             imageUrl = await fileToBase64(imageFile.files[0]); 
        } catch (error) {
            console.error("Error reading file:", error);
            alert("Error reading file! Please try a URL or another file.");
            return;
        }
    }
    
    if (!imageUrl) {
        alert("Image URL or File is required.");
        return;
    }

    const productData = {
        name,
        price,
        originalPrice,
        desc,
        image: imageUrl,
    };

    try {
        if (editId) {
            const productRef = doc(db, COLLECTION.PRODUCTS, editId);
            await updateDoc(productRef, productData);
            alert(`Product "${name}" updated successfully in the cloud!`);
        } else {
            const productsCollection = collection(db, COLLECTION.PRODUCTS);
            // Firestore automatically creates the ID for a new document
            await addDoc(productsCollection, productData);
            alert(`New Product "${name}" added successfully to the cloud!`);
        }
        document.getElementById('product-modal').classList.add('hidden');
        document.getElementById('product-edit-form').reset();
    } catch (e) {
        console.error("Error saving product: ", e);
        alert("Error saving product to cloud. Check console for details.");
    }
}

async function deleteProduct(productId) {
    if (confirm("Are you sure you want to delete this product?")) {
        try {
            const productRef = doc(db, COLLECTION.PRODUCTS, productId);
            await deleteDoc(productRef);
            alert("Product deleted successfully from the cloud.");
        } catch (e) {
            console.error("Error deleting product: ", e);
            alert("Error deleting product from cloud. Check console for details.");
        }
    }
}

async function placeOrder(customerDetails, totalAmount) {
    const newOrder = {
        timestamp: new Date().toISOString(),
        customer: customerDetails,
        total: totalAmount,
        payment: "Prepaid / Online",
        status: "New",
        items: currentCart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }))
    };
    
    try {
        const ordersCollection = collection(db, COLLECTION.ORDERS);
        await addDoc(ordersCollection, newOrder); 

        currentCart = [];
        saveCart();
        updateCartDisplay();
        
        alert(`Order Placed Successfully in Cloud! (à¤‘à¤°à¥à¤¡à¤° à¤¸à¤«à¤²à¤¤à¤¾à¤ªà¥‚à¤°à¥à¤µà¤• à¤¦à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾!) \nTotal: â‚¹${totalAmount.toFixed(2)}\nThank you!`); 
        showPage('home-page');
    } catch (e) {
        console.error("Error placing order: ", e);
        alert("Error placing order to cloud. Check console for details.");
    }
}

async function clearAllOrders() {
    if (!confirm("Are you sure you want to clear ALL orders? This action cannot be undone.")) return;

    try {
        const ordersCollection = collection(db, COLLECTION.ORDERS);
        const snapshot = await getDocs(ordersCollection);
        
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        alert('All orders cleared from the cloud.');
    } catch (e) {
        console.error("Error clearing orders: ", e);
        alert("Error clearing orders from cloud.");
    }
}

// --- FIREBASE LISTENERS (Real-time Sync) ---

function listenForProducts() {
    if (!db) return;
    const productsCollection = collection(db, COLLECTION.PRODUCTS);
    onSnapshot(productsCollection, (snapshot) => {
        initialProducts = snapshot.docs.map(doc => ({
            id: doc.id, 
            ...doc.data()
        }));
        products = [...initialProducts];
        renderProductGrid();
        renderProductManagementList();
        
        if (document.getElementById('product-page').classList.contains('hidden') === false && initialProducts.length > 0) {
             // If on product page, update it if the product is still available or move to first available product
             const foundProduct = initialProducts.find(p => p.id === currentProductId);
             updateProductPage(foundProduct ? currentProductId : (initialProducts[0]?.id || 1));
        } else if (initialProducts.length > 0) {
             // Set current product ID to the first product if products are available
             currentProductId = initialProducts[0].id;
        }
        
        console.log(`Products synced from cloud. Total: ${initialProducts.length}`);
    }, (error) => {
        console.error("Error listening to products: ", error);
        alert("Error loading products from cloud.");
        initialProducts = [];
        products = [];
        renderProductGrid();
    });
}

function listenForSettings() {
    if (!db) return;
    const adminDocRef = doc(db, COLLECTION.SETTINGS, "admin");
    onSnapshot(adminDocRef, (docSnap) => {
        if (docSnap.exists()) {
            adminSettings = docSnap.data();
            ADMIN_PASSWORD = adminSettings.ADMIN_PASSWORD;
            heroLabels = adminSettings.heroLabels || {};
            homeLinksData = adminSettings.homeLinksData || {};
            upiQrData = { upiId: adminSettings.upiId, qrUrl: adminSettings.qrUrl || DEFAULT_QR_URL };
            
            loadSavedImages();
            loadHomeLinks();
            populateAdminFields();
            
            const currentPageId = document.querySelector('.page-content:not(.hidden)')?.id;
             if (currentPageId === 'contact-page' || currentPageId === 'privacy-page') {
                 showPage(currentPageId, true); // Rerender content after update
             }
            
            console.log("Settings updated from cloud.");
        } else {
             console.warn("Admin settings document not found. Using defaults.");
        }
    }, (error) => {
        console.error("Error listening to settings: ", error);
        alert("Error loading settings from cloud.");
    });
}

function listenForOrders() {
    if (!db) return;
    const ordersCollection = collection(db, COLLECTION.ORDERS);
    // Order by timestamp, descending (newest first)
    const q = query(ordersCollection, orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        orders = snapshot.docs.map(doc => ({
            id: doc.id, 
            ...doc.data()
        }));
        renderOrdersList();
        console.log(`Orders synced from cloud. Total: ${orders.length}`);
    }, (error) => {
        console.error("Error listening to orders: ", error);
        alert("Error loading orders from cloud.");
    });
}


// --- ADMIN MANAGEMENT FUNCTIONS (Cloud Saving) ---

async function saveAdminPassword() {
    const newPassword = document.getElementById('new-admin-password').value.trim();
    if (newPassword.length < 4) {
        alert("Password must be at least 4 characters long.");
        return;
    }
    if (!confirm("Are you sure you want to change the Admin Password?")) return;
    
    try {
        const adminDocRef = doc(db, COLLECTION.SETTINGS, "admin");
        await updateDoc(adminDocRef, { ADMIN_PASSWORD: newPassword });
        alert('Admin Password updated successfully in the cloud! Please log in again.');
        document.getElementById('admin-content').classList.add('hidden');
        document.getElementById('admin-login-container').classList.remove('hidden');
        document.getElementById('new-admin-password').value = '';
    } catch (e) {
        console.error("Error updating password: ", e);
        alert("Error updating password to cloud.");
    }
}

async function savePageContent(page) {
    const content = document.getElementById(`${page}-page-content-input`).value.trim();
    
    try {
        const adminDocRef = doc(db, COLLECTION.SETTINGS, "admin");
        const fieldName = `${page}PageContent`;
        await updateDoc(adminDocRef, { [fieldName]: content });
        alert(`${page} Page content updated successfully in the cloud!`);
    } catch (e) {
        console.error("Error updating page content: ", e);
        alert("Error updating page content to cloud.");
    }
}

async function saveUpiQrData() {
    const upiId = document.getElementById('upi-id-input').value.trim();
    // Allow saving empty string if user wants to remove placeholder QR code
    const qrUrlInput = document.getElementById('qr-code-url-input').value.trim();
    const qrUrl = qrUrlInput || DEFAULT_QR_URL;
    
    if (!upiId) {
        alert("UPI ID cannot be empty.");
        return;
    }

    try {
        const adminDocRef = doc(db, COLLECTION.SETTINGS, "admin");
        await updateDoc(adminDocRef, { upiId, qrUrl });
        alert('UPI ID and QR Code updated successfully in the cloud!');
    } catch (e) {
        console.error("Error updating UPI/QR: ", e);
        alert("Error updating UPI/QR to cloud.");
    }
}

async function saveImageUrls() {
    const newHeroLabels = {
        'hero-1': document.getElementById('label-hero-1').textContent.trim().replace(' Image (URL/File)', '').trim(),
        'hero-2': document.getElementById('label-hero-2').textContent.trim().replace(' Image (URL/File)', '').trim()
    };
    let hero1 = document.getElementById('hero-img-url-1').value.trim();
    let hero2 = document.getElementById('hero-img-url-2').value.trim();
    
    const dataToUpdate = {
        heroLabels: newHeroLabels,
    };

    const file1 = document.getElementById('hero-img-file-1').files[0];
    const file2 = document.getElementById('hero-img-file-2').files[0];

    try {
        // Handle file uploads by converting to Base64
        if (file1) {
            hero1 = await fileToBase64(file1);
        }
        if (file2) {
            hero2 = await fileToBase64(file2);
        }
        
        // Only update the URL/Base64 if there is content
        if (hero1) dataToUpdate.heroImageUrl1 = hero1;
        if (hero2) dataToUpdate.heroImageUrl2 = hero2;

        
        const adminDocRef = doc(db, COLLECTION.SETTINGS, "admin");
        await updateDoc(adminDocRef, dataToUpdate);
        
        // Clear file inputs after successful upload
        document.getElementById('hero-img-file-1').value = '';
        document.getElementById('hero-img-file-2').value = '';

        alert('Hero images and labels updated successfully in the cloud!');
    } catch (e) {
        console.error("Error updating Hero Images: ", e);
        alert("Error updating Hero Images to cloud.");
    }
}

async function saveHomeLinks() {
    const newHomeLinksData = {
        'link-1': { 
            label: document.getElementById('home-link-1-label').value.trim(), 
            image: document.getElementById('home-link-1-image').value.trim() 
        },
        'link-2': { 
            label: document.getElementById('home-link-2-label').value.trim(), 
            image: document.getElementById('home-link-2-image').value.trim() 
        }
    };
    
    try {
        const adminDocRef = doc(db, COLLECTION.SETTINGS, "admin");
        await updateDoc(adminDocRef, { homeLinksData: newHomeLinksData });
        alert('Home Page Links updated successfully in the cloud!');
    } catch (e) {
        console.error("Error updating Home Links: ", e);
        alert("Error updating Home Links to cloud.");
    }
}

// --- ADMIN PANEL RENDERING FUNCTIONS ---

function populateAdminFields() {
    // UPI & QR
    if (document.getElementById('upi-id-input')) {
        document.getElementById('upi-id-input').value = upiQrData.upiId || '';
        document.getElementById('qr-code-url-input').value = upiQrData.qrUrl === DEFAULT_QR_URL ? '' : upiQrData.qrUrl || '';
    }
    
    // Content Editor
    if (document.getElementById('contact-page-content-input')) {
        document.getElementById('contact-page-content-input').value = adminSettings.contactPageContent || '';
        document.getElementById('privacy-page-content-input').value = adminSettings.privacyPageContent || '';
    }
    
    // Hero Labels & Images
    if (document.getElementById('label-hero-1')) { 
        // Set visible labels in Admin UI
        document.getElementById('label-hero-1').textContent = (heroLabels['hero-1'] || 'Festive Sale') + ' Image (URL/File)';
        document.getElementById('label-hero-2').textContent = (heroLabels['hero-2'] || 'New Arrivals') + ' Image (URL/File)';
        
        // Populate URL inputs (Avoid filling with large Base64, which is not editable)
        if (adminSettings.heroImageUrl1 && adminSettings.heroImageUrl1.length < 500) {
            document.getElementById('hero-img-url-1').value = adminSettings.heroImageUrl1;
        } else {
             document.getElementById('hero-img-url-1').value = '';
        }
        if (adminSettings.heroImageUrl2 && adminSettings.heroImageUrl2.length < 500) {
            document.getElementById('hero-img-url-2').value = adminSettings.heroImageUrl2;
        } else {
             document.getElementById('hero-img-url-2').value = '';
        }
    }

    // Home Links
    if (document.getElementById('home-link-1-label')) {
        document.getElementById('home-link-1-label').value = homeLinksData['link-1'] ? homeLinksData['link-1'].label : '';
        document.getElementById('home-link-1-image').value = homeLinksData['link-1'] ? homeLinksData['link-1'].image : '';
        document.getElementById('home-link-2-label').value = homeLinksData['link-2'] ? homeLinksData['link-2'].label : '';
        document.getElementById('home-link-2-image').value = homeLinksData['link-2'] ? homeLinksData['link-2'].image : '';
    }
}

function loadSavedImages() {
    const hero1 = adminSettings.heroImageUrl1;
    const hero2 = adminSettings.heroImageUrl2;

    // Update image and label in HOME PAGE
    if (document.getElementById('img-hero-1')) {
        try {
            document.getElementById('text-hero-1').textContent = heroLabels['hero-1'] || 'Festive Sale';
            document.getElementById('text-hero-2').textContent = heroLabels['hero-2'] || 'New Arrivals';
        } catch(e) { /* silent fail if element not found */ }
    }

    if (hero1) document.getElementById('img-hero-1').src = hero1;
    if (hero2) document.getElementById('img-hero-2').src = hero2;
}

function loadHomeLinks() {
    const link1 = homeLinksData['link-1'];
    if (document.getElementById('img-collection-1')) document.getElementById('img-collection-1').src = link1 ? link1.image : 'https://placehold.co/800x400/808080/ffffff?text=Best+Seller+Jewelry';
    if (document.getElementById('text-collection-1')) document.getElementById('text-collection-1').textContent = link1 ? link1.label : 'Best seller';

    const link2 = homeLinksData['link-2'];
    if (document.getElementById('img-collection-2')) document.getElementById('img-collection-2').src = link2 ? link2.image : 'https://placehold.co/800x400/969696/ffffff?text=Necklaces+Collection';
    if (document.getElementById('text-collection-2')) document.getElementById('text-collection-2').textContent = link2 ? link2.label : 'Necklaces';
}

function renderProductManagementList() {
    const listDiv = document.getElementById('product-management-list');
    if (!listDiv) return;

    listDiv.innerHTML = ''; 
    if (initialProducts.length === 0) {
        listDiv.innerHTML = '<p class="text-gray-500 italic">No products in the store. Add a new one! (à¤¸à¥à¤Ÿà¥‹à¤° à¤®à¥‡à¤‚ à¤•à¥‹à¤ˆ à¤‰à¤¤à¥à¤ªà¤¾à¤¦ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤ à¤à¤• à¤¨à¤¯à¤¾ à¤œà¥‹à¤¡à¤¼à¥‡à¤‚!)</p>';
        return;
    }

    initialProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm';
        productItem.innerHTML = `
            <div class="flex items-center space-x-4">
                <img src="${product.image}" alt="${product.name}" class="w-12 h-12 object-cover rounded">
                <div>
                    <p class="font-semibold text-gray-900">${product.name}</p>
                    <p class="text-sm text-ghaba-green">â‚¹${product.price.toFixed(2)}</p>
                </div>
            </div>
            <div class="space-x-2 flex">
                <button class="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition" onclick="openProductEditForm('${product.id}')">
                    Edit
                </button>
                <button class="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition" onclick="deleteProduct('${product.id}')">
                    Delete
                </button>
            </div>
        `;
        listDiv.appendChild(productItem);
    });
}

function openProductEditForm(productId) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-edit-form');
    const title = document.getElementById('product-modal-title');
    const saveBtn = document.getElementById('save-product-btn');
    
    form.reset(); 
    document.getElementById('edit-product-id').value = ''; 
    document.getElementById('edit-image-url').value = ''; // Ensure URL field is cleared

    if (productId) {
        title.textContent = "Edit Product";
        saveBtn.textContent = "Save Changes";
        const product = initialProducts.find(p => p.id === productId);
        if (product) {
            document.getElementById('edit-product-id').value = product.id;
            document.getElementById('edit-name').value = product.name;
            document.getElementById('edit-price').value = product.price;
            document.getElementById('edit-original-price').value = product.originalPrice;
            document.getElementById('edit-desc').value = product.desc;
            // Only pre-fill URL if it's not a large Base64 image
            if(product.image && product.image.length < 500) { 
                document.getElementById('edit-image-url').value = product.image;
            } 
        }
    } else {
        title.textContent = "Add New Product";
        saveBtn.textContent = "Add Product";
    }

    modal.classList.remove('hidden');
}

function renderOrdersList() {
    const listContainer = document.getElementById('orders-list');
    const countElement = document.getElementById('total-orders-count');
    if (!listContainer || !countElement) return;
    
    listContainer.innerHTML = '';
    countElement.textContent = orders.length;

    if (orders.length === 0) {
        listContainer.innerHTML = '<p class="text-center text-gray-500 py-4">No orders placed yet.</p>';
        return;
    }

    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'bg-gray-50 p-4 border border-ghaba-green rounded-lg shadow-md';
        const date = new Date(order.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
        
        const itemsList = order.items.map(item => `
            <li class="text-sm text-gray-700">
                ${item.name} (x${item.quantity}) - â‚¹${(item.price * item.quantity).toFixed(2)}
            </li>
        `).join('');

        orderCard.innerHTML = `
            <div class="flex justify-between items-start border-b pb-2 mb-2">
                <h4 class="font-bold text-lg text-ghaba-green">Order ID: #${order.timestamp.slice(-6)}</h4>
                <span class="text-xs font-medium bg-green-200 text-green-800 px-2 py-0.5 rounded-full">${order.status}</span>
            </div>
            <p class="text-sm text-gray-700">Customer: ${order.customer.name} | Phone: ${order.customer.phone}</p>
            <p class="text-sm text-gray-700">Address: ${order.customer.address}, ${order.customer.city} (${order.customer.pincode})</p>
            <p class="text-sm text-gray-700">Date: ${date}</p>
            <p class="font-bold text-gray-900 mt-2">Total: <span class="text-red-600">â‚¹${order.total.toFixed(2)}</span> (${order.payment})</p>
            <ul class="list-disc list-inside mt-2 text-sm ml-2">
                ${itemsList}
            </ul>
        `;
        listContainer.appendChild(orderCard);
    });
}

function renderAdminPanel() {
    populateAdminFields();
    renderProductManagementList();
    renderOrdersList();
}


// --- Initial Load (Cloud Sync Start) ---
window.onload = () => {
    if (db) {
        // Start all real-time listeners
        listenForProducts(); 
        listenForSettings(); 
        listenForOrders();
    }

    // Load local cart
    updateCartDisplay();
    
    // Check URL for admin access
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path.includes('/admin') || hash.includes('#admin')) {
        showPage('admin-page');
    } else {
        showPage('home-page');
    }
};

// Event Listeners for quantity buttons (re-added for clarity)
document.getElementById('qty-plus').addEventListener('click', () => {
    document.getElementById('qty-input').value = parseInt(document.getElementById('qty-input').value, 10) + 1;
    document.getElementById('qr-section').classList.add('hidden');
});

document.getElementById('qty-minus').addEventListener('click', () => {
    const input = document.getElementById('qty-input');
    const current = parseInt(input.value, 10);
    if (current > 1) {
        input.value = current - 1;
    }
    document.getElementById('qr-section').classList.add('hidden');
});

document.getElementById('qty-input').addEventListener('change', () => {
     document.getElementById('qr-section').classList.add('hidden');
});

function changeHeroLabel(heroId) {
    const labelElement = document.getElementById(`label-${heroId}`);
    // Extract current label without the suffix
    const currentText = (heroLabels[heroId] || 'Hero Label'); 
    
    const newText = prompt("Enter new label for this image:", currentText);
    
    if (newText !== null && newText.trim() !== "") {
        // Temporarily update label in Admin UI
        labelElement.textContent = newText.trim() + ' Image (URL/File)';
        // Update in global object so saveImageUrls uses the prompt value
        heroLabels[heroId] = newText.trim();
    }
}