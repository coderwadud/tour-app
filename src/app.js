// TourManager 100% Offline Tour & Financial Ledger (Multi-View & LocalStorage Persistent)

const STORAGE_KEY = 'tour_manager_offline_db';

let state = {
  activeView: 'dashboard', // 'dashboard' | 'all-tours' | 'all-mates' | 'mate-detail' | 'tour-detail'
  activeTripId: null,
  activeMateName: null,
  tourFilter: 'ALL',
  trips: []
};

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.trips)) {
        state = parsed;
      }
    }
  } catch (err) {
    console.error('Error loading from localStorage:', err);
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

function getActiveTrip() {
  if (!state.activeTripId && state.trips.length > 0) {
    state.activeTripId = state.trips[0].id;
  }
  return state.trips.find(t => t.id === state.activeTripId) || null;
}

// UI Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  setupNavigation();
  setupTabs();
  setupModals();
  renderApp();
});

function setupNavigation() {
  // Brand Header Click -> Home Dashboard
  document.querySelector('.brand')?.addEventListener('click', () => {
    state.activeView = 'dashboard';
    saveToLocalStorage();
    renderApp();
  });

  // All Back to Home buttons
  document.querySelectorAll('.btn-back-home').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeView = 'dashboard';
      saveToLocalStorage();
      renderApp();
    });
  });

  // Clickable Stat Cards -> All Tours / All Mates Views
  document.getElementById('cardStatTours')?.addEventListener('click', () => {
    state.activeView = 'all-tours';
    state.tourFilter = 'ALL';
    saveToLocalStorage();
    renderApp();
  });

  document.getElementById('cardStatMates')?.addEventListener('click', () => {
    state.activeView = 'all-mates';
    saveToLocalStorage();
    renderApp();
  });

  document.getElementById('cardStatSpent')?.addEventListener('click', () => {
    state.activeView = 'all-tours';
    state.tourFilter = 'ALL';
    saveToLocalStorage();
    renderApp();
  });

  document.getElementById('cardStatBudget')?.addEventListener('click', () => {
    state.activeView = 'all-tours';
    state.tourFilter = 'ALL';
    saveToLocalStorage();
    renderApp();
  });

  // Back to Mates List from Mate Detail Profile
  document.getElementById('btnBackToMatesList')?.addEventListener('click', () => {
    state.activeView = 'all-mates';
    saveToLocalStorage();
    renderApp();
  });

  // Filter Pills inside All Tours View
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.tourFilter = btn.dataset.tourFilter;
      renderAllToursView();
    });
  });
}

function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const pane = document.getElementById(tab.dataset.tab);
      if (pane) pane.classList.add('active');
    });
  });
}

function setupModals() {
  // New Tour Modal
  const modalNewTour = document.getElementById('modalNewTour');
  document.getElementById('btnNewTour')?.addEventListener('click', () => modalNewTour.classList.add('active'));
  document.getElementById('btnCreateTourHome')?.addEventListener('click', () => modalNewTour.classList.add('active'));
  document.getElementById('btnCreateTourAllView')?.addEventListener('click', () => modalNewTour.classList.add('active'));
  document.getElementById('btnCancelNewTour')?.addEventListener('click', () => modalNewTour.classList.remove('active'));
  document.getElementById('btnConfirmNewTour')?.addEventListener('click', handleCreateTour);

  // Edit Tour Modal
  const modalEditTour = document.getElementById('modalEditTour');
  document.getElementById('btnCancelEditTour')?.addEventListener('click', () => modalEditTour.classList.remove('active'));
  document.getElementById('btnConfirmEditTour')?.addEventListener('click', handleConfirmEditTour);

  // Backup Modal
  const modalBackup = document.getElementById('modalBackup');
  document.getElementById('btnBackup')?.addEventListener('click', () => modalBackup.classList.add('active'));
  document.getElementById('btnCancelBackup')?.addEventListener('click', () => modalBackup.classList.remove('active'));
  document.getElementById('btnBackupExport')?.addEventListener('click', exportBackupJson);
  document.getElementById('btnBackupImport')?.addEventListener('click', () => document.getElementById('filePickerImport').click());
  document.getElementById('btnLoadDemoTours')?.addEventListener('click', load10DemoTours);
  document.getElementById('filePickerImport')?.addEventListener('change', handleImportJsonFile);

  // Add Member Modal
  const modalAddMember = document.getElementById('modalAddMember');
  document.getElementById('btnAddMember')?.addEventListener('click', () => modalAddMember.classList.add('active'));
  document.getElementById('btnQuickAddMate')?.addEventListener('click', () => modalAddMember.classList.add('active'));
  document.getElementById('btnCancelAddMember')?.addEventListener('click', () => modalAddMember.classList.remove('active'));
  document.getElementById('btnConfirmAddMember')?.addEventListener('click', handleAddMember);

  // Edit Member Modal
  const modalEditMember = document.getElementById('modalEditMember');
  document.getElementById('btnCancelEditMember')?.addEventListener('click', () => modalEditMember.classList.remove('active'));
  document.getElementById('btnConfirmEditMember')?.addEventListener('click', handleConfirmEditMember);

  // Add Deposit Modal
  const modalAddDeposit = document.getElementById('modalAddDeposit');
  document.getElementById('btnQuickDeposit')?.addEventListener('click', openDepositModal);
  document.getElementById('btnTabDeposit')?.addEventListener('click', openDepositModal);
  document.getElementById('btnCancelDeposit')?.addEventListener('click', () => modalAddDeposit.classList.remove('active'));
  document.getElementById('btnConfirmDeposit')?.addEventListener('click', handleAddDeposit);

  // Add Expense Modal
  const modalAddExpense = document.getElementById('modalAddExpense');
  document.getElementById('btnQuickExpense')?.addEventListener('click', openExpenseModal);
  document.getElementById('btnAddExpense')?.addEventListener('click', openExpenseModal);
  document.getElementById('btnCancelExpense')?.addEventListener('click', () => modalAddExpense.classList.remove('active'));
  document.getElementById('btnConfirmExpense')?.addEventListener('click', handleAddExpense);

  // Add Itinerary Modal
  const modalAddItinerary = document.getElementById('modalAddItinerary');
  document.getElementById('btnAddItinerary')?.addEventListener('click', () => modalAddItinerary.classList.add('active'));
  document.getElementById('btnCancelItinerary')?.addEventListener('click', () => modalAddItinerary.classList.remove('active'));
  document.getElementById('btnConfirmItinerary')?.addEventListener('click', handleAddItinerary);

  // Add Checklist Modal
  const modalAddChecklist = document.getElementById('modalAddChecklist');
  document.getElementById('btnAddChecklist')?.addEventListener('click', () => modalAddChecklist.classList.add('active'));
  document.getElementById('btnCancelChecklist')?.addEventListener('click', () => modalAddChecklist.classList.remove('active'));
  document.getElementById('btnConfirmChecklist')?.addEventListener('click', handleAddChecklist);

  // Add Contact Modal
  const modalAddContact = document.getElementById('modalAddContact');
  document.getElementById('btnAddContact')?.addEventListener('click', () => modalAddContact.classList.add('active'));
  document.getElementById('btnCancelContact')?.addEventListener('click', () => modalAddContact.classList.remove('active'));
  document.getElementById('btnConfirmContact')?.addEventListener('click', handleAddContact);

  // PDF Export & Share
  document.getElementById('btnExportPdfReport')?.addEventListener('click', exportPdfReport);
  document.getElementById('btnExportPdfTab')?.addEventListener('click', exportPdfReport);
  document.getElementById('btnShareSummary')?.addEventListener('click', exportShareableText);
  document.getElementById('btnExportTextTab')?.addEventListener('click', exportShareableText);
}

async function load10DemoTours() {
  try {
    const response = await fetch('/sample_10_tours_backup.json');
    if (!response.ok) throw new Error('Demo file not found');
    const importedData = await response.json();
    if (importedData && importedData.trips) {
      state = importedData;
      document.getElementById('modalBackup').classList.remove('active');
      saveToLocalStorage();
      renderApp();
      alert('🎉 10 Sample Demo Tours successfully loaded into your app!');
    }
  } catch (err) {
    alert('Error loading demo tours: ' + err.message);
  }
}

function handleCreateTour() {
  const title = document.getElementById('tourInputTitle').value.trim();
  const dest = document.getElementById('tourInputDestination').value.trim();
  const status = document.getElementById('tourInputStatus').value || 'IN_PROGRESS';
  const curr = document.getElementById('tourInputCurrency').value || 'BDT ';
  const budget = parseFloat(document.getElementById('tourInputBudget').value) || 0;

  if (!title || !dest) return alert('Please enter tour title and destination');

  const todayStr = new Date().toISOString().split('T')[0];

  const newTrip = {
    id: Date.now(),
    title: title,
    destination: dest,
    status: status,
    startDate: todayStr,
    endDate: todayStr,
    currency: curr,
    budget: budget,
    members: [],
    deposits: [],
    expenses: [],
    itinerary: [],
    checklist: [],
    emergencyContacts: []
  };

  state.trips.push(newTrip);
  state.activeTripId = newTrip.id;
  state.activeView = 'tour-detail';

  document.getElementById('modalNewTour').classList.remove('active');
  document.getElementById('tourInputTitle').value = '';
  document.getElementById('tourInputDestination').value = '';
  document.getElementById('tourInputBudget').value = '';

  saveToLocalStorage();
  renderApp();
}

window.openEditTourModal = function(event, tourId) {
  event.stopPropagation();
  const trip = state.trips.find(t => t.id === tourId);
  if (!trip) return;

  document.getElementById('editTourId').value = trip.id;
  document.getElementById('editTourTitle').value = trip.title;
  document.getElementById('editTourDestination').value = trip.destination;
  document.getElementById('editTourStatus').value = trip.status || 'IN_PROGRESS';
  document.getElementById('editTourCurrency').value = trip.currency;
  document.getElementById('editTourBudget').value = trip.budget || 0;

  document.getElementById('modalEditTour').classList.add('active');
};

function handleConfirmEditTour() {
  const id = parseInt(document.getElementById('editTourId').value);
  const trip = state.trips.find(t => t.id === id);
  if (!trip) return;

  const title = document.getElementById('editTourTitle').value.trim();
  const dest = document.getElementById('editTourDestination').value.trim();
  const status = document.getElementById('editTourStatus').value;
  const curr = document.getElementById('editTourCurrency').value || 'BDT ';
  const budget = parseFloat(document.getElementById('editTourBudget').value) || 0;

  if (!title || !dest) return alert('Title and destination are required');

  trip.title = title;
  trip.destination = dest;
  trip.status = status;
  trip.currency = curr;
  trip.budget = budget;

  document.getElementById('modalEditTour').classList.remove('active');
  saveToLocalStorage();
  renderApp();
}

window.deleteTour = function(event, tourId) {
  event.stopPropagation();
  const trip = state.trips.find(t => t.id === tourId);
  if (!trip) return;

  if (confirm(`Are you sure you want to delete tour "${trip.title}"?`)) {
    state.trips = state.trips.filter(t => t.id !== tourId);
    if (state.activeTripId === tourId) {
      state.activeTripId = state.trips.length > 0 ? state.trips[0].id : null;
      state.activeView = 'dashboard';
    }
    saveToLocalStorage();
    renderApp();
  }
};

window.openEditMemberModal = function(memberId) {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;
  const member = activeTrip.members.find(m => m.id === memberId);
  if (!member) return;

  document.getElementById('editMemberId').value = member.id;
  document.getElementById('editMemberName').value = member.name;
  document.getElementById('editMemberPhone').value = member.phone || '';
  document.getElementById('editMemberOrganizer').checked = member.role === 'ORGANIZER';

  document.getElementById('modalEditMember').classList.add('active');
};

function handleConfirmEditMember() {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;
  const id = parseInt(document.getElementById('editMemberId').value);
  const member = activeTrip.members.find(m => m.id === id);
  if (!member) return;

  const name = document.getElementById('editMemberName').value.trim();
  const phone = document.getElementById('editMemberPhone').value.trim();
  const isOrg = document.getElementById('editMemberOrganizer').checked;

  if (!name) return alert('Member name is required');

  member.name = name;
  member.phone = phone;
  member.role = isOrg ? 'ORGANIZER' : 'MEMBER';

  document.getElementById('modalEditMember').classList.remove('active');
  saveToLocalStorage();
  renderApp();
}

window.deleteMember = function(memberId) {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;
  const member = activeTrip.members.find(m => m.id === memberId);
  if (!member) return;

  if (confirm(`Remove "${member.name}" from tour mates?`)) {
    activeTrip.members = activeTrip.members.filter(m => m.id !== memberId);
    activeTrip.deposits = activeTrip.deposits.filter(d => d.memberId !== memberId);
    recalculateEqualSplitsForTrip(activeTrip);
    saveToLocalStorage();
    renderApp();
  }
};

window.deleteExpense = function(expenseId) {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;

  if (confirm('Delete this expense entry?')) {
    activeTrip.expenses = activeTrip.expenses.filter(e => e.id !== expenseId);
    saveToLocalStorage();
    renderApp();
  }
};

window.deleteItineraryItem = function(id) {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;
  activeTrip.itinerary = activeTrip.itinerary.filter(i => i.id !== id);
  saveToLocalStorage();
  renderApp();
};

window.deleteChecklistItem = function(id) {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;
  activeTrip.checklist = activeTrip.checklist.filter(c => c.id !== id);
  saveToLocalStorage();
  renderApp();
};

window.deleteContact = function(id) {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;
  activeTrip.emergencyContacts = activeTrip.emergencyContacts.filter(c => c.id !== id);
  saveToLocalStorage();
  renderApp();
};

function openDepositModal() {
  const activeTrip = getActiveTrip();
  if (!activeTrip || activeTrip.members.length === 0) {
    return alert('Please add at least one Member before recording a deposit!');
  }
  const select = document.getElementById('depositSelectMember');
  select.innerHTML = activeTrip.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  document.getElementById('modalAddDeposit').classList.add('active');
}

function openExpenseModal() {
  const activeTrip = getActiveTrip();
  if (!activeTrip || activeTrip.members.length === 0) {
    return alert('Please add at least one Member before logging an expense!');
  }
  const select = document.getElementById('expenseSelectPaidBy');
  select.innerHTML = '<option value="COMMON_FUND">Common Fund</option>' +
    activeTrip.members.map(m => `<option value="${m.id}">${m.name} (Out-of-pocket)</option>`).join('');
  document.getElementById('modalAddExpense').classList.add('active');
}

function handleAddMember() {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;

  const name = document.getElementById('memberInputName').value.trim();
  const phone = document.getElementById('memberInputPhone').value.trim();
  const isOrg = document.getElementById('memberInputOrganizer').checked;

  if (!name) return alert('Please enter member name');

  activeTrip.members.push({
    id: Date.now(),
    name,
    phone,
    role: isOrg ? 'ORGANIZER' : 'MEMBER'
  });
  recalculateEqualSplitsForTrip(activeTrip);
  document.getElementById('modalAddMember').classList.remove('active');
  document.getElementById('memberInputName').value = '';
  document.getElementById('memberInputPhone').value = '';
  saveToLocalStorage();
  renderApp();
}

function recalculateEqualSplitsForTrip(trip) {
  if (!trip || !trip.members || trip.members.length === 0) return;
  const numMembers = trip.members.length;
  (trip.expenses || []).forEach(e => {
    if (!e.splitMethod || e.splitMethod === 'EQUAL') {
      const perPerson = Math.floor(e.totalAmountCents / numMembers);
      const remainder = e.totalAmountCents % numMembers;
      e.splits = trip.members.map((m, idx) => ({
        memberId: m.id,
        amountCents: idx === 0 ? perPerson + remainder : perPerson
      }));
    }
  });
}

function handleAddDeposit() {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;

  const memberId = parseInt(document.getElementById('depositSelectMember').value);
  const amount = parseFloat(document.getElementById('depositInputAmount').value);
  const notes = document.getElementById('depositInputNotes').value.trim();

  if (!amount || amount <= 0) return alert('Please enter valid amount');

  activeTrip.deposits.push({
    id: Date.now(),
    memberId,
    amountCents: Math.round(amount * 100),
    notes
  });
  document.getElementById('modalAddDeposit').classList.remove('active');
  document.getElementById('depositInputAmount').value = '';
  saveToLocalStorage();
  renderApp();
}

function handleAddExpense() {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;

  const title = document.getElementById('expenseInputTitle').value.trim();
  const amount = parseFloat(document.getElementById('expenseInputAmount').value);
  const category = document.getElementById('expenseSelectCategory').value;
  const paidByVal = document.getElementById('expenseSelectPaidBy').value;

  if (!title || !amount || amount <= 0) return alert('Please enter title and valid amount');

  const paidByMemberId = paidByVal === 'COMMON_FUND' ? null : parseInt(paidByVal);
  const totalCents = Math.round(amount * 100);
  const perPersonCents = activeTrip.members.length > 0 ? Math.round(totalCents / activeTrip.members.length) : 0;

  const splits = activeTrip.members.map(m => ({ memberId: m.id, amountCents: perPersonCents }));

  activeTrip.expenses.push({
    id: Date.now(),
    title,
    totalAmountCents: totalCents,
    category,
    paidByMemberId,
    splits
  });

  document.getElementById('modalAddExpense').classList.remove('active');
  document.getElementById('expenseInputTitle').value = '';
  document.getElementById('expenseInputAmount').value = '';
  saveToLocalStorage();
  renderApp();
}

function handleAddItinerary() {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;

  const day = parseInt(document.getElementById('itineraryInputDay').value) || 1;
  const title = document.getElementById('itineraryInputTitle').value.trim();
  const time = document.getElementById('itineraryInputTime').value.trim();
  const loc = document.getElementById('itineraryInputLoc').value.trim();
  const desc = document.getElementById('itineraryInputDesc').value.trim();

  if (!title) return alert('Please enter schedule title');

  activeTrip.itinerary.push({
    id: Date.now(),
    day,
    title,
    time,
    loc,
    desc,
    isCompleted: false
  });
  document.getElementById('modalAddItinerary').classList.remove('active');
  document.getElementById('itineraryInputTitle').value = '';
  saveToLocalStorage();
  renderApp();
}

function handleAddChecklist() {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;

  const title = document.getElementById('checklistInputTitle').value.trim();
  if (!title) return alert('Please enter item name');

  activeTrip.checklist.push({
    id: Date.now(),
    title,
    category: "ESSENTIALS",
    isPacked: false
  });
  document.getElementById('modalAddChecklist').classList.remove('active');
  document.getElementById('checklistInputTitle').value = '';
  saveToLocalStorage();
  renderApp();
}

function handleAddContact() {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;

  const name = document.getElementById('contactInputName').value.trim();
  const phone = document.getElementById('contactInputPhone').value.trim();
  const role = document.getElementById('contactSelectRole').value;
  const notes = document.getElementById('contactInputNotes').value.trim();

  if (!name || !phone) return alert('Please enter contact name and phone number');

  activeTrip.emergencyContacts.push({
    id: Date.now(),
    name,
    phone,
    role,
    notes
  });
  document.getElementById('modalAddContact').classList.remove('active');
  document.getElementById('contactInputName').value = '';
  document.getElementById('contactInputPhone').value = '';
  saveToLocalStorage();
  renderApp();
}

function handleImportJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      if (importedData && (importedData.trips || importedData.members)) {
        if (importedData.trips) {
          state = importedData;
        } else {
          state.trips.push(importedData);
          state.activeTripId = importedData.id || Date.now();
        }
        document.getElementById('modalBackup').classList.remove('active');
        saveToLocalStorage();
        renderApp();
        alert('Backup data successfully restored!');
      } else {
        alert('Invalid backup JSON format.');
      }
    } catch (err) {
      alert('Error parsing JSON backup file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function renderApp() {
  document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));

  if (state.activeView === 'dashboard') {
    document.getElementById('view-dashboard').classList.add('active');
    renderHomeDashboard();
  } else if (state.activeView === 'all-tours') {
    document.getElementById('view-all-tours').classList.add('active');
    renderAllToursView();
  } else if (state.activeView === 'all-mates') {
    document.getElementById('view-all-mates').classList.add('active');
    renderAllMatesView();
  } else if (state.activeView === 'mate-detail') {
    document.getElementById('view-mate-detail').classList.add('active');
    renderMateDetailProfileView();
  } else {
    document.getElementById('view-tour-detail').classList.add('active');
    renderTourDetailsPage();
  }
}

// RENDER VIEW 1: HOME PAGE DASHBOARD (GLOBAL SUMMARY ACROSS ALL TOURS + RUNNING TOURS GRID)
function renderHomeDashboard() {
  const totalTours = state.trips.length;

  const mateNamesSet = new Set();
  state.trips.forEach(t => t.members.forEach(m => mateNamesSet.add(m.name.trim().toLowerCase())));

  const totalSpentCents = state.trips.reduce((acc, t) => acc + t.expenses.reduce((eAcc, e) => eAcc + e.totalAmountCents, 0), 0);
  const totalBudgetCents = state.trips.reduce((acc, t) => acc + (t.budget || 0) * 100, 0);

  document.getElementById('homeStatTotalTours').textContent = `${totalTours} Tour${totalTours > 1 ? 's' : ''}`;
  document.getElementById('homeStatTotalMates').textContent = `${mateNamesSet.size} Member${mateNamesSet.size > 1 ? 's' : ''}`;
  document.getElementById('homeStatTotalSpent').textContent = `BDT ${formatCents(totalSpentCents)}`;
  document.getElementById('homeStatTotalBudget').textContent = `BDT ${formatCents(totalBudgetCents)}`;

  const runningTours = state.trips.filter(t => t.status !== 'COMPLETED');

  const toursGrid = document.getElementById('toursListGrid');
  if (runningTours.length === 0) {
    toursGrid.innerHTML = `
      <div class="card" style="grid-column:1/-1; text-align:center; padding: 40px 20px;">
        <div style="font-size:32px; margin-bottom:10px;">🗺️</div>
        <h4 style="margin-bottom:6px;">No Active Running Tours</h4>
        <div class="text-muted" style="margin-bottom:16px;">Create a new tour or check closed tours in All Tours directory.</div>
        <button class="btn btn-primary" onclick="document.getElementById('modalNewTour').classList.add('active')">+ Create Tour</button>
      </div>
    `;
  } else {
    toursGrid.innerHTML = runningTours.map(trip => renderTourCardHtml(trip)).join('');
  }
}

// RENDER VIEW 2: ALL TOURS DIRECTORY VIEW
function renderAllToursView() {
  const filter = state.tourFilter || 'ALL';
  let filteredTours = state.trips;
  if (filter !== 'ALL') {
    filteredTours = state.trips.filter(t => (t.status || 'IN_PROGRESS') === filter);
  }

  const grid = document.getElementById('allToursGrid');
  if (filteredTours.length === 0) {
    grid.innerHTML = '<div class="card" style="grid-column:1/-1;"><div class="text-muted">No tours found matching this filter status.</div></div>';
  } else {
    grid.innerHTML = filteredTours.map(trip => renderTourCardHtml(trip)).join('');
  }
}

// Helper to render tour card
function renderTourCardHtml(trip) {
  const spentCents = trip.expenses.reduce((acc, e) => acc + e.totalAmountCents, 0);
  const currency = trip.currency || 'BDT ';
  const status = trip.status || 'IN_PROGRESS';
  const statusClass = status === 'IN_PROGRESS' ? 'status-in-progress' : status === 'PENDING' ? 'status-pending' : 'status-completed';

  return `
    <div class="tour-card-item" onclick="openTourDetail(${trip.id})">
      <div>
        <div class="tour-card-header">
          <div>
            <h4 class="tour-card-title">${trip.title}</h4>
            <div class="tour-card-dest">📍 ${trip.destination}</div>
          </div>
          <div class="card-action-btns">
            <span class="status-badge ${statusClass}">${status}</span>
            <button class="btn-icon-sm" onclick="openEditTourModal(event, ${trip.id})" title="Edit Tour">✏️</button>
            <button class="btn-icon-sm btn-danger-sm" onclick="deleteTour(event, ${trip.id})" title="Delete Tour">🗑️</button>
          </div>
        </div>
        <div class="text-muted" style="font-size:12px; margin-top:8px;">
          👥 ${trip.members.length} Members | 📅 ${trip.startDate}
        </div>
      </div>
      <div class="tour-card-meta">
        <div>
          <span class="text-muted" style="font-size:11px;">Total Spent</span>
          <div style="font-weight:800; color:#DC2626; font-size:16px;">${currency}${formatCents(spentCents)}</div>
        </div>
        <button class="btn btn-primary" style="padding:6px 12px; font-size:12px;">View Ledger →</button>
      </div>
    </div>
  `;
}

// RENDER VIEW 3: ALL MEMBERS DIRECTORY VIEW
function renderAllMatesView() {
  const matesMap = new Map();

  state.trips.forEach(trip => {
    trip.members.forEach(member => {
      const key = member.name.trim().toLowerCase();
      if (!matesMap.has(key)) {
        matesMap.set(key, {
          name: member.name.trim(),
          phone: member.phone || '',
          toursCount: 0,
          totalDepositedCents: 0,
          totalOutPocketCents: 0,
          toursList: []
        });
      }

      const mateObj = matesMap.get(key);
      mateObj.toursCount += 1;
      mateObj.toursList.push(trip);

      const memberDeposits = trip.deposits.filter(d => d.memberId === member.id).reduce((a, b) => a + b.amountCents, 0);
      const memberOutPocket = trip.expenses.filter(e => e.paidByMemberId === member.id).reduce((a, b) => a + b.totalAmountCents, 0);

      mateObj.totalDepositedCents += memberDeposits;
      mateObj.totalOutPocketCents += memberOutPocket;
    });
  });

  const grid = document.getElementById('allMatesGrid');
  if (!grid) return;
  if (matesMap.size === 0) {
    grid.innerHTML = '<div class="card" style="grid-column:1/-1;"><div class="text-muted">No members registered across any tours yet.</div></div>';
  } else {
    grid.innerHTML = Array.from(matesMap.values()).map(m => `
      <div class="card" style="cursor:pointer;" onclick="openMateDetailProfile('${m.name.replace(/'/g, "\\'")}')">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="member-avatar">${m.name.charAt(0).toUpperCase()}</div>
            <div>
              <strong style="font-size:16px;">${m.name}</strong>
              <div class="text-muted" style="font-size:12px;">${m.toursCount} Tour${m.toursCount > 1 ? 's' : ''} Joined</div>
            </div>
          </div>
          <span class="btn btn-secondary" style="padding:4px 10px; font-size:12px;">Profile →</span>
        </div>
      </div>
    `).join('');
  }
}

window.openMateDetailProfile = function(name) {
  state.activeMateName = name;
  state.activeView = 'mate-detail';
  saveToLocalStorage();
  renderApp();
};

// RENDER VIEW 4: SPECIFIC MEMBER DETAIL PROFILE & TOURS JOINED VIEW
function renderMateDetailProfileView() {
  const name = state.activeMateName;
  if (!name) {
    state.activeView = 'all-mates';
    renderAllMatesView();
    return;
  }

  // Find all tours where this member is included
  const joinedTours = [];
  let phoneNum = '';
  let totalDeposited = 0;
  let totalOutPocket = 0;

  state.trips.forEach(trip => {
    const member = trip.members.find(m => m.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (member) {
      if (member.phone && !phoneNum) phoneNum = member.phone;

      const memberDeposits = trip.deposits.filter(d => d.memberId === member.id).reduce((a, b) => a + b.amountCents, 0);
      const memberOutPocket = trip.expenses.filter(e => e.paidByMemberId === member.id).reduce((a, b) => a + b.totalAmountCents, 0);

      totalDeposited += memberDeposits;
      totalOutPocket += memberOutPocket;

      joinedTours.push({ trip, member, memberDeposits, memberOutPocket, totalPaid: memberDeposits + memberOutPocket });
    }
  });

  const nameEl = document.getElementById('mateProfileName');
  if (nameEl) nameEl.textContent = name;
  const phoneEl = document.getElementById('mateProfilePhone');
  if (phoneEl) phoneEl.textContent = phoneNum ? `📞 ${phoneNum}` : 'No phone number';

  const toursEl = document.getElementById('mateStatTotalTours');
  if (toursEl) toursEl.textContent = `${joinedTours.length} Tour${joinedTours.length > 1 ? 's' : ''}`;
  const depEl = document.getElementById('mateStatTotalDeposited');
  if (depEl) depEl.textContent = `BDT ${formatCents(totalDeposited)}`;
  const outEl = document.getElementById('mateStatTotalOutPocket');
  if (outEl) outEl.textContent = `BDT ${formatCents(totalOutPocket)}`;

  const grid = document.getElementById('mateToursJoinedGrid');
  if (!grid) return;
  if (joinedTours.length === 0) {
    grid.innerHTML = '<div class="card" style="grid-column:1/-1;"><div class="text-muted">This member has not joined any tours yet.</div></div>';
  } else {
    grid.innerHTML = joinedTours.map(item => `
      <div class="card" style="cursor:pointer;" onclick="openTourDetail(${item.trip.id})">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h4 style="font-size:16px; font-weight:800;">${item.trip.title}</h4>
            <div class="text-muted">📍 ${item.trip.destination}</div>
            <div class="text-muted" style="font-size:12px; margin-top:4px;">Role: ${item.member.role}</div>
          </div>
          <div style="text-align:right;">
            <span class="status-badge ${item.trip.status === 'IN_PROGRESS' ? 'status-in-progress' : item.trip.status === 'PENDING' ? 'status-pending' : 'status-completed'}">${item.trip.status || 'IN_PROGRESS'}</span>
            <div style="font-weight:800; color:#37B149; font-size:15px; margin-top:6px;">${item.trip.currency || 'BDT '}${formatCents(item.totalPaid)}</div>
          </div>
        </div>
      </div>
    `).join('');
  }
}

window.openTourDetail = function(tripId) {
  state.activeTripId = tripId;
  state.activeView = 'tour-detail';
  saveToLocalStorage();
  renderApp();
};

// RENDER VIEW 5: TOUR DETAILS PAGE
function renderTourDetailsPage() {
  const activeTrip = getActiveTrip();
  if (!activeTrip) {
    state.activeView = 'dashboard';
    renderHomeDashboard();
    return;
  }

  recalculateEqualSplitsForTrip(activeTrip);

  // Title Headers
  document.getElementById('detailTourTitle').textContent = activeTrip.title;
  document.getElementById('detailTourDestination').textContent = `📍 ${activeTrip.destination}`;

  const statusBadge = document.getElementById('detailTourStatusBadge');
  const status = activeTrip.status || 'IN_PROGRESS';
  statusBadge.textContent = status;
  statusBadge.className = `status-badge ${status === 'IN_PROGRESS' ? 'status-in-progress' : status === 'PENDING' ? 'status-pending' : 'status-completed'}`;

  // 1. Calculate Totals
  const totalFund = activeTrip.deposits.reduce((acc, d) => acc + d.amountCents, 0);
  const totalSpent = activeTrip.expenses.reduce((acc, e) => acc + e.totalAmountCents, 0);
  const remainingCash = totalFund - totalSpent;
  const currency = activeTrip.currency;

  document.getElementById('statTotalFund').textContent = `${currency}${formatCents(totalFund)}`;
  document.getElementById('statTotalSpent').textContent = `${currency}${formatCents(totalSpent)}`;
  document.getElementById('statRemainingCash').textContent = `${currency}${formatCents(remainingCash)}`;
  document.getElementById('statMemberCount').textContent = `${activeTrip.members.length} Members`;

  // 1b. Target Budget Analytics & Over-Budget Control
  const targetBudget = activeTrip.budget || 0;
  const targetBudgetCents = targetBudget * 100;
  const budgetCard = document.getElementById('budgetOverviewCard');

  if (budgetCard) {
    if (targetBudgetCents > 0) {
      budgetCard.style.display = 'block';
      const pct = Math.round((totalSpent / targetBudgetCents) * 100);
      const isOverBudget = totalSpent > targetBudgetCents;
      const remainingCents = targetBudgetCents - totalSpent;

      budgetCard.className = `budget-analytics-card ${isOverBudget ? 'is-over-budget' : 'is-on-track'}`;

      const badge = document.getElementById('budgetStatusBadge');
      if (badge) {
        if (isOverBudget) {
          badge.textContent = `🚨 OVER BUDGET (${pct}%)`;
          badge.className = 'budget-status-pill over-budget';
        } else {
          badge.textContent = `🟢 ON TRACK (${pct}%)`;
          badge.className = 'budget-status-pill on-track';
        }
      }

      const targetEl = document.getElementById('budgetTextTarget');
      if (targetEl) {
        targetEl.textContent = `${currency}${formatCents(targetBudgetCents)}`;
        targetEl.style.color = '#0F172A';
      }

      const spentEl = document.getElementById('budgetTextSpent');
      if (spentEl) {
        spentEl.textContent = `${currency}${formatCents(totalSpent)}`;
        spentEl.style.color = '#2563EB';
      }

      const remLabel = document.getElementById('budgetLabelRemaining');
      if (remLabel) remLabel.textContent = isOverBudget ? 'Budget Deficit / Over' : 'Remaining Savings';

      const remEl = document.getElementById('budgetTextRemaining');
      if (remEl) {
        if (isOverBudget) {
          remEl.textContent = `-${currency}${formatCents(-remainingCents)}`;
          remEl.style.color = '#DC2626';
        } else {
          remEl.textContent = `+${currency}${formatCents(remainingCents)}`;
          remEl.style.color = '#059669';
        }
      }

      const remTile = remEl ? remEl.closest('.budget-metric-tile') : null;
      if (remTile) {
        remTile.className = `budget-metric-tile ${isOverBudget ? 'tile-over-budget' : 'tile-on-track'}`;
      }

      const bar = document.getElementById('budgetProgressBar');
      const greenLabel = document.getElementById('budgetBarGreenLabel');
      const redLabel = document.getElementById('budgetBarRedLabel');

      if (bar) {
        if (isOverBudget) {
          // Dual-color split bar: Green portion for target budget, Red portion proportional to over-budget excess!
          const greenSharePct = Math.round((targetBudgetCents / totalSpent) * 100);
          const overBudgetPct = pct - 100;

          bar.style.width = '100%';
          bar.style.background = `linear-gradient(90deg, #10B981 0%, #10B981 ${greenSharePct}%, #EF4444 ${greenSharePct}%, #F43F5E 100%)`;
          bar.style.boxShadow = 'none';

          if (greenLabel) {
            greenLabel.style.color = '#047857';
            greenLabel.textContent = `🟢 Target Budget: ${greenSharePct}% (${currency}${formatCents(targetBudgetCents)})`;
          }
          if (redLabel) {
            redLabel.style.display = 'inline';
            redLabel.style.color = '#B91C1C';
            redLabel.textContent = `🔴 Exceeded: +${overBudgetPct}% (+${currency}${formatCents(-remainingCents)})`;
          }
        } else {
          // Standard green progress bar within budget limit
          bar.style.width = `${pct}%`;
          bar.style.background = 'linear-gradient(90deg, #10B981 0%, #059669 100%)';
          bar.style.boxShadow = 'none';

          if (greenLabel) {
            greenLabel.style.color = '#047857';
            greenLabel.textContent = `🟢 Budget Used: ${pct}% of ${currency}${formatCents(targetBudgetCents)}`;
          }
          if (redLabel) redLabel.style.display = 'none';
        }
      }

      const footer = document.getElementById('budgetInsightFooter');
      if (footer) {
        footer.className = `budget-insight-footer ${isOverBudget ? 'footer-over-budget' : 'footer-on-track'}`;
        if (isOverBudget) {
          footer.innerHTML = `⚠️ <strong>Warning:</strong> Total expenses have exceeded target budget by ${currency}${formatCents(-remainingCents)}.`;
        } else {
          footer.innerHTML = `💡 <strong>Insight:</strong> ${100 - pct}% of target budget remains available for upcoming tour activities.`;
        }
      }
    } else {
      budgetCard.style.display = 'none';
    }
  }

  // 2. Recent Expenses Activity
  const recentList = document.getElementById('recentExpensesList');
  if (activeTrip.expenses.length === 0) {
    recentList.innerHTML = '<div class="text-muted">No expenses logged yet. Tap "💳 Log Expense" above to start.</div>';
  } else {
    recentList.innerHTML = activeTrip.expenses.map(e => `
      <div class="card" style="padding: 14px; margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${e.title}</strong>
            <div class="text-muted">${e.category} | Paid by: ${e.paidByMemberId ? activeTrip.members.find(m => m.id === e.paidByMemberId)?.name : 'Common Fund'}</div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <strong style="color: #DC2626; font-size: 16px;">${currency}${formatCents(e.totalAmountCents)}</strong>
            <button class="btn-icon-sm btn-danger-sm" onclick="deleteExpense(${e.id})">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 3. Expenses List Tab
  const expensesList = document.getElementById('expensesList');
  if (activeTrip.expenses.length === 0) {
    expensesList.innerHTML = '<div class="card"><div class="text-muted">No expenses logged yet. Tap "+ Log Expense" to add.</div></div>';
  } else {
    expensesList.innerHTML = activeTrip.expenses.map(e => `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 16px;">${e.title}</strong>
            <div class="text-muted">Category: ${e.category} | Paid: ${e.paidByMemberId ? activeTrip.members.find(m => m.id === e.paidByMemberId)?.name : 'Common Fund'}</div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <strong style="color: #DC2626; font-size: 18px;">${currency}${formatCents(e.totalAmountCents)}</strong>
            <button class="btn-icon-sm btn-danger-sm" onclick="deleteExpense(${e.id})">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 4. Members Grid
  const membersGrid = document.getElementById('membersGrid');
  if (activeTrip.members.length === 0) {
    membersGrid.innerHTML = '<div class="card" style="grid-column: 1/-1;"><div class="text-muted">No members added yet. Tap "+ Add Member" to begin!</div></div>';
  } else {
    membersGrid.innerHTML = activeTrip.members.map(m => {
      const memberDeposits = activeTrip.deposits.filter(d => d.memberId === m.id).reduce((a, b) => a + b.amountCents, 0);
      const memberOutPocket = activeTrip.expenses.filter(e => e.paidByMemberId === m.id).reduce((a, b) => a + b.totalAmountCents, 0);
      const totalPaid = memberDeposits + memberOutPocket;

      return `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="openMateDetailProfile('${m.name.replace(/'/g, "\\'")}')">
              <div class="member-avatar">${m.name.charAt(0).toUpperCase()}</div>
              <div>
                <strong>${m.name}</strong> ${m.role === 'ORGANIZER' ? '<span class="status-badge status-in-progress">Organizer</span>' : ''}
                <div class="text-muted">${m.phone || 'No phone'}</div>
              </div>
            </div>
            <div style="text-align:right;">
              <span class="text-muted" style="font-size: 11px;">Deposited/Paid</span>
              <div style="font-weight: 800; color: #37B149; font-size: 16px;">${currency}${formatCents(totalPaid)}</div>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px; padding-top:10px; border-top:1px solid var(--border);">
            <button class="btn-icon-sm" onclick="openEditMemberModal(${m.id})">✏️ Edit</button>
            <button class="btn-icon-sm btn-danger-sm" onclick="deleteMember(${m.id})">🗑️ Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 5. Settlement Engine Report
  renderSettlementReport(activeTrip, totalSpent, currency);

  // 6. Itinerary
  const itineraryContainer = document.getElementById('itineraryTimeline');
  if (activeTrip.itinerary.length === 0) {
    itineraryContainer.innerHTML = '<div class="card"><div class="text-muted">No schedule items added. Tap "+ Add Schedule Item" to build itinerary.</div></div>';
  } else {
    itineraryContainer.innerHTML = activeTrip.itinerary.map(item => `
      <div class="card" style="margin-bottom: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px; cursor: pointer;" onclick="toggleItinerary(${item.id})">
            <input type="checkbox" ${item.isCompleted ? 'checked' : ''}>
            <div>
              <span class="status-badge status-in-progress">Day ${item.day} ${item.time ? '• ' + item.time : ''}</span>
              <h4 style="${item.isCompleted ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${item.title}</h4>
              <div class="text-muted">${item.loc ? '📍 ' + item.loc + ' ' : ''}${item.desc || ''}</div>
            </div>
          </div>
          <button class="btn-icon-sm btn-danger-sm" onclick="deleteItineraryItem(${item.id})">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  // 7. Packing Checklist Progress
  const totalItems = activeTrip.checklist.length;
  const packedItems = activeTrip.checklist.filter(c => c.isPacked).length;
  const pct = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
  document.getElementById('packingProgressText').textContent = `${packedItems} / ${totalItems} Packed (${pct}%)`;
  document.getElementById('packingProgressBar').style.width = `${pct}%`;

  const checklistGrid = document.getElementById('checklistItems');
  if (activeTrip.checklist.length === 0) {
    checklistGrid.innerHTML = '<div class="card"><div class="text-muted">No packing items. Tap "+ Add Packing Item" to list essentials.</div></div>';
  } else {
    checklistGrid.innerHTML = activeTrip.checklist.map(item => `
      <div class="card" style="padding: 14px; margin-bottom: 8px;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="toggleChecklist(${item.id})">
            <input type="checkbox" ${item.isPacked ? 'checked' : ''}>
            <span style="${item.isPacked ? 'text-decoration: line-through; opacity: 0.6;' : 'font-weight:600;'}">${item.title}</span>
          </div>
          <button class="btn-icon-sm btn-danger-sm" onclick="deleteChecklistItem(${item.id})">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  // 8. Emergency Contacts
  const contactsGrid = document.getElementById('emergencyContactsList');
  if (activeTrip.emergencyContacts.length === 0) {
    contactsGrid.innerHTML = '<div class="card"><div class="text-muted">No emergency contacts saved. Tap "+ Add Contact" to store local police or guide numbers.</div></div>';
  } else {
    contactsGrid.innerHTML = activeTrip.emergencyContacts.map(c => `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${c.name}</strong>
            <div class="text-muted">${c.role} • ${c.phone}</div>
            <div class="text-muted" style="font-size:12px;">${c.notes || ''}</div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <a href="tel:${c.phone}" class="btn btn-emerald" style="padding: 6px 12px; text-decoration: none;">📞 Call</a>
            <button class="btn-icon-sm btn-danger-sm" onclick="deleteContact(${c.id})">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

window.toggleChecklist = function(id) {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;
  const item = activeTrip.checklist.find(c => c.id === id);
  if (item) {
    item.isPacked = !item.isPacked;
    saveToLocalStorage();
    renderApp();
  }
};

window.toggleItinerary = function(id) {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;
  const item = activeTrip.itinerary.find(i => i.id === id);
  if (item) {
    item.isCompleted = !item.isCompleted;
    saveToLocalStorage();
    renderApp();
  }
};

function renderSettlementReport(activeTrip, totalSpent, currency) {
  const memberCount = activeTrip.members.length;
  const perPersonCents = memberCount > 0 ? Math.round(totalSpent / memberCount) : 0;

  document.getElementById('settleTotalCost').textContent = `${currency}${formatCents(totalSpent)}`;
  document.getElementById('settlePerPerson').textContent = `${currency}${formatCents(perPersonCents)}`;

  const depositMap = {};
  activeTrip.deposits.forEach(d => depositMap[d.memberId] = (depositMap[d.memberId] || 0) + d.amountCents);

  const outOfPocketMap = {};
  activeTrip.expenses.forEach(e => {
    if (e.paidByMemberId) outOfPocketMap[e.paidByMemberId] = (outOfPocketMap[e.paidByMemberId] || 0) + e.totalAmountCents;
  });

  const shareMap = {};
  activeTrip.expenses.forEach(e => {
    e.splits.forEach(s => shareMap[s.memberId] = (shareMap[s.memberId] || 0) + s.amountCents);
  });

  const summaries = activeTrip.members.map(m => {
    const deposited = depositMap[m.id] || 0;
    const outOfPocket = outOfPocketMap[m.id] || 0;
    const share = shareMap[m.id] || 0;
    const totalPaid = deposited + outOfPocket;
    const net = totalPaid - share;

    return { member: m, totalPaid, share, net };
  });

  // Table
  const tbody = document.getElementById('settlementTableBody');
  if (summaries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-muted">No members added yet.</td></tr>';
  } else {
    tbody.innerHTML = summaries.map(s => {
      let statusHtml = '';
      if (s.net > 0) statusHtml = `<span style="color: #37B149; font-weight:700;">🟢 Gets Back: ${currency}${formatCents(s.net)}</span>`;
      else if (s.net < 0) statusHtml = `<span style="color: #DC2626; font-weight:700;">🔴 Owes: ${currency}${formatCents(-s.net)}</span>`;
      else statusHtml = `<span style="color: #64748B;">⚪ Settled (0)</span>`;

      return `
        <tr>
          <td><strong>${s.member.name}</strong></td>
          <td>${currency}${formatCents(s.totalPaid)}</td>
          <td>${currency}${formatCents(s.share)}</td>
          <td>${statusHtml}</td>
        </tr>
      `;
    }).join('');
  }

  // Greedy Debt Simplifier Algorithm
  const creditors = summaries.filter(s => s.net > 0).map(s => ({ name: s.member.name, amount: s.net }));
  const debtors = summaries.filter(s => s.net < 0).map(s => ({ name: s.member.name, amount: -s.net }));

  const transactions = [];
  while (creditors.length > 0 && debtors.length > 0) {
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const debtor = debtors[0];
    const creditor = creditors[0];
    const payment = Math.min(debtor.amount, creditor.amount);

    if (payment > 0) {
      transactions.push({ debtor: debtor.name, creditor: creditor.name, amount: payment });
    }

    debtor.amount -= payment;
    creditor.amount -= payment;

    if (debtor.amount === 0) debtors.shift();
    if (creditor.amount === 0) creditors.shift();
  }

  const txContainer = document.getElementById('debtTransactionsList');
  if (transactions.length === 0) {
    txContainer.innerHTML = '<div class="text-muted">🎉 All member accounts are completely settled!</div>';
  } else {
    txContainer.innerHTML = transactions.map(tx => `
      <div class="debt-card">
        <div>
          <strong style="color:#DC2626;">${tx.debtor}</strong> pays to <strong style="color:#37B149;">${tx.creditor}</strong>
        </div>
        <div class="debt-amount">${currency}${formatCents(tx.amount)}</div>
      </div>
    `).join('');
  }
}

function exportPdfReport() {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return alert('No active tour selected!');

  const currency = activeTrip.currency || 'BDT ';
  const totalFund = activeTrip.deposits.reduce((acc, d) => acc + d.amountCents, 0);
  const totalSpent = activeTrip.expenses.reduce((acc, e) => acc + e.totalAmountCents, 0);
  const remainingCash = totalFund - totalSpent;
  const todayStr = new Date().toISOString().split('T')[0];

  // Populate PDF Invoice Header & Metrics
  document.getElementById('pdfInvTitle').textContent = activeTrip.title;
  document.getElementById('pdfInvDest').textContent = `📍 ${activeTrip.destination}`;
  document.getElementById('pdfInvDate').textContent = `Report Date: ${todayStr}`;
  document.getElementById('pdfInvStatus').textContent = `Status: ${activeTrip.status || 'IN_PROGRESS'}`;

  document.getElementById('pdfInvTotalFund').textContent = `${currency}${formatCents(totalFund)}`;
  document.getElementById('pdfInvTotalSpent').textContent = `${currency}${formatCents(totalSpent)}`;
  document.getElementById('pdfInvRemainingCash').textContent = `${currency}${formatCents(remainingCash)}`;
  document.getElementById('pdfInvMemberCount').textContent = `${activeTrip.members.length} Members`;

  // Member Settlement Breakdown Table
  const depositMap = {};
  activeTrip.deposits.forEach(d => depositMap[d.memberId] = (depositMap[d.memberId] || 0) + d.amountCents);

  const outOfPocketMap = {};
  activeTrip.expenses.forEach(e => {
    if (e.paidByMemberId) outOfPocketMap[e.paidByMemberId] = (outOfPocketMap[e.paidByMemberId] || 0) + e.totalAmountCents;
  });

  const shareMap = {};
  activeTrip.expenses.forEach(e => {
    e.splits.forEach(s => shareMap[s.memberId] = (shareMap[s.memberId] || 0) + s.amountCents);
  });

  const summaries = activeTrip.members.map(m => {
    const deposited = depositMap[m.id] || 0;
    const outOfPocket = outOfPocketMap[m.id] || 0;
    const share = shareMap[m.id] || 0;
    const totalPaid = deposited + outOfPocket;
    const net = totalPaid - share;

    return { member: m, totalPaid, share, net };
  });

  const pdfSettleBody = document.getElementById('pdfInvSettlementBody');
  pdfSettleBody.innerHTML = summaries.map(s => {
    let statusText = '';
    if (s.net > 0) statusText = `🟢 Gets Back: ${currency}${formatCents(s.net)}`;
    else if (s.net < 0) statusText = `🔴 Owes: ${currency}${formatCents(-s.net)}`;
    else statusText = `⚪ Settled (0)`;

    return `
      <tr>
        <td><strong>${s.member.name}</strong></td>
        <td>${currency}${formatCents(s.totalPaid)}</td>
        <td>${currency}${formatCents(s.share)}</td>
        <td>${statusText}</td>
      </tr>
    `;
  }).join('');

  // Who Pays Whom Settlement Cards
  const creditors = summaries.filter(s => s.net > 0).map(s => ({ name: s.member.name, amount: s.net }));
  const debtors = summaries.filter(s => s.net < 0).map(s => ({ name: s.member.name, amount: -s.net }));

  const transactions = [];
  while (creditors.length > 0 && debtors.length > 0) {
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const debtor = debtors[0];
    const creditor = creditors[0];
    const payment = Math.min(debtor.amount, creditor.amount);

    if (payment > 0) {
      transactions.push({ debtor: debtor.name, creditor: creditor.name, amount: payment });
    }

    debtor.amount -= payment;
    creditor.amount -= payment;

    if (debtor.amount === 0) debtors.shift();
    if (creditor.amount === 0) creditors.shift();
  }

  const pdfDebtList = document.getElementById('pdfInvDebtList');
  if (transactions.length === 0) {
    pdfDebtList.innerHTML = '<div style="font-size:13px; color:#64748B;">All member accounts are completely settled.</div>';
  } else {
    pdfDebtList.innerHTML = transactions.map(tx => `
      <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:8px 12px; border-radius:8px; display:flex; justify-content:space-between;">
        <span><strong>${tx.debtor}</strong> pays to <strong>${tx.creditor}</strong></span>
        <strong style="color:#37B149;">${currency}${formatCents(tx.amount)}</strong>
      </div>
    `).join('');
  }

  // Itemized Expenses Table
  const pdfExpBody = document.getElementById('pdfInvExpensesBody');
  if (activeTrip.expenses.length === 0) {
    pdfExpBody.innerHTML = '<tr><td colspan="4" style="color:#64748B;">No expenses logged yet.</td></tr>';
  } else {
    pdfExpBody.innerHTML = activeTrip.expenses.map(e => `
      <tr>
        <td><strong>${e.title}</strong></td>
        <td>${e.category}</td>
        <td>${e.paidByMemberId ? activeTrip.members.find(m => m.id === e.paidByMemberId)?.name : 'Common Fund'}</td>
        <td style="font-weight:800; color:#DC2626;">${currency}${formatCents(e.totalAmountCents)}</td>
      </tr>
    `).join('');
  }

  // Print Window
  window.print();
}

function exportShareableText() {
  const activeTrip = getActiveTrip();
  if (!activeTrip) return;

  const totalFund = activeTrip.deposits.reduce((acc, d) => acc + d.amountCents, 0);
  const totalSpent = activeTrip.expenses.reduce((acc, e) => acc + e.totalAmountCents, 0);
  const currency = activeTrip.currency;

  let text = `✈️ *${activeTrip.title.toUpperCase()} - FINANCIAL SUMMARY REPORT*\n`;
  text += `📍 *Destination:* ${activeTrip.destination}\n`;
  text += `💵 *Total Fund:* ${currency}${formatCents(totalFund)}\n`;
  text += `🛒 *Total Cost:* ${currency}${formatCents(totalSpent)}\n\n`;
  text += `Generated by TourManager App 📱`;

  navigator.clipboard.writeText(text);
  alert('Shareable text summary report copied to clipboard!');
}

function exportBackupJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `TourManager_Backup_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function formatCents(cents) {
  return (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
