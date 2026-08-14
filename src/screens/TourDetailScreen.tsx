import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, StyleSheet, Share, useWindowDimensions } from 'react-native';
import { useTour } from '../context/TourContext';
import { BudgetAnalyticsCard } from '../components/BudgetAnalyticsCard';
import { formatCents, calculateEqualSplitsAndSettlement } from '../utils/settlement';
import { exportTourPDF } from '../utils/pdfExport';
import { Member, Expense, Deposit, ItineraryItem, ChecklistItem, EmergencyContact } from '../types';
import {
  ArrowLeft, MapPin, UserPlus, PlusCircle, CreditCard,
  BarChart3, Users, Scale, Calendar, PackageCheck, PhoneCall,
  Share2, Pencil, Trash2, CheckSquare, Square, X, Plus, Printer, FileText, ArrowRight
} from 'lucide-react-native';

export const TourDetailScreen: React.FC = () => {
  const {
    activeTrip,
    updateTrip,
    setActiveView,
    addMember,
    updateMember,
    deleteMember,
    addDeposit,
    updateDeposit,
    deleteDeposit,
    addExpense,
    updateExpense,
    deleteExpense,
    addItineraryItem,
    updateItineraryItem,
    toggleItineraryItem,
    deleteItineraryItem,
    addChecklistItem,
    updateChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact
  } = useTour();

  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'expenses' | 'settlement' | 'itinerary' | 'checklist' | 'emergency'>('overview');

  // Modals state for ADD
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Modals state for EDIT
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingItinerary, setEditingItinerary] = useState<ItineraryItem | null>(null);
  const [editingChecklist, setEditingChecklist] = useState<ChecklistItem | null>(null);
  const [editingEmergency, setEditingEmergency] = useState<EmergencyContact | null>(null);

  // Form Inputs for Member
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberRole, setMemberRole] = useState('Member');

  // Form Inputs for Deposit
  const [depositMemberId, setDepositMemberId] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');

  // Form Inputs for Expense
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('FOOD');
  const [expensePayerId, setExpensePayerId] = useState<number | null>(null);

  // Form Inputs for Itinerary
  const [itinDay, setItinDay] = useState('1');
  const [itinTitle, setItinTitle] = useState('');
  const [itinDesc, setItinDesc] = useState('');
  const [itinTime, setItinTime] = useState('');

  // Form Inputs for Checklist
  const [checkItem, setCheckItem] = useState('');
  const [checkCategory, setCheckCategory] = useState('CLOTHING');

  // Form Inputs for Emergency Contact
  const [emergName, setEmergName] = useState('');
  const [emergRelation, setEmergRelation] = useState('');
  const [emergPhone, setEmergPhone] = useState('');

  if (!activeTrip) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setActiveView('home')} style={styles.backBtn}>
          <ArrowLeft size={16} color="#334155" />
          <Text style={styles.backBtnText}>Back to Tours</Text>
        </TouchableOpacity>
        <Text style={styles.emptyText}>No active tour selected.</Text>
      </View>
    );
  }

  const currency = activeTrip.currency || 'BDT ';
  const totalFundCents = activeTrip.deposits.reduce((acc, d) => acc + d.amountCents, 0);
  const totalSpentCents = activeTrip.expenses.reduce((acc, e) => acc + e.totalAmountCents, 0);
  const cashBalanceCents = totalFundCents - totalSpentCents;

  const settlementReport = calculateEqualSplitsAndSettlement(activeTrip);

  // --- MEMBER SUBMIT & EDIT HANDLERS ---
  const handleAddMemberSubmit = () => {
    if (!memberName.trim()) return;
    addMember(activeTrip.id, {
      name: memberName.trim(),
      phone: memberPhone.trim(),
      role: memberRole || 'Member'
    });
    setMemberName('');
    setMemberPhone('');
    setShowMemberModal(false);
  };

  const handleEditMemberSubmit = () => {
    if (!editingMember || !memberName.trim()) return;
    updateMember(activeTrip.id, editingMember.id, {
      name: memberName.trim(),
      phone: memberPhone.trim(),
      role: memberRole || 'Member'
    });
    setEditingMember(null);
  };

  // --- DEPOSIT SUBMIT HANDLERS ---
  const handleAddDepositSubmit = () => {
    const amt = parseFloat(depositAmount);
    if (!depositMemberId || isNaN(amt) || amt <= 0) return;
    addDeposit(activeTrip.id, {
      memberId: depositMemberId,
      amountCents: Math.round(amt * 100),
      date: new Date().toISOString().split('T')[0],
      note: depositNote.trim()
    });
    setDepositAmount('');
    setDepositNote('');
    setShowDepositModal(false);
  };

  // --- EXPENSE SUBMIT & EDIT HANDLERS ---
  const handleAddExpenseSubmit = () => {
    const amt = parseFloat(expenseAmount);
    if (!expenseTitle.trim() || isNaN(amt) || amt <= 0) return;
    addExpense(activeTrip.id, {
      title: expenseTitle.trim(),
      category: expenseCategory,
      totalAmountCents: Math.round(amt * 100),
      paidByMemberId: expensePayerId,
      date: new Date().toISOString().split('T')[0]
    });
    setExpenseTitle('');
    setExpenseAmount('');
    setShowExpenseModal(false);
  };

  const handleEditExpenseSubmit = () => {
    const amt = parseFloat(expenseAmount);
    if (!editingExpense || !expenseTitle.trim() || isNaN(amt) || amt <= 0) return;
    updateExpense(activeTrip.id, editingExpense.id, {
      title: expenseTitle.trim(),
      category: expenseCategory,
      totalAmountCents: Math.round(amt * 100),
      paidByMemberId: expensePayerId
    });
    setEditingExpense(null);
  };

  // --- ITINERARY SUBMIT & EDIT HANDLERS ---
  const handleAddItinerarySubmit = () => {
    if (!itinTitle.trim()) return;
    addItineraryItem(activeTrip.id, {
      dayNumber: parseInt(itinDay) || 1,
      title: itinTitle.trim(),
      description: itinDesc.trim(),
      timeSlot: itinTime.trim() || 'All Day'
    });
    setItinTitle('');
    setItinDesc('');
    setItinTime('');
    setShowItineraryModal(false);
  };

  const handleEditItinerarySubmit = () => {
    if (!editingItinerary || !itinTitle.trim()) return;
    updateItineraryItem(activeTrip.id, editingItinerary.id, {
      dayNumber: parseInt(itinDay) || 1,
      title: itinTitle.trim(),
      description: itinDesc.trim(),
      timeSlot: itinTime.trim() || 'All Day'
    });
    setEditingItinerary(null);
  };

  // --- CHECKLIST SUBMIT & EDIT HANDLERS ---
  const handleAddChecklistSubmit = () => {
    if (!checkItem.trim()) return;
    addChecklistItem(activeTrip.id, {
      item: checkItem.trim(),
      category: checkCategory
    });
    setCheckItem('');
    setShowChecklistModal(false);
  };

  const handleEditChecklistSubmit = () => {
    if (!editingChecklist || !checkItem.trim()) return;
    updateChecklistItem(activeTrip.id, editingChecklist.id, {
      item: checkItem.trim(),
      category: checkCategory
    });
    setEditingChecklist(null);
  };

  // --- EMERGENCY CONTACT SUBMIT & EDIT HANDLERS ---
  const handleAddEmergencySubmit = () => {
    if (!emergName.trim() || !emergPhone.trim()) return;
    addEmergencyContact(activeTrip.id, {
      name: emergName.trim(),
      relation: emergRelation.trim() || 'Emergency',
      phone: emergPhone.trim()
    });
    setEmergName('');
    setEmergRelation('');
    setEmergPhone('');
    setShowEmergencyModal(false);
  };

  const handleEditEmergencySubmit = () => {
    if (!editingEmergency || !emergName.trim() || !emergPhone.trim()) return;
    updateEmergencyContact(activeTrip.id, editingEmergency.id, {
      name: emergName.trim(),
      relation: emergRelation.trim() || 'Emergency',
      phone: emergPhone.trim()
    });
    setEditingEmergency(null);
  };

  const handleShareSummary = async () => {
    let summaryText = `🌴 TOUR LEDGER REPORT: ${activeTrip.title.toUpperCase()}\n`;
    summaryText += `📍 Destination: ${activeTrip.destination}\n`;
    summaryText += `------------------------------------\n`;
    summaryText += `💰 Total Collected: ${currency}${formatCents(totalFundCents)}\n`;
    summaryText += `🛒 Total Spent: ${currency}${formatCents(totalSpentCents)}\n`;
    summaryText += `💵 Cash Balance: ${currency}${formatCents(cashBalanceCents)}\n\n`;

    summaryText += `📊 MEMBER BALANCES:\n`;
    settlementReport.memberBalances.forEach(b => {
      const status = b.netBalanceCents >= 0
        ? `Refund Due: +${currency}${formatCents(b.netBalanceCents)}`
        : `Owes: -${currency}${formatCents(-b.netBalanceCents)}`;
      summaryText += `• ${b.memberName}: ${status}\n`;
    });

    if (settlementReport.debts.length > 0) {
      summaryText += `\n⚖️ SETTLEMENT INSTRUCTIONS:\n`;
      settlementReport.debts.forEach(d => {
        summaryText += `👉 ${d.fromMemberName} pays ${d.toMemberName}: ${currency}${formatCents(d.amountCents)}\n`;
      });
    }

    try {
      await Share.share({ message: summaryText });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => setActiveView('home')} style={styles.backBtn}>
        <ArrowLeft size={16} color="#334155" />
        <Text style={styles.backBtnText}>All Tours</Text>
      </TouchableOpacity>

      {/* Tour Title Header */}
      <View style={styles.tourHeaderCard}>
        <View style={styles.tourHeaderTop}>
          <Text style={styles.tourTitle}>{activeTrip.title}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{activeTrip.status}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <MapPin size={15} color="#475569" />
          <Text style={styles.tourDestination}>{activeTrip.destination}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <Calendar size={14} color="#64748B" />
          <Text style={{ fontSize: 12, color: '#64748B' }}>
            Started: {activeTrip.startDate || 'Today'} {activeTrip.endDate ? `• Completed: ${activeTrip.endDate}` : '• Ongoing'}
          </Text>
        </View>

        {/* Status Switcher Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
          {!isMobile && <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B', marginRight: 4 }}>Change Status:</Text>}
          {(['IN_PROGRESS', 'PENDING', 'COMPLETED'] as const).map(s => (
            <TouchableOpacity
              key={s}
              style={[
                { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
                activeTrip.status === s && { backgroundColor: s === 'COMPLETED' ? '#37B149' : s === 'IN_PROGRESS' ? '#2563EB' : '#D97706', borderColor: 'transparent' }
              ]}
              onPress={() => updateTrip(activeTrip.id, { status: s })}
            >
              <Text style={[{ fontSize: 11, fontWeight: '800', color: '#475569' }, activeTrip.status === s && { color: '#FFFFFF' }]}>
                {s === 'IN_PROGRESS' ? 'In Progress' : s === 'COMPLETED' ? 'Completed' : s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats Summary Bar */}
      <View style={styles.statsGrid}>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>Total Collected</Text>
          <Text style={[styles.statValue, { color: '#37B149' }]}>{currency}{formatCents(totalFundCents)}</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>Total Spent</Text>
          <Text style={[styles.statValue, { color: '#DC2626' }]}>{currency}{formatCents(totalSpentCents)}</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>Cash Balance</Text>
          <Text style={[styles.statValue, { color: '#2563EB' }]}>{currency}{formatCents(cashBalanceCents)}</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statLabel}>Active Members</Text>
          <Text style={styles.statValue}>{activeTrip.members.length} Members</Text>
        </View>
      </View>

      {/* Quick Action Buttons Bar */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => { setMemberName(''); setMemberPhone(''); setShowMemberModal(true); }}>
          <UserPlus size={15} color="#334155" />
          <Text style={styles.actionBtnSecondaryText}>Add Member</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtnPrimary}
          onPress={() => {
            if (activeTrip.members.length > 0) setDepositMemberId(activeTrip.members[0].id);
            setDepositAmount('');
            setShowDepositModal(true);
          }}
        >
          <PlusCircle size={15} color="#FFFFFF" />
          <Text style={styles.actionBtnPrimaryText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => { setExpenseTitle(''); setExpenseAmount(''); setShowExpenseModal(true); }}>
          <CreditCard size={15} color="#334155" />
          <Text style={styles.actionBtnSecondaryText}>Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Target Budget Control Card (Dual-Color Split Progress Bar & Alert) */}
      <BudgetAnalyticsCard trip={activeTrip} />

      {/* Navigation Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'members', label: `Members (${activeTrip.members.length})`, icon: Users },
          { key: 'expenses', label: `Expenses (${activeTrip.expenses.length})`, icon: CreditCard },
          { key: 'settlement', label: 'Settlement Ledger', icon: Scale },
          { key: 'itinerary', label: 'Itinerary', icon: Calendar },
          { key: 'checklist', label: 'Checklist', icon: PackageCheck },
          { key: 'emergency', label: 'Emergency', icon: PhoneCall }
        ].map(tab => {
          const IconComp = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <IconComp size={15} color={activeTab === tab.key ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* TAB CONTENTS */}
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <View style={styles.tabSection}>
          <Text style={styles.subTitle}>Recent Activity</Text>
          {activeTrip.expenses.length === 0 ? (
            <Text style={styles.emptyText}>No expenses logged yet. Tap "Log Expense" above to start.</Text>
          ) : (
            activeTrip.expenses.slice(0, 4).map(e => (
              <View key={e.id} style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{e.title}</Text>
                  <Text style={styles.itemSubtext}>Category: {e.category} | {e.date}</Text>
                </View>
                <Text style={styles.expenseAmount}>{currency}{formatCents(e.totalAmountCents)}</Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* 2. MEMBERS TAB */}
      {activeTab === 'members' && (
        <View style={styles.tabSection}>
          <View style={styles.tabHeaderRow}>
            <Text style={styles.subTitle}>Tour Members ({activeTrip.members.length})</Text>
            <TouchableOpacity style={styles.addSmallBtn} onPress={() => { setMemberName(''); setMemberPhone(''); setShowMemberModal(true); }}>
              <Plus size={14} color="#37B149" />
              <Text style={styles.addSmallBtnText}>Add Member</Text>
            </TouchableOpacity>
          </View>

          {activeTrip.members.map(m => {
            const mDeposits = activeTrip.deposits.filter(d => d.memberId === m.id).reduce((a, b) => a + b.amountCents, 0);
            const mOutPocket = activeTrip.expenses.filter(e => e.paidByMemberId === m.id).reduce((a, b) => a + b.totalAmountCents, 0);
            return (
              <View key={m.id} style={styles.itemCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  <View style={styles.avatarSmall}>
                    <Text style={styles.avatarSmallText}>{m.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{m.name}</Text>
                    <Text style={styles.itemSubtext}>{m.role} • {m.phone || 'No phone'}</Text>
                    <Text style={[styles.itemSubtext, { color: '#37B149', fontWeight: '800' }]}>Dep: {currency}{formatCents(mDeposits)} | Out: {currency}{formatCents(mOutPocket)}</Text>
                  </View>
                </View>

                {/* Edit & Delete Member Actions */}
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity style={styles.actionEditBtn} onPress={() => { setEditingMember(m); setMemberName(m.name); setMemberPhone(m.phone || ''); setMemberRole(m.role); }}>
                    <Pencil size={12} color="#2563EB" />
                    <Text style={styles.actionEditText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionDeleteBtn} onPress={() => deleteMember(activeTrip.id, m.id)}>
                    <Trash2 size={12} color="#DC2626" />
                    <Text style={styles.actionDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 3. EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <View style={styles.tabSection}>
          <View style={styles.tabHeaderRow}>
            <Text style={styles.subTitle}>Logged Expenses ({activeTrip.expenses.length})</Text>
            <TouchableOpacity style={styles.addSmallBtn} onPress={() => { setExpenseTitle(''); setExpenseAmount(''); setShowExpenseModal(true); }}>
              <Plus size={14} color="#37B149" />
              <Text style={styles.addSmallBtnText}>Log Expense</Text>
            </TouchableOpacity>
          </View>

          {activeTrip.expenses.map(e => {
            const payer = activeTrip.members.find(m => m.id === e.paidByMemberId);
            return (
              <View key={e.id} style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{e.title}</Text>
                  <Text style={styles.itemSubtext}>Paid By: {payer ? payer.name : 'Common Fund'} • {e.date}</Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={styles.expenseAmount}>{currency}{formatCents(e.totalAmountCents)}</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity style={styles.actionEditBtn} onPress={() => {
                      setEditingExpense(e);
                      setExpenseTitle(e.title);
                      setExpenseAmount((e.totalAmountCents / 100).toString());
                      setExpenseCategory(e.category);
                      setExpensePayerId(e.paidByMemberId);
                    }}>
                      <Pencil size={12} color="#2563EB" />
                      <Text style={styles.actionEditText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionDeleteBtn} onPress={() => deleteExpense(activeTrip.id, e.id)}>
                      <Trash2 size={12} color="#DC2626" />
                      <Text style={styles.actionDeleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* 4. SETTLEMENT TAB */}
      {activeTab === 'settlement' && (
        <View style={styles.tabSection}>
          <View style={styles.tabHeaderRow}>
            <Text style={styles.subTitle}>Equal Split Settlement Ledger</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                style={[styles.shareBtn, { backgroundColor: '#10B981' }]}
                onPress={() => exportTourPDF(activeTrip, settlementReport)}
              >
                <Printer size={13} color="#FFFFFF" />
                <Text style={styles.shareBtnText}>PDF Statement</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShareSummary}>
                <Share2 size={13} color="#FFFFFF" />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.subText}>Each member's share is calculated equally across all logged expenses.</Text>

          <Text style={[styles.subTitle, { marginTop: 14 }]}>Member Balances</Text>
          {settlementReport.memberBalances.map(b => (
            <View key={b.memberId} style={styles.itemCard}>
              <View>
                <Text style={styles.itemTitle}>{b.memberName}</Text>
                <Text style={styles.itemSubtext}>Dep: {currency}{formatCents(b.totalDepositedCents)} | Out: {currency}{formatCents(b.totalOutPocketCents)}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '800', color: b.netBalanceCents >= 0 ? '#37B149' : '#DC2626' }}>
                {b.netBalanceCents >= 0 ? `+${currency}${formatCents(b.netBalanceCents)}` : `-${currency}${formatCents(-b.netBalanceCents)}`}
              </Text>
            </View>
          ))}

          <Text style={[styles.subTitle, { marginTop: 16 }]}>Recommended Debt Settlements</Text>
          {settlementReport.debts.length === 0 ? (
            <Text style={styles.emptyText}>All balances are fully settled equally!</Text>
          ) : (
            settlementReport.debts.map((d, idx) => (
              <View key={idx} style={[styles.itemCard, { backgroundColor: '#FFF5F5', borderColor: '#FCA5A5' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ArrowRight size={15} color="#DC2626" />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#991B1B' }}>
                    <Text style={{ fontWeight: '800' }}>{d.fromMemberName}</Text> pays <Text style={{ fontWeight: '800' }}>{d.toMemberName}</Text>
                  </Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#DC2626' }}>{currency}{formatCents(d.amountCents)}</Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* 5. ITINERARY TAB */}
      {activeTab === 'itinerary' && (
        <View style={styles.tabSection}>
          <View style={styles.tabHeaderRow}>
            <Text style={styles.subTitle}>Tour Itinerary</Text>
            <TouchableOpacity style={styles.addSmallBtn} onPress={() => { setItinTitle(''); setItinDesc(''); setItinTime(''); setShowItineraryModal(true); }}>
              <Plus size={14} color="#37B149" />
              <Text style={styles.addSmallBtnText}>Add Plan</Text>
            </TouchableOpacity>
          </View>

          {activeTrip.itinerary.map(i => (
            <View key={i.id} style={styles.itemCard}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }} onPress={() => toggleItineraryItem(activeTrip.id, i.id)}>
                {i.completed ? <CheckSquare size={18} color="#37B149" /> : <Square size={18} color="#94A3B8" />}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemTitle, i.completed && { textDecorationLine: 'line-through', color: '#94A3B8' }]}>
                    Day {i.dayNumber}: {i.title}
                  </Text>
                  <Text style={styles.itemSubtext}>{i.timeSlot} • {i.description}</Text>
                </View>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity style={styles.actionEditBtn} onPress={() => { setEditingItinerary(i); setItinDay(i.dayNumber.toString()); setItinTitle(i.title); setItinDesc(i.description); setItinTime(i.timeSlot); }}>
                  <Pencil size={12} color="#2563EB" />
                  <Text style={styles.actionEditText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionDeleteBtn} onPress={() => deleteItineraryItem(activeTrip.id, i.id)}>
                  <Trash2 size={12} color="#DC2626" />
                  <Text style={styles.actionDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 6. CHECKLIST TAB */}
      {activeTab === 'checklist' && (
        <View style={styles.tabSection}>
          <View style={styles.tabHeaderRow}>
            <Text style={styles.subTitle}>Packing Checklist</Text>
            <TouchableOpacity style={styles.addSmallBtn} onPress={() => { setCheckItem(''); setShowChecklistModal(true); }}>
              <Plus size={14} color="#37B149" />
              <Text style={styles.addSmallBtnText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {activeTrip.checklist.map(c => (
            <View key={c.id} style={styles.itemCard}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }} onPress={() => toggleChecklistItem(activeTrip.id, c.id)}>
                {c.packed ? <CheckSquare size={18} color="#37B149" /> : <Square size={18} color="#94A3B8" />}
                <Text style={[styles.itemTitle, c.packed && { textDecorationLine: 'line-through', color: '#94A3B8' }]}>{c.item}</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity style={styles.actionEditBtn} onPress={() => { setEditingChecklist(c); setCheckItem(c.item); setCheckCategory(c.category); }}>
                  <Pencil size={12} color="#2563EB" />
                  <Text style={styles.actionEditText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionDeleteBtn} onPress={() => deleteChecklistItem(activeTrip.id, c.id)}>
                  <Trash2 size={12} color="#DC2626" />
                  <Text style={styles.actionDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 7. EMERGENCY TAB */}
      {activeTab === 'emergency' && (
        <View style={styles.tabSection}>
          <View style={styles.tabHeaderRow}>
            <Text style={styles.subTitle}>Emergency Contacts</Text>
            <TouchableOpacity style={styles.addSmallBtn} onPress={() => { setEmergName(''); setEmergRelation(''); setEmergPhone(''); setShowEmergencyModal(true); }}>
              <Plus size={14} color="#37B149" />
              <Text style={styles.addSmallBtnText}>Add Contact</Text>
            </TouchableOpacity>
          </View>

          {activeTrip.emergencyContacts.map(e => (
            <View key={e.id} style={styles.itemCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{e.name}</Text>
                <Text style={styles.itemSubtext}>{e.relation} • 📞 {e.phone}</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity style={styles.actionEditBtn} onPress={() => { setEditingEmergency(e); setEmergName(e.name); setEmergRelation(e.relation); setEmergPhone(e.phone); }}>
                  <Pencil size={12} color="#2563EB" />
                  <Text style={styles.actionEditText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionDeleteBtn} onPress={() => deleteEmergencyContact(activeTrip.id, e.id)}>
                  <Trash2 size={12} color="#DC2626" />
                  <Text style={styles.actionDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ADD MEMBER MODAL */}
      <Modal visible={showMemberModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Add Member</Text>
              <TouchableOpacity onPress={() => setShowMemberModal(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Member Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Sajid Wadud" value={memberName} onChangeText={setMemberName} />
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput style={styles.input} placeholder="01700000000" value={memberPhone} onChangeText={setMemberPhone} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowMemberModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddMemberSubmit}>
                <Text style={styles.submitBtnText}>Add Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT MEMBER MODAL */}
      <Modal visible={editingMember !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Member</Text>
              <TouchableOpacity onPress={() => setEditingMember(null)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Member Name *</Text>
            <TextInput style={styles.input} value={memberName} onChangeText={setMemberName} />
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput style={styles.input} value={memberPhone} onChangeText={setMemberPhone} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingMember(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleEditMemberSubmit}>
                <Text style={styles.submitBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DEPOSIT FUND MODAL */}
      <Modal visible={showDepositModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Record Deposit</Text>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Select Member *</Text>
            <ScrollView horizontal style={{ marginBottom: 10 }}>
              {activeTrip.members.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.memberSelectChip, depositMemberId === m.id && styles.memberSelectChipActive]}
                  onPress={() => setDepositMemberId(m.id)}
                >
                  <Text style={[styles.memberSelectChipText, depositMemberId === m.id && styles.memberSelectChipTextActive]}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.inputLabel}>Deposit Amount (BDT) *</Text>
            <TextInput style={styles.input} placeholder="5000" keyboardType="numeric" value={depositAmount} onChangeText={setDepositAmount} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDepositModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddDepositSubmit}>
                <Text style={styles.submitBtnText}>Record Deposit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* LOG EXPENSE MODAL */}
      <Modal visible={showExpenseModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Log Expense</Text>
              <TouchableOpacity onPress={() => setShowExpenseModal(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Expense Title *</Text>
            <TextInput style={styles.input} placeholder="e.g. Dinner at Seagull" value={expenseTitle} onChangeText={setExpenseTitle} />
            <Text style={styles.inputLabel}>Amount (BDT) *</Text>
            <TextInput style={styles.input} placeholder="1200" keyboardType="numeric" value={expenseAmount} onChangeText={setExpenseAmount} />
            <Text style={styles.inputLabel}>Who Paid?</Text>
            <ScrollView horizontal style={{ marginBottom: 10 }}>
              <TouchableOpacity
                style={[styles.memberSelectChip, expensePayerId === null && styles.memberSelectChipActive]}
                onPress={() => setExpensePayerId(null)}
              >
                <Text style={[styles.memberSelectChipText, expensePayerId === null && styles.memberSelectChipTextActive]}>Common Fund</Text>
              </TouchableOpacity>
              {activeTrip.members.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.memberSelectChip, expensePayerId === m.id && styles.memberSelectChipActive]}
                  onPress={() => setExpensePayerId(m.id)}
                >
                  <Text style={[styles.memberSelectChipText, expensePayerId === m.id && styles.memberSelectChipTextActive]}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowExpenseModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddExpenseSubmit}>
                <Text style={styles.submitBtnText}>Log Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT EXPENSE MODAL */}
      <Modal visible={editingExpense !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Expense</Text>
              <TouchableOpacity onPress={() => setEditingExpense(null)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Expense Title *</Text>
            <TextInput style={styles.input} value={expenseTitle} onChangeText={setExpenseTitle} />
            <Text style={styles.inputLabel}>Amount (BDT) *</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={expenseAmount} onChangeText={setExpenseAmount} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingExpense(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleEditExpenseSubmit}>
                <Text style={styles.submitBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADD ITINERARY MODAL */}
      <Modal visible={showItineraryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Add Itinerary Plan</Text>
              <TouchableOpacity onPress={() => setShowItineraryModal(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Day Number</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={itinDay} onChangeText={setItinDay} />
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput style={styles.input} placeholder="e.g. Sunset View" value={itinTitle} onChangeText={setItinTitle} />
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput style={styles.input} placeholder="Details" value={itinDesc} onChangeText={setItinDesc} />
            <Text style={styles.inputLabel}>Time Slot</Text>
            <TextInput style={styles.input} placeholder="05:00 PM" value={itinTime} onChangeText={setItinTime} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowItineraryModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddItinerarySubmit}>
                <Text style={styles.submitBtnText}>Add Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT ITINERARY MODAL */}
      <Modal visible={editingItinerary !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Itinerary Plan</Text>
              <TouchableOpacity onPress={() => setEditingItinerary(null)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput style={styles.input} value={itinTitle} onChangeText={setItinTitle} />
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput style={styles.input} value={itinDesc} onChangeText={setItinDesc} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingItinerary(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleEditItinerarySubmit}>
                <Text style={styles.submitBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADD CHECKLIST MODAL */}
      <Modal visible={showChecklistModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Add Packing Item</Text>
              <TouchableOpacity onPress={() => setShowChecklistModal(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Item Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Sunscreen" value={checkItem} onChangeText={setCheckItem} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowChecklistModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddChecklistSubmit}>
                <Text style={styles.submitBtnText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT CHECKLIST MODAL */}
      <Modal visible={editingChecklist !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Packing Item</Text>
              <TouchableOpacity onPress={() => setEditingChecklist(null)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Item Name *</Text>
            <TextInput style={styles.input} value={checkItem} onChangeText={setCheckItem} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingChecklist(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleEditChecklistSubmit}>
                <Text style={styles.submitBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADD EMERGENCY MODAL */}
      <Modal visible={showEmergencyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Add Emergency Contact</Text>
              <TouchableOpacity onPress={() => setShowEmergencyModal(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Contact Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Tourist Police" value={emergName} onChangeText={setEmergName} />
            <Text style={styles.inputLabel}>Relation / Note</Text>
            <TextInput style={styles.input} placeholder="Helpline" value={emergRelation} onChangeText={setEmergRelation} />
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput style={styles.input} placeholder="01320000000" value={emergPhone} onChangeText={setEmergPhone} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEmergencyModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddEmergencySubmit}>
                <Text style={styles.submitBtnText}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT EMERGENCY MODAL */}
      <Modal visible={editingEmergency !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Emergency Contact</Text>
              <TouchableOpacity onPress={() => setEditingEmergency(null)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Contact Name *</Text>
            <TextInput style={styles.input} value={emergName} onChangeText={setEmergName} />
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput style={styles.input} value={emergPhone} onChangeText={setEmergPhone} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingEmergency(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleEditEmergencySubmit}>
                <Text style={styles.submitBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  contentContainer: {
    maxWidth: 1140,
    width: '100%',
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 95
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155'
  },
  tourHeaderCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  tourHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tourTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D'
  },
  tourDestination: {
    fontSize: 13,
    color: '#475569'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  statTile: {
    flex: 1,
    minWidth: 130,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: '#37B149',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4
  },
  actionBtnSecondaryText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800'
  },
  tabsScroll: {
    marginVertical: 16
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8
  },
  tabBtnActive: {
    backgroundColor: '#37B149',
    borderColor: '#37B149'
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B'
  },
  tabBtnTextActive: {
    color: '#FFFFFF'
  },
  tabSection: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  subText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F7EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  addSmallBtnText: {
    color: '#37B149',
    fontSize: 12,
    fontWeight: '800'
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  itemCard: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  itemSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#DC2626'
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#37B149',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarSmallText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  actionEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  actionEditText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB'
  },
  actionDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  actionDeleteText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626'
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    marginVertical: 10
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A'
  },
  memberSelectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  memberSelectChipActive: {
    backgroundColor: '#37B149',
    borderColor: '#37B149'
  },
  memberSelectChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  memberSelectChipTextActive: {
    color: '#FFFFFF'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9'
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700'
  },
  submitBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#37B149'
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
