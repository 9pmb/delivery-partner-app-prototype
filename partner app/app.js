// STORAGE KEYS
const STORAGE_KEY_BALANCE = 'partner_app_balance';
const STORAGE_KEY_TODAY = 'partner_app_today';

// MOCK DATA FOR STATS
const STATS = {
    today: 0,
    yesterday: 850,
    week: 12500
};

// LOAD STATE
let currentBalance = parseInt(localStorage.getItem(STORAGE_KEY_BALANCE)) || 850;
let todayEarnings = parseInt(localStorage.getItem(STORAGE_KEY_TODAY)) || 0;

const state = {
    isOnline: false,
    earnings: currentBalance,
    today: todayEarnings,
    flowStep: 0
};

const STEPS = [
    { title: "Go to Burger King", addr: "Sector 18, Noida", btn: "SWIPE TO ARRIVE" },
    { title: "Pick up Order", addr: "Order #1023 • 2 Items", btn: "SWIPE TO CONFIRM" },
    { title: "Go to Customer", addr: "Tower B, Supertech Cape Town", btn: "SWIPE TO ARRIVE" },
    { title: "Deliver Order", addr: "Leave at door", btn: "SWIPE TO DELIVER" }
];

// DOM
const loginScreen = document.getElementById('login-screen');
const homeScreen = document.getElementById('home-screen');
const orderOverlay = document.getElementById('order-overlay');
const walletScreen = document.getElementById('wallet-screen');
const statusToggle = document.getElementById('status-toggle');
const viewOffline = document.getElementById('view-offline');
const viewOnline = document.getElementById('view-online');
const pulseRing = document.getElementById('pulse-ring');
const orderCard = document.getElementById('order-card-trigger');

// UI UPDATERS
function updateEarningsUI() {
    document.getElementById('dash-earnings').textContent = state.earnings;
    document.getElementById('wallet-balance').textContent = state.earnings;
    document.getElementById('stat-today').textContent = state.today;

    // Static mocks for now
    document.getElementById('stat-yesterday').textContent = STATS.yesterday;
    document.getElementById('stat-week').textContent = STATS.week + state.today;

    // Saves
    localStorage.setItem(STORAGE_KEY_BALANCE, state.earnings);
    localStorage.setItem(STORAGE_KEY_TODAY, state.today);
}

// HANDLERS
document.getElementById('login-btn').addEventListener('click', () => {
    loginScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    updateEarningsUI();
});


statusToggle.addEventListener('click', () => {
    state.isOnline = !state.isOnline;

    if (state.isOnline) {
        statusToggle.classList.add('online');
        pulseRing.classList.add('active');
        viewOffline.classList.add('hidden');
        setTimeout(() => {
            viewOnline.classList.remove('hidden');
            viewOnline.classList.add('slide-up');
        }, 800);
    } else {
        statusToggle.classList.remove('online');
        pulseRing.classList.remove('active');
        viewOnline.classList.add('hidden');
        viewOffline.classList.remove('hidden');
    }
});

// Wallet Modals
document.getElementById('open-wallet-btn').addEventListener('click', () => {
    walletScreen.classList.remove('hidden');
    walletScreen.classList.add('slide-up');
    updateEarningsUI();
});

document.getElementById('close-wallet-btn').addEventListener('click', () => {
    walletScreen.classList.add('hidden');
    walletScreen.classList.remove('slide-up');
    // Hide withdraw form if open
    document.getElementById('withdraw-form').classList.add('hidden');
});

document.getElementById('withdraw-btn').addEventListener('click', () => {
    document.getElementById('withdraw-form').classList.remove('hidden');
});

document.getElementById('cancel-withdraw').addEventListener('click', () => {
    document.getElementById('withdraw-form').classList.add('hidden');
});

document.getElementById('confirm-withdraw').addEventListener('click', () => {
    const input = document.getElementById('withdraw-amount');
    const amount = parseInt(input.value);

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }
    if (amount > state.earnings) {
        alert("Insufficient balance!");
        return;
    }

    if (confirm(`Withdraw ₹${amount} to your bank account?`)) {
        state.earnings -= amount;
        updateEarningsUI();
        document.getElementById('withdraw-form').classList.add('hidden');
        input.value = '';
        alert("Withdrawal Successful! Funds will reflect in 24 hours.");
    }
});


// Order Logic
orderCard.addEventListener('click', () => {
    // Desktop check: If desktop, might want to just show overlay alongside
    // For now, we stick to overlay flow
    homeScreen.classList.add('hidden');
    orderOverlay.classList.remove('hidden');
    state.flowStep = 0;
    updateFlowUI();
});


// Swipe Logic
const swipeBtn = document.getElementById('swipe-btn');
const handle = document.getElementById('swipe-handle');
const bg = document.getElementById('swipe-bg');
const swipeText = document.getElementById('swipe-text');

let startX = 0;
let isDragging = false;

handle.addEventListener('mousedown', startDrag);
handle.addEventListener('touchstart', (e) => startDrag(e.touches[0]));

function startDrag(e) {
    isDragging = true;
    startX = e.clientX;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', (e) => onDrag(e.touches[0]));
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
}

function onDrag(e) {
    if (!isDragging) return;
    let diff = e.clientX - startX;
    if (diff < 0) diff = 0;
    if (diff > 250) diff = 250;

    handle.style.transform = `translateX(${diff}px)`;
    bg.style.width = `${diff + 35}px`;

    if (diff >= 230) {
        completeSwipe();
    }
}

function stopDrag() {
    isDragging = false;
    if (handle.style.transform.includes('250') || handle.style.transform.includes('230')) return;

    handle.style.transition = 'transform 0.2s';
    bg.style.transition = 'width 0.2s';
    handle.style.transform = 'translateX(0)';
    bg.style.width = '0';

    setTimeout(() => {
        handle.style.transition = '';
        bg.style.transition = '';
    }, 200);
}

function completeSwipe() {
    isDragging = false;
    handle.textContent = '✓';

    setTimeout(() => {
        state.flowStep++;
        if (state.flowStep < STEPS.length) {
            updateFlowUI();
            resetSwipe();
        } else {
            finishOrder();
        }
    }, 500);
}

function resetSwipe() {
    handle.style.transform = 'translateX(0)';
    bg.style.width = '0';
    handle.textContent = '➜';
}

function updateFlowUI() {
    const step = STEPS[state.flowStep];
    document.getElementById('flow-title').textContent = step.title;
    document.getElementById('flow-address').textContent = step.addr;
    swipeText.textContent = step.btn;
}

function finishOrder() {
    const pay = 85;
    alert(`Order Completed! +₹${pay}`);

    state.earnings += pay;
    state.today += pay;
    updateEarningsUI();

    orderOverlay.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    resetSwipe();
}

// Init
updateEarningsUI();
