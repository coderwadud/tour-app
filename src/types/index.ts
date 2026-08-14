export interface Member {
  id: number;
  name: string;
  phone?: string;
  role: string;
  colorHex?: string;
}

export interface Deposit {
  id: number;
  memberId: number;
  amountCents: number;
  date: string; // ISO date string
  note?: string;
}

export interface Expense {
  id: number;
  title: string;
  category: string;
  totalAmountCents: number;
  paidByMemberId: number | null; // null means paid from common fund
  date: string; // ISO date string
  splits: {
    memberId: number;
    splitAmountCents: number;
  }[];
}

export interface ItineraryItem {
  id: number;
  dayNumber: number;
  title: string;
  description: string;
  timeSlot: string;
  completed: boolean;
}

export interface ChecklistItem {
  id: number;
  item: string;
  category: string;
  packed: boolean;
}

export interface EmergencyContact {
  id: number;
  name: string;
  relation: string;
  phone: string;
}

export interface Trip {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number; // Target Budget in major currency unit (e.g. BDT)
  currency: string;
  status: 'IN_PROGRESS' | 'PENDING' | 'COMPLETED';
  members: Member[];
  deposits: Deposit[];
  expenses: Expense[];
  itinerary: ItineraryItem[];
  checklist: ChecklistItem[];
  emergencyContacts: EmergencyContact[];
}

export interface SettlementDebt {
  fromMemberId: number;
  fromMemberName: string;
  toMemberId: number;
  toMemberName: string;
  amountCents: number;
}

export interface MemberBalance {
  memberId: number;
  memberName: string;
  totalDepositedCents: number;
  totalOutPocketCents: number;
  totalShareCents: number;
  netBalanceCents: number; // Positive = Refund due to member; Negative = Member owes money
}

export interface SettlementReport {
  memberBalances: MemberBalance[];
  debts: SettlementDebt[];
}
