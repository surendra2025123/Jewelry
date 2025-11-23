// --- ADMIN CONFIGURATION ---
const ADMIN_PASSWORD = "1234";
const DEFAULT_UPI_ID = "ghaba.jewels@ybl";
// Use a placeholder that clearly indicates dynamic generation for default
const DEFAULT_QR_URL = "https://placehold.co/200x200/2a3c2a/ffc72c?text=SCAN+HERE"; 

// --- INITIAL DATA (Default Products) ---
let initialProducts = JSON.parse(localStorage.getItem('ghaba_products')) || [
    { id: 1, name: "2 Layer Arab Necklace", price: 399.00, originalPrice: 650.00, desc: "A stunning two-layered necklace with an intricate Arabic design and polished finish. High-quality polish and anti-allergy metal finish.", image: "https://placehold.co/800x800/2a3c2a/ffc72c?text=2+LAYER+ARAB+NECKLACE", qrCodeData: "upi://pay?pa=ghaba.jewels@ybl&pn=GHABA" },
    { id: 2, name: "Round single stone necklace", price: 299.00, originalPrice: 500.00, desc: "A delicate round single stone necklace perfect for everyday wear. Simple, elegant, and timeless. Gold plated, perfect for subtle elegance.", image: "https://placehold.co/600x600/2a3c2a/ffc72c?text=ROUND+STONE+NECKLACE", qrCodeData: "upi://pay?pa=ghaba.jewels@ybl&pn=GHABA" },
    { id: 3, name: "Premium Multi Layer Dainty necklace", price: 499.00, originalPrice: 599.00, desc: "A luxurious multi-layered dainty necklace featuring fine gold chains and delicate pearl accents. High-quality polish and anti-allergy metal.", image: "https://placehold.co/600x600/2a3c2a/ffc72c?text=MULTI+DAINTY+SET", qrCodeData: "upi://pay?pa=ghaba.jewels@ybl&pn=GHABA" },
    { id: 4, name: "Floral girl necklace", price: 449.00, originalPrice: 600.00, desc: "Charming floral design necklace, ideal for a sweet and youthful look. Comes with adjustable chain length.", image: "https://placehold.co/600x600/2a3c2a/ffc72c?text=FLORAL+GIRL+NECKLACE", qrCodeData: "upi://pay?pa=ghaba.jewels@ybl&pn=GHABA" },
    { id: 5, name: "Elegant Stud Earrings Set", price: 199.00, originalPrice: 350.00, desc: "A set of five pairs of elegant stud earrings, perfect for various occasions. Hypoallergenic material.", image: "https://placehold.co/600x600/2a3c2a/ffc72c?text=ELEGANT+STUDS", qrCodeData: "upi://pay?pa=ghaba.jewels@ybl&pn=GHABA" },
    { id: 6, name: "Classic Pearl Bracelet", price: 799.00, originalPrice: 1000.00, desc: "A timeless bracelet featuring lustrous freshwater pearls. A must-have for classic elegance.", image: "https://placehold.co/600x600/2a3c2a/ffc72c?text=PEARL+BRACELET", qrCodeData: "upi://pay?pa=ghaba.jewels@ybl&pn=GHABA" },
];

let products = [...initialProducts]; // Mutable copy for filtering/searching
let currentCart = [];
let currentProductId = initialProducts.length > 0 ? initialProducts[0].id : 1; 

let heroLabels = JSON.parse(localStorage.getItem('ghaba_hero_labels')) || {
    'hero-1': 'Festive Sale Image (URL/File)',
    'hero-2': 'Model Collection Image (URL/File)'
};

let homeLinksData = JSON.parse(localStorage.getItem('ghaba_home_links')) || {
    'link-1': { label: 'Best seller', image: 'https://placehold.co/800x400/808080/ffffff?text=Best+Seller+Jewelry' },
    'link-2': { label: 'Necklaces', image: 'https://placehold.co/800x400/969696/ffffff?text=Necklaces+Collection' }
};

let upiQrData = JSON.parse(localStorage.getItem('ghaba_upi_qr')) || {
    upiId: DEFAULT_UPI_ID,
    qrUrl: DEFAULT_QR_URL
};


// --- CORE UTILITY FUNCTIONS ---
let pageHistory = []; // Navigation history stack

/**
 * Switches the displayed content page and manages history.
 * @param {string} pageId The ID of the page to show.
 * @param {boolean} isBack True if navigation is triggered by the back button.
 */
function showPage(pageId, isBack = false) {
    // 1. Get the ID of the currently visible page
    const currentlyVisiblePage = document.querySelector('.page-content:not(.hidden)');
    const currentId = currentlyVisiblePage ? currentlyVisiblePage.id : (pageHistory.length > 0 ? pageHistory[pageHistory.length - 1] : 'home-page');

    // 2. Manage History: Only push to history if it's not a back action AND we are moving to a different page.
    if (!isBack && currentId && currentId !== pageId) {
        pageHistory.push(currentId);
    }
    
    // 3. Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    
    // 4. Admin page specific logic (show/hide login form)
    if (pageId === 'admin-page') {
        const adminContent = document.getElementById('admin-content');
        const loginContainer = document.getElementById('admin-login-container');
        
        // If admin content is hidden (not logged in), show login form
        if (adminContent && adminContent.classList.contains('hidden')) {
            loginContainer.classList.remove('hidden');
        } else if (adminContent) {
            // If logged in, hide login form
            loginContainer.classList.add('hidden');
        }
    }
    
    // 5. Show the requested page
    document.getElementById(pageId).classList.remove('hidden');
    window.scrollTo(0, 0); // Scroll to top on page change
}

/**
 * Navigates back one step in history using the pageHistory stack.
 */
function goBack() {
    if (pageHistory.length > 0) {
        const previousPageId = pageHistory.pop();
        showPage(previousPageId, true); // Use the isBack flag to prevent pushing history again
    } else {
        // Fallback: If no history, go to home page
        showPage('home-page'); 
    }
}

/**
 * Handles the admin login process.
 */
function loginAdmin() {
    const passwordInput = document.getElementById('admin-password').value;
    const loginError = document.getElementById('login-error');
    const loginContainer = document.getElementById('admin-login-container');
    const adminContent = document.getElementById('admin-content');

    if (passwordInput === ADMIN_PASSWORD) {
        loginContainer.classList.add('hidden');
        adminContent.classList.remove('hidden');
        loginError.classList.add('hidden');
        alert('Welcome to Admin Panel! (एडमिन पैनल में आपका स्वागत है!)');
        
        // Manually show the content management sections after login
        renderAdminPanel(); 
        renderProductManagementList(); 
        renderUpiQrManagement();
    } else {
        loginError.classList.remove('hidden');
        document.getElementById('admin-password').value = '';
    }
}


/**
 * Toggles the visibility of the search input field.
 */
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
        products = [...initialProducts]; // Reset search
        renderProductGrid();
    }
}

/**
 * Filter products based on search query.
 */
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
    showPage('collections-page'); // Show collections page with results
}

// --- IMAGE & LABEL MANAGEMENT (ADMIN) ---

/**
 * Converts a File object to a Base64 data URL.
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Loads saved image data (URL or Base64) from localStorage and applies them to the hero section.
 * Also loads custom labels.
 */
function loadSavedImages() {
    const hero1 = localStorage.getItem('ghaba_hero_1');
    const hero2 = localStorage.getItem('ghaba_hero_2');

    // Load custom labels and update Admin fields
    if (document.getElementById('label-hero-1')) { 
        document.getElementById('label-hero-1').textContent = heroLabels['hero-1'];
        document.getElementById('label-hero-2').textContent = heroLabels['hero-2'];

        // Also update the displayed text on the home page
        try {
            document.querySelector('#home-page > section:nth-child(2) > div:nth-child(1) .bg-opacity-95 > span:nth-child(1)').textContent = heroLabels['hero-1'].replace(' Image (URL/File)', '').replace(' Image', '');
            document.querySelector('#home-page > section:nth-child(2) > div:nth-child(2) .bg-opacity-95 > span:nth-child(1)').textContent = heroLabels['hero-2'].replace(' Image (URL/File)', '').replace(' Image', '');
        } catch(e) { /* silent fail */ }
    }

    if (hero1) document.getElementById('img-hero-1').src = hero1;
    if (hero2) document.getElementById('img-hero-2').src = hero2;
}

/**
 * Saves image URLs or uploaded files to localStorage.
 */
async function saveImageUrls() {
    // Helper function to get image source (URL takes precedence over file)
    const getSource = async (urlId, fileId, storageKey) => {
        const url = document.getElementById(urlId).value.trim();
        const fileInput = document.getElementById(fileId);
        if (url) {
            localStorage.setItem(storageKey, url);
        } else if (fileInput.files.length > 0) {
            try {
                const base64 = await fileToBase64(fileInput.files[0]);
                localStorage.setItem(storageKey, base64);
            } catch (error) {
                alert(`Error reading file for ${storageKey}!`);
            }
        } else {
             // If no new input, keep existing value (do nothing to localStorage)
        }
    };

    await getSource('hero-img-url-1', 'hero-img-file-1', 'ghaba_hero_1');
    await getSource('hero-img-url-2', 'hero-img-file-2', 'ghaba_hero_2');

    loadSavedImages();
    alert('Hero Images updated successfully! (हीरो इमेज सफलतापूर्वक अपडेट हो गईं!)');
}

/**
 * Allows Admin to change the label text for the hero image sections.
 */
function changeHeroLabel(heroId) {
    const newLabel = prompt(`Enter new label for ${heroId}:`, heroLabels[heroId]);
    if (newLabel !== null && newLabel.trim() !== '') {
        heroLabels[heroId] = newLabel.trim();
        localStorage.setItem('ghaba_hero_labels', JSON.stringify(heroLabels));
        loadSavedImages(); // Refresh labels and home page text
    }
}


// --- HOME PAGE LINK MANAGEMENT FUNCTIONS ---

/**
 * Loads saved home page link data and applies them to the Home Page.
 */
function loadHomeLinks() {
    // Link 1
    const link1 = homeLinksData['link-1'];
    if (document.getElementById('img-collection-1')) document.getElementById('img-collection-1').src = link1.image;
    if (document.getElementById('text-collection-1')) document.getElementById('text-collection-1').textContent = link1.label;
    
    // Update Admin form fields if they exist
    if (document.getElementById('home-link-1-label')) {
         document.getElementById('home-link-1-label').value = link1.label;
         document.getElementById('home-link-1-image').value = link1.image;
    }

    // Link 2
    const link2 = homeLinksData['link-2'];
    if (document.getElementById('img-collection-2')) document.getElementById('img-collection-2').src = link2.image;
    if (document.getElementById('text-collection-2')) document.getElementById('text-collection-2').textContent = link2.label;
    
    // Update Admin form fields if they exist
    if (document.getElementById('home-link-2-label')) {
         document.getElementById('home-link-2-label').value = link2.label;
         document.getElementById('home-link-2-image').value = link2.image;
    }
}

/**
 * Saves home page link data from the Admin Panel to localStorage.
 */
function saveHomeLinks() {
    const label1 = document.getElementById('home-link-1-label').value.trim();
    const image1 = document.getElementById('home-link-1-image').value.trim();
    const label2 = document.getElementById('home-link-2-label').value.trim();
    const image2 = document.getElementById('home-link-2-image').value.trim();

    if (label1) homeLinksData['link-1'].label = label1;
    if (image1) homeLinksData['link-1'].image = image1;
    if (label2) homeLinksData['link-2'].label = label2;
    if (image2) homeLinksData['link-2'].image = image2;

    localStorage.setItem('ghaba_home_links', JSON.stringify(homeLinksData));
    loadHomeLinks(); // Update the home page display
    alert('Home Page Links updated successfully! (होम पेज लिंक सफलतापूर्वक अपडेट हो गए!)');
}


// --- UPI/QR MANAGEMENT FUNCTIONS (UPDATED) ---

/**
 * Renders the current UPI/QR data in the Admin Panel form.
 */
function renderUpiQrManagement() {
    if (document.getElementById('upi-id-input')) {
        document.getElementById('upi-id-input').value = upiQrData.upiId;
    }
    if (document.getElementById('qr-code-url-input')) {
        // Only display URL if it's not a local base64 or the default placeholder
        const isBase64 = upiQrData.qrUrl.startsWith('data:');
        const isDefault = upiQrData.qrUrl === DEFAULT_QR_URL;
        
        document.getElementById('qr-code-url-input').value = (isBase64 || isDefault) ? '' : upiQrData.qrUrl;
    }
    // Clear file input on render
    if (document.getElementById('qr-code-file-input')) {
        document.getElementById('qr-code-file-input').value = '';
    }
}

/**
 * Saves UPI/QR data from the Admin Panel to localStorage.
 */
async function saveUpiQrData() {
    const upiId = document.getElementById('upi-id-input').value.trim();
    const qrUrlInput = document.getElementById('qr-code-url-input').value.trim();
    const qrFile = document.getElementById('qr-code-file-input');
    let finalQrUrl = qrUrlInput; // URL takes precedence

    if (!upiId) {
        alert('UPI ID cannot be empty! (UPI ID खाली नहीं हो सकती!)');
        return;
    }
    
    // Check for file upload if URL is empty
    if (!qrUrlInput && qrFile.files.length > 0) {
        try {
            finalQrUrl = await fileToBase64(qrFile.files[0]);
        } catch (error) {
            alert("Error reading QR file! Please try again.");
            return;
        }
    }
    
    // Fallback to default placeholder if both are empty
    upiQrData.upiId = upiId;
    upiQrData.qrUrl = finalQrUrl || DEFAULT_QR_URL; 

    localStorage.setItem('ghaba_upi_qr', JSON.stringify(upiQrData));
    renderUpiQrManagement(); // Re-render to show saved values
    alert('UPI/QR Settings updated successfully! (UPI/QR सेटिंग्स सफलतापूर्वक अपडेट हो गईं!)');
}


// --- PRODUCT DISPLAY FUNCTIONS ---

/**
 * Renders the product cards on the Collections Page based on the current 'products' array.
 */
function renderProductGrid() {
    const grid = document.getElementById('product-grid');
    if (!grid) return; 

    grid.innerHTML = '';
    document.getElementById('product-count').textContent = products.length;

    if (products.length === 0) {
        grid.innerHTML = '<p class="text-xl text-gray-500 col-span-full text-center py-10">No products found matching your search. (आपकी खोज से मेल खाने वाले कोई उत्पाद नहीं मिले।)</p>';
        return;
    }

    products.forEach(product => {
        const discount = (product.originalPrice > product.price) ? 'Sale' : '';
        const card = document.createElement('div');
        card.className = "product-card bg-white rounded-xl shadow-2xl overflow-hidden transition hover:shadow-3xl hover:scale-[1.03] cursor-pointer";
        card.setAttribute('data-product-id', product.id);
        card.onclick = () => {
            showPage('product-page');
            updateProductPage(product.id);
        };
        card.innerHTML = `
            <div class="relative bg-gray-50">
                <img src="${product.image}" alt="${product.name}" class="w-full h-auto object-cover transform transition duration-500 hover:scale-110">
                ${discount ? `<span class="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">SALE</span>` : ''}
            </div>
            <div class="p-4 text-center">
                <p class="text-sm font-bold text-gray-800 truncate mb-1">${product.name}</p>
                ${product.originalPrice > product.price ? `<p class="text-xs text-gray-400 line-through">Rs. ${product.originalPrice.toFixed(2)}</p>` : `<p class="text-xs text-transparent">.</p>` }
                <p class="text-lg font-extrabold text-ghaba-green mb-3">Rs. ${product.price.toFixed(2)}</p>
                <button class="w-full bg-ghaba-gold text-gray-900 font-semibold py-2 rounded-md hover:bg-yellow-500 transition text-sm" onclick="event.stopPropagation(); addToCart(${product.id}, 1); showPage('cart-page');">Add to Cart</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

/**
 * Updates the Product Detail Page with the selected product's information.
 */
function updateProductPage(productId) {
    const product = initialProducts.find(p => p.id === productId);
    if (!product) return;

    currentProductId = productId; // Set the current product for cart/qr code

    document.getElementById('product-image').src = product.image;
    document.getElementById('product-detail-title').textContent = product.name;
    document.getElementById('product-detail-price').textContent = `Rs. ${product.price.toFixed(2)}`;
    document.getElementById('product-detail-original-price').textContent = product.originalPrice > product.price ? `Rs. ${product.originalPrice.toFixed(2)}` : '';
    document.getElementById('product-detail-desc').textContent = product.desc;
    document.getElementById('qty-input').value = 1;

    // Hide QR section initially
    document.getElementById('qr-section').classList.add('hidden');
}

/**
 * Shows the UPI QR code section and calculates the total payment amount based on quantity.
 * 'Buy it now' पर क्लिक करने पर QR कोड दिखाता है और कुल राशि कैलकुलेट करता है।
 */
function showQrCodeWithPayment() {
    const product = initialProducts.find(p => p.id === currentProductId);
    const quantity = parseInt(document.getElementById('qty-input').value, 10);
    if (!product || quantity < 1) return;

    const totalAmount = (product.price * quantity).toFixed(2);
    
    // Dynamic QR generation placeholder URL (Used if no custom QR URL is provided)
    const qrImageUrl = `https://placehold.co/200x200/2a3c2a/ffc72c?text=Rs+${totalAmount}`; 
    
    // Fallback/Static QR (The one configurable in Admin)
    const staticQrUrl = upiQrData.qrUrl;

    // Decide which image to display
    // Priority: 1. Configured static URL/Base64. 2. Dynamic placeholder.
    const finalQrImage = (staticQrUrl && staticQrUrl !== DEFAULT_QR_URL) 
                         ? staticQrUrl 
                         : qrImageUrl;

    document.getElementById('upi-qr-code').src = finalQrImage;
    document.getElementById('upi-qr-code').alt = `UPI QR Code for Rs. ${totalAmount}`;


    // 2. Update Payment Amount Display
    document.getElementById('qr-payment-amount').textContent = `Rs. ${totalAmount}`;

    // 3. Show the QR Section
    document.getElementById('qr-section').classList.remove('hidden');
}

// --- CART/CHECKOUT LOGIC ---

/**
 * Calculates the total price of all items in the current cart.
 * @returns {number} The total cost.
 */
function calculateCartTotal() {
    return currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Function to add a product to the cart (simulated).
 */
function addToCart(productId, quantity) {
    const product = initialProducts.find(p => p.id === productId);
    if (!product) return;
    const qty = parseInt(quantity, 10);
    if (qty < 1) return;

    // Find existing item
    const existingItemIndex = currentCart.findIndex(item => item.id === productId);

    if (existingItemIndex !== -1) {
        // If exists, update quantity
        currentCart[existingItemIndex].quantity = qty;
    } else {
        // Create a new item object
        const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: qty
        };
        currentCart.push(newItem);
    }
    
    updateCartDisplay();
    // Show confirmation message on the cart page
    const confirmMessage = document.getElementById('cart-confirm-message');
    if (confirmMessage) {
        confirmMessage.classList.remove('hidden');
        setTimeout(() => {
             confirmMessage.classList.add('hidden');
        }, 3000);
    }
}

/**
 * Function to update the quantity of an item in the cart.
 */
function updateCartQuantity(productId, newQuantity) {
    const item = currentCart.find(item => item.id === productId);
    if (!item) return;

    const qty = parseInt(newQuantity, 10);
    if (qty < 1) {
        removeFromCart(productId);
        return;
    }

    item.quantity = qty;
    updateCartDisplay();
}

/**
 * Function to remove a product from the cart.
 */
function removeFromCart(productId) {
    currentCart = currentCart.filter(item => item.id !== productId);
    updateCartDisplay();
}

/**
 * Updates the cart icon count and the content of the full cart page.
 */
function updateCartDisplay() {
    const cartCount = currentCart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;

    const cartItemsDiv = document.getElementById('cart-items-list');
    const total = calculateCartTotal();
    
    // Update Full Cart Page Summary
    if (document.getElementById('cart-page-count')) {
        document.getElementById('cart-page-count').textContent = cartCount;
        document.getElementById('cart-summary-item-count').textContent = cartCount;
        document.getElementById('cart-summary-subtotal').textContent = `Rs. ${total.toFixed(2)}`;
        document.getElementById('cart-summary-total').textContent = `Rs. ${total.toFixed(2)}`;
    }
    
    // Render cart items list
    if (cartItemsDiv) {
        cartItemsDiv.innerHTML = currentCart.map(item => `
            <div class="flex items-start border border-gray-200 p-4 rounded-lg shadow-sm">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-md mr-4 shadow">
                <div class="flex-1 flex justify-between">
                    <div>
                        <p class="font-bold text-lg text-gray-900">${item.name}</p>
                        <p class="text-ghaba-green font-bold text-md">Rs. ${item.price.toFixed(2)}</p>
                        <button class="text-sm text-red-500 mt-2 hover:text-red-700" onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                    <div class="flex flex-col items-end">
                        <div class="flex items-center w-24 border border-gray-300 rounded-md overflow-hidden mb-2">
                            <button class="p-1 text-gray-600 hover:bg-gray-100 transition text-sm" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <input type="number" value="${item.quantity}" min="1" class="w-full text-center text-sm border-x p-1 focus:outline-none" onchange="updateCartQuantity(${item.id}, this.value)">
                            <button class="p-1 text-gray-600 hover:bg-gray-100 transition text-sm" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <p class="font-bold text-gray-800">Total: Rs. ${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        `).join('');

        // Handle empty cart state
        if (cartCount === 0) {
            cartItemsDiv.innerHTML = `<p class="text-center py-20 text-xl text-gray-500">Your cart is empty. Please add items to checkout. (आपकी कार्ट खाली है।)</p>`;
        }
    }


    // Disable checkout button if cart is empty on the full cart page
    const checkoutBtnFull = document.getElementById('checkout-btn-full');
    if (checkoutBtnFull) {
        if (cartCount > 0) {
            checkoutBtnFull.disabled = false;
            checkoutBtnFull.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            checkoutBtnFull.disabled = true;
            checkoutBtnFull.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }
}

/**
 * Populates the checkout page with the order summary.
 */
function setupCheckoutPage() {
    const total = calculateCartTotal();
    document.getElementById('checkout-subtotal').textContent = `Rs. ${total.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `Rs. ${total.toFixed(2)}`;
    document.getElementById('checkout-submit-total').textContent = `Rs. ${total.toFixed(2)}`; // Update the button text

    // Populate item list
    const itemsListDiv = document.getElementById('checkout-items-list');
    itemsListDiv.innerHTML = currentCart.map(item => 
        `<div class="flex justify-between text-sm text-gray-700"> 
            <span>${item.name} (x${item.quantity})</span> 
            <span>Rs. ${(item.price * item.quantity).toFixed(2)}</span> 
        </div>`
    ).join('');
}

/**
 * Saves the order details and current cart to local storage (Admin Panel data).
 */
function placeOrder() {
    const customerName = document.getElementById('checkout-name').value;
    const customerPhone = document.getElementById('checkout-phone').value;
    const customerEmail = document.getElementById('checkout-email').value;
    const customerAddress = document.getElementById('checkout-address').value;
    const customerPincode = document.getElementById('checkout-pincode').value;
    const customerCity = document.getElementById('checkout-city').value;

    const totalAmount = calculateCartTotal();
    
    // Only Online Payment is available now
    const paymentMethod = 'online';
    
    // Simple validation
    if (!customerName || !customerPhone || !customerAddress || !customerCity || !customerPincode) {
        alert("Please fill out all required shipping fields. (कृपया सभी आवश्यक शिपिंग फ़ील्ड भरें।)");
        return;
    }
    if (currentCart.length === 0) {
        alert("Your cart is empty. Please add items before placing an order.");
        return;
    }

    // Create the order object
    const newOrder = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        customer: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            address: customerAddress,
            pincode: customerPincode,
            city: customerCity,
        },
        items: currentCart,
        total: totalAmount,
        payment: 'Online Prepaid', 
        status: 'Pending Payment', // Always pending payment since COD is removed
    };

    // Save to local storage
    const allOrders = JSON.parse(localStorage.getItem('ghaba_orders')) || [];
    allOrders.push(newOrder);
    localStorage.setItem('ghaba_orders', JSON.stringify(allOrders));

    // Clear cart
    currentCart = [];
    updateCartDisplay();
    renderAdminPanel(); // Refresh admin panel

    // Show confirmation
    alert(`Order Placed Successfully! (ऑर्डर सफलतापूर्वक दिया गया!) \nOrder ID: #${newOrder.id.toString().slice(-6)}\nTotal: Rs. ${newOrder.total.toFixed(2)}\nPayment: ${newOrder.payment}\n\nNote: This is a simulated online payment. Thank you!`);

    // Redirect to home page
    showPage('home-page');
}

// --- ADMIN MANAGEMENT FUNCTIONS ---

/**
 * Renders the list of products in the Admin Panel for editing/deletion.
 */
function renderProductManagementList() {
    const listDiv = document.getElementById('product-management-list');
    if (!listDiv) return; 

    listDiv.innerHTML = ''; // Clear previous content

    if (initialProducts.length === 0) {
        listDiv.innerHTML = '<p class="text-gray-500 italic">No products in the store. Add a new one! (स्टोर में कोई उत्पाद नहीं है। एक नया जोड़ें!)</p>';
        return;
    }

    initialProducts.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm';
        productItem.innerHTML = `
            <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-800 truncate">${product.name} (ID: ${product.id})</p>
                <p class="text-sm text-ghaba-green font-semibold">Price: Rs. ${product.price.toFixed(2)} ${product.originalPrice > product.price ? `<span class="text-red-500 line-through ml-2">(${product.originalPrice.toFixed(2)})</span>` : ''}</p>
            </div>
            <div class="flex space-x-2 ml-4">
                <button class="text-sm bg-ghaba-gold text-gray-900 px-3 py-1 rounded-md hover:bg-yellow-500 transition" onclick="openProductEditForm(${product.id})">Edit</button>
                <button class="text-sm bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition" onclick="deleteProduct(${product.id})">Delete</button>
            </div>
        `;
        listDiv.appendChild(productItem);
    });
}

/**
 * Opens the modal form to add a new product or edit an existing one.
 */
function openProductEditForm(productId) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-edit-form');
    form.reset(); // Clear previous form data

    document.getElementById('edit-product-id').value = productId || '';
    document.getElementById('product-modal-title').textContent = productId ? 'Edit Product' : 'Add New Product';

    if (productId) {
        const product = initialProducts.find(p => p.id === productId);
        if (product) {
            document.getElementById('edit-name').value = product.name;
            document.getElementById('edit-price').value = product.price;
            document.getElementById('edit-original-price').value = product.originalPrice || '';
            document.getElementById('edit-desc').value = product.desc;
            // Only set URL input if it's a URL (not base64 image data)
            document.getElementById('edit-image-url').value = product.image.startsWith('http') ? product.image : ''; 
        }
    } else {
        // Clear fields for new product
        document.getElementById('edit-image-url').value = '';
    }
    
    // Clear file input on open/switch
    document.getElementById('edit-image-file').value = '';

    modal.classList.remove('hidden');
}

/**
 * Saves a new product or updates an existing one.
 */
async function saveProduct() {
    const editId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const price = parseFloat(document.getElementById('edit-price').value);
    const originalPrice = parseFloat(document.getElementById('edit-original-price').value) || 0;
    const desc = document.getElementById('edit-desc').value.trim();
    let imageUrl = document.getElementById('edit-image-url').value.trim();
    const imageFile = document.getElementById('edit-image-file');

    if (imageFile.files.length > 0) {
        try {
            // File upload takes priority
            imageUrl = await fileToBase64(imageFile.files[0]);
        } catch (error) {
            console.error("Error reading file:", error);
            alert("Error reading file! Please try a URL or another file.");
            return;
        }
    }

    if (editId) {
        // EDIT EXISTING PRODUCT
        const index = initialProducts.findIndex(p => p.id === parseInt(editId));
        if (index !== -1) {
            const existingProduct = initialProducts[index];
            existingProduct.name = name;
            existingProduct.price = price;
            existingProduct.originalPrice = originalPrice;
            existingProduct.desc = desc;
            if (imageUrl) { 
                existingProduct.image = imageUrl;
            }
            alert(`Product "${name}" updated successfully!`);
        }
    } else {
        // ADD NEW PRODUCT
        const newId = initialProducts.length > 0 ? Math.max(...initialProducts.map(p => p.id)) + 1 : 1;
        const newProduct = {
            id: newId,
            name: name,
            price: price,
            originalPrice: originalPrice,
            desc: desc,
            image: imageUrl || "https://placehold.co/600x600/cccccc/000000?text=NEW+PRODUCT", 
            qrCodeData: "upi://pay?pa=ghaba.jewels@ybl&pn=GHABA"
        };
        initialProducts.push(newProduct);
        alert(`New product "${name}" added successfully!`);
    }

    // Save updated products list to Local Storage
    localStorage.setItem('ghaba_products', JSON.stringify(initialProducts));
    
    // Re-render and close modal
    products = [...initialProducts]; // Sync the mutable copy
    renderProductManagementList();
    renderProductGrid();
    updateProductPage(parseInt(editId) || initialProducts[0].id); 
    document.getElementById('product-modal').classList.add('hidden');
}

/**
 * Deletes a product from the list.
 */
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product? This cannot be undone.')) {
        initialProducts = initialProducts.filter(p => p.id !== productId);
        
        // Save updated products list to Local Storage
        localStorage.setItem('ghaba_products', JSON.stringify(initialProducts));

        // Clear from cart if present
        currentCart = currentCart.filter(item => item.id !== productId);
        updateCartDisplay();

        // Re-render
        products = [...initialProducts];
        renderProductManagementList();
        renderProductGrid(); 

        // Redirect if the deleted product was the one currently being viewed
        if (currentProductId === productId && initialProducts.length > 0) {
             currentProductId = initialProducts[0].id;
             updateProductPage(currentProductId);
             showPage('collections-page');
        } else if (currentProductId === productId) {
             showPage('home-page');
        }
    }
}

/**
 * Renders the order list in the Admin Panel.
 */
function renderAdminPanel() {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;

    const allOrders = JSON.parse(localStorage.getItem('ghaba_orders')) || [];
    ordersList.innerHTML = '';

    if (allOrders.length === 0) {
        ordersList.innerHTML = '<p class="text-gray-500 italic">No orders found. (कोई ऑर्डर नहीं मिला।)</p>';
        return;
    }

    // Display orders in reverse chronological order (newest first)
    allOrders.slice().reverse().forEach(order => {
        const itemsList = order.items.map(item => 
            `<li class="ml-4 list-disc text-sm text-gray-700">${item.name} (x${item.quantity}) - Rs. ${(item.price * item.quantity).toFixed(2)}</li>`
        ).join('');
        
        // Dynamic status color
        let statusColor = 'text-green-600'; // All orders are prepaid/online now
        
        const orderCard = document.createElement('div');
        orderCard.className = 'bg-gray-50 p-4 border border-ghaba-green rounded-lg shadow-md';
        orderCard.innerHTML = `
            <div class="flex justify-between items-start border-b pb-2 mb-2">
                <h4 class="font-bold text-lg text-ghaba-green">Order ID: #${order.id.toString().slice(-6)}</h4>
                <span class="text-sm font-medium ${statusColor}">${order.status}</span>
            </div>
            <p class="text-xs text-gray-600 mb-2">Date: ${order.date}</p>
            <div class="mb-3">
                <p class="font-semibold text-gray-800">Customer: ${order.customer.name} (${order.customer.phone})</p>
                <p class="text-sm text-gray-700">Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.pincode}</p>
            </div>
            <p class="font-bold text-sm text-gray-900 mb-1">Items:</p>
            <ul class="mb-3">${itemsList}</ul>
            <div class="flex justify-between font-extrabold text-md text-ghaba-gold border-t pt-2">
                <span>TOTAL:</span>
                <span>Rs. ${order.total.toFixed(2)} (${order.payment})</span>
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

/**
 * Clears all stored orders from local storage.
 */
function clearAllOrders() {
    if (confirm('Are you sure you want to delete ALL orders? This cannot be undone.')) {
        localStorage.removeItem('ghaba_orders');
        renderAdminPanel();
        alert('All orders have been cleared.');
    }
}


// --- EVENT LISTENERS ---

// Quantity control for product page
document.getElementById('qty-minus').addEventListener('click', () => {
    let input = document.getElementById('qty-input');
    let value = parseInt(input.value, 10);
    if (value > 1) {
        input.value = value - 1;
    }
    document.getElementById('qr-section').classList.add('hidden');
});

document.getElementById('qty-plus').addEventListener('click', () => {
    let input = document.getElementById('qty-input');
    input.value = parseInt(input.value, 10) + 1;
    document.getElementById('qr-section').classList.add('hidden');
});

document.getElementById('qty-input').addEventListener('change', () => {
     document.getElementById('qr-section').classList.add('hidden');
});


// Initialize the app on load
window.onload = () => {
    // Load config from local storage
    initialProducts = JSON.parse(localStorage.getItem('ghaba_products')) || initialProducts;
    products = [...initialProducts];
    heroLabels = JSON.parse(localStorage.getItem('ghaba_hero_labels')) || heroLabels;
    homeLinksData = JSON.parse(localStorage.getItem('ghaba_home_links')) || homeLinksData; 
    upiQrData = JSON.parse(localStorage.getItem('ghaba_upi_qr')) || upiQrData; 

    // Sync views
    loadSavedImages(); 
    loadHomeLinks(); 
    renderProductGrid(); 
    updateCartDisplay();
    
    // Check URL for /admin access
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path.includes('/admin') || hash.includes('#admin')) {
        showPage('admin-page');
    } else {
        // Default to home page
        showPage('home-page');
        
        if(initialProducts.length > 0) {
             updateProductPage(initialProducts[0].id);
        }
    }
    
    // Admin functions always loaded (but only displayed if logged in)
    renderAdminPanel(); 
    renderProductManagementList(); 
    renderUpiQrManagement();
    
};