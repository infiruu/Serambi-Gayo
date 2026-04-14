document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ---
    let cart = [];
    let transactions = [];
    let currentCategory = 'all';

    // --- DOM ELEMENTS ---
    const posView = document.getElementById('pos-view');
    const historyView = document.getElementById('history-view');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    const productGrid = document.getElementById('product-grid');
    const categoryBtns = document.querySelectorAll('.cat-btn');
    const searchInput = document.getElementById('search-input');
    const currentTimeEl = document.getElementById('current-time');

    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    const btnCheckout = document.getElementById('btn-checkout');

    const paymentModal = document.getElementById('payment-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalTotalAmount = document.getElementById('modal-total-amount');
    const payMethodBtns = document.querySelectorAll('.pay-method-btn');
    const cashInputArea = document.getElementById('cash-input-area');
    const cashAmountInput = document.getElementById('cash-amount');
    const cashChangeEl = document.getElementById('cash-change');
    const confirmPaymentBtn = document.getElementById('confirm-payment');

    const receiptModal = document.getElementById('receipt-modal');
    const receiptIdDisplay = document.getElementById('receipt-id-display');
    const receiptBodyDetails = document.getElementById('receipt-body-details');
    const btnCloseReceipt = document.getElementById('btn-close-receipt');
    
    // Brew Modal
    const brewModal = document.getElementById('brew-modal');
    const closeBrewModalBtn = document.getElementById('close-brew-modal');
    const brewBeanName = document.getElementById('brew-bean-name');
    const brewMethodsList = document.getElementById('brew-methods-list');
    const confirmBrewBtn = document.getElementById('confirm-brew-btn');

    const historyList = document.getElementById('history-list');

    let selectedPaymentMethod = null;
    let currentTotal = 0;
    
    let activeBean = null;
    let selectedBrewMethod = null;

    // --- INITIALIZATION ---
    updateClock();
    setInterval(updateClock, 1000);
    renderProducts(products);

    // --- EVENT LISTENERS ---
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const view = link.getAttribute('data-view');
            if (view === 'pos') {
                posView.classList.remove('hidden');
                historyView.classList.add('hidden');
            } else {
                posView.classList.add('hidden');
                historyView.classList.remove('hidden');
                renderHistory();
            }
        });
    });

    // Categories
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            filterProducts();
        });
    });

    // Search
    searchInput.addEventListener('input', filterProducts);

    // Order Type Toggle
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // Checkout button
    btnCheckout.addEventListener('click', () => {
        if(cart.length > 0) openPaymentModal();
    });

    // Modals
    closeModalBtn.addEventListener('click', () => paymentModal.classList.add('hidden'));
    btnCloseReceipt.addEventListener('click', () => receiptModal.classList.add('hidden'));
    closeBrewModalBtn.addEventListener('click', () => brewModal.classList.add('hidden'));

    // Payment Methods Selection
    payMethodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            payMethodBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedPaymentMethod = btn.getAttribute('data-method');
            
            if (selectedPaymentMethod === 'cash') {
                cashInputArea.classList.remove('hidden');
                calculateChange();
            } else {
                cashInputArea.classList.add('hidden');
                confirmPaymentBtn.disabled = false;
            }
        });
    });

    // Cash Input Logic
    cashAmountInput.addEventListener('input', calculateChange);

    // Confirm Payment
    confirmPaymentBtn.addEventListener('click', processTransaction);


    // --- FUNCTIONS ---
    function updateClock() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        currentTimeEl.textContent = now.toLocaleDateString('id-ID', options);
    }

    function renderProducts(items) {
        productGrid.innerHTML = '';
        if (items.length === 0) {
            productGrid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">Menu tidak ditemukan.</p>`;
            return;
        }

        items.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-img" style="background-image: url('${product.img}')"></div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="price">${formatRupiah(product.price)}</p>
                </div>
            `;
            card.addEventListener('click', () => handleProductClick(product));
            productGrid.appendChild(card);
        });
    }

    function filterProducts() {
        const query = searchInput.value.toLowerCase();
        const filtered = products.filter(p => {
            const matchCategory = currentCategory === 'all' || p.category === currentCategory;
            const matchQuery = p.name.toLowerCase().includes(query);
            return matchCategory && matchQuery;
        });
        renderProducts(filtered);
    }

    // --- CART LOGIC ---
    function handleProductClick(product) {
        if (product.requiresBrew) {
            openBrewModal(product);
        } else {
            addToCart(product);
        }
    }

    function openBrewModal(product) {
        activeBean = product;
        selectedBrewMethod = null;
        brewBeanName.textContent = product.name;
        confirmBrewBtn.disabled = true;
        
        brewMethodsList.innerHTML = '';
        
        brewingMethods.forEach(method => {
            const btn = document.createElement('button');
            btn.className = 'pay-method-btn'; // Reusing this class for styling
            btn.innerHTML = `<span>${method.name}</span> <span style="margin-left:auto; color:var(--primary-color);">+${formatRupiah(method.price)}</span>`;
            
            btn.addEventListener('click', () => {
                const allBtns = brewMethodsList.querySelectorAll('.pay-method-btn');
                allBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                
                selectedBrewMethod = method;
                confirmBrewBtn.disabled = false;
            });
            
            brewMethodsList.appendChild(btn);
        });
        
        brewModal.classList.remove('hidden');
    }

    confirmBrewBtn.addEventListener('click', () => {
        if (activeBean && selectedBrewMethod) {
            const combinedProduct = {
                id: activeBean.id + '_' + selectedBrewMethod.id,
                name: `${activeBean.name} - ${selectedBrewMethod.name}`,
                price: activeBean.price + selectedBrewMethod.price,
                img: activeBean.img
            };
            addToCart(combinedProduct);
            brewModal.classList.add('hidden');
        }
    });

    function addToCart(product) {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        renderCart();
    }

    function updateQty(id, delta) {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) {
                cart = cart.filter(i => i.id !== id);
            }
        }
        renderCart();
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="ri-shopping-cart-2-line"></i>
                    <p>Belum ada pesanan</p>
                </div>`;
            updateSummary();
            return;
        }

        cart.forEach(item => {
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <div class="cart-item-info">
                    <h5>${item.name}</h5>
                    <span>${formatRupiah(item.price)}</span>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="app.updateQty('${item.id}', -1)"><i class="ri-subtract-line"></i></button>
                    <span class="qty-val">${item.qty}</span>
                    <button class="qty-btn" onclick="app.updateQty('${item.id}', 1)"><i class="ri-add-line"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(el);
        });

        // Scroll to bottom
        cartItemsContainer.scrollTop = cartItemsContainer.scrollHeight;
        updateSummary();
    }

    function updateSummary() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const tax = subtotal * 0.10; // 10% tax
        currentTotal = subtotal + tax;

        subtotalEl.textContent = formatRupiah(subtotal);
        taxEl.textContent = formatRupiah(tax);
        totalEl.textContent = formatRupiah(currentTotal);

        btnCheckout.disabled = cart.length === 0;
    }

    // Expose updateQty globally for inline onclick
    window.app = window.app || {};
    window.app.updateQty = updateQty;

    // --- CHECKOUT & TRANSACTION LOGIC ---
    function openPaymentModal() {
        modalTotalAmount.textContent = formatRupiah(currentTotal);
        
        // Reset modal state
        payMethodBtns.forEach(b => b.classList.remove('selected'));
        selectedPaymentMethod = null;
        cashInputArea.classList.add('hidden');
        cashAmountInput.value = '';
        confirmPaymentBtn.disabled = true;

        paymentModal.classList.remove('hidden');
    }

    function calculateChange() {
        const cashValue = parseFloat(cashAmountInput.value) || 0;
        const change = cashValue - currentTotal;
        cashChangeEl.textContent = formatRupiah(change > 0 ? change : 0);
        
        if (cashValue >= currentTotal) {
            confirmPaymentBtn.disabled = false;
        } else {
            confirmPaymentBtn.disabled = true;
        }
    }

    function processTransaction() {
        const randomId = "TRX-" + Math.floor(1000 + Math.random() * 9000);
        const now = new Date();
        const transaction = {
            id: randomId,
            date: now.toLocaleString('id-ID'),
            method: selectedPaymentMethod,
            items: [...cart],
            total: currentTotal
        };

        transactions.unshift(transaction); // Add to top of history
        
        // Hide payment modal, clear cart, open receipt
        paymentModal.classList.add('hidden');
        cart = [];
        renderCart();
        
        showReceipt(transaction);
    }

    function showReceipt(transaction) {
        receiptIdDisplay.textContent = transaction.id;
        
        let itemsHtml = transaction.items.map(i => `
            <div class="receipt-item">
                <span>${i.name} (x${i.qty})</span>
                <span>${formatRupiah(i.price * i.qty)}</span>
            </div>
        `).join('');

        receiptBodyDetails.innerHTML = `
            <div style="margin-bottom:10px;">
                <p>Metode: <strong>${transaction.method.toUpperCase()}</strong></p>
                <p>Tanggal: ${transaction.date}</p>
            </div>
            <div class="receipt-divider"></div>
            ${itemsHtml}
            <div class="receipt-divider"></div>
            <div class="receipt-total">
                <span>Total Bayar</span>
                <span>${formatRupiah(transaction.total)}</span>
            </div>
        `;

        receiptModal.classList.remove('hidden');
    }

    // --- HISTORY LOGIC ---
    function renderHistory() {
        historyList.innerHTML = '';
        if (transactions.length === 0) {
            historyList.innerHTML = `<p style="color: var(--text-muted); text-align:center;">Belum ada riwayat transaksi.</p>`;
            return;
        }

        transactions.forEach(trx => {
            const card = document.createElement('div');
            card.className = 'history-card';
            
            let methodIcon = 'ri-money-dollar-circle-line';
            if(trx.method === 'qris') methodIcon = 'ri-qr-code-line';
            if(trx.method === 'transfer') methodIcon = 'ri-bank-card-line';

            card.innerHTML = `
                <div>
                    <span class="history-date">${trx.date}</span>
                    <span class="history-id">${trx.id}</span>
                </div>
                <div style="display:flex; align-items:center; gap: 15px;">
                    <i class="${methodIcon}" style="font-size: 1.5rem; color: var(--text-muted);"></i>
                    <span class="history-amount">${formatRupiah(trx.total)}</span>
                    <button class="secondary-btn" style="padding: 5px 10px;" onclick="app.showReceiptId('${trx.id}')">Lihat Struk</button>
                </div>
            `;
            historyList.appendChild(card);
        });
    }

    window.app.showReceiptId = (id) => {
        const trx = transactions.find(t => t.id === id);
        if(trx) showReceipt(trx);
    }
});
