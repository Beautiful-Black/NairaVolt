import { FileDown } from 'lucide-react';
import { type UserAppliance, type TariffBand } from '@/data/appliances';

interface PdfExportProps {
  appliances: UserAppliance[];
  band: TariffBand;
  totalDaily: number;
  totalMonthly: number;
  profileName?: string;
}

const PdfExport = ({ appliances, band, totalDaily, totalMonthly, profileName }: PdfExportProps) => {
  const handleExport = () => {
    const title = profileName || 'Energy Audit';
    const date = new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });

    const heavyHitters = appliances.filter(ua => totalMonthly > 0 && (ua.monthlyCost / totalMonthly) > 0.4);

    const rows = appliances.map(ua => {
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${ua.appliance.icon} ${ua.appliance.name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px;">${ua.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px;">${ua.appliance.average_watts}W</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:13px;">${ua.hoursPerDay} hrs</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;font-family:monospace;">₦${ua.dailyCost.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:13px;font-weight:600;font-family:monospace;">₦${ua.monthlyCost.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
        </tr>`;
    }).join('');

    const heavySection = heavyHitters.length > 0 ? `
      <div style="margin-top:24px;padding:16px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;">
        <h3 style="margin:0 0 8px;font-size:14px;color:#dc2626;font-weight:700;">⚠️ Heavy Hitters (Over 40% of Total)</h3>
        <ul style="margin:0;padding-left:20px;">
          ${heavyHitters.map(ua => `<li style="font-size:13px;color:#991b1b;margin-bottom:4px;">${ua.appliance.name} (×${ua.quantity}) — ₦${ua.monthlyCost.toLocaleString('en-NG')}/month</li>`).join('')}
        </ul>
      </div>` : '';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>NairaVolt Energy Audit</title>
  <style>
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    body { font-family: -apple-system, 'Segoe UI', sans-serif; margin: 0; padding: 40px; color: #1a1a2e; }
    .header { background: #008751; color: white; padding: 32px; border-radius: 16px; margin-bottom: 32px; }
    .header h1 { margin: 0 0 4px; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
    .header .subtitle { margin: 0; font-size: 16px; font-weight: 600; opacity: 0.9; }
    .header p.tagline { margin: 4px 0 0; opacity: 0.75; font-size: 12px; }
    .meta { display: flex; gap: 16px; margin-top: 16px; flex-wrap: wrap; }
    .meta-item { background: rgba(255,255,255,0.15); padding: 8px 16px; border-radius: 8px; font-size: 12px; }
    .summary { display: flex; gap: 16px; margin-bottom: 32px; }
    .summary-card { flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; }
    .summary-card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .summary-card .value { font-size: 28px; font-weight: 800; color: #008751; font-family: monospace; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    thead { background: #f9fafb; }
    th { padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; border-bottom: 2px solid #e5e7eb; text-align: left; }
    th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: center; }
    th:nth-child(5), th:nth-child(6) { text-align: right; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>OFFICIAL ENERGY CONSUMPTION AUDIT</h1>
    <p class="subtitle">⚡ NairaVolt — ${title}</p>
    <p class="tagline">Smart Energy Auditing for Nigeria</p>
    <div class="meta">
      <div class="meta-item">📅 ${date}</div>
      <div class="meta-item">⚡ ${band.name} — ₦${band.rate}/kWh</div>
      <div class="meta-item">🏠 Property: ${title}</div>
      <div class="meta-item">🔌 ${appliances.length} Appliance${appliances.length !== 1 ? 's' : ''}</div>
    </div>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="label">Estimated Daily Cost</div>
      <div class="value">₦${totalDaily.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
    </div>
    <div class="summary-card">
      <div class="label">Estimated Monthly Cost</div>
      <div class="value">₦${totalMonthly.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Appliance</th>
        <th>Qty</th>
        <th>Wattage</th>
        <th>Hours/Day</th>
        <th>Daily (₦)</th>
        <th>Monthly (₦)</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  ${heavySection}

  <div class="footer">
    <p><strong>Disclaimer:</strong> Estimates based on average wattages. Actual consumption may vary by brand and device age. NairaVolt is a management guide, not an official bill.</p>
    <p style="margin-top:8px;">Generated by NairaVolt — Smart Energy Auditing for Nigeria 🇳🇬</p>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    }
  };

  if (appliances.length === 0) return null;

  return (
    <button
      onClick={handleExport}
      className="w-full py-3.5 rounded-2xl bg-card shadow-card text-card-foreground font-semibold flex items-center justify-center gap-2 hover:bg-secondary transition-colors text-sm mb-3"
    >
      <FileDown size={18} className="text-primary" />
      Download Energy Audit (PDF)
    </button>
  );
};

export default PdfExport;
