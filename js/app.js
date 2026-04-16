document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ---
    let cart = [];
    let transactions = [];
    let currentCategory = 'all';
    let inventoryLogs = [];
    const LOW_STOCK_THRESHOLD = 100000; // 100 Kg in grams

    // --- DOM ELEMENTS ---
    const posView = document.getElementById('pos-view');
    const historyView = document.getElementById('history-view');
    const inventoryView = document.getElementById('inventory-view');
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
    const qrisArea = document.getElementById('qris-area');
    const transferArea = document.getElementById('transfer-area');
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

    // Espresso Modal
    const espressoModal = document.getElementById('espresso-modal');
    const closeEspressoModalBtn = document.getElementById('close-espresso-modal');
    const espressoMenuName = document.getElementById('espresso-menu-name');
    const btnNoAddon = document.getElementById('btn-no-addon');
    const btnWithOatmilk = document.getElementById('btn-with-oatmilk');

    const historyList = document.getElementById('history-list');
    
    // Inventory Elements
    const inventoryGrid = document.getElementById('inventory-grid');
    const inventoryLogsBody = document.getElementById('inventory-logs-body');
    const toastContainer = document.getElementById('toast-container');

    let selectedPaymentMethod = null;
    let currentTotal = 0;
    
    let activeBean = null;
    let selectedBrewMethod = null;

    // --- AUTHENTICATION ---
    const APP_PASSWORD = "serambigayo";
    const loginOverlay = document.getElementById('login-overlay');
    const loginPassword = document.getElementById('login-password');
    const btnLogin = document.getElementById('btn-login');
    const loginErrorMsg = document.getElementById('login-error-msg');

    if (sessionStorage.getItem('isAuthenticated') === 'true') {
        loginOverlay.classList.add('hidden');
    }

    function attemptLogin() {
        if (loginPassword.value === APP_PASSWORD) {
            sessionStorage.setItem('isAuthenticated', 'true');
            loginOverlay.style.opacity = '0';
            setTimeout(() => loginOverlay.classList.add('hidden'), 500);
        } else {
            loginErrorMsg.classList.remove('hidden');
        }
    }

    btnLogin.addEventListener('click', attemptLogin);
    loginPassword.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') attemptLogin();
    });

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
            posView.classList.add('hidden');
            historyView.classList.add('hidden');
            inventoryView.classList.add('hidden');
            
            if (view === 'pos') {
                posView.classList.remove('hidden');
            } else if (view === 'history') {
                historyView.classList.remove('hidden');
                renderHistory();
            } else if (view === 'inventory') {
                inventoryView.classList.remove('hidden');
                renderInventory();
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
    closeEspressoModalBtn.addEventListener('click', () => espressoModal.classList.add('hidden'));

    // Payment Methods Selection
    payMethodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            payMethodBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedPaymentMethod = btn.getAttribute('data-method');
            
            // Reset areas
            cashInputArea.classList.add('hidden');
            qrisArea.classList.add('hidden');
            transferArea.classList.add('hidden');
            confirmPaymentBtn.disabled = true;
            
            if (selectedPaymentMethod === 'cash') {
                cashInputArea.classList.remove('hidden');
                calculateChange();
            } else if (selectedPaymentMethod === 'qris') {
                qrisArea.classList.remove('hidden');
                confirmPaymentBtn.disabled = false;
            } else if (selectedPaymentMethod === 'transfer') {
                transferArea.classList.remove('hidden');
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
            const isManual = product.category === 'manual';
            const isEspresso = product.category === 'espresso';
            let stockHtml = '';
            let isOutOfStock = false;
            
            if (product.grams > 0) {
                let beanId = isManual ? product.id : (isEspresso ? HOUSE_BLEND_ID : null);
                if (beanId && inventoryData[beanId]) {
                    const stockInGrams = inventoryData[beanId].stock;
                    const stockInKg = (stockInGrams / 1000).toFixed(2);
                    
                    if (stockInGrams < product.grams) {
                        isOutOfStock = true;
                        stockHtml = `<div class="product-stock danger">Habis</div>`;
                    } else {
                        stockHtml = `<div class="product-stock">${stockInKg} Kg</div>`;
                    }
                }
            }

            const card = document.createElement('div');
            card.className = `product-card ${isOutOfStock ? 'out-of-stock' : ''}`;
            card.innerHTML = `
                <div class="product-img" style="background-image: url('${product.img}')"></div>
                ${stockHtml}
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="price">${formatRupiah(product.price)}</p>
                </div>
            `;
            card.addEventListener('click', () => {
                if(!isOutOfStock) handleProductClick(product);
            });
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
        } else if (product.requiresEspressoAddon) {
            openEspressoModal(product);
        } else {
            addToCart(product);
        }
    }

    function openEspressoModal(product) {
        activeBean = product;
        espressoMenuName.textContent = product.name;
        espressoModal.classList.remove('hidden');
    }

    btnNoAddon.addEventListener('click', () => {
        if (activeBean) {
            addToCart(activeBean);
            espressoModal.classList.add('hidden');
        }
    });

    btnWithOatmilk.addEventListener('click', () => {
        if (activeBean) {
            const combinedProduct = {
                id: activeBean.id + '_oatmilk',
                name: `${activeBean.name} - Ganti Oatmilk`,
                price: activeBean.price + 15000,
                img: activeBean.img,
                grams: activeBean.grams,
                category: activeBean.category,
                baseId: activeBean.id
            };
            addToCart(combinedProduct);
            espressoModal.classList.add('hidden');
        }
    });

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
                img: activeBean.img,
                grams: activeBean.grams,
                category: activeBean.category,
                baseId: activeBean.id
            };
            addToCart(combinedProduct);
            brewModal.classList.add('hidden');
        }
    });

    // Helper finding bean mapping id for a given cart product
    function getBeanId(item) {
        const baseId = item.baseId || item.id;
        const baseProduct = products.find(p => p.id === baseId);
        if (!baseProduct) return null;
        
        if (baseProduct.category === 'manual') return baseId;
        if (baseProduct.category === 'espresso') return HOUSE_BLEND_ID;
        return null;
    }

    // Helper calculate stock checking against the cart
    function isStockSufficient(productToAdd, qtyToAdd) {
        const targetBeanId = getBeanId(productToAdd);
        if (!targetBeanId) return true; // not a coffee item

        const gramsPerUnit = productToAdd.grams || 0;
        if (gramsPerUnit === 0) return true;

        // Calculate total grams needed for THIS beanId currently in cart
        let totalGramsInCart = 0;
        cart.forEach(item => {
            if (getBeanId(item) === targetBeanId) {
                totalGramsInCart += (item.grams || 0) * item.qty;
            }
        });

        const newGramsNeeded = gramsPerUnit * qtyToAdd;
        const availableStock = inventoryData[targetBeanId].stock;

        return (totalGramsInCart + newGramsNeeded) <= availableStock;
    }

    function addToCart(product) {
        if (!isStockSufficient(product, 1)) {
            alert('Gagal menambahkan: Sisa Stok tidak mencukupi!');
            return;
        }

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
            // Check stock if increasing qty
            if (delta > 0 && !isStockSufficient(item, 1)) {
                alert('Gagal menambah: Sisa Stok tidak mencukupi!');
                return;
            }

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
        qrisArea.classList.add('hidden');
        transferArea.classList.add('hidden');
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
        
        let stockDeductionMsg = [];
        let deductedBeans = {};

        // Deduct Inventory & Build Log
        cart.forEach(item => {
            const targetBeanId = getBeanId(item);
            if (targetBeanId && item.grams > 0) {
                const gramsToDeduct = item.grams * item.qty;
                inventoryData[targetBeanId].stock -= gramsToDeduct;
                
                // Group deductions by bean for the notification
                if (!deductedBeans[targetBeanId]) {
                    deductedBeans[targetBeanId] = 0;
                }
                deductedBeans[targetBeanId] += gramsToDeduct;
            }
        });
        
        for (const beanId in deductedBeans) {
            const totalGrams = deductedBeans[beanId];
            const remainingKg = (inventoryData[beanId].stock / 1000).toFixed(2);
            const beanName = inventoryData[beanId].name;
            
            // Add to Inventory Log
            inventoryLogs.unshift({
                date: now.toLocaleString('id-ID'),
                beanName: beanName,
                deduction: totalGrams + " gr",
                remaining: remainingKg,
                trxId: randomId
            });
            
            stockDeductionMsg.push(`${beanName} berkurang ${totalGrams}gr (Sisa: ${remainingKg} Kg)`);
        }

        if (stockDeductionMsg.length > 0) {
            showToast("Transaksi Berhasil!", stockDeductionMsg.join(' • '));
        } else {
            showToast("Transaksi Berhasil!", "Pesanan tidak mengandung bahan kopi.");
        }

        // Hide payment modal, clear cart, open receipt
        paymentModal.classList.add('hidden');
        cart = [];
        renderCart();
        renderProducts(products); // Refresh the UI stocks
        renderInventory(); // update inventory view if open
        
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
    };

    // --- INVENTORY VIEW LOGIC ---
    function renderInventory() {
        if (!inventoryGrid || !inventoryLogsBody) return;
        inventoryGrid.innerHTML = '';
        
        // Render Stock Cards
        for (const key in inventoryData) {
            const item = inventoryData[key];
            const stockKg = (item.stock / 1000).toFixed(2);
            const isCritical = item.stock < LOW_STOCK_THRESHOLD; // < 100Kg
            
            const card = document.createElement('div');
            card.className = `inv-stock-card ${isCritical ? 'critical' : ''}`;
            
            let refillBadgeHtml = isCritical ? '<br><span class="refill-badge">Kopi sudah bisa di stok kembali</span>' : '';
            
            card.innerHTML = `
                <h4>${item.name}</h4>
                <div class="inv-stock-amount">${stockKg} Kg</div>
                ${refillBadgeHtml}
            `;
            inventoryGrid.appendChild(card);
        }

        // Render Logs Table
        inventoryLogsBody.innerHTML = '';
        if (inventoryLogs.length === 0) {
            inventoryLogsBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Belum ada log pergerakan stok.</td></tr>`;
        } else {
            inventoryLogs.forEach(log => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${log.date}</td>
                    <td><strong>${log.beanName}</strong></td>
                    <td style="color:var(--danger)">-${log.deduction}</td>
                    <td>${log.remaining}</td>
                    <td><span class="history-id">${log.trxId}</span></td>
                `;
                inventoryLogsBody.appendChild(tr);
            });
        }
    }

    // --- TOAST NOTIFICATIONS ---
    function showToast(title, message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-body">${message}</div>
        `;
        toastContainer.appendChild(toast);
        
        // Auto remove after animation ends (4.6s + buffer)
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 5100);
    }
});
