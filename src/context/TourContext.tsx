import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, Member, Deposit, Expense, ItineraryItem, ChecklistItem, EmergencyContact } from '../types';
import { INITIAL_TRIPS } from '../utils/initialData';
import { calculateEqualSplitsAndSettlement } from '../utils/settlement';

const STORAGE_KEY = '@tour_manager_trips_v2';
const ACTIVE_TRIP_KEY = '@tour_manager_active_trip_v2';

interface TourContextType {
  trips: Trip[];
  activeTrip: Trip | null;
  activeTripId: number | null;
  activeView: 'home' | 'members' | 'member-detail' | 'tour-detail';
  activeMemberName: string | null;
  setActiveTripId: (id: number | null) => void;
  setActiveView: (view: 'home' | 'members' | 'member-detail' | 'tour-detail') => void;
  setActiveMemberName: (name: string | null) => void;

  // Import / Export Backup
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;

  // Tour CRUD
  createTrip: (tripData: Omit<Trip, 'id' | 'members' | 'deposits' | 'expenses' | 'itinerary' | 'checklist' | 'emergencyContacts'>) => void;
  updateTrip: (tripId: number, updatedFields: Partial<Trip>) => void;
  deleteTrip: (tripId: number) => void;

  // Member CRUD
  addMember: (tripId: number, member: Omit<Member, 'id'>) => void;
  updateMember: (tripId: number, memberId: number, memberData: Partial<Member>) => void;
  deleteMember: (tripId: number, memberId: number) => void;

  // Deposit CRUD
  addDeposit: (tripId: number, deposit: Omit<Deposit, 'id'>) => void;
  updateDeposit: (tripId: number, depositId: number, depositData: Partial<Deposit>) => void;
  deleteDeposit: (tripId: number, depositId: number) => void;

  // Expense CRUD
  addExpense: (tripId: number, expense: Omit<Expense, 'id' | 'splits'>) => void;
  updateExpense: (tripId: number, expenseId: number, expenseData: Partial<Expense>) => void;
  deleteExpense: (tripId: number, expenseId: number) => void;

  // Itinerary CRUD
  addItineraryItem: (tripId: number, item: Omit<ItineraryItem, 'id' | 'completed'>) => void;
  updateItineraryItem: (tripId: number, itemId: number, itemData: Partial<ItineraryItem>) => void;
  toggleItineraryItem: (tripId: number, itemId: number) => void;
  deleteItineraryItem: (tripId: number, itemId: number) => void;

  // Checklist CRUD
  addChecklistItem: (tripId: number, item: Omit<ChecklistItem, 'id' | 'packed'>) => void;
  updateChecklistItem: (tripId: number, itemId: number, itemData: Partial<ChecklistItem>) => void;
  toggleChecklistItem: (tripId: number, itemId: number) => void;
  deleteChecklistItem: (tripId: number, itemId: number) => void;

  // Emergency Contact CRUD
  addEmergencyContact: (tripId: number, contact: Omit<EmergencyContact, 'id'>) => void;
  updateEmergencyContact: (tripId: number, contactId: number, contactData: Partial<EmergencyContact>) => void;
  deleteEmergencyContact: (tripId: number, contactId: number) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [activeTripId, setActiveTripIdState] = useState<number | null>(1);
  const [activeView, setActiveView] = useState<'home' | 'members' | 'member-detail' | 'tour-detail'>('home');
  const [activeMemberName, setActiveMemberName] = useState<string | null>(null);

  // Load from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const storedTrips = await AsyncStorage.getItem(STORAGE_KEY);
        const storedActiveId = await AsyncStorage.getItem(ACTIVE_TRIP_KEY);
        if (storedTrips) {
          const parsed = JSON.parse(storedTrips);
          setTrips(parsed);
        }
        if (storedActiveId) {
          setActiveTripIdState(JSON.parse(storedActiveId));
        }
      } catch (e) {
        console.error('Failed to load trips from storage', e);
      }
    })();
  }, []);

  // Save to AsyncStorage
  const saveTrips = async (newTrips: Trip[]) => {
    setTrips(newTrips);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTrips));
    } catch (e) {
      console.error('Failed to save trips to storage', e);
    }
  };

  const setActiveTripId = async (id: number | null) => {
    setActiveTripIdState(id);
    try {
      await AsyncStorage.setItem(ACTIVE_TRIP_KEY, JSON.stringify(id));
    } catch (e) {
      console.error('Failed to save active trip id', e);
    }
  };

  const activeTrip = trips.find(t => t.id === activeTripId) || (trips.length > 0 ? trips[0] : null);

  // EXPORT / IMPORT BACKUP
  const exportDataJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trips, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `tour_manager_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        saveTrips(parsed);
        if (parsed.length > 0) {
          setActiveTripId(parsed[0].id);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  // 1. TOUR CRUD
  const createTrip = (tripData: Omit<Trip, 'id' | 'members' | 'deposits' | 'expenses' | 'itinerary' | 'checklist' | 'emergencyContacts'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newTrip: Trip = {
      ...tripData,
      startDate: tripData.startDate || today,
      endDate: tripData.endDate || '',
      id: Date.now(),
      members: [],
      deposits: [],
      expenses: [],
      itinerary: [],
      checklist: [],
      emergencyContacts: []
    };
    const updated = [newTrip, ...trips];
    saveTrips(updated);
    setActiveTripId(newTrip.id);
  };

  const updateTrip = (tripId: number, updatedFields: Partial<Trip>) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = trips.map(t => {
      if (t.id !== tripId) return t;
      const newFields = { ...updatedFields };
      if (newFields.status === 'COMPLETED' && !newFields.endDate && !t.endDate) {
        newFields.endDate = today;
      }
      return { ...t, ...newFields };
    });
    saveTrips(updated);
  };

  const deleteTrip = (tripId: number) => {
    const updated = trips.filter(t => t.id !== tripId);
    saveTrips(updated);
    if (activeTripId === tripId) {
      const nextTrip = updated.length > 0 ? updated[0].id : null;
      setActiveTripId(nextTrip);
      setActiveView('home');
    }
  };

  // 2. MEMBER CRUD
  const addMember = (tripId: number, memberData: Omit<Member, 'id'>) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const newMember: Member = { ...memberData, id: Date.now() };
      const newMembers = [...trip.members, newMember];
      const updatedTrip = { ...trip, members: newMembers };
      calculateEqualSplitsAndSettlement(updatedTrip);
      return updatedTrip;
    });
    saveTrips(updated);
  };

  const updateMember = (tripId: number, memberId: number, memberData: Partial<Member>) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const updatedMembers = trip.members.map(m => m.id === memberId ? { ...m, ...memberData } : m);
      const updatedTrip = { ...trip, members: updatedMembers };
      calculateEqualSplitsAndSettlement(updatedTrip);
      return updatedTrip;
    });
    saveTrips(updated);
  };

  const deleteMember = (tripId: number, memberId: number) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const updatedMembers = trip.members.filter(m => m.id !== memberId);
      const updatedDeposits = trip.deposits.filter(d => d.memberId !== memberId);
      const updatedExpenses = trip.expenses.filter(e => e.paidByMemberId !== memberId);
      const updatedTrip = { ...trip, members: updatedMembers, deposits: updatedDeposits, expenses: updatedExpenses };
      calculateEqualSplitsAndSettlement(updatedTrip);
      return updatedTrip;
    });
    saveTrips(updated);
  };

  // 3. DEPOSIT CRUD
  const addDeposit = (tripId: number, depositData: Omit<Deposit, 'id'>) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const newDeposit: Deposit = { ...depositData, id: Date.now() };
      return { ...trip, deposits: [newDeposit, ...trip.deposits] };
    });
    saveTrips(updated);
  };

  const updateDeposit = (tripId: number, depositId: number, depositData: Partial<Deposit>) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const updatedDeposits = trip.deposits.map(d => d.id === depositId ? { ...d, ...depositData } : d);
      return { ...trip, deposits: updatedDeposits };
    });
    saveTrips(updated);
  };

  const deleteDeposit = (tripId: number, depositId: number) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const updatedDeposits = trip.deposits.filter(d => d.id !== depositId);
      return { ...trip, deposits: updatedDeposits };
    });
    saveTrips(updated);
  };

  // 4. EXPENSE CRUD
  const addExpense = (tripId: number, expenseData: Omit<Expense, 'id' | 'splits'>) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const newExpense: Expense = {
        ...expenseData,
        id: Date.now(),
        splits: []
      };
      const updatedTrip = { ...trip, expenses: [newExpense, ...trip.expenses] };
      calculateEqualSplitsAndSettlement(updatedTrip);
      return updatedTrip;
    });
    saveTrips(updated);
  };

  const updateExpense = (tripId: number, expenseId: number, expenseData: Partial<Expense>) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const updatedExpenses = trip.expenses.map(e => e.id === expenseId ? { ...e, ...expenseData } : e);
      const updatedTrip = { ...trip, expenses: updatedExpenses };
      calculateEqualSplitsAndSettlement(updatedTrip);
      return updatedTrip;
    });
    saveTrips(updated);
  };

  const deleteExpense = (tripId: number, expenseId: number) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const filtered = trip.expenses.filter(e => e.id !== expenseId);
      const updatedTrip = { ...trip, expenses: filtered };
      calculateEqualSplitsAndSettlement(updatedTrip);
      return updatedTrip;
    });
    saveTrips(updated);
  };

  // 5. ITINERARY CRUD
  const addItineraryItem = (tripId: number, itemData: Omit<ItineraryItem, 'id' | 'completed'>) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const newItem: ItineraryItem = { ...itemData, id: Date.now(), completed: false };
      return { ...trip, itinerary: [...trip.itinerary, newItem] };
    });
    saveTrips(updated);
  };

  const updateItineraryItem = (tripId: number, itemId: number, itemData: Partial<ItineraryItem>) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const updatedItinerary = trip.itinerary.map(i => i.id === itemId ? { ...i, ...itemData } : i);
      return { ...trip, itinerary: updatedItinerary };
    });
    saveTrips(updated);
  };

  const toggleItineraryItem = (tripId: number, itemId: number) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const updatedItinerary = trip.itinerary.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i);
      return { ...trip, itinerary: updatedItinerary };
    });
    saveTrips(updated);
  };

  const deleteItineraryItem = (tripId: number, itemId: number) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const updatedItinerary = trip.itinerary.filter(i => i.id !== itemId);
      return { ...trip, itinerary: updatedItinerary };
    });
    saveTrips(updated);
  };

  // 6. CHECKLIST CRUD
  const addChecklistItem = (tripId: number, itemData: Omit<ChecklistItem, 'id' | 'packed'>) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const newItem: ChecklistItem = { ...itemData, id: Date.now(), packed: false };
      return { ...trip, checklist: [...trip.checklist, newItem] };
    });
    saveTrips(updated);
  };

  const updateChecklistItem = (tripId: number, itemId: number, itemData: Partial<ChecklistItem>) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const updatedChecklist = trip.checklist.map(c => c.id === itemId ? { ...c, ...itemData } : c);
      return { ...trip, checklist: updatedChecklist };
    });
    saveTrips(updated);
  };

  const toggleChecklistItem = (tripId: number, itemId: number) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const updatedChecklist = trip.checklist.map(c => c.id === itemId ? { ...c, packed: !c.packed } : c);
      return { ...trip, checklist: updatedChecklist };
    });
    saveTrips(updated);
  };

  const deleteChecklistItem = (tripId: number, itemId: number) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const updatedChecklist = trip.checklist.filter(c => c.id !== itemId);
      return { ...trip, checklist: updatedChecklist };
    });
    saveTrips(updated);
  };

  // 7. EMERGENCY CONTACT CRUD
  const addEmergencyContact = (tripId: number, contactData: Omit<EmergencyContact, 'id'>) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const newContact: EmergencyContact = { ...contactData, id: Date.now() };
      return { ...trip, emergencyContacts: [...trip.emergencyContacts, newContact] };
    });
    saveTrips(updated);
  };

  const updateEmergencyContact = (tripId: number, contactId: number, contactData: Partial<EmergencyContact>) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const updatedContacts = trip.emergencyContacts.map(c => c.id === contactId ? { ...c, ...contactData } : c);
      return { ...trip, emergencyContacts: updatedContacts };
    });
    saveTrips(updated);
  };

  const deleteEmergencyContact = (tripId: number, contactId: number) => {
    const updated = trips.map(trip => {
      if (trip.id !== tripId) return trip;
      const updatedContacts = trip.emergencyContacts.filter(c => c.id !== contactId);
      return { ...trip, emergencyContacts: updatedContacts };
    });
    saveTrips(updated);
  };

  return (
    <TourContext.Provider
      value={{
        trips,
        activeTrip,
        activeTripId,
        activeView,
        activeMemberName,
        setActiveTripId,
        setActiveView,
        setActiveMemberName,
        exportDataJSON,
        importDataJSON,
        createTrip,
        updateTrip,
        deleteTrip,
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
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
