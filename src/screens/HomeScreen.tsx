import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, StyleSheet } from 'react-native';
import { useTour } from '../context/TourContext';
import { formatCents } from '../utils/settlement';
import { Trip } from '../types';
import { Compass, Users, DollarSign, Wallet, MapPin, Calendar, Pencil, Trash2, Plus, X } from 'lucide-react-native';

interface HomeScreenProps {
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ isCreateModalOpen, onCloseCreateModal }) => {
  const { trips, createTrip, updateTrip, deleteTrip, setActiveTripId, setActiveView } = useTour();
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'IN_PROGRESS' | 'PENDING' | 'COMPLETED'>('ALL');

  // Create Form State
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('BDT ');

  // Edit Form State
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDestination, setEditDestination] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editStatus, setEditStatus] = useState<'IN_PROGRESS' | 'PENDING' | 'COMPLETED'>('IN_PROGRESS');

  // Compute Overall Stats
  const totalTours = trips.length;

  const memberNamesSet = new Set<string>();
  trips.forEach(t => {
    t.members.forEach(m => memberNamesSet.add(m.name.trim().toLowerCase()));
  });

  const totalSpentCents = trips.reduce((acc, t) => {
    return acc + t.expenses.reduce((eAcc, e) => eAcc + e.totalAmountCents, 0);
  }, 0);

  const totalBudgetCents = trips.reduce((acc, t) => acc + (t.budget || 0) * 100, 0);

  const filteredTrips = trips.filter(t => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const handleCreateSubmit = () => {
    if (!title.trim() || !destination.trim()) return;
    createTrip({
      title: title.trim(),
      destination: destination.trim(),
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      budget: parseFloat(budget) || 0,
      currency: currency || 'BDT ',
      status: 'IN_PROGRESS'
    });

    setTitle('');
    setDestination('');
    setStartDate('');
    setEndDate('');
    setBudget('');
    onCloseCreateModal();
    setActiveView('tour-detail');
  };

  const openEditModal = (trip: Trip) => {
    setEditingTrip(trip);
    setEditTitle(trip.title);
    setEditDestination(trip.destination);
    setEditStartDate(trip.startDate);
    setEditEndDate(trip.endDate);
    setEditBudget(trip.budget.toString());
    setEditStatus(trip.status);
  };

  const handleEditSubmit = () => {
    if (!editingTrip || !editTitle.trim()) return;
    updateTrip(editingTrip.id, {
      title: editTitle.trim(),
      destination: editDestination.trim(),
      startDate: editStartDate,
      endDate: editEndDate,
      budget: parseFloat(editBudget) || 0,
      status: editStatus
    });
    setEditingTrip(null);
  };

  const handleDeleteSubmit = (tripId: number) => {
    deleteTrip(tripId);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Home Overview Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Home Overview</Text>
        <Text style={styles.sectionSubtitle}>Track overall group funds, member contributions & tour budgets</Text>
      </View>

      {/* 4 Overview Stat Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <Text style={styles.statLabel}>Total Tours</Text>
            <Compass size={18} color="#37B149" />
          </View>
          <Text style={[styles.statValue, { color: '#37B149' }]}>{totalTours} Tour{totalTours > 1 ? 's' : ''}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <Text style={styles.statLabel}>Total Members</Text>
            <Users size={18} color="#2563EB" />
          </View>
          <Text style={[styles.statValue, { color: '#2563EB' }]}>{memberNamesSet.size} Member{memberNamesSet.size > 1 ? 's' : ''}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <Text style={styles.statLabel}>Total Money Spent</Text>
            <DollarSign size={18} color="#DC2626" />
          </View>
          <Text style={[styles.statValue, { color: '#DC2626' }]}>BDT {formatCents(totalSpentCents)}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statTopRow}>
            <Text style={styles.statLabel}>Total Tracked Budget</Text>
            <Wallet size={18} color="#059669" />
          </View>
          <Text style={[styles.statValue, { color: '#059669' }]}>BDT {formatCents(totalBudgetCents)}</Text>
        </View>
      </View>

      {/* Filters Bar */}
      <View style={styles.filtersRow}>
        <Text style={styles.filterTitle}>Your Tours ({filteredTrips.length})</Text>
        <View style={styles.filterPills}>
          {(['ALL', 'IN_PROGRESS', 'PENDING', 'COMPLETED'] as const).map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.filterPill, filterStatus === status && styles.filterPillActive]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.filterPillText, filterStatus === status && styles.filterPillTextActive]}>
                {status === 'ALL' ? 'All Tours' : status === 'IN_PROGRESS' ? 'In Progress' : status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tour Cards Grid */}
      {filteredTrips.length === 0 ? (
        <View style={styles.emptyCard}>
          <Compass size={44} color="#37B149" />
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 10 }}>No Tours Found</Text>
          <Text style={[styles.emptyText, { marginTop: 4, marginBottom: 16, textAlign: 'center' }]}>
            Create your first tour to start tracking group budgets and expenses!
          </Text>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#37B149', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }}
            onPress={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>Create Your First Tour</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tripsGrid}>
          {filteredTrips.map(trip => {
            const spentCents = trip.expenses.reduce((acc, e) => acc + e.totalAmountCents, 0);
            return (
              <View key={trip.id} style={styles.tourCard}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => {
                    setActiveTripId(trip.id);
                    setActiveView('tour-detail');
                  }}
                  activeOpacity={0.85}
                >
                  <View style={styles.tourHeader}>
                    <Text style={styles.tourTitle}>{trip.title}</Text>
                    <View style={[
                      styles.statusBadge,
                      trip.status === 'IN_PROGRESS' ? styles.statusInProgress : trip.status === 'PENDING' ? styles.statusPending : styles.statusCompleted
                    ]}>
                      <Text style={styles.statusBadgeText}>{trip.status}</Text>
                    </View>
                  </View>

                  <View style={styles.iconInfoRow}>
                    <MapPin size={14} color="#64748B" />
                    <Text style={styles.tourDestination}>{trip.destination}</Text>
                  </View>

                  <View style={styles.iconInfoRow}>
                    <Calendar size={14} color="#64748B" />
                    <Text style={styles.tourDates}>
                      Started: {trip.startDate || 'Today'} {trip.endDate ? `• Completed: ${trip.endDate}` : '• Ongoing'}
                    </Text>
                  </View>

                  <View style={styles.tourFooter}>
                    <View>
                      <Text style={styles.tourFooterLabel}>Target Budget</Text>
                      <Text style={styles.tourFooterValue}>{trip.currency || 'BDT '}{formatCents((trip.budget || 0) * 100)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.tourFooterLabel}>Spent So Far</Text>
                      <Text style={[styles.tourFooterValue, { color: '#DC2626' }]}>{trip.currency || 'BDT '}{formatCents(spentCents)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Edit & Delete Actions */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(trip)}>
                    <Pencil size={13} color="#2563EB" />
                    <Text style={styles.editBtnText}>Edit Tour</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteSubmit(trip.id)}>
                    <Trash2 size={13} color="#DC2626" />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Modal to Create New Tour */}
      <Modal visible={isCreateModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Create New Tour</Text>
              <TouchableOpacity onPress={onCloseCreateModal}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Tour Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Cox's Bazar Sea Tour"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.inputLabel}>Destination *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Cox's Bazar"
              value={destination}
              onChangeText={setDestination}
            />

            <Text style={styles.inputLabel}>Target Budget (BDT)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 25000"
              keyboardType="numeric"
              value={budget}
              onChangeText={setBudget}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onCloseCreateModal}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateSubmit}>
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Create Tour</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal to Edit Tour */}
      <Modal visible={editingTrip !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Tour Details</Text>
              <TouchableOpacity onPress={() => setEditingTrip(null)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Tour Title *</Text>
            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
            />

            <Text style={styles.inputLabel}>Destination *</Text>
            <TextInput
              style={styles.input}
              value={editDestination}
              onChangeText={setEditDestination}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  value={editStartDate}
                  onChangeText={setEditStartDate}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>End Date</Text>
                <TextInput
                  style={styles.input}
                  value={editEndDate}
                  onChangeText={setEditEndDate}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Target Budget (BDT)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={editBudget}
              onChangeText={setEditBudget}
            />

            <Text style={styles.inputLabel}>Tour Status</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              {(['IN_PROGRESS', 'PENDING', 'COMPLETED'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.filterPill, editStatus === s && styles.filterPillActive]}
                  onPress={() => setEditStatus(s)}
                >
                  <Text style={[styles.filterPillText, editStatus === s && styles.filterPillTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingTrip(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleEditSubmit}>
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
  sectionHeader: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A'
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  statTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800'
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  filterPills: {
    flexDirection: 'row',
    gap: 6
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  filterPillActive: {
    backgroundColor: '#37B149',
    borderColor: '#37B149'
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B'
  },
  filterPillTextActive: {
    color: '#FFFFFF'
  },
  tripsGrid: {
    gap: 14
  },
  tourCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  tourTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusInProgress: {
    backgroundColor: '#DCFCE7'
  },
  statusPending: {
    backgroundColor: '#FEF3C7'
  },
  statusCompleted: {
    backgroundColor: '#E2E8F0'
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A'
  },
  iconInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  tourDestination: {
    fontSize: 13,
    color: '#475569'
  },
  tourDates: {
    fontSize: 12,
    color: '#64748B'
  },
  tourFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  tourFooterLabel: {
    fontSize: 11,
    color: '#64748B'
  },
  tourFooterValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB'
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626'
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B'
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
    marginBottom: 16
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
  rowInputs: {
    flexDirection: 'row',
    gap: 10
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 24
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
