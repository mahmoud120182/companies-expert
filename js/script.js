// DOM Elements
const homePage = document.getElementById('homePage');
const companyPage = document.getElementById('companyPage');
const searchResultsPage = document.getElementById('searchResultsPage');
const companiesGrid = document.getElementById('companiesGrid');
const companyHeader = document.getElementById('companyHeader');
const productsContainer = document.getElementById('productsContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const homeBtn = document.getElementById('homeBtn');
const searchQuerySpan = document.getElementById('searchQuerySpan');
const searchResultsContent = document.getElementById('searchResultsContent');
const pageTitle = document.getElementById('pageTitle');

// Chart variables
let quarterlyPurchasesChart, quarterlyPatientsChart;

// Track current page state
let currentPage = 'home';

// Check if running locally
const isLocalFile = window.location.protocol === 'file:';

// Initialize the page
function init() {
    renderCompanies();
    setupEventListeners();
    
    // Check URL parameters on initial load if not local file
    if (!isLocalFile) {
        const urlParams = new URLSearchParams(window.location.search);
        const companyId = urlParams.get('company');
        const searchQuery = urlParams.get('search');

        if (companyId) {
            renderCompany(parseInt(companyId));
        } else if (searchQuery) {
            searchInput.value = searchQuery;
            performSearch(searchQuery);
        }
    }
}

// Render all companies
function renderCompanies() {
    companiesGrid.innerHTML = '';
    companies.forEach(company => {
        const companyCard = document.createElement('div');
        companyCard.className = 'company-card';
        companyCard.innerHTML = `
            <img src="${company.logo}" alt="${company.name}" class="company-logo">
            <div class="company-info">
                <h3 class="company-name">${company.name}</h3>
                <p class="company-products-count">${company.products.length} products</p>
                <a href="#" class="view-btn" data-id="${company.id}">View Details</a>
            </div>
        `;
        companiesGrid.appendChild(companyCard);
    });
}

// Render a single company
function renderCompany(companyId) {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;

    // Update page state
    currentPage = 'company';
    if (!isLocalFile) {
        history.pushState({ page: 'company', companyId }, '', `?company=${companyId}`);
    }

    // Update page title
    pageTitle.textContent = company.name;

    // Update company header
    companyHeader.innerHTML = `
        <img src="${company.logo}" alt="${company.name}" class="company-header-logo">
        <div class="company-header-info">
            <h1 class="company-header-name">${company.name}</h1>
            <p class="company-header-total">2024 Total: $${company.total2024.toLocaleString()} (${company.totalPatients2024.toLocaleString()} patients)</p>
            <p class="company-header-desc">${company.description}</p>
        </div>
    `;

    // Sort products by total value (descending)
    const sortedProducts = [...company.products].sort((a, b) => {
        const totalA = a.q1 + a.q2 + a.q3 + a.q4;
        const totalB = b.q1 + b.q2 + b.q3 + b.q4;
        return totalB - totalA;
    });

    // Render products
    productsContainer.innerHTML = '';
    sortedProducts.forEach(product => {
        const totalPurchases = product.q1 + product.q2 + product.q3 + product.q4;
        const totalPatients = product.patients_q1 + product.patients_q2 + product.patients_q3 + product.patients_q4;
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-header">
                <img src="${product.image}" alt="${product.name}" class="product-img">
                <h3 class="product-name">${product.name}</h3>
            </div>
            <div class="data-grid">
                <div class="data-section">
                    <h4 class="data-title">Purchases ($)</h4>
                    <div class="quarters-grid">
                        <div class="quarter-item">
                            <div class="quarter-label">Q1</div>
                            <div class="quarter-value">$${product.q1.toLocaleString()}</div>
                        </div>
                        <div class="quarter-item">
                            <div class="quarter-label">Q2</div>
                            <div class="quarter-value">$${product.q2.toLocaleString()}</div>
                        </div>
                        <div class="quarter-item">
                            <div class="quarter-label">Q3</div>
                            <div class="quarter-value">$${product.q3.toLocaleString()}</div>
                        </div>
                        <div class="quarter-item">
                            <div class="quarter-label">Q4</div>
                            <div class="quarter-value">$${product.q4.toLocaleString()}</div>
                        </div>
                    </div>
                    <div class="data-total">
                        <span>Total:</span>
                        <span>$${totalPurchases.toLocaleString()}</span>
                    </div>
                </div>
                <div class="data-section">
                    <h4 class="data-title">Patients</h4>
                    <div class="quarters-grid">
                        <div class="quarter-item">
                            <div class="quarter-label">Q1</div>
                            <div class="quarter-value">${product.patients_q1.toLocaleString()}</div>
                        </div>
                        <div class="quarter-item">
                            <div class="quarter-label">Q2</div>
                            <div class="quarter-value">${product.patients_q2.toLocaleString()}</div>
                        </div>
                        <div class="quarter-item">
                            <div class="quarter-label">Q3</div>
                            <div class="quarter-value">${product.patients_q3.toLocaleString()}</div>
                        </div>
                        <div class="quarter-item">
                            <div class="quarter-label">Q4</div>
                            <div class="quarter-value">${product.patients_q4.toLocaleString()}</div>
                        </div>
                    </div>
                    <div class="data-total">
                        <span>Total:</span>
                        <span>${totalPatients.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });

    // Render charts
    renderCharts(company);

    // Show company page
    homePage.style.display = 'none';
    searchResultsPage.style.display = 'none';
    companyPage.style.display = 'block';
}

// Render charts for a company
function renderCharts(company) {
    const quarterlyPurchasesCtx = document.getElementById('quarterlyPurchasesChart').getContext('2d');
    const quarterlyPatientsCtx = document.getElementById('quarterlyPatientsChart').getContext('2d');
    
    // Destroy previous charts if they exist
    if (quarterlyPurchasesChart) quarterlyPurchasesChart.destroy();
    if (quarterlyPatientsChart) quarterlyPatientsChart.destroy();

    // Calculate quarterly totals for purchases and patients
    const quarterlyData = company.products.reduce((acc, product) => {
        acc.purchases.q1 += product.q1;
        acc.purchases.q2 += product.q2;
        acc.purchases.q3 += product.q3;
        acc.purchases.q4 += product.q4;
        acc.patients.q1 += product.patients_q1;
        acc.patients.q2 += product.patients_q2;
        acc.patients.q3 += product.patients_q3;
        acc.patients.q4 += product.patients_q4;
        return acc;
    }, { 
        purchases: { q1: 0, q2: 0, q3: 0, q4: 0 },
        patients: { q1: 0, q2: 0, q3: 0, q4: 0 }
    });

    // Purchases Chart
    quarterlyPurchasesChart = new Chart(quarterlyPurchasesCtx, {
        type: 'bar',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Purchases ($)',
                data: [
                    quarterlyData.purchases.q1, 
                    quarterlyData.purchases.q2, 
                    quarterlyData.purchases.q3, 
                    quarterlyData.purchases.q4
                ],
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.raw.toLocaleString();
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'customDataLabels',
            afterDatasetsDraw(chart, args, options) {
                const {ctx, data, chartArea: {top, bottom, left, right, width, height}, scales: {x, y}} = chart;
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillStyle = '#666';
                
                data.datasets.forEach(dataset => {
                    dataset.data.forEach((value, index) => {
                        ctx.fillText('$' + value.toLocaleString(), x.getPixelForValue(index), y.getPixelForValue(value) - 5);
                    });
                });
            }
        }]
    });

    // Patients Chart
    quarterlyPatientsChart = new Chart(quarterlyPatientsCtx, {
        type: 'bar',
        data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Patients',
                data: [
                    quarterlyData.patients.q1, 
                    quarterlyData.patients.q2, 
                    quarterlyData.patients.q3, 
                    quarterlyData.patients.q4
                ],
                backgroundColor: 'rgba(46, 204, 113, 0.7)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.raw.toLocaleString() + ' patients';
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'customDataLabels',
            afterDatasetsDraw(chart, args, options) {
                const {ctx, data, chartArea: {top, bottom, left, right, width, height}, scales: {x, y}} = chart;
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillStyle = '#666';
                
                data.datasets.forEach(dataset => {
                    dataset.data.forEach((value, index) => {
                        ctx.fillText(value.toLocaleString(), x.getPixelForValue(index), y.getPixelForValue(value) - 5);
                    });
                });
            }
        }]
    });
}

// Perform search
function performSearch(query) {
    if (!query.trim()) {
        showHomePage();
        return;
    }

    // Update page state
    currentPage = 'search';
    if (!isLocalFile) {
        history.pushState({ page: 'search', query }, '', `?search=${encodeURIComponent(query)}`);
    }

    const lowerQuery = query.toLowerCase();
    
    // Search companies
    const matchingCompanies = companies.filter(company => 
        company.name.toLowerCase().includes(lowerQuery)
    );
    
    // Search products
    const matchingProducts = [];
    companies.forEach(company => {
        company.products.forEach(product => {
            if (product.name.toLowerCase().includes(lowerQuery)) {
                matchingProducts.push({
                    ...product,
                    companyName: company.name,
                    companyId: company.id
                });
            }
        });
    });

    // Sort products by total value
    matchingProducts.sort((a, b) => {
        const totalA = a.q1 + a.q2 + a.q3 + a.q4;
        const totalB = b.q1 + b.q2 + b.q3 + b.q4;
        return totalB - totalA;
    });

    // Display results
    searchQuerySpan.textContent = query;
    searchResultsContent.innerHTML = '';

    if (matchingCompanies.length === 0 && matchingProducts.length === 0) {
        searchResultsContent.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 2rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No results found</h3>
            </div>
        `;
    } else {
        if (matchingCompanies.length > 0) {
            const companiesSection = document.createElement('div');
            companiesSection.innerHTML = `
                <h3 style="margin-bottom: 0.5rem;">Companies (${matchingCompanies.length})</h3>
                <div class="companies-grid" style="margin-bottom: 1rem;"></div>
            `;
            
            const companiesGrid = companiesSection.querySelector('.companies-grid');
            matchingCompanies.forEach(company => {
                const companyCard = document.createElement('div');
                companyCard.className = 'company-card';
                companyCard.innerHTML = `
                    <img src="${company.logo}" alt="${company.name}" class="company-logo">
                    <div class="company-info">
                        <h3 class="company-name">${company.name}</h3>
                        <p class="company-products-count">${company.products.length} products</p>
                        <a href="#" class="view-btn" data-id="${company.id}">View</a>
                    </div>
                `;
                companiesGrid.appendChild(companyCard);
            });
            
            searchResultsContent.appendChild(companiesSection);
        }

        if (matchingProducts.length > 0) {
            const productsSection = document.createElement('div');
            productsSection.innerHTML = `
                <h3 style="margin-bottom: 0.5rem;">Products (${matchingProducts.length})</h3>
                <div class="products-container"></div>
            `;
            
            const productsContainer = productsSection.querySelector('.products-container');
            matchingProducts.forEach(product => {
                const totalPurchases = product.q1 + product.q2 + product.q3 + product.q4;
                const totalPatients = product.patients_q1 + product.patients_q2 + product.patients_q3 + product.patients_q4;
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <div class="product-header">
                        <img src="${product.image}" alt="${product.name}" class="product-img">
                        <div>
                            <h3 class="product-name">${product.name}</h3>
                            <p style="font-size: 0.8rem; color: #666;">${product.companyName}</p>
                        </div>
                    </div>
                    <div class="data-total">
                        <span>Total Purchases:</span>
                        <span>$${totalPurchases.toLocaleString()}</span>
                    </div>
                    <div class="data-total">
                        <span>Total Patients:</span>
                        <span>${totalPatients.toLocaleString()}</span>
                    </div>
                    <a href="#" class="view-btn" style="display: block; margin-top: 0.5rem; text-align: center;" 
                       data-id="${product.companyId}">View Company</a>
                `;
                productsContainer.appendChild(productCard);
            });
            
            searchResultsContent.appendChild(productsSection);
        }
    }

    // Show results page
    homePage.style.display = 'none';
    companyPage.style.display = 'none';
    searchResultsPage.style.display = 'block';
}

// Show home page
function showHomePage() {
    // Reset page title
    pageTitle.textContent = 'PharmaPurchases';
    
    homePage.style.display = 'block';
    companyPage.style.display = 'none';
    searchResultsPage.style.display = 'none';
    searchInput.value = '';
    
    currentPage = 'home';
    if (!isLocalFile) {
        history.pushState({ page: 'home' }, '', '/');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Company card clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-btn')) {
            e.preventDefault();
            const companyId = parseInt(e.target.getAttribute('data-id'));
            renderCompany(companyId);
        }
    });

    // Home button
    homeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showHomePage();
    });

    // Real-time search
    searchInput.addEventListener('input', function() {
        performSearch(searchInput.value.trim());
    });

    // Handle browser back/forward buttons (only if not local file)
    if (!isLocalFile) {
        window.addEventListener('popstate', function(event) {
            if (event.state) {
                if (event.state.page === 'home') {
                    showHomePage();
                } else if (event.state.page === 'company') {
                    renderCompany(event.state.companyId);
                } else if (event.state.page === 'search') {
                    searchInput.value = event.state.query;
                    performSearch(event.state.query);
                }
            } else {
                showHomePage();
            }
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);
