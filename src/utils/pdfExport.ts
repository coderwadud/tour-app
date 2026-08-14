import { Platform } from 'react-native';
import { Trip, SettlementReport } from '../types';
import { formatCents } from './settlement';

export async function exportTourPDF(trip: Trip, report: SettlementReport): Promise<void> {
  const currency = trip.currency || 'BDT ';
  const totalFundCents = trip.deposits.reduce((acc, d) => acc + d.amountCents, 0);
  const totalSpentCents = trip.expenses.reduce((acc, e) => acc + e.totalAmountCents, 0);
  const cashBalanceCents = totalFundCents - totalSpentCents;
  const targetBudgetCents = (trip.budget || 0) * 100;

  const sanitizeFilename = (trip.title || 'tour_statement').replace(/[^a-zA-Z0-9_-]/g, '_');
  const pdfFilename = `${sanitizeFilename}_statement.pdf`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${pdfFilename}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; font-family: 'Poppins', sans-serif; }
          body { margin: 0; padding: 24px; background: #FFFFFF; color: #0F172A; font-size: 12px; }
          
          .pdf-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 14px; margin-bottom: 16px; }
          .pdf-brand { display: flex; align-items: center; gap: 10px; }
          .pdf-brand-icon { width: 40px; height: 40px; background: #37B149; color: #FFF; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; }
          .pdf-brand-title { font-size: 18px; font-weight: 800; margin: 0; color: #0F172A; }
          .pdf-brand-sub { font-size: 11px; color: #64748B; margin: 0; }

          .pdf-doc-type { text-align: right; }
          .pdf-doc-type h2 { margin: 0; font-size: 15px; color: #37B149; text-transform: uppercase; letter-spacing: 0.5px; }
          .pdf-doc-type p { margin: 2px 0 0; font-size: 10px; color: #64748B; }

          .pdf-tour-info { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; margin-bottom: 16px; display: flex; justify-content: space-between; }
          .pdf-info-block h3 { margin: 0 0 4px; font-size: 15px; color: #0F172A; }
          .pdf-info-block p { margin: 0; font-size: 11px; color: #475569; }

          .pdf-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
          .pdf-stat-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; }
          .pdf-stat-card label { font-size: 10px; color: #64748B; display: block; font-weight: 600; }
          .pdf-stat-card val { font-size: 14px; font-weight: 800; margin-top: 2px; display: block; }

          .pdf-section-title { font-size: 13px; font-weight: 800; color: #0F172A; margin: 16px 0 8px; border-left: 4px solid #37B149; padding-left: 8px; }

          .pdf-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
          .pdf-table th { background: #F1F5F9; color: #475569; text-align: left; padding: 8px; font-weight: 700; border-bottom: 1px solid #CBD5E1; }
          .pdf-table td { padding: 8px; border-bottom: 1px solid #E2E8F0; color: #1E293B; }

          .pdf-badge-refund { background: #DCFCE7; color: #15803D; padding: 3px 6px; border-radius: 4px; font-weight: 800; font-size: 10px; display: inline-block; }
          .pdf-badge-owes { background: #FEE2E2; color: #B91C1C; padding: 3px 6px; border-radius: 4px; font-weight: 800; font-size: 10px; display: inline-block; }

          .pdf-debt-box { background: #FFF5F5; border: 1px solid #FCA5A5; border-radius: 10px; padding: 12px; margin-bottom: 20px; }
          .pdf-debt-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #FECACA; font-size: 11px; }
          .pdf-debt-item:last-child { border-bottom: none; }

          .pdf-footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; color: #94A3B8; font-size: 10px; }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="pdf-header">
          <div class="pdf-brand">
            <div class="pdf-brand-icon">🌴</div>
            <div>
              <h1 class="pdf-brand-title">Tour Manager</h1>
              <p class="pdf-brand-sub">Group Ledger & Financial Statement</p>
            </div>
          </div>
          <div class="pdf-doc-type">
            <h2>INVOICE STATEMENT</h2>
            <p>Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>

        <!-- Tour Info -->
        <div class="pdf-tour-info">
          <div class="pdf-info-block">
            <h3>${trip.title}</h3>
            <p>📍 Destination: ${trip.destination}</p>
          </div>
          <div class="pdf-info-block" style="text-align: right;">
            <p><strong>Status:</strong> ${trip.status}</p>
            <p><strong>Started:</strong> ${trip.startDate || 'Today'} ${trip.endDate ? `| <strong>Completed:</strong> ${trip.endDate}` : ''}</p>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="pdf-stats-grid">
          <div class="pdf-stat-card">
            <label>Total Collected</label>
            <val style="color: #37B149;">${currency}${formatCents(totalFundCents)}</val>
          </div>
          <div class="pdf-stat-card">
            <label>Total Expenses</label>
            <val style="color: #DC2626;">${currency}${formatCents(totalSpentCents)}</val>
          </div>
          <div class="pdf-stat-card">
            <label>Cash Balance</label>
            <val style="color: #2563EB;">${currency}${formatCents(cashBalanceCents)}</val>
          </div>
          <div class="pdf-stat-card">
            <label>Target Budget</label>
            <val style="color: #0F172A;">${targetBudgetCents > 0 ? currency + formatCents(targetBudgetCents) : 'N/A'}</val>
          </div>
        </div>

        <!-- Member Balances Table -->
        <div class="pdf-section-title">1. Member Contributions & Equal Shares</div>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Deposited</th>
              <th>Out-of-Pocket</th>
              <th>Equal Share</th>
              <th>Net Status</th>
            </tr>
          </thead>
          <tbody>
            ${report.memberBalances.map(b => `
              <tr>
                <td><strong>${b.memberName}</strong></td>
                <td>${currency}${formatCents(b.totalDepositedCents)}</td>
                <td>${currency}${formatCents(b.totalOutPocketCents)}</td>
                <td>${currency}${formatCents(b.totalShareCents)}</td>
                <td>
                  <span class="${b.netBalanceCents >= 0 ? 'pdf-badge-refund' : 'pdf-badge-owes'}">
                    ${b.netBalanceCents >= 0 ? `Refund: +${currency}${formatCents(b.netBalanceCents)}` : `Owes: -${currency}${formatCents(-b.netBalanceCents)}`}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Settlement Instructions -->
        ${report.debts.length > 0 ? `
          <div class="pdf-section-title">2. Equal Split Debt Settlements</div>
          <div class="pdf-debt-box">
            ${report.debts.map(d => `
              <div class="pdf-debt-item">
                <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg> <strong>${d.fromMemberName}</strong> pays <strong>${d.toMemberName}</strong></span>
                <span style="font-weight: 800; color: #DC2626;">${currency}${formatCents(d.amountCents)}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Logged Expenses Table -->
        <div class="pdf-section-title">3. Logged Expenses (${trip.expenses.length})</div>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Paid By</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${trip.expenses.map(e => {
              const payer = trip.members.find(m => m.id === e.paidByMemberId);
              return `
                <tr>
                  <td>${e.date}</td>
                  <td><strong>${e.title}</strong></td>
                  <td>${e.category}</td>
                  <td>${payer ? payer.name : 'Common Fund'}</td>
                  <td style="text-align: right; font-weight: 800; color: #DC2626;">${currency}${formatCents(e.totalAmountCents)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Footer -->
        <div class="pdf-footer">
          <div>Tour Manager Application • Auto-generated Ledger Report</div>
          <div>Page 1 of 1</div>
        </div>
      </body>
    </html>
  `;

  // Cross-Platform Execution Logic (Web vs Native Android/iOS App)
  if (Platform.OS === 'web') {
    // 1. WEB EXPORT: HTML2PDF 1-Click File Download
    const container = document.createElement('div');
    container.innerHTML = htmlContent;

    const triggerHtml2PdfDownload = () => {
      const html2pdf = (window as any).html2pdf;
      if (html2pdf) {
        const opt = {
          margin:       [8, 8, 8, 8],
          filename:     pdfFilename,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(container).save();
      } else {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
        }
      }
    };

    if ((window as any).html2pdf) {
      triggerHtml2PdfDownload();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => triggerHtml2PdfDownload();
      script.onerror = () => triggerHtml2PdfDownload();
      document.head.appendChild(script);
    }
  } else {
    // 2. NATIVE ANDROID / IOS EXPORT: expo-print + expo-sharing
    try {
      const Print = require('expo-print');
      const Sharing = require('expo-sharing');
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      console.error('Failed to generate native PDF report', e);
    }
  }
}
