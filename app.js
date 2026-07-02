/* ==========================================================================
   VERTEX LEDGER - APPLICATION ENGINE (VANILLA JS)
   ========================================================================== */

// --- Global Application State ---
let state = {
    company: {
        name: "",
        address: "",
        gstin: "",
        phone: ""
    },
    items: [],
    parties: [],
    bankAccounts: [],
    invoices: [],
    transactions: []
};

// Cart for the active invoice creation
let activeCart = [];

// Track active view
let currentView = 'dashboard';

// Active selected bank account ID in Cash & Bank page
let activeBankIdForCard = null;

// --- Initialize App ---
document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    loadData();
    setupNavigation();
    setup3DParallax();
    setupRealtimeClock();
    setupGlobalSearch();

    // Set default invoice details in the creator form
    initInvoiceFormDefaults();

    // Render initial views
    renderAll();
});

// --- LocalStorage & Mock Data Hydration ---
function loadData() {
    const savedState = localStorage.getItem('vertex_ledger_state');
    if (savedState) {
        state = JSON.parse(savedState);
        // Migration: Ensure new food testing items exist
        if (state.items && !state.items.find(i => i.id === "item-7")) {
            state.items.push({ id: "item-7", name: "Organic Fuji Apples (1kg)", code: "SKU-APPLE", category: "Fruits & Vegetables", qty: 30, purchasePrice: 120.00, salePrice: 160.00, taxRate: 5, minQty: 10 });
        }
        if (state.items && !state.items.find(i => i.id === "item-8")) {
            state.items.push({ id: "item-8", name: "Premium Basmati Rice (5kg)", code: "SKU-RICE", category: "Food", qty: 40, purchasePrice: 350.00, salePrice: 499.00, taxRate: 5, minQty: 8 });
        }
        // Migration: Align legacy categories with predefined select values
        if (state.items) {
            state.items.forEach(item => {
                if (item.category === "Peripherals" || item.category === "Monitors" || item.category === "Laptops" || item.category === "Accessories" || item.category === "Networking") {
                    item.category = "Electronics";
                }
            });
        }
        saveData();
    } else {
        // Populate standard enterprise Mock Data
        state.company = {
            name: "",
            address: "",
            gstin: "",
            phone: ""
        };

        state.bankAccounts = [
            {
                id: "bank-cash",
                name: "Cash In Hand",
                accountNum: "PHYSICAL VAULT",
                ifsc: "N/A",
                branch: "Office Safe",
                upi: "N/A",
                balance: 12400.00,
                cardHolder: "APEX CASHIER",
                cardType: "mastercard"
            },
            {
                id: "bank-hdfc",
                name: "HDFC Business Bank",
                accountNum: "•••• •••• •••• 8920",
                ifsc: "HDFC0000104",
                branch: "Main Branch Pune",
                upi: "apex@hdfc",
                balance: 145200.00,
                cardHolder: "APEX INNOVATIONS",
                cardType: "visa"
            },
            {
                id: "bank-upi",
                name: "UPI Business Wallet",
                accountNum: "PHONEPE / GPAY MERCHANT",
                ifsc: "UPI-DIRECT",
                branch: "Online Gateway",
                upi: "apex@upi",
                balance: 28000.00,
                cardHolder: "APEX BUSINESS QR",
                cardType: "rupay"
            }
        ];

        state.items = [
            { id: "item-1", name: "Logitech MX Master 3S", code: "SKU-MX3S", category: "Electronics", qty: 25, purchasePrice: 7500.00, salePrice: 9499.00, taxRate: 18, minQty: 5 },
            { id: "item-2", name: "Dell UltraSharp 27 Monitor", code: "SKU-U2723QE", category: "Electronics", qty: 12, purchasePrice: 32000.00, salePrice: 38500.00, taxRate: 18, minQty: 3 },
            { id: "item-3", name: "Apple MacBook Pro M3", code: "SKU-MBP14", category: "Electronics", qty: 4, purchasePrice: 145000.00, salePrice: 169900.00, taxRate: 18, minQty: 5 },
            { id: "item-4", name: "USB-C Hub Multiport", code: "SKU-C-HUB", category: "Electronics", qty: 2, purchasePrice: 1200.00, salePrice: 1850.00, taxRate: 18, minQty: 10 },
            { id: "item-5", name: "Ergonomic Office Chair", code: "SKU-ERG-CH", category: "Furniture", qty: 15, purchasePrice: 8500.00, salePrice: 11000.00, taxRate: 12, minQty: 2 },
            { id: "item-6", name: "Cat6 Ethernet Cable 15m", code: "SKU-CAT6-15", category: "Electronics", qty: 48, purchasePrice: 250.00, salePrice: 450.00, taxRate: 18, minQty: 8 },
            { id: "item-7", name: "Organic Fuji Apples (1kg)", code: "SKU-APPLE", category: "Fruits & Vegetables", qty: 30, purchasePrice: 120.00, salePrice: 160.00, taxRate: 5, minQty: 10 },
            { id: "item-8", name: "Premium Basmati Rice (5kg)", code: "SKU-RICE", category: "Food", qty: 40, purchasePrice: 350.00, salePrice: 499.00, taxRate: 5, minQty: 8 }
        ];

        state.parties = [
            { id: "party-1", name: "Walking Customer", phone: "N/A", gstin: "N/A", balanceType: "receive", balance: 0.00 },
            { id: "party-2", name: "Ramesh Enterprises", phone: "9823456711", gstin: "27BBBCC1234A2Z2", balanceType: "receive", balance: 14500.00 },
            { id: "party-3", name: "Vikas Tech Solutions", phone: "8888777712", gstin: "27DDDEE5678C1Z9", balanceType: "receive", balance: 45000.00 },
            { id: "party-4", name: "Super Computech Distributor", phone: "9123456789", gstin: "27FFFGG9012D1Z0", balanceType: "pay", balance: 88000.00 }
        ];

        state.invoices = [
            {
                id: "inv-mock-1",
                invoiceNum: "INV-2026-001",
                date: "2026-06-28",
                partyId: "party-2",
                partyName: "Ramesh Enterprises",
                partyPhone: "9823456711",
                partyGstin: "27BBBCC1234A2Z2",
                items: [
                    { name: "Logitech MX Master 3S", qty: 2, rate: 9499.00, lineTotal: 18998.00 }
                ],
                subtotal: 16100.00,
                discount: 0.00,
                tax: 2898.00,
                grandTotal: 18998.00,
                bankId: "bank-hdfc"
            },
            {
                id: "inv-mock-2",
                invoiceNum: "INV-2026-002",
                date: "2026-07-01",
                partyId: "party-3",
                partyName: "Vikas Tech Solutions",
                partyPhone: "8888777712",
                partyGstin: "27DDDEE5678C1Z9",
                items: [
                    { name: "Dell UltraSharp 27 Monitor", qty: 1, rate: 38500.00, lineTotal: 38500.00 },
                    { name: "USB-C Hub Multiport", qty: 2, rate: 1850.00, lineTotal: 3700.00 }
                ],
                subtotal: 35762.71,
                discount: 0.00,
                tax: 6437.29,
                grandTotal: 42200.00,
                bankId: "bank-upi"
            }
        ];

        state.transactions = [
            { id: "tx-mock-1", date: "2026-06-28", sourceAccount: "HDFC Business Bank", details: "Sale Deposit: INV-2026-001", flowType: "in", amount: 18998.00 },
            { id: "tx-mock-2", date: "2026-07-01", sourceAccount: "UPI Business Wallet", details: "Sale Deposit: INV-2026-002", flowType: "in", amount: 42200.00 }
        ];

        saveData();
    }

    if (state.bankAccounts.length > 0) {
        activeBankIdForCard = state.bankAccounts[1].id; // Default to HDFC card view
    }
}

function saveData() {
    localStorage.setItem('vertex_ledger_state', JSON.stringify(state));
}

function resetAppData() {
    if (confirm("Are you sure you want to reset all data to default mock values? This will erase custom entries.")) {
        localStorage.removeItem('vertex_ledger_state');
        showToast("Restoring default mock enterprise data...", "info");
        setTimeout(() => {
            window.location.reload();
        }, 800);
    }
}

// --- Navigation Controller ---
function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            // Prevent event if clicked add shortcut button
            if (e.target.classList.contains('add-shortcut-btn')) {
                return;
            }
            const targetView = item.getAttribute("data-view");
            switchView(targetView);
        });
    });
}

function switchView(viewName) {
    currentView = viewName;

    // Toggle active classes on Sidebar items
    document.querySelectorAll(".nav-item").forEach(item => {
        if (item.getAttribute("data-view") === viewName) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Toggle active view sections in main viewport
    document.querySelectorAll(".view-section").forEach(section => {
        if (section.id === `view-${viewName}`) {
            section.classList.add("active");
        } else {
            section.classList.remove("active");
        }
    });

    renderAll();
}

// --- Global Rendering Registry ---
function renderAll() {
    // Populate header & footer company names
    const companyName = state.company.name || "";
    
    const displayHeaderName = document.getElementById("display-company-name-header");
    if (displayHeaderName) {
        displayHeaderName.innerText = companyName ? companyName : "Enter Business Name";
    }

    const displaySidebarName = document.getElementById("display-company-name");
    if (displaySidebarName) {
        displaySidebarName.innerText = companyName ? companyName : "My Company";
    }

    const displaySidebarGstin = document.getElementById("display-company-gstin");
    if (displaySidebarGstin) {
        displaySidebarGstin.innerText = state.company.gstin ? `GSTIN: ${state.company.gstin}` : "Click to setup GSTIN";
    }

    if (currentView === 'dashboard') {
        renderDashboard();
    } else if (currentView === 'parties') {
        renderParties();
    } else if (currentView === 'items') {
        renderStockItems();
    } else if (currentView === 'billing') {
        renderBilling();
    } else if (currentView === 'banking') {
        renderBanking();
    } else if (currentView === 'reports') {
        renderReports();
    }
}

// --- VIEW: DASHBOARD ---
function renderDashboard() {
    // 1. Calculate Stats
    // Today's Sales
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySalesTotal = state.invoices
        .filter(inv => inv.date === todayStr)
        .reduce((sum, inv) => sum + inv.grandTotal, 0);
    
    // Total stock value & item count
    let totalStockVal = 0;
    let lowStockCount = 0;
    state.items.forEach(item => {
        totalStockVal += (item.qty * item.purchasePrice);
        if (item.qty <= item.minQty) {
            lowStockCount++;
        }
    });

    // Total cash & bank balance
    const totalBankBal = state.bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Apply stats to DOM
    document.getElementById("stat-total-sales").innerText = formatCurrency(todaySalesTotal || 48250.00); // fallback mock if no fresh sales
    document.getElementById("stat-stock-value").innerText = formatCurrency(totalStockVal);
    document.getElementById("stat-total-items-count").innerText = state.items.length;
    document.getElementById("stat-bank-balance").innerText = formatCurrency(totalBankBal);
    document.getElementById("stat-low-stock").innerText = `${lowStockCount} Item${lowStockCount !== 1 ? 's' : ''}`;
    
    // Set colors for low stock indicators
    const lowStockDom = document.getElementById("stat-low-stock");
    if (lowStockCount > 0) {
        lowStockDom.className = "card-value text-gold";
    } else {
        lowStockDom.className = "card-value text-green";
    }

    // 2. Populate Recent Invoices table
    const recentInvoicesTbody = document.getElementById("recent-invoices-list");
    recentInvoicesTbody.innerHTML = "";

    // Show last 5 invoices
    const sortedInvoices = [...state.invoices].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    if (sortedInvoices.length === 0) {
        recentInvoicesTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No sales invoices recorded yet.</td></tr>`;
    } else {
        sortedInvoices.forEach(inv => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${inv.invoiceNum}</strong></td>
                <td>${inv.partyName}</td>
                <td>${formatDateString(inv.date)}</td>
                <td>${formatCurrency(inv.grandTotal)}</td>
                <td><span class="status-badge paid"><i class="fa-solid fa-circle-check"></i> Paid</span></td>
                <td>
                    <button class="btn-card-action" onclick="viewSpecificInvoice('${inv.id}')" title="View & Print"><i class="fa-solid fa-file-invoice"></i></button>
                </td>
            `;
            recentInvoicesTbody.appendChild(tr);
        });
    }

    // 3. Populate Low Stock Alerts panel
    const lowStockListContainer = document.getElementById("low-stock-list");
    lowStockListContainer.innerHTML = "";

    const lowStockItems = state.items.filter(item => item.qty <= item.minQty);
    if (lowStockItems.length === 0) {
        lowStockListContainer.innerHTML = `
            <div class="stock-alert-item" style="border-color: rgba(56, 239, 125, 0.2); background: rgba(56, 239, 125, 0.01);">
                <div class="alert-info">
                    <h4 class="text-green"><i class="fa-solid fa-circle-check"></i> All Stock Safe</h4>
                    <p>All items exceed low threshold.</p>
                </div>
            </div>
        `;
    } else {
        lowStockItems.slice(0, 3).forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "stock-alert-item";
            itemDiv.innerHTML = `
                <div class="alert-info">
                    <h4>${item.name}</h4>
                    <p>Min limit: ${item.minQty} units</p>
                </div>
                <div class="qty-pill">${item.qty} left</div>
            `;
            lowStockListContainer.appendChild(itemDiv);
        });
    }

    // 4. Update ledger quick status widgets
    const cashInHandAcc = state.bankAccounts.find(acc => acc.id === 'bank-cash');
    const hdfcAcc = state.bankAccounts.find(acc => acc.id === 'bank-hdfc');
    const upiAcc = state.bankAccounts.find(acc => acc.id === 'bank-upi');

    if (cashInHandAcc) document.getElementById("sum-cash-in-hand").innerText = formatCurrency(cashInHandAcc.balance);
    if (hdfcAcc) document.getElementById("sum-bank-hdfc").innerText = formatCurrency(hdfcAcc.balance);
    if (upiAcc) document.getElementById("sum-bank-upi").innerText = formatCurrency(upiAcc.balance);
}

// --- VIEW: PARTIES ---
function renderParties() {
    const tbody = document.getElementById("parties-list-table");
    tbody.innerHTML = "";

    if (state.parties.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No business parties added yet.</td></tr>`;
    } else {
        state.parties.forEach(party => {
            const isPayable = party.balanceType === "pay";
            const balanceClass = isPayable ? "expense-indicator" : (party.balance > 0 ? "deposit-indicator" : "");
            const balanceLabel = isPayable ? "Payable" : "Receivable";
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${party.name}</strong></td>
                <td>${party.phone || 'N/A'}</td>
                <td>${party.gstin || 'N/A'}</td>
                <td><span class="status-badge ${isPayable ? 'pending' : 'paid'}">${balanceLabel}</span></td>
                <td><span class="${balanceClass}">${formatCurrency(party.balance)}</span></td>
                <td>
                    <button class="btn-card-action btn-delete" onclick="deleteParty('${party.id}')" title="Delete Party"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// --- VIEW: ITEMS & STOCK ---
let activeStockFilter = 'all';

function renderStockItems() {
    const grid = document.getElementById("stock-items-grid");
    grid.innerHTML = "";

    let filteredItems = state.items;
    if (activeStockFilter === 'low') {
        filteredItems = state.items.filter(item => item.qty <= item.minQty);
    } else if (activeStockFilter === 'gst') {
        filteredItems = state.items.filter(item => item.taxRate > 0);
    }

    if (filteredItems.length === 0) {
        grid.innerHTML = `<div class="glass-card text-center text-muted span-2 w-100" style="grid-column: 1 / -1;">No matching inventory stock items found.</div>`;
    } else {
        filteredItems.forEach(item => {
            const isLow = item.qty <= item.minQty;
            const itemDiv = document.createElement("div");
            itemDiv.className = `stock-card-3d tilt-target ${isLow ? 'low-stock' : ''}`;
            const isFood = (item.category === "Food" || item.category === "Fruits & Vegetables");
            const unitLabel = isFood ? "servings" : "pcs";
            const saleLabel = isFood ? "Price/Portion" : "Sale Price";
            const buyLabel = isFood ? "Cost Price" : "Buy Price";
            const categoryBadge = isFood 
                ? `<span class="item-sku" style="background: rgba(56, 239, 125, 0.12); color: var(--accent-green); border-color: rgba(56, 239, 125, 0.25);"><i class="fa-solid fa-bowl-food"></i> Food</span>` 
                : `<span class="item-sku">${item.code || 'NO SKU'}</span>`;

            itemDiv.innerHTML = `
                <div class="stock-card-inner">
                    <div class="item-actions">
                        <button class="btn-card-action" onclick="openItemModal('${item.id}')" title="Edit Product"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-card-action btn-delete" onclick="deleteItem('${item.id}')" title="Delete Product"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                    ${categoryBadge}
                    <h3 class="item-title" title="${item.name}">${item.name}</h3>
                    
                    <div class="stock-indicator-row">
                        <span class="stock-stat">Current Stock:</span>
                        <span class="stock-count">${item.qty} <span class="small text-muted" style="font-size:11px; font-weight:400;">${unitLabel}</span></span>
                    </div>

                    <div class="price-details-box">
                        <div class="price-col">
                            <span>${saleLabel}</span>
                            <strong>${formatCurrency(item.salePrice)}</strong>
                        </div>
                        <div class="price-col">
                            <span>${buyLabel}</span>
                            <strong>${formatCurrency(item.purchasePrice)}</strong>
                        </div>
                        <div class="price-col">
                            <span>GST</span>
                            <strong style="color: var(--accent-blue);">${item.taxRate}%</strong>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(itemDiv);
        });

        // Re-initialize mouse event tracking on dynamically added stock cards
        setup3DParallax();
    }
}

function filterStockItems() {
    const query = document.getElementById("stock-search-input").value.toLowerCase();
    const cards = document.querySelectorAll(".stock-card-3d");
    cards.forEach(card => {
        const title = card.querySelector(".item-title").innerText.toLowerCase();
        const sku = card.querySelector(".item-sku").innerText.toLowerCase();
        if (title.includes(query) || sku.includes(query)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

function filterStockTab(filterType) {
    activeStockFilter = filterType;
    document.querySelectorAll(".filter-tab").forEach(tab => {
        if (tab.getAttribute("data-filter") === filterType) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });
    renderStockItems();
}

// --- VIEW: BILLING & INVOICING ---
let activeBillingSubview = 'create';

function toggleBillingView(subview) {
    activeBillingSubview = subview;
    const btnCreate = document.getElementById("btn-create-invoice-tab");
    const btnHistory = document.getElementById("btn-invoices-history-tab");
    const viewCreate = document.getElementById("billing-create-subview");
    const viewHistory = document.getElementById("billing-history-subview");

    if (subview === 'create') {
        btnCreate.classList.add("active");
        btnHistory.classList.remove("active");
        viewCreate.classList.remove("d-none");
        viewHistory.classList.add("d-none");
    } else {
        btnCreate.classList.remove("active");
        btnHistory.classList.add("active");
        viewCreate.classList.add("d-none");
        viewHistory.classList.remove("d-none");
        renderInvoicesHistory();
    }
}

function initInvoiceFormDefaults() {
    document.getElementById("bill-date").value = new Date().toISOString().split('T')[0];
    // Generate next invoice sequential number
    const nextNum = state.invoices.length + 1;
    document.getElementById("bill-number").value = `INV-2026-${String(nextNum).padStart(3, '0')}`;
}

function renderBilling() {
    // Populate Parties list dropdown
    const partySelect = document.getElementById("bill-party-select");
    partySelect.innerHTML = "";
    state.parties.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.innerText = p.name;
        partySelect.appendChild(opt);
    });

    // Build initial autocomplete suggestions
    buildAutocompleteSuggestions();

    // Populate Bank select dropdown
    const bankSelect = document.getElementById("bill-bank-select");
    bankSelect.innerHTML = "";
    state.bankAccounts.forEach(acc => {
        const opt = document.createElement("option");
        opt.value = acc.id;
        opt.innerText = `${acc.name} (Bal: ${formatCurrency(acc.balance)})`;
        bankSelect.appendChild(opt);
    });

    updateBillCustomerDetails();
    renderInvoiceCart();
}

function updateBillCustomerDetails() {
    const partyId = document.getElementById("bill-party-select").value;
    const customer = state.parties.find(p => p.id === partyId);

    const hasFood = activeCart.some(item => {
        const cat = (item.category || "").toLowerCase();
        return cat === "food" || cat === "fruits & vegetables";
    });

    const restRow = document.getElementById("restaurant-order-details-row");
    const previewLabel = document.getElementById("inv-preview-bill-to-label");
    const previewName = document.getElementById("inv-preview-party-name");
    const previewPhone = document.getElementById("inv-preview-party-phone");
    const previewGstRow = document.getElementById("inv-preview-party-gst-row");

    if (hasFood) {
        if (restRow) restRow.classList.remove("d-none");
        
        const table = document.getElementById("restaurant-table-no").value;
        const type = document.getElementById("restaurant-order-type").value;
        const waiter = document.getElementById("restaurant-waiter").value;

        // Change Invoice title
        const titleH1 = document.querySelector(".inv-title-side h1");
        if (titleH1) titleH1.innerText = "KOT & FOOD BILL";

        // Display Table & Order Info
        if (previewLabel) previewLabel.innerText = "ORDER DETAILS:";
        if (previewName) previewName.innerText = `${table} (${type})`;
        if (previewPhone) previewPhone.innerText = `Server/Waiter: ${waiter}`;
        if (previewGstRow) {
            const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            previewGstRow.innerHTML = `Order Time: <span>${currentTime}</span>`;
        }
    } else {
        if (restRow) restRow.classList.add("d-none");

        // Restore Invoice title
        const titleH1 = document.querySelector(".inv-title-side h1");
        if (titleH1) titleH1.innerText = "TAX INVOICE";

        if (previewLabel) previewLabel.innerText = "BILL TO:";
        if (customer) {
            if (previewName) previewName.innerText = customer.name;
            if (previewPhone) previewPhone.innerText = `Phone: ${customer.phone || 'N/A'}`;
            if (previewGstRow) {
                previewGstRow.innerHTML = `GSTIN: <span id="inv-preview-party-gst">${customer.gstin || 'N/A'}</span>`;
            }
        }
    }
}

function autoFillItemDetails() {
    const itemId = document.getElementById("bill-item-select-id").value;
    const item = state.items.find(i => i.id === itemId);

    if (item) {
        document.getElementById("bill-item-price").value = item.salePrice;
        document.getElementById("bill-item-tax").value = item.taxRate;
        document.getElementById("bill-item-qty").value = 1;
        calculateActiveLineTotal();
    } else {
        document.getElementById("bill-item-price").value = "";
        document.getElementById("bill-item-tax").value = "";
        document.getElementById("bill-item-qty").value = 1;
        document.getElementById("bill-line-total-preview").innerText = "₹0.00";
    }
}

function calculateActiveLineTotal() {
    const qty = parseFloat(document.getElementById("bill-item-qty").value) || 0;
    const price = parseFloat(document.getElementById("bill-item-price").value) || 0;
    const discount = parseFloat(document.getElementById("bill-item-discount").value) || 0;
    
    // Formula: (Qty * Price) - Discount
    const rawTotal = (qty * price) - discount;
    const netTotal = Math.max(0, rawTotal);

    document.getElementById("bill-line-total-preview").innerText = formatCurrency(netTotal);
}

function isFoodCategory(cat) {
    const c = (cat || "").toLowerCase();
    return c === "food" || c === "fruits & vegetables";
}

let previousCategoryFilter = "all";

function handleCategoryFilterChange() {
    const filterSelect = document.getElementById("bill-item-category-filter");
    if (!filterSelect) return;
    
    const newVal = filterSelect.value;
    
    if (activeCart.length > 0 && newVal !== "all") {
        const cartIsFood = isFoodCategory(activeCart[0].category);
        const newIsFood = isFoodCategory(newVal);
        
        if (cartIsFood !== newIsFood) {
            const currentType = cartIsFood ? "Food/Restaurant" : "Standard Business (Electronics/Furniture)";
            const newType = newIsFood ? "Food/Restaurant" : "Standard Business (Electronics/Furniture)";
            const confirmClear = confirm(
                `Changing the category filter to show ${newType} items will clear your current ${currentType} cart.\n\n` +
                `Do you want to clear the cart and proceed?`
            );
            
            if (confirmClear) {
                activeCart = [];
                renderInvoiceCart();
            } else {
                // Revert select option
                filterSelect.value = previousCategoryFilter;
                return;
            }
        }
    }
    
    previousCategoryFilter = newVal;
    buildAutocompleteSuggestions();
}

function addItemToInvoiceCart() {
    const itemId = document.getElementById("bill-item-select-id").value;
    const item = state.items.find(i => i.id === itemId);
    const qty = parseInt(document.getElementById("bill-item-qty").value) || 0;
    const price = parseFloat(document.getElementById("bill-item-price").value) || 0;
    const discount = parseFloat(document.getElementById("bill-item-discount").value) || 0;

    if (!itemId) {
        showToast("Please select a stock item.", "error");
        return;
    }

    // Category routing and separation validation
    if (activeCart.length > 0) {
        const cartIsFood = isFoodCategory(activeCart[0].category);
        const itemIsFood = isFoodCategory(item.category);
        
        if (cartIsFood !== itemIsFood) {
            const currentType = cartIsFood ? "Food/Restaurant" : "Standard Business (Electronics/Furniture)";
            const newType = itemIsFood ? "Food/Restaurant" : "Standard Business (Electronics/Furniture)";
            
            const confirmChange = confirm(
                `Mixing ${newType} items with ${currentType} items on the same invoice is not allowed.\n\n` +
                `Would you like to clear the current cart and start a new invoice for ${item.category}?`
            );
            
            if (confirmChange) {
                activeCart = [];
                // Update the category filter dropdown to match
                const filterSelect = document.getElementById("bill-item-category-filter");
                if (filterSelect) {
                    filterSelect.value = itemIsFood ? "Food" : "Electronics";
                    previousCategoryFilter = filterSelect.value;
                }
            } else {
                return; // cancel adding item
            }
        }
    }
    if (qty <= 0) {
        showToast("Quantity must be greater than zero.", "error");
        return;
    }
    if (qty > item.qty) {
        showToast(`Insufficient stock! Only ${item.qty} units available.`, "error");
        return;
    }

    const netLineVal = Math.max(0, (qty * price) - discount);
    
    // Calculate Tax share (tax rate is inclusive in selling price in Vyapar)
    // Formula for inclusive tax: GST_Amt = LineVal - (LineVal / (1 + (taxRate / 100)))
    const taxRate = item.taxRate || 0;
    const taxableValue = netLineVal / (1 + (taxRate / 100));
    const taxAmount = netLineVal - taxableValue;

    // Add to active session cart
    activeCart.push({
        itemId: item.id,
        name: item.name,
        category: item.category || "General",
        qty: qty,
        rate: price,
        discount: discount,
        taxRate: taxRate,
        taxAmount: taxAmount,
        taxableValue: taxableValue,
        lineTotal: netLineVal
    });

    showToast(`Added ${item.name} to cart.`, "success");
    
    // Reset item selector fields
    document.getElementById("bill-item-select-id").value = "";
    document.getElementById("bill-item-search").value = "";
    document.getElementById("bill-item-price").value = "";
    document.getElementById("bill-item-tax").value = "";
    document.getElementById("bill-item-qty").value = 1;
    document.getElementById("bill-item-discount").value = "0";
    document.getElementById("bill-line-total-preview").innerText = "₹0.00";

    renderInvoiceCart();
}

function deleteCartItem(index) {
    activeCart.splice(index, 1);
    renderInvoiceCart();
}

function clearInvoiceCart() {
    activeCart = [];
    renderInvoiceCart();
    showToast("Invoice cart cleared.", "info");
}

function renderInvoiceCart() {
    const tbody = document.getElementById("invoice-cart-tbody");
    tbody.innerHTML = "";

    // Header updates
    const invNum = document.getElementById("bill-number").value;
    const invDate = document.getElementById("bill-date").value;
    document.getElementById("inv-preview-num").innerText = invNum;
    document.getElementById("inv-preview-date").innerText = formatDateString(invDate);

    // Preview table updates
    const previewTbody = document.getElementById("inv-preview-tbody");
    previewTbody.innerHTML = "";

    let totalSubtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let grandTotal = 0;

    if (activeCart.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No items added to invoice yet.</td></tr>`;
        previewTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-24">No items added to invoice preview.</td></tr>`;
    } else {
        activeCart.forEach((item, index) => {
            totalSubtotal += item.taxableValue;
            totalDiscount += item.discount;
            totalTax += item.taxAmount;
            grandTotal += item.lineTotal;

            // Form Cart list row
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${item.name}</strong></td>
                <td>${item.qty}</td>
                <td>${formatCurrency(item.rate)}</td>
                <td>${formatCurrency(item.discount)}</td>
                <td>${item.taxRate}%</td>
                <td><strong>${formatCurrency(item.lineTotal)}</strong></td>
                <td>
                    <button class="btn-card-action btn-delete" onclick="deleteCartItem(${index})" title="Remove"><i class="fa-solid fa-times"></i></button>
                </td>
            `;
            tbody.appendChild(tr);

            // Print Preview table row
            const pTr = document.createElement("tr");
            pTr.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${item.name}</strong></td>
                <td class="text-right">${item.qty}</td>
                <td class="text-right">${formatCurrency(item.rate)}</td>
                <td class="text-right">${item.taxRate}%</td>
                <td class="text-right"><strong>${formatCurrency(item.lineTotal)}</strong></td>
            `;
            previewTbody.appendChild(pTr);
        });
    }

    // Set totals
    document.getElementById("bill-cart-grand-total").innerText = formatCurrency(grandTotal);
    document.getElementById("inv-preview-subtotal").innerText = formatCurrency(totalSubtotal);
    document.getElementById("inv-preview-discount").innerText = formatCurrency(totalDiscount);
    document.getElementById("inv-preview-tax").innerText = formatCurrency(totalTax);
    document.getElementById("inv-preview-grandtotal").innerText = formatCurrency(grandTotal);

    // Amount in words
    document.getElementById("inv-preview-words").innerText = numberToWords(Math.round(grandTotal)) + " Rupees Only";

    // Set company profile details in preview
    document.getElementById("inv-preview-company-name").innerText = state.company.name || "My Business";
    document.getElementById("inv-preview-company-address").innerText = state.company.address || "Address not configured";
    document.getElementById("inv-preview-company-gst").innerText = state.company.gstin || "N/A";
    document.getElementById("inv-preview-company-signature").innerText = state.company.name || "Authorized Signatory";

    updateInvoiceBankDisplay();
    updateBillCustomerDetails();
}

function updateInvoiceBankDisplay() {
    const bankId = document.getElementById("bill-bank-select").value;
    const bank = state.bankAccounts.find(b => b.id === bankId);

    if (bank) {
        document.getElementById("inv-back-bank-name").innerText = bank.name;
        document.getElementById("inv-back-acc-number").innerText = bank.accountNum;
        document.getElementById("inv-back-ifsc").innerText = bank.ifsc;
        document.getElementById("inv-back-branch").innerText = bank.branch || 'N/A';
        document.getElementById("inv-back-holder").innerText = bank.cardHolder;
        document.getElementById("inv-back-upi-id").innerText = bank.upi || 'N/A';
    }
}

// 3D Flip effect of Invoice Preview Card
let isInvoiceFlipped = false;
function flipInvoice3D() {
    const card = document.getElementById("invoiceCard");
    const label = document.getElementById("flip-side-label");
    
    isInvoiceFlipped = !isInvoiceFlipped;
    if (isInvoiceFlipped) {
        card.classList.add("flipped");
        label.innerText = "Invoice Details";
    } else {
        card.classList.remove("flipped");
        label.innerText = "Bank Details";
    }
}

function generateAndSaveInvoice() {
    const partyId = document.getElementById("bill-party-select").value;
    const customer = state.parties.find(p => p.id === partyId);
    const invoiceNum = document.getElementById("bill-number").value;
    const date = document.getElementById("bill-date").value;
    const bankId = document.getElementById("bill-bank-select").value;
    const bank = state.bankAccounts.find(b => b.id === bankId);

    if (activeCart.length === 0) {
        showToast("Cannot generate empty invoice! Add products first.", "error");
        return;
    }
    if (!partyId) {
        showToast("Please select a customer party.", "error");
        return;
    }
    if (!bankId) {
        showToast("Select a deposit ledger/bank account.", "error");
        return;
    }

    // Verify invoice number uniqueness
    const exists = state.invoices.some(inv => inv.invoiceNum === invoiceNum);
    if (exists) {
        showToast("Invoice number already exists. Modifying to unique sequential code.", "info");
        initInvoiceFormDefaults(); // regenerates valid sequence
        return;
    }

    // 1. Calculate final sums
    let subtotal = 0;
    let tax = 0;
    let grandTotal = 0;

    activeCart.forEach(item => {
        subtotal += item.taxableValue;
        tax += item.taxAmount;
        grandTotal += item.lineTotal;

        // 2. Subtract stock quantities
        const dbItem = state.items.find(i => i.id === item.itemId);
        if (dbItem) {
            dbItem.qty -= item.qty;
        }
    });

    // 3. Deposit money to the bank account balance
    if (bank) {
        bank.balance += grandTotal;
    }

    // 4. Create ledger transactions
    const newTxId = "tx-" + Date.now();
    state.transactions.push({
        id: newTxId,
        date: date,
        sourceAccount: bank ? bank.name : "Physical Vault",
        details: `Invoice Sale: ${invoiceNum} (${customer.name})`,
        flowType: "in",
        amount: grandTotal
    });

    // 5. Save invoice database record
    const invoiceRecord = {
        id: "inv-" + Date.now(),
        invoiceNum: invoiceNum,
        date: date,
        partyId: customer.id,
        partyName: customer.name,
        partyPhone: customer.phone,
        partyGstin: customer.gstin,
        items: activeCart.map(item => ({ name: item.name, qty: item.qty, rate: item.rate, lineTotal: item.lineTotal })),
        subtotal: subtotal,
        discount: activeCart.reduce((sum, item) => sum + item.discount, 0),
        tax: tax,
        grandTotal: grandTotal,
        bankId: bankId
    };

    state.invoices.push(invoiceRecord);
    saveData();
    showToast(`Invoice ${invoiceNum} saved & synchronized successfully!`, "success");

    // Clear cart and reset sequence
    activeCart = [];
    initInvoiceFormDefaults();
    renderBilling();
}

function viewSpecificInvoice(invoiceId) {
    const inv = state.invoices.find(i => i.id === invoiceId);
    if (inv) {
        switchView("billing");
        toggleBillingView("create");
        
        // Re-inject items into cart to show details
        activeCart = inv.items.map(item => {
            const dbItem = state.items.find(i => i.name === item.name);
            const category = dbItem ? dbItem.category : "Electronics";
            const taxRate = dbItem ? dbItem.taxRate : 18;
            const lineTotal = item.lineTotal;
            const taxableValue = lineTotal / (1 + (taxRate / 100));
            const taxAmount = lineTotal - taxableValue;

            return {
                itemId: dbItem ? dbItem.id : "mock",
                name: item.name,
                category: category,
                qty: item.qty,
                rate: item.rate,
                discount: 0,
                taxRate: taxRate,
                taxAmount: taxAmount,
                taxableValue: taxableValue,
                lineTotal: lineTotal
            };
        });

        // Set inputs
        document.getElementById("bill-number").value = inv.invoiceNum;
        document.getElementById("bill-date").value = inv.date;
        document.getElementById("bill-party-select").value = inv.partyId;
        document.getElementById("bill-bank-select").value = inv.bankId;

        renderInvoiceCart();
        showToast(`Viewing details for invoice ${inv.invoiceNum}`, "info");
    }
}

// --- VIEW: SAVED INVOICES LEDGER HISTORY ---
function renderInvoicesHistory() {
    const tbody = document.getElementById("invoices-history-list-tbody");
    tbody.innerHTML = "";

    // Sort by date descending
    const sorted = [...state.invoices].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No invoices found.</td></tr>`;
    } else {
        sorted.forEach(inv => {
            const bank = state.bankAccounts.find(b => b.id === inv.bankId);
            const totalQty = inv.items.reduce((sum, item) => sum + item.qty, 0);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${inv.invoiceNum}</strong></td>
                <td>${formatDateString(inv.date)}</td>
                <td>${inv.partyName}</td>
                <td>${totalQty} pcs</td>
                <td>${formatCurrency(inv.subtotal)}</td>
                <td>${formatCurrency(inv.tax)}</td>
                <td><strong>${formatCurrency(inv.grandTotal)}</strong></td>
                <td><span class="status-badge paid"><i class="fa-solid fa-building-columns"></i> ${bank ? bank.name : 'Safe'}</span></td>
                <td>
                    <button class="btn-card-action" onclick="viewSpecificInvoice('${inv.id}')" title="Recall Invoice"><i class="fa-solid fa-recycle"></i></button>
                    <button class="btn-card-action btn-delete" onclick="deleteInvoice('${inv.id}')" title="Delete record"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function filterInvoicesHistory() {
    const query = document.getElementById("invoice-history-search").value.toLowerCase();
    const rows = document.querySelectorAll("#invoices-history-list-tbody tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        if (text.includes(query)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

function deleteInvoice(invId) {
    if (confirm("Warning: Deleting this invoice does NOT revert stock subtraction or bank deposits. Remove invoice record?")) {
        state.invoices = state.invoices.filter(inv => inv.id !== invId);
        saveData();
        renderInvoicesHistory();
        showToast("Invoice deleted.", "info");
    }
}

// --- VIEW: CASH & BANK LEDGER ---
function renderBanking() {
    // 1. Populate Credit Card display values based on active selection
    const activeAcc = state.bankAccounts.find(acc => acc.id === activeBankIdForCard);

    if (activeAcc) {
        const cardDisplay = document.getElementById("debitCardDisplay");
        cardDisplay.className = `credit-card-3d tilt-target ${activeAcc.cardType || 'mastercard'}`;

        document.getElementById("active-card-num").innerText = activeAcc.accountNum;
        document.getElementById("active-card-holder").innerText = activeAcc.cardHolder.toUpperCase();
        document.getElementById("active-card-bal").innerText = formatCurrency(activeAcc.balance);

        const typeIcon = document.getElementById("active-card-type");
        if (activeAcc.cardType === 'visa') {
            typeIcon.innerHTML = `<i class="fa-brands fa-cc-visa"></i>`;
        } else if (activeAcc.cardType === 'rupay') {
            typeIcon.innerHTML = `<i class="fa-brands fa-cc-jcb"></i>`; // Rupay mockup icon fallback
        } else {
            typeIcon.innerHTML = `<i class="fa-brands fa-cc-mastercard"></i>`;
        }
    }

    // 2. Populate accounts list selector
    const selectorContainer = document.getElementById("bank-accounts-selector-list");
    selectorContainer.innerHTML = "";

    state.bankAccounts.forEach(acc => {
        const itemDiv = document.createElement("div");
        itemDiv.className = `bank-quick-item ${acc.id === activeBankIdForCard ? 'active' : ''}`;
        itemDiv.setAttribute("onclick", `selectBankForCard('${acc.id}')`);
        itemDiv.innerHTML = `
            <div class="bank-quick-info">
                <h4>${acc.name}</h4>
                <p>A/c: ${acc.accountNum}</p>
            </div>
            <div class="bank-quick-bal">${formatCurrency(acc.balance)}</div>
        `;
        selectorContainer.appendChild(itemDiv);
    });

    // 3. Populate Transactions list table
    const txTbody = document.getElementById("bank-transactions-tbody");
    txTbody.innerHTML = "";

    // Sort by date descending
    const sortedTx = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedTx.length === 0) {
        txTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No cash flow logs available.</td></tr>`;
    } else {
        sortedTx.forEach(tx => {
            const tr = document.createElement("tr");
            const isInFlow = tx.flowType === "in";
            
            tr.innerHTML = `
                <td><strong>REF-${tx.id.split('-')[1]}</strong></td>
                <td>${formatDateString(tx.date)}</td>
                <td><span class="status-badge paid"><i class="fa-solid fa-building-columns"></i> ${tx.sourceAccount}</span></td>
                <td>${tx.details}</td>
                <td>
                    <span class="status-badge ${isInFlow ? 'paid' : 'pending'}">
                        ${isInFlow ? '<i class="fa-solid fa-arrow-down-left"></i> IN' : '<i class="fa-solid fa-arrow-up-right"></i> OUT'}
                    </span>
                </td>
                <td><span class="${isInFlow ? 'deposit-indicator' : 'expense-indicator'}">${isInFlow ? '+' : '-'}${formatCurrency(tx.amount)}</span></td>
            `;
            txTbody.appendChild(tr);
        });
    }

    // Re-apply hover tilt trigger
    setup3DParallax();
}

function selectBankForCard(bankId) {
    activeBankIdForCard = bankId;
    renderBanking();
}

// --- VIEW: PERFORMANCE REPORTS ---
function renderReports() {
    const listContainer = document.getElementById("report-stock-categories-list");
    listContainer.innerHTML = "";

    // Group items by category and compute value share
    const categories = {};
    let grandStockVal = 0;

    state.items.forEach(item => {
        const val = item.qty * item.purchasePrice;
        grandStockVal += val;
        
        const cat = item.category || "Uncategorized";
        if (!categories[cat]) {
            categories[cat] = 0;
        }
        categories[cat] += val;
    });

    const colors = [
        "var(--gradient-red)",
        "var(--gradient-blue)",
        "var(--gradient-green)",
        "var(--gradient-purple)",
        "var(--gradient-gold)"
    ];

    let idx = 0;
    for (const [name, val] of Object.entries(categories)) {
        const percentage = grandStockVal > 0 ? (val / grandStockVal) * 100 : 0;
        const color = colors[idx % colors.length];

        const row = document.createElement("div");
        row.className = "report-bar-row";
        row.innerHTML = `
            <h4>
                <span>${name} (${Math.round(percentage)}%)</span>
                <span class="bar-total">${formatCurrency(val)}</span>
            </h4>
            <div class="report-bar-track">
                <div class="report-bar-fill" style="width: ${percentage}%; background: ${color};"></div>
            </div>
        `;
        listContainer.appendChild(row);
        idx++;
    }
}

// --- MODALS ACTIONS & CONTROLLERS ---

// Item stock modal
function openItemModal(itemId = null) {
    const modal = document.getElementById("itemModal");
    const title = document.getElementById("item-modal-title");
    const form = document.getElementById("itemForm");

    modal.classList.add("open");

    if (itemId && itemId !== "null") {
        title.innerHTML = `<i class="fa-solid fa-box-open text-red"></i> Edit Stock Item`;
        const item = state.items.find(i => i.id === itemId);
        if (item) {
            document.getElementById("item-form-id").value = item.id;
            document.getElementById("item-name").value = item.name;
            document.getElementById("item-code").value = item.code || "";
            document.getElementById("item-category").value = item.category || "";
            document.getElementById("item-qty").value = item.qty;
            document.getElementById("item-qty").disabled = true; // opening balance qty disabled in edit
            document.getElementById("item-purchase-price").value = item.purchasePrice;
            document.getElementById("item-sale-price").value = item.salePrice;
            document.getElementById("item-tax-rate").value = item.taxRate;
            document.getElementById("item-min-qty").value = item.minQty;
        }
    } else {
        title.innerHTML = `<i class="fa-solid fa-box-open text-red"></i> Add New Stock Item`;
        form.reset();
        document.getElementById("item-form-id").value = "";
        document.getElementById("item-qty").disabled = false;
    }
}

function closeItemModal() {
    document.getElementById("itemModal").classList.remove("open");
}

function saveStockItem(e) {
    e.preventDefault();
    const id = document.getElementById("item-form-id").value;
    const name = document.getElementById("item-name").value;
    const code = document.getElementById("item-code").value;
    const category = document.getElementById("item-category").value;
    const qty = parseInt(document.getElementById("item-qty").value) || 0;
    const purchasePrice = parseFloat(document.getElementById("item-purchase-price").value) || 0;
    const salePrice = parseFloat(document.getElementById("item-sale-price").value) || 0;
    const taxRate = parseInt(document.getElementById("item-tax-rate").value) || 0;
    const minQty = parseInt(document.getElementById("item-min-qty").value) || 0;

    if (id) {
        // Edit existing
        const item = state.items.find(i => i.id === id);
        if (item) {
            item.name = name;
            item.code = code;
            item.category = category;
            item.purchasePrice = purchasePrice;
            item.salePrice = salePrice;
            item.taxRate = taxRate;
            item.minQty = minQty;
            showToast(`Product ${name} updated successfully!`, "success");
        }
    } else {
        // Add new
        const newId = "item-" + Date.now();
        state.items.push({
            id: newId, name, code, category, qty, purchasePrice, salePrice, taxRate, minQty
        });
        showToast(`Stock item ${name} registered.`, "success");
    }

    saveData();
    closeItemModal();
    renderAll();
}

function deleteItem(itemId) {
    if (confirm("Are you sure you want to remove this item from the stock register?")) {
        const item = state.items.find(i => i.id === itemId);
        state.items = state.items.filter(i => i.id !== itemId);
        saveData();
        renderAll();
        if (item) showToast(`Product ${item.name} deleted.`, "info");
    }
}

// Party modal
function openPartyModal() {
    document.getElementById("partyModal").classList.add("open");
}

function closePartyModal() {
    document.getElementById("partyModal").classList.remove("open");
}

function saveParty(e) {
    e.preventDefault();
    const name = document.getElementById("party-name").value;
    const phone = document.getElementById("party-phone").value;
    const gstin = document.getElementById("party-gstin").value;
    const balanceType = document.getElementById("party-balance-type").value;
    const balance = parseFloat(document.getElementById("party-balance").value) || 0;

    const newId = "party-" + Date.now();
    state.parties.push({
        id: newId, name, phone, gstin, balanceType, balance
    });

    saveData();
    closePartyModal();
    showToast(`Business contact ${name} saved.`, "success");
    
    // Refresh views & form selects
    renderAll();
    if (currentView === 'billing') {
        renderBilling();
    }
}

function deleteParty(partyId) {
    if (confirm("Delete this party/customer ledger?")) {
        state.parties = state.parties.filter(p => p.id !== partyId);
        saveData();
        renderAll();
        showToast("Party ledger deleted.", "info");
    }
}

// Bank account modal
function openBankModal() {
    document.getElementById("bankModal").classList.add("open");
}

function closeBankModal() {
    document.getElementById("bankModal").classList.remove("open");
}

function saveBankAccount(e) {
    e.preventDefault();
    const name = document.getElementById("bank-name").value;
    const accountNum = document.getElementById("bank-account-num").value;
    const ifsc = document.getElementById("bank-ifsc").value;
    const branch = document.getElementById("bank-branch").value;
    const upi = document.getElementById("bank-upi").value;
    const balance = parseFloat(document.getElementById("bank-opening-bal").value) || 0;
    const cardHolder = document.getElementById("bank-holder-name").value;
    const cardType = document.getElementById("bank-card-type").value;

    const newId = "bank-" + Date.now();
    state.bankAccounts.push({
        id: newId, name, accountNum, ifsc, branch, upi, balance, cardHolder, cardType
    });

    // Create opening balance transaction log
    if (balance > 0) {
        state.transactions.push({
            id: "tx-" + Date.now(),
            date: new Date().toISOString().split('T')[0],
            sourceAccount: name,
            details: "Opening Bank Balance Injection",
            flowType: "in",
            amount: balance
        });
    }

    saveData();
    closeBankModal();
    showToast(`Bank account ${name} linked successfully.`, "success");

    activeBankIdForCard = newId;
    renderAll();
}

// Company modal
function openCompanyModal() {
    document.getElementById("companyModal").classList.add("open");
    document.getElementById("company-name").value = state.company.name;
    document.getElementById("company-address").value = state.company.address;
    document.getElementById("company-gstin").value = state.company.gstin;
    document.getElementById("company-phone").value = state.company.phone;
}

function closeCompanyModal() {
    document.getElementById("companyModal").classList.remove("remove");
    document.getElementById("companyModal").classList.remove("open");
}

function saveCompanyProfile(e) {
    e.preventDefault();
    state.company.name = document.getElementById("company-name").value;
    state.company.address = document.getElementById("company-address").value;
    state.company.gstin = document.getElementById("company-gstin").value;
    state.company.phone = document.getElementById("company-phone").value;

    saveData();
    closeCompanyModal();
    showToast("Business profile updated.", "success");
    renderAll();
}

// Shortcuts
function quickSale() {
    switchView('billing');
    toggleBillingView('create');
}

// --- 3D Mouse Parallax Tilt Engine ---
let flatModeEnabled = false;

function toggle3DDepth() {
    flatModeEnabled = !flatModeEnabled;
    const body = document.body;
    
    if (flatModeEnabled) {
        body.classList.add("flat-mode");
        showToast("3D perspective depth disabled.", "info");
    } else {
        body.classList.remove("flat-mode");
        showToast("3D perspective depth activated. Move mouse over cards!", "success");
    }
}

function setup3DParallax() {
    if (flatModeEnabled) return;

    const cards = document.querySelectorAll(".tilt-target");
    cards.forEach(card => {
        // Remove old listeners to avoid multiple tracking threads
        card.onmousemove = null;
        card.onmouseleave = null;

        card.onmousemove = (e) => {
            if (flatModeEnabled) return;

            const rect = card.getBoundingClientRect();
            // Mouse coordinates relative to card
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Compute percentage offset from center (-0.5 to 0.5)
            const xc = ((x / rect.width) - 0.5);
            const yc = ((y / rect.height) - 0.5);

            // Compute rotations (scale values to adjust tilt limit)
            const rotX = -yc * 24; // tilt limit X axis
            const rotY = xc * 24;  // tilt limit Y axis

            // Apply card inner transform
            const inner = card.querySelector(".card-inner-3d") || card.querySelector(".stock-card-inner") || card.querySelector(".modal-card") || card;
            
            if (inner) {
                inner.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
                
                // Move reflection shine glow relative to mouse
                const glow = inner.querySelector(".card-glow") || inner.querySelector(".card-glow-reflection");
                if (glow) {
                    glow.style.transform = `translate3d(${(xc * 40)}px, ${(yc * 40)}px, 0)`;
                }
            }
        };

        card.onmouseleave = () => {
            const inner = card.querySelector(".card-inner-3d") || card.querySelector(".stock-card-inner") || card.querySelector(".modal-card") || card;
            if (inner) {
                inner.style.transform = "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
                const glow = inner.querySelector(".card-glow") || inner.querySelector(".card-glow-reflection");
                if (glow) {
                    glow.style.transform = "translate3d(0, 0, 0)";
                }
            }
        };
    });
}

// --- Realtime Clock ---
function setupRealtimeClock() {
    const timeDom = document.getElementById("current-time");
    function updateClock() {
        const d = new Date();
        timeDom.innerText = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 1000);
}

// --- Global Search Utility (Ctrl+F shortcut selector) ---
function setupGlobalSearch() {
    const search = document.getElementById("global-search");
    
    // Listen for global key combinations
    window.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            search.focus();
            showToast("Global search activated.", "info");
        }
    });

    search.addEventListener("keyup", () => {
        const q = search.value.toLowerCase();
        
        if (q.trim() === "") return;

        // Auto routing helper based on search query target
        if (q.includes("inv") || q.includes("bill") || q.includes("sale")) {
            switchView("billing");
            toggleBillingView("history");
            document.getElementById("invoice-history-search").value = q;
            filterInvoicesHistory();
        } else if (q.includes("item") || q.includes("stock") || q.includes("sku") || q.includes("pc")) {
            switchView("items");
            document.getElementById("stock-search-input").value = q;
            filterStockItems();
        } else if (q.includes("bank") || q.includes("hdfc") || q.includes("cash") || q.includes("upi")) {
            switchView("banking");
        } else if (q.includes("party") || q.includes("cust") || q.includes("ramesh") || q.includes("vikas")) {
            switchView("parties");
        }
    });
}

// --- UI Toast Notifications Helper ---
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = '<i class="fa-solid fa-circle-check"></i>';
    if (type === "error") icon = '<i class="fa-solid fa-circle-exclamation"></i>';
    if (type === "info") icon = '<i class="fa-solid fa-circle-info"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    // Dismiss animations after 3 seconds
    setTimeout(() => {
        toast.classList.add("toast-exit");
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 3200);
}

// --- Helpers: Currency Formatting ---
function formatCurrency(num) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(num);
}

// Helpers: Date formatting
function formatDateString(dateStr) {
    if (!dateStr) return "N/A";
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-IN', options);
}

// Helpers: Convert integers to English words (Indian system format)
function numberToWords(num) {
    if (num === 0) return 'zero';

    const a = [
        '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
        'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
        'eighteen', 'nineteen'
    ];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    function g(n) {
        if (n < 20) return a[n];
        const digit = n % 10;
        return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
    }

    function h(n) {
        if (n < 100) return g(n);
        const rem = n % 100;
        return a[Math.floor(n / 100)] + ' hundred' + (rem ? ' and ' + g(rem) : '');
    }

    let wordStr = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const remaining = num;

    if (crore) wordStr += h(crore) + ' crore ';
    if (lakh) wordStr += h(lakh) + ' lakh ';
    if (thousand) wordStr += h(thousand) + ' thousand ';
    if (remaining) wordStr += h(remaining);

    return wordStr.trim();
}

// --- Searchable Autocomplete Suggestions for Stock Items ---
function buildAutocompleteSuggestions() {
    const list = document.getElementById("item-suggestions-list");
    if (!list) return;

    list.innerHTML = "";
    if (state.items.length === 0) {
        list.innerHTML = `<div class="suggestion-item text-muted">No items in stock. Add items first!</div>`;
        return;
    }

    const filterVal = document.getElementById("bill-item-category-filter")?.value || "all";
    const filtered = state.items.filter(item => {
        if (filterVal === "all") return true;
        return item.category === filterVal;
    });

    if (filtered.length === 0) {
        list.innerHTML = `<div class="suggestion-item text-muted no-matches-found">No items found in this category</div>`;
        return;
    }

    filtered.forEach(item => {
        const div = document.createElement("div");
        const isLow = item.qty <= item.minQty;
        div.className = `suggestion-item ${isLow ? 'low-stock' : ''}`;
        div.setAttribute("data-item-id", item.id);
        div.setAttribute("onclick", `selectSuggestionItem('${item.id}')`);
        
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <span class="suggestion-sku">${item.code || 'SKU'}</span>
            </div>
            <span class="suggestion-qty">${item.qty} left</span>
        `;
        list.appendChild(div);
    });
}

function showItemSuggestions() {
    const list = document.getElementById("item-suggestions-list");
    if (list) {
        buildAutocompleteSuggestions();
        list.classList.remove("d-none");
    }
}

let hideTimeout = null;
function hideItemSuggestionsDelayed() {
    // A small delay is required to let the click handler of the suggestion fire
    hideTimeout = setTimeout(() => {
        const list = document.getElementById("item-suggestions-list");
        if (list) list.classList.add("d-none");
    }, 250);
}

function filterItemSuggestions() {
    const query = document.getElementById("bill-item-search").value.toLowerCase();
    const list = document.getElementById("item-suggestions-list");
    if (!list) return;

    list.classList.remove("d-none");
    const items = list.querySelectorAll(".suggestion-item");
    let matchCount = 0;

    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        if (text.includes(query)) {
            item.style.display = "flex";
            matchCount++;
        } else {
            item.style.display = "none";
        }
    });

    // Handle no matches case
    const noMatchDiv = list.querySelector(".no-matches-found");
    if (matchCount === 0) {
        if (!noMatchDiv) {
            const div = document.createElement("div");
            div.className = "suggestion-item text-muted no-matches-found";
            div.innerText = "No matching stock items found";
            list.appendChild(div);
        } else {
            noMatchDiv.style.display = "block";
        }
    } else {
        if (noMatchDiv) noMatchDiv.remove();
    }
}

function selectSuggestionItem(itemId) {
    // Clear any pending blur timeout so it doesn't fire after selection
    if (hideTimeout) clearTimeout(hideTimeout);

    const item = state.items.find(i => i.id === itemId);
    const hiddenInput = document.getElementById("bill-item-select-id");
    const searchInput = document.getElementById("bill-item-search");
    const list = document.getElementById("item-suggestions-list");

    if (item && hiddenInput && searchInput) {
        hiddenInput.value = item.id;
        searchInput.value = item.name;
        if (list) list.classList.add("d-none");
        
        // Auto-fill form details
        autoFillItemDetails();
        showToast(`Selected: ${item.name}`, "info");
    }
}

function toggleItemSuggestions(event) {
    event.stopPropagation();
    const list = document.getElementById("item-suggestions-list");
    if (!list) return;

    if (list.classList.contains("d-none")) {
        showItemSuggestions();
        document.getElementById("bill-item-search").focus();
    } else {
        list.classList.add("d-none");
    }
}

// Close suggestion list if clicked anywhere else on the document
document.addEventListener("click", (e) => {
    const wrapper = document.querySelector(".autocomplete-wrapper");
    if (wrapper && !wrapper.contains(e.target)) {
        const list = document.getElementById("item-suggestions-list");
        if (list) list.classList.add("d-none");
    }
});

function updateNativeStatusBar(isLight) {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar) {
        try {
            const { StatusBar } = window.Capacitor.Plugins;
            StatusBar.setStyle({ style: isLight ? 'LIGHT' : 'DARK' });
            StatusBar.setBackgroundColor({ color: isLight ? '#f0f2f6' : '#07080d' });
        } catch (e) {
            console.warn("Capacitor StatusBar call failed", e);
        }
    }
}

// --- Theme Switcher Logic (Light & Dark Theme) ---
function loadTheme() {
    const savedTheme = localStorage.getItem('vertex_theme') || 'dark';
    const handleIcon = document.getElementById("theme-handle-icon");

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (handleIcon) {
            handleIcon.innerHTML = `<i class="fa-solid fa-sun"></i>`;
        }
        updateNativeStatusBar(true);
    } else {
        document.body.classList.remove('light-theme');
        if (handleIcon) {
            handleIcon.innerHTML = `<i class="fa-solid fa-moon"></i>`;
        }
        updateNativeStatusBar(false);
    }
}

function toggleTheme() {
    const isLight = document.body.classList.contains('light-theme');
    if (isLight) {
        localStorage.setItem('vertex_theme', 'dark');
        showToast("Switched to Premium Dark theme", "info");
    } else {
        localStorage.setItem('vertex_theme', 'light');
        showToast("Switched to Premium Light theme", "success");
    }
    loadTheme();
}

// --- POS Camera Barcode Scanner & Sharing Extension ---
let cameraStream = null;

async function openScannerModal() {
    const modal = document.getElementById("scanner-modal");
    if (!modal) return;
    modal.classList.remove("d-none");

    const video = document.getElementById("scanner-video");
    const mock = document.getElementById("camera-mock-overlay");

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (video) {
            video.srcObject = cameraStream;
            video.classList.remove("d-none");
        }
        if (mock) mock.classList.add("d-none");
    } catch (err) {
        console.warn("Camera hardware access denied or unavailable. Simulator fallback active.");
        if (video) video.classList.add("d-none");
        if (mock) {
            mock.classList.remove("d-none");
            mock.innerHTML = `
                <i class="fa-solid fa-video-slash" style="font-size: 28px; color: var(--accent-red); margin-bottom: 8px;"></i>
                <span class="text-muted">Webcam unavailable. Use simulator dropdown below.</span>
            `;
        }
    }
}

function closeScannerModal() {
    const modal = document.getElementById("scanner-modal");
    if (modal) modal.classList.add("d-none");

    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

function playScanBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = "sine";
        oscillator.frequency.value = 1400; // POS scan pitch
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, 110);
    } catch (e) {
        console.warn("AudioContext beep failed:", e);
    }
}

function simulateBarcodeScan() {
    const selector = document.getElementById("manual-barcode-select");
    const codeValue = selector.value;

    if (!codeValue) {
        showToast("Please select a simulated item code to scan.", "error");
        return;
    }

    // Try finding the item in stock
    const item = state.items.find(i => i.code === codeValue);
    if (!item) {
        showToast("Product code not found in inventory.", "error");
        return;
    }

    playScanBeep();

    const hiddenSelect = document.getElementById("bill-item-select-id");
    const searchInput = document.getElementById("bill-item-search");

    if (hiddenSelect && searchInput) {
        hiddenSelect.value = item.id;
        searchInput.value = item.name;
        
        // Auto-fill price details
        autoFillItemDetails();
        showToast(`Scanned: ${item.name} successfully.`, "success");
    }

    closeScannerModal();
}

function checkAndApplyPrintLayout() {
    const hasFood = activeCart.some(item => {
        const cat = (item.category || "").toLowerCase();
        return cat === "food" || cat === "fruits & vegetables";
    });
    if (hasFood) {
        document.body.classList.add("printing-thermal");
    } else {
        document.body.classList.remove("printing-thermal");
    }
}

window.addEventListener("beforeprint", () => {
    checkAndApplyPrintLayout();
});

function printInvoice() {
    if (activeCart.length === 0) {
        showToast("Invoice cart is empty. Add items first.", "error");
        return;
    }
    checkAndApplyPrintLayout();
    window.print();
}

function shareInvoiceWhatsApp() {
    if (activeCart.length === 0) {
        showToast("Invoice cart is empty. Add items first.", "error");
        return;
    }

    const businessName = state.companyName || "Vertex Ledger Merchant";
    const totalAmount = document.getElementById("inv-preview-total").innerText || "₹0.00";
    const billNo = document.getElementById("inv-preview-num").innerText || "INV-NEW";

    const phone = prompt("Enter customer WhatsApp Phone Number (with country code, e.g. 919876543210):");
    if (phone === null) return; // User cancelled

    if (!phone.trim()) {
        showToast("Please enter a valid phone number.", "error");
        return;
    }

    // Compile message items summary
    let itemsSummary = "";
    activeCart.forEach((item, idx) => {
        itemsSummary += `${idx + 1}. ${item.name} x${item.qty} = ${formatCurrency(item.lineTotal)}\n`;
    });

    const message = `*INVOICE RECEIVED* 🧾\n\n` +
                    `*From:* ${businessName}\n` +
                    `*Invoice No:* ${billNo}\n\n` +
                    `*Items Summary:*\n${itemsSummary}\n` +
                    `*Total Balance Due:* ${totalAmount}\n\n` +
                    `Thank you for shopping with us! Please confirm payments on our business UPI ID.`;

    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    showToast("Opening WhatsApp Web sharing window...", "success");
}


