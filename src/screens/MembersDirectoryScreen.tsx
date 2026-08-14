import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTour } from '../context/TourContext';
import { formatCents } from '../utils/settlement';
import { Trip, Member } from '../types';
import { ArrowLeft, Phone, MapPin, ChevronRight } from 'lucide-react-native';

export const MembersDirectoryScreen: React.FC = () => {
  const { trips, activeView, activeMemberName, setActiveMemberName, setActiveView, setActiveTripId } = useTour();

  // Aggregate all members across tours by normalized name
  const membersMap = new Map<string, {
    name: string;
    phone: string;
    toursCount: number;
    totalDepositedCents: number;
    totalOutPocketCents: number;
    toursList: { trip: Trip; member: Member; memberDeposits: number; memberOutPocket: number }[];
  }>();

  trips.forEach(trip => {
    trip.members.forEach(member => {
      const key = member.name.trim().toLowerCase();
      if (!membersMap.has(key)) {
        membersMap.set(key, {
          name: member.name.trim(),
          phone: member.phone || '',
          toursCount: 0,
          totalDepositedCents: 0,
          totalOutPocketCents: 0,
          toursList: []
        });
      }

      const mObj = membersMap.get(key)!;
      mObj.toursCount += 1;
      if (member.phone && !mObj.phone) mObj.phone = member.phone;

      const memberDeposits = trip.deposits.filter(d => d.memberId === member.id).reduce((a, b) => a + b.amountCents, 0);
      const memberOutPocket = trip.expenses.filter(e => e.paidByMemberId === member.id).reduce((a, b) => a + b.totalAmountCents, 0);

      mObj.totalDepositedCents += memberDeposits;
      mObj.totalOutPocketCents += memberOutPocket;
      mObj.toursList.push({ trip, member, memberDeposits, memberOutPocket });
    });
  });

  const allMembersList = Array.from(membersMap.values());

  // RENDER MEMBER PROFILE DETAIL VIEW
  if (activeView === 'member-detail' && activeMemberName) {
    const key = activeMemberName.trim().toLowerCase();
    const memberData = membersMap.get(key);

    if (!memberData) {
      return (
        <View style={styles.container}>
          <TouchableOpacity onPress={() => setActiveView('members')} style={styles.backBtn}>
            <ArrowLeft size={16} color="#334155" />
            <Text style={styles.backBtnText}>Back to Members</Text>
          </TouchableOpacity>
          <Text style={styles.emptyText}>Member profile not found.</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity onPress={() => setActiveView('members')} style={styles.backBtn}>
          <ArrowLeft size={16} color="#334155" />
          <Text style={styles.backBtnText}>Back to Members Directory</Text>
        </TouchableOpacity>

        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>{memberData.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{memberData.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Phone size={14} color="#64748B" />
              <Text style={styles.profilePhone}>{memberData.phone || 'No phone number'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Tours Joined</Text>
            <Text style={styles.statValue}>{memberData.toursCount} Tour{memberData.toursCount > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Deposited</Text>
            <Text style={[styles.statValue, { color: '#37B149' }]}>BDT {formatCents(memberData.totalDepositedCents)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Out-Of-Pocket</Text>
            <Text style={[styles.statValue, { color: '#2563EB' }]}>BDT {formatCents(memberData.totalOutPocketCents)}</Text>
          </View>
        </View>

        <Text style={styles.subSectionTitle}>Tours Joined ({memberData.toursList.length})</Text>

        <View style={styles.tripsGrid}>
          {memberData.toursList.map(item => (
            <TouchableOpacity
              key={item.trip.id}
              style={styles.tourCard}
              onPress={() => {
                setActiveTripId(item.trip.id);
                setActiveView('tour-detail');
              }}
            >
              <View style={styles.tourHeader}>
                <Text style={styles.tourTitle}>{item.trip.title}</Text>
                <Text style={styles.roleTag}>Role: {item.member.role}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <MapPin size={13} color="#475569" />
                <Text style={styles.tourDestination}>{item.trip.destination}</Text>
              </View>

              <View style={styles.memberPaidRow}>
                <Text style={styles.memberPaidLabel}>Deposited: BDT {formatCents(item.memberDeposits)}</Text>
                <Text style={styles.memberPaidLabel}>Out-Of-Pocket: BDT {formatCents(item.memberOutPocket)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  // RENDER ALL MEMBERS DIRECTORY LIST
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Members Directory</Text>
        <Text style={styles.sectionSubtitle}>View registered members across all tours and their total contributions</Text>
      </View>

      {allMembersList.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No members registered across any tours yet.</Text>
        </View>
      ) : (
        <View style={styles.membersGrid}>
          {allMembersList.map(m => (
            <TouchableOpacity
              key={m.name}
              style={styles.memberCard}
              onPress={() => {
                setActiveMemberName(m.name);
                setActiveView('member-detail');
              }}
              activeOpacity={0.8}
            >
              <View style={styles.memberCardLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{m.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.memberToursCount}>{m.toursCount} Tour{m.toursCount > 1 ? 's' : ''} Joined</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.profileBtnText}>Profile</Text>
                <ChevronRight size={16} color="#37B149" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 16,
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
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#37B149',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarTextLarge: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A'
  },
  profilePhone: {
    fontSize: 13,
    color: '#64748B'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12
  },
  membersGrid: {
    gap: 12
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  memberCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#37B149',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  memberName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  memberToursCount: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  profileBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#37B149'
  },
  tourCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10
  },
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  tourTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A'
  },
  roleTag: {
    fontSize: 12,
    color: '#64748B'
  },
  tourDestination: {
    fontSize: 13,
    color: '#475569'
  },
  memberPaidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  memberPaidLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155'
  },
  tripsGrid: {
    gap: 10
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
  }
});
