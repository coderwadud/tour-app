import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useTour } from '../context/TourContext';
import { Home, Users, PlusCircle } from 'lucide-react-native';

interface BottomNavProps {
  onOpenCreateModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenCreateModal }) => {
  const { activeView, setActiveView } = useTour();
  const { width } = useWindowDimensions();

  // Only render on mobile screens (< 640px)
  if (width >= 640) return null;

  return (
    <View style={styles.bottomBar}>
      {/* Tours Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => setActiveView('home')}
        activeOpacity={0.7}
      >
        <Home size={20} color={activeView === 'home' ? '#37B149' : '#64748B'} />
        <Text style={[styles.tabLabel, activeView === 'home' && styles.tabLabelActive]}>Tours</Text>
      </TouchableOpacity>

      {/* Floating Plus Create Tour Tab */}
      <TouchableOpacity
        style={styles.centerFab}
        onPress={onOpenCreateModal}
        activeOpacity={0.85}
      >
        <View style={styles.fabCircle}>
          <PlusCircle size={26} color="#FFFFFF" />
        </View>
        <Text style={styles.fabLabel}>New Tour</Text>
      </TouchableOpacity>

      {/* Members Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => setActiveView('members')}
        activeOpacity={0.7}
      >
        <Users size={20} color={(activeView === 'members' || activeView === 'member-detail') ? '#37B149' : '#64748B'} />
        <Text style={[styles.tabLabel, (activeView === 'members' || activeView === 'member-detail') && styles.tabLabelActive]}>Members</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    height: 64,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2
  },
  tabLabelActive: {
    color: '#37B149'
  },
  centerFab: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -12
  },
  fabCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#37B149',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#37B149',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6
  },
  fabLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#37B149',
    marginTop: 2
  }
});
