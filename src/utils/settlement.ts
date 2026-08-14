import { Trip, MemberBalance, SettlementDebt, SettlementReport } from '../types';

export function calculateEqualSplitsAndSettlement(trip: Trip): SettlementReport {
  const members = trip.members || [];
  const memberBalances: MemberBalance[] = [];

  if (members.length === 0) {
    return { memberBalances: [], debts: [] };
  }

  // Recalculate expenses splits equally across members if splits are missing or unequal
  trip.expenses.forEach(expense => {
    const splitCount = members.length;
    const baseSplit = Math.floor(expense.totalAmountCents / splitCount);
    const remainder = expense.totalAmountCents % splitCount;

    expense.splits = members.map((member, idx) => ({
      memberId: member.id,
      splitAmountCents: baseSplit + (idx < remainder ? 1 : 0)
    }));
  });

  // Calculate totals per member
  members.forEach(member => {
    const totalDepositedCents = trip.deposits
      .filter(d => d.memberId === member.id)
      .reduce((acc, d) => acc + d.amountCents, 0);

    const totalOutPocketCents = trip.expenses
      .filter(e => e.paidByMemberId === member.id)
      .reduce((acc, e) => acc + e.totalAmountCents, 0);

    const totalShareCents = trip.expenses.reduce((acc, expense) => {
      const split = expense.splits.find(s => s.memberId === member.id);
      return acc + (split ? split.splitAmountCents : 0);
    }, 0);

    // Net Balance = (Total Deposited + Total Out-of-Pocket Spent) - Total Share
    const netBalanceCents = (totalDepositedCents + totalOutPocketCents) - totalShareCents;

    memberBalances.push({
      memberId: member.id,
      memberName: member.name,
      totalDepositedCents,
      totalOutPocketCents,
      totalShareCents,
      netBalanceCents
    });
  });

  // Calculate minimal debt settlements using greedy algorithm
  const debtors = memberBalances
    .filter(b => b.netBalanceCents < 0)
    .map(b => ({ ...b, remainingDeficit: -b.netBalanceCents }))
    .sort((a, b) => b.remainingDeficit - a.remainingDeficit);

  const creditors = memberBalances
    .filter(b => b.netBalanceCents > 0)
    .map(b => ({ ...b, remainingSurplus: b.netBalanceCents }))
    .sort((a, b) => b.remainingSurplus - a.remainingSurplus);

  const debts: SettlementDebt[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settlementAmount = Math.min(debtor.remainingDeficit, creditor.remainingSurplus);
    if (settlementAmount > 0) {
      debts.push({
        fromMemberId: debtor.memberId,
        fromMemberName: debtor.memberName,
        toMemberId: creditor.memberId,
        toMemberName: creditor.memberName,
        amountCents: settlementAmount
      });

      debtor.remainingDeficit -= settlementAmount;
      creditor.remainingSurplus -= settlementAmount;
    }

    if (debtor.remainingDeficit === 0) dIdx++;
    if (creditor.remainingSurplus === 0) cIdx++;
  }

  return { memberBalances, debts };
}

export function formatCents(cents: number): string {
  const amount = (cents || 0) / 100;
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
