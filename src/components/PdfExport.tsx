import { FileDown } from 'lucide-react';
import { type UserAppliance, type TariffBand } from '@/data/appliances';

const LOGO_BASE64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCABQAFADASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAQGAwUHAQL/xAAxEAABAwMDAwEFCAMAAAAAAAABAAIDBAURBhIhEzFBUSJhgaGxBhQVJDJjccFCkfD/xAAYAQEAAwEAAAAAAAAAAAAAAAAAAQIEA//EACIRAAICAgIBBQEAAAAAAAAAAAABAgMRERIhMSJBUZHB8P/aAAwDAQACEQMRAD8A64iIgCIiAIiIAgzhEQBERAEREAWsv94/BbcKkRtke6QMaxxwD6/RbNUL7Qa7dX01E08RR9Rw97u3yHzVZPSMuXa6qXJeTZWnV1ZdbjHSsoIWh3L39Q+w0dz/AN6qzVMpp6WaYAExxufg+cAlc2s4paq2y0UdTJT1EpMk8vSyxsbOQC7IwM8k+uArVZr4L1piqMjs1UED2yjy72Th3x/oqsZP3MuJkScdTe2+14+v78PixatmvFyZSPpI4g5jnbmvJPA96s65poZ+7UkI/Zf9F0tTBtrs7YFs7KuU3t7CIiubgiIgCp2vKeijpo+lRMluVfM2ON4BLyB3x8h8VcVVtTW66TOnuNBC6arY0U1KxpGYmnPUkGf8j2HoFWXgz5MeVbWjHpe0W2S1XG2OxNLkRVczTxuxna0+jT58nKpsj63St5qaZ/J2OieOwljcOD9D/IVz+z+1XC00FZHcKV9O+SZrmB5HI248FZdbabfe6BtRRx7q2n/QBwZGeW/2Pj6qOPRinjudEZRWpIqegX51RCP2ZPouprnOi9O3q26jjqa23ywQiJ4L3FuASOOxXRlMVpHfAg4Vaa12ERFY3BERAQrtXvttvdUxQdd4exoj3Y3bnAce/lQotT0j2iRzHGKSp6MbmEHj2QHEE57vA4BwtnVMbIxrH0/XbuDsZHslpBB/39FCfbKGQ73WcElznnsDuJBJ4PkgH+RlR2cpKze4sxwahidE8vhkc6Nhe9zGhrAN7mNGXO7ktWMalZK5gipz+YEbqcPOC4F5a/Ppt2k8eFK+40bopY/wo7X7WvbwMgOLhjnw4k8eSvYqSmidA5lq2Opy/ong9Pd+rHPGfKdleNvyRTqSOTofd6aXMrmuDZGgF8TmPc17cHzs8rZW2sNfbaesMLoTPG1+xxBIyM+PChst1FAwbLOAN4kw3GQ4ZA89uTx25PCm0MMdNAKaGlNPFGMNbnIA93KFoKxP1MkIiKTqEREAREQBERAEREARE4wgP//Z';

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
    .header { background: #008751; color: white; padding: 32px; border-radius: 16px; margin-bottom: 32px; display: flex; align-items: center; gap: 20px; }
    .header-logo { width: 64px; height: 64px; border-radius: 12px; object-fit: contain; background: white; padding: 4px; }
    .header-text h1 { margin: 0 0 4px; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
    .header-text .subtitle { margin: 0; font-size: 16px; font-weight: 600; opacity: 0.9; }
    .header-text p.tagline { margin: 4px 0 0; opacity: 0.75; font-size: 12px; }
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
    <img src="data:image/jpeg;base64,${LOGO_BASE64}" class="header-logo" alt="NairaVolt Logo" />
    <div class="header-text">
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
