import { useMemo, useState } from 'react';
import {
  AlertTriangle, BarChart3, Building2, Calculator, Check, ChevronDown, ClipboardList, Download,
  FileDown, ListPlus, MapPin, Pencil, Plus, Settings2, Trash2, Wrench, X,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { APPLIANCES, TARIFF_BANDS } from '@/data/appliances';
import { getLocationMetrics, type AuditAppliance, type AuditLocation, type AuditSpace, useManualAudit } from '@/hooks/useManualAudit';
import nairavoltLogo from '@/assets/nairavolt-logo.jpeg';

const formatNaira = (amount: number) => `₦${Math.round(amount).toLocaleString('en-NG')}`;
const formatKwh = (amount: number) => `${amount.toFixed(1)} kWh`;

type DashboardProps = {
  onReplayTutorial: () => void;
};

const ManualAuditDashboard = ({ onReplayTutorial }: DashboardProps) => {
  const audit = useManualAudit();
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [newBuilding, setNewBuilding] = useState('');
  const [newSpace, setNewSpace] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedSpace, setSelectedSpace] = useState('');
  const [newAppliance, setNewAppliance] = useState({ name: '', category: 'General', watts: '100', quantity: '1', hours: '1' });
  const [editingSpace, setEditingSpace] = useState<string | null>(null);
  const [scenario, setScenario] = useState({ spaceId: '', applianceId: '', hours: '1', watts: '' });
  const [log, setLog] = useState({ text: '', kind: 'note' as 'note' | 'fault' | 'check' });
  const [showSettings, setShowSettings] = useState(false);

  const location = audit.activeLocation;
  const metrics = audit.metrics;
  if (!location || !metrics) return null;

  const allLocationsMetrics = audit.allMetrics;
  const allLocations = allLocationsMetrics.reduce((sum, item) => ({
    monthlyKwh: sum.monthlyKwh + item.metrics.totalMonthlyKwh,
    monthlyCost: sum.monthlyCost + item.metrics.totalMonthlyCost,
  }), { monthlyKwh: 0, monthlyCost: 0 });

  const buildingName = (buildingId: string) => location.buildings.find(building => building.id === buildingId)?.name ?? 'Unassigned';
  const selectedScenarioSpace = location.spaces.find(space => space.id === scenario.spaceId);
  const selectedScenarioAppliance = selectedScenarioSpace?.appliances.find(item => item.id === scenario.applianceId);
  const scenarioResult = useMemo(() => {
    if (!selectedScenarioAppliance) return { monthlyKwh: 0, monthlyCost: 0, annualCost: 0 };
    const rate = metrics.rate * 1.075;
    const currentKwh = selectedScenarioAppliance.watts * selectedScenarioAppliance.quantity * selectedScenarioAppliance.hoursPerDay / 1000 * 30;
    const nextHours = Math.max(0, Number(scenario.hours) || 0);
    const nextWatts = Math.max(0, Number(scenario.watts) || selectedScenarioAppliance.watts);
    const nextKwh = nextWatts * selectedScenarioAppliance.quantity * nextHours / 1000 * 30;
    const monthlyKwh = Math.max(0, currentKwh - nextKwh);
    const monthlyCost = monthlyKwh * rate;
    return { monthlyKwh, monthlyCost, annualCost: monthlyCost * 12 };
  }, [metrics.rate, scenario.hours, scenario.watts, selectedScenarioAppliance]);

  const downloadCsv = () => {
    const header = ['Location', 'Building', 'Space', 'Appliance', 'Category', 'Quantity', 'Watts', 'Hours/Day', 'Monthly kWh', 'Monthly Cost'];
    const rows = allLocationsMetrics.flatMap(({ location: itemLocation, metrics: itemMetrics }) => itemMetrics.rows.map(row => [itemLocation.name, buildingNameFor(itemLocation, row.buildingId), row.spaceName, row.name, row.category, row.quantity, row.watts, row.hoursPerDay, row.monthlyKwh.toFixed(2), row.monthlyCost.toFixed(2)]));
    const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'nairavolt-energy-audit.csv'; link.click(); URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    const rows = metrics.rows.map(row => `<tr><td>${row.name}</td><td>${row.spaceName}</td><td>${row.quantity}</td><td>${row.watts}W</td><td>${row.hoursPerDay}</td><td>${formatNaira(row.monthlyCost)}</td></tr>`).join('');
    const html = `<!doctype html><html><head><title>NairaVolt Energy Audit</title><style>body{font-family:Arial,sans-serif;color:#17201b;padding:36px}header{background:#008751;color:white;padding:24px;border-radius:14px;display:flex;gap:18px;align-items:center}header img{width:64px;height:64px;object-fit:contain;background:white;border-radius:10px}h1{font-size:22px;margin:0 0 4px}p{color:#5e6b63}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{padding:10px;border-bottom:1px solid #dce5df;text-align:left;font-size:12px}th{color:#008751}.summary{display:flex;gap:12px;margin-top:20px}.summary div{border:1px solid #bfe4ce;padding:14px;flex:1;border-radius:10px}.value{font-weight:bold;font-size:20px;color:#008751}</style></head><body><header><img src="${nairavoltLogo}"/><div><h1>OFFICIAL ENERGY CONSUMPTION AUDIT</h1><strong>NairaVolt — ${location.name}</strong><p style="color:white">Manual energy audit · ${new Date().toLocaleDateString('en-NG')}</p></div></header><div class="summary"><div><small>MONTHLY USAGE</small><div class="value">${formatKwh(metrics.totalMonthlyKwh)}</div></div><div><small>MONTHLY COST</small><div class="value">${formatNaira(metrics.totalMonthlyCost)}</div></div><div><small>ANNUAL COST</small><div class="value">${formatNaira(metrics.totalAnnualCost)}</div></div></div><p>Tariff: ${location.customRate ? `Custom — ₦${location.customRate}/kWh` : `${TARIFF_BANDS.find(band => band.id === location.bandId)?.name ?? location.bandId} — ₦${metrics.rate}/kWh`} · 7.5% VAT included</p><table><thead><tr><th>Appliance</th><th>Space</th><th>Qty</th><th>Power</th><th>Hours/day</th><th>Monthly cost</th></tr></thead><tbody>${rows}</tbody></table><p style="margin-top:32px">Estimates based on manually entered average wattages and usage. NairaVolt is a management guide, not an official bill.</p></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' })); const printWindow = window.open(url, '_blank');
    if (printWindow) printWindow.addEventListener('load', () => printWindow.print());
  };

  const addManualAppliance = () => {
    if (!selectedSpace || !newAppliance.name.trim()) return;
    audit.addAppliance(selectedSpace, { name: newAppliance.name.trim(), category: newAppliance.category || 'General', watts: Math.max(0, Number(newAppliance.watts) || 0), quantity: Math.max(1, Number(newAppliance.quantity) || 1), hoursPerDay: Math.max(0, Math.min(Number(newAppliance.hours) || 0, location.limits.maxHours)) });
    setNewAppliance({ name: '', category: 'General', watts: '100', quantity: '1', hours: '1' });
  };

  const addLocation = () => { if (locationName.trim()) { audit.createLocation(locationName.trim()); setLocationName(''); setShowLocationMenu(false); } };

  return (
    <section className="space-y-5" aria-label="Manual energy audit dashboard">
      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.16em]"><ClipboardList size={14} /> Manual audit workspace</div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Know where your energy goes.</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Record spaces and appliances, compare costs, and prepare a clean audit report without connected hardware.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onReplayTutorial}><ClipboardList /> Replay tutorial</Button>
          <Button variant="outline" size="sm" onClick={downloadCsv}><Download /> CSV</Button>
          <Button size="sm" onClick={downloadPdf}><FileDown /> Export report</Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="relative">
          <button id="onboard-locations" onClick={() => setShowLocationMenu(value => !value)} className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left shadow-card">
            <span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><MapPin size={17} /></span><span><span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Active location</span><span className="font-semibold text-card-foreground">{location.name}</span></span></span><ChevronDown size={17} className="text-muted-foreground" />
          </button>
          {showLocationMenu && <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-border bg-card p-2 shadow-elevated">
            {audit.locations.map(item => <div key={item.id} className="flex items-center gap-2 rounded-lg p-2 hover:bg-secondary"><button onClick={() => { audit.setActiveLocationId(item.id); setShowLocationMenu(false); }} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm"><MapPin size={14} className="text-primary" /><span className="truncate">{item.name}</span>{item.id === location.id && <Check size={14} className="ml-auto text-primary" />}</button><Button variant="ghost" size="icon" onClick={() => { const next = window.prompt('Rename location', item.name); if (next?.trim()) audit.renameLocation(item.id, next.trim()); }} title="Rename location"><Pencil /></Button><Button variant="ghost" size="icon" onClick={() => audit.deleteLocation(item.id)} disabled={audit.locations.length <= 1} title="Delete location"><Trash2 /></Button></div>)}
            <div className="mt-2 flex gap-2 border-t border-border pt-2"><Input value={locationName} onChange={event => setLocationName(event.target.value)} placeholder="New location name" onKeyDown={event => event.key === 'Enter' && addLocation()} /><Button size="sm" onClick={addLocation}><Plus /> Add</Button></div>
          </div>}
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">All locations</p><p className="font-mono text-sm font-bold text-card-foreground">{formatKwh(allLocations.monthlyKwh)} · {formatNaira(allLocations.monthlyCost)}/mo</p></div><Building2 className="text-primary" size={18} /></div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Monthly usage" value={formatKwh(metrics.totalMonthlyKwh)} detail={`${formatKwh(metrics.totalAnnualKwh)} yearly`} icon={<BarChart3 />} />
        <Metric label="Monthly cost" value={formatNaira(metrics.totalMonthlyCost)} detail={`${formatNaira(metrics.totalAnnualCost)} yearly`} icon={<Calculator />} />
        <Metric label="Top space" value={metrics.topSpace?.name ?? '—'} detail={metrics.topSpace ? formatKwh(metrics.topSpace.monthlyKwh) : 'Add spaces'} icon={<MapPin />} />
        <Metric label="Top appliance" value={metrics.topAppliance?.name ?? '—'} detail={metrics.topAppliance ? formatNaira(metrics.topAppliance.monthlyCost) : 'Add appliances'} icon={<Wrench />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-card-foreground">Spaces and equipment</h3><p className="mt-1 text-xs text-muted-foreground">Add the rooms you audit and enter the appliances found there.</p></div><div className="flex gap-2"><Input className="h-9 w-36" value={newBuilding} onChange={event => setNewBuilding(event.target.value)} placeholder="Building name" /><Button size="sm" onClick={() => { if (newBuilding.trim()) { audit.addBuilding(newBuilding.trim()); setNewBuilding(''); } }}><Plus /> Building</Button></div></div>
            <div className="space-y-3">
              {location.spaces.map(space => <SpaceEditor key={space.id} space={space} buildingName={buildingName(space.buildingId)} editing={editingSpace === space.id} onEdit={() => setEditingSpace(editingSpace === space.id ? null : space.id)} onDelete={() => audit.deleteSpace(space.id)} onUpdate={update => audit.updateSpace(space.id, update)} onUpdateAppliance={(applianceId, update) => audit.updateAppliance(space.id, applianceId, update)} onDeleteAppliance={applianceId => audit.deleteAppliance(space.id, applianceId)} />)}
              {location.spaces.length === 0 && <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No spaces yet. Add a building and a room below.</p>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4"><Select value={selectedBuilding} onValueChange={setSelectedBuilding}><SelectTrigger className="w-44"><SelectValue placeholder="Choose building" /></SelectTrigger><SelectContent>{location.buildings.map(building => <SelectItem key={building.id} value={building.id}>{building.name}</SelectItem>)}</SelectContent></Select><Input value={newSpace} onChange={event => setNewSpace(event.target.value)} placeholder="Room or space name" className="w-48" /><Button variant="outline" onClick={() => { if (selectedBuilding && newSpace.trim()) { audit.addSpace(newSpace.trim(), selectedBuilding); setNewSpace(''); } }}><Plus /> Add space</Button></div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartPanel title="Usage by space" data={metrics.spaceTotals.map(space => ({ name: space.name, value: Number(space.monthlyKwh.toFixed(1)) }))} unit="kWh" />
            <ChartPanel title="Cost by appliance category" data={Object.values(metrics.rows.reduce<Record<string, number>>((groups, row) => { groups[row.category] = (groups[row.category] ?? 0) + row.monthlyCost; return groups; }, {})).map((value, index) => ({ name: Object.keys(metrics.rows.reduce<Record<string, number>>((groups, row) => { groups[row.category] = (groups[row.category] ?? 0) + row.monthlyCost; return groups; }, {}))[index], value: Math.round(value) }))} unit="₦" />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="mb-4 flex items-center justify-between"><div><h3 className="font-bold text-card-foreground">Alert centre</h3><p className="mt-1 text-xs text-muted-foreground">Manual threshold and baseline checks for {location.name}.</p></div><AlertTriangle className="text-warning" size={19} /></div>
            {metrics.alerts.length === 0 ? <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-xs text-primary"><Check size={15} /> No manual threshold alerts.</div> : <div className="space-y-3">{metrics.alerts.map(alert => <div key={alert.id} className="flex gap-2 border-b border-border pb-3 last:border-0 last:pb-0"><AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" /><div><p className="text-xs font-semibold text-card-foreground">{alert.title}</p><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{alert.detail}</p></div></div>)}</div>}
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card"><div className="mb-3 flex items-center justify-between"><div><h3 className="font-bold text-card-foreground">Alert delivery</h3><p className="mt-1 text-xs text-muted-foreground">Choose how saved audit alerts are delivered.</p></div><Settings2 size={18} className="text-primary" /></div><DeliveryRow label="In-app Alert Centre" checked={location.delivery.inApp} onChange={value => audit.updateSettings({ delivery: { ...location.delivery, inApp: value } })} /><DeliveryRow label="Browser / mobile push" checked={location.delivery.push} onChange={value => audit.updateSettings({ delivery: { ...location.delivery, push: value } })} /><DeliveryRow label="Email summaries" checked={location.delivery.email} onChange={value => audit.updateSettings({ delivery: { ...location.delivery, email: value } })} /></div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card"><div className="mb-3 flex items-center justify-between"><div><h3 className="font-bold text-card-foreground">Data memory</h3><p className="mt-1 text-xs text-muted-foreground">Keep custom locations and audits on this device.</p></div><Switch checked={audit.memoryEnabled} onCheckedChange={audit.toggleMemory} aria-label="Remember audit data" /></div><p className="mb-3 text-[11px] text-muted-foreground">{audit.memoryEnabled ? 'Remember Data is ON.' : 'Guest Mode is ON. Saved entries are cleared for this session.'}</p><Button variant="outline" size="sm" onClick={() => { if (window.confirm('Clear saved audit data and restore Home and Office?')) audit.clearSavedData(); }}><Trash2 /> Clear saved data</Button><Button variant="ghost" size="sm" className="ml-2" onClick={() => setShowSettings(value => !value)}><Settings2 /> Limits</Button>{showSettings && <div className="mt-3 grid grid-cols-2 gap-2"><label className="text-[11px] text-muted-foreground">Max watts<input className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground" type="number" value={location.limits.maxWatts} onChange={event => audit.updateSettings({ limits: { ...location.limits, maxWatts: Number(event.target.value) || 0 } })} /></label><label className="text-[11px] text-muted-foreground">Max hours<input className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground" type="number" value={location.limits.maxHours} onChange={event => audit.updateSettings({ limits: { ...location.limits, maxHours: Number(event.target.value) || 0 } })} /></label></div>}</div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-5"><div className="mb-4"><h3 className="font-bold text-card-foreground">Savings scenario</h3><p className="mt-1 text-xs text-muted-foreground">Test a manual change without changing your saved audit.</p></div><div className="grid gap-2 sm:grid-cols-3"><Select value={scenario.spaceId} onValueChange={value => setScenario(current => ({ ...current, spaceId: value, applianceId: '' }))}><SelectTrigger><SelectValue placeholder="Choose space" /></SelectTrigger><SelectContent>{location.spaces.map(space => <SelectItem key={space.id} value={space.id}>{space.name}</SelectItem>)}</SelectContent></Select><Select value={scenario.applianceId} onValueChange={value => setScenario(current => ({ ...current, applianceId: value }))}><SelectTrigger><SelectValue placeholder="Choose appliance" /></SelectTrigger><SelectContent>{selectedScenarioSpace?.appliances.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select><Input type="number" min="0" value={scenario.hours} onChange={event => setScenario(current => ({ ...current, hours: event.target.value }))} placeholder="New hours/day" /></div><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-lg bg-primary/10 p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly saving</p><p className="mt-1 font-mono text-lg font-bold text-primary">{formatNaira(scenarioResult.monthlyCost)}</p></div><div className="rounded-lg bg-secondary p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Annual saving</p><p className="mt-1 font-mono text-lg font-bold text-card-foreground">{formatNaira(scenarioResult.annualCost)}</p></div></div><p className="mt-2 text-[11px] text-muted-foreground">Potential reduction: {formatKwh(scenarioResult.monthlyKwh)} per month. Use this as a planning estimate.</p></div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-5"><div className="mb-4 flex items-center gap-2"><Wrench size={18} className="text-primary" /><div><h3 className="font-bold text-card-foreground">Maintenance & audit log</h3><p className="mt-1 text-xs text-muted-foreground">Record faults, notes, and scheduled physical checks.</p></div></div><div className="flex gap-2"><Select value={log.kind} onValueChange={value => setLog(current => ({ ...current, kind: value as typeof log.kind }))}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="note">Note</SelectItem><SelectItem value="fault">Fault</SelectItem><SelectItem value="check">Check</SelectItem></SelectContent></Select><Textarea value={log.text} onChange={event => setLog(current => ({ ...current, text: event.target.value }))} placeholder="e.g. Service the reception AC next Friday" className="min-h-10" /><Button size="icon" onClick={() => { if (log.text.trim()) { audit.addLog(log.text.trim(), log.kind); setLog(current => ({ ...current, text: '' })); } }} title="Add audit log"><Plus /></Button></div><div className="mt-3 space-y-2">{location.logs.slice(0, 4).map(item => <div key={item.id} className="flex items-start gap-2 rounded-lg bg-secondary p-2.5"><span className="mt-0.5 rounded bg-primary/10 p-1 text-primary"><Wrench size={12} /></span><div><p className="text-xs text-card-foreground">{item.text}</p><p className="mt-1 text-[10px] text-muted-foreground">{item.kind} · {new Date(item.createdAt).toLocaleDateString('en-NG')}</p></div></div>)}</div></div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary/60 p-4 text-xs text-muted-foreground"><span><strong className="text-foreground">7.5% VAT included.</strong> Estimates are based on your manual inputs and are not an official bill.</span><span>Built for Nigeria 🇳🇬</span></div>
    </section>
  );
};

const buildingNameFor = (location: AuditLocation, buildingId: string) => location.buildings.find(building => building.id === buildingId)?.name ?? 'Unassigned';

const Metric = ({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) => <div className="rounded-xl border border-border bg-card p-4 shadow-card"><div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-1 truncate font-mono text-lg font-extrabold tabular-nums text-card-foreground">{value}</p><p className="mt-1 truncate text-[10px] text-muted-foreground">{detail}</p></div>;

const DeliveryRow = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) => <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0"><span className="text-xs text-card-foreground">{label}</span><Switch checked={checked} onCheckedChange={onChange} aria-label={label} /></div>;

const ChartPanel = ({ title, data, unit }: { title: string; data: { name: string; value: number }[]; unit: string }) => <div className="rounded-xl border border-border bg-card p-4 shadow-card"><h3 className="font-bold text-card-foreground">{title}</h3><div className="mt-3 h-48">{data.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 4, right: 4, bottom: 24, left: -18 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" /><XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} angle={-25} textAnchor="end" interval={0} /><YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={value => unit === '₦' ? `₦${Math.round(value / 1000)}k` : value} /><Tooltip formatter={(value: number) => [unit === '₦' ? formatNaira(value) : `${value} kWh`, title]} /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>{data.map(item => <Cell key={item.name} fill="hsl(var(--primary))" />)}</Bar></BarChart></ResponsiveContainer> : <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Add audit data to see the breakdown.</p>}</div></div>;

const SpaceEditor = ({ space, buildingName, editing, onEdit, onDelete, onUpdate, onUpdateAppliance, onDeleteAppliance }: { space: AuditSpace; buildingName: string; editing: boolean; onEdit: () => void; onDelete: () => void; onUpdate: (update: Partial<AuditSpace>) => void; onUpdateAppliance: (id: string, update: Partial<AuditAppliance>) => void; onDeleteAppliance: (id: string) => void }) => {
  const [newItem, setNewItem] = useState({ name: '', watts: '100', quantity: '1', hours: '1', category: 'General' });
  const metrics = getLocationMetrics({ id: 'preview', name: '', bandId: 'B', customRate: null, buildings: [], spaces: [space], logs: [], limits: { maxWatts: 999999, maxHours: 999 }, delivery: { inApp: true, push: false, email: false } });
  return <div className="rounded-lg border border-border/80 p-3"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><MapPin size={15} className="text-primary" /><p className="font-semibold text-card-foreground">{space.name}</p></div><p className="mt-1 text-[11px] text-muted-foreground">{buildingName} · {formatKwh(metrics.totalMonthlyKwh)}/month · baseline {space.baselineKwh} kWh/day</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={onEdit} title="Edit space"><Pencil /></Button><Button variant="ghost" size="icon" onClick={onDelete} title="Delete space"><Trash2 /></Button></div></div>{editing && <div className="mt-3 grid gap-2 border-t border-border pt-3 sm:grid-cols-3"><Input value={space.name} onChange={event => onUpdate({ name: event.target.value })} aria-label="Space name" /><Input type="number" value={space.baselineKwh} onChange={event => onUpdate({ baselineKwh: Number(event.target.value) || 0 })} aria-label="Daily baseline kWh" placeholder="Baseline kWh/day" /><span className="text-[11px] text-muted-foreground">Edit the name and daily planning baseline.</span></div>}<div className="mt-3 space-y-2">{space.appliances.map(item => <div key={item.id} className="grid items-center gap-2 rounded-lg bg-secondary/60 p-2 sm:grid-cols-[1fr_90px_70px_70px_80px_auto]"><span className="min-w-0 truncate text-xs font-medium text-card-foreground">{item.name}<small className="ml-1 text-muted-foreground">{item.category}</small></span><input className="h-8 rounded border border-input bg-background px-2 text-xs text-foreground" type="number" value={item.watts} onChange={event => onUpdateAppliance(item.id, { watts: Number(event.target.value) || 0 })} aria-label={`${item.name} watts`} /><input className="h-8 rounded border border-input bg-background px-2 text-xs text-foreground" type="number" min="1" value={item.quantity} onChange={event => onUpdateAppliance(item.id, { quantity: Math.max(1, Number(event.target.value) || 1) })} aria-label={`${item.name} quantity`} /><input className="h-8 rounded border border-input bg-background px-2 text-xs text-foreground" type="number" min="0" value={item.hoursPerDay} onChange={event => onUpdateAppliance(item.id, { hoursPerDay: Math.max(0, Number(event.target.value) || 0) })} aria-label={`${item.name} hours`} /><span className="text-right font-mono text-xs text-card-foreground">{formatNaira(metrics.rows.find(row => row.id === item.id)?.monthlyCost ?? 0)}</span><Button variant="ghost" size="icon" onClick={() => onDeleteAppliance(item.id)} title="Delete appliance"><X /></Button></div>)}<div className="flex flex-wrap gap-2 pt-1"><Input value={newItem.name} onChange={event => setNewItem(current => ({ ...current, name: event.target.value }))} placeholder="Appliance name" className="h-8 flex-1" /><Input value={newItem.watts} onChange={event => setNewItem(current => ({ ...current, watts: event.target.value }))} type="number" placeholder="W" className="h-8 w-20" /><Input value={newItem.quantity} onChange={event => setNewItem(current => ({ ...current, quantity: event.target.value }))} type="number" placeholder="Qty" className="h-8 w-20" /><Input value={newItem.hours} onChange={event => setNewItem(current => ({ ...current, hours: event.target.value }))} type="number" placeholder="Hrs" className="h-8 w-20" /><Button variant="outline" size="sm" onClick={() => { if (newItem.name.trim()) { onUpdate({ appliances: [...space.appliances, { id: `local-${Date.now()}`, name: newItem.name.trim(), category: newItem.category, watts: Number(newItem.watts) || 0, quantity: Number(newItem.quantity) || 1, hoursPerDay: Number(newItem.hours) || 0 }] }); setNewItem({ name: '', watts: '100', quantity: '1', hours: '1', category: 'General' }); } }}><Plus /> Add appliance</Button></div></div></div>;
};

export default ManualAuditDashboard;