import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  Fan,
  Flame,
  Gauge,
  Lightbulb,
  Mail,
  Pause,
  Play,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';

type RoomState = {
  id: string;
  room: string;
  building: string;
  occupants: number;
  capacity: number;
  watts: number;
  baseline: number;
  energyToday: number;
  lightsOn: boolean;
  fanOn: boolean;
  temperature: number;
  naturalLight: number;
  lightsOnMinutes: number;
  sensorHealth: number;
};

type AlertItem = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  time: string;
};

const INITIAL_ROOMS: RoomState[] = [
  { id: 'room-101', room: 'Room 101', building: 'Main Block', occupants: 34, capacity: 45, watts: 1840, baseline: 1320, energyToday: 18.6, lightsOn: true, fanOn: true, temperature: 26, naturalLight: 34, lightsOnMinutes: 86, sensorHealth: 99 },
  { id: 'room-204', room: 'Room 204', building: 'Science Wing', occupants: 28, capacity: 36, watts: 1430, baseline: 1210, energyToday: 15.2, lightsOn: true, fanOn: true, temperature: 25, naturalLight: 48, lightsOnMinutes: 42, sensorHealth: 96 },
  { id: 'room-302', room: 'Room 302', building: 'New Lecture Hall', occupants: 0, capacity: 80, watts: 920, baseline: 210, energyToday: 21.7, lightsOn: true, fanOn: true, temperature: 24, naturalLight: 71, lightsOnMinutes: 137, sensorHealth: 91 },
  { id: 'lab-1', room: 'ICT Lab 1', building: 'Technology Centre', occupants: 18, capacity: 24, watts: 1160, baseline: 1020, energyToday: 12.8, lightsOn: true, fanOn: true, temperature: 24, naturalLight: 54, lightsOnMinutes: 58, sensorHealth: 98 },
  { id: 'staff-room', room: 'Staff Room', building: 'Admin Block', occupants: 6, capacity: 14, watts: 470, baseline: 560, energyToday: 5.4, lightsOn: true, fanOn: false, temperature: 27, naturalLight: 66, lightsOnMinutes: 22, sensorHealth: 100 },
];

const seededAlerts: AlertItem[] = [
  { id: 'alert-1', severity: 'critical', title: 'Room 302 is empty with lights on', detail: 'Lights and fans have been active for 2h 17m with no detected occupants.', time: 'Now' },
  { id: 'alert-2', severity: 'warning', title: 'Room 101 is above its normal load', detail: 'Current draw is 39% above the room baseline. Check the AC and projector.', time: '4 min ago' },
  { id: 'alert-3', severity: 'info', title: 'ICT Lab 1 automation applied', detail: 'Fans held at medium speed because natural light is already sufficient.', time: '11 min ago' },
];

const formatNaira = (amount: number) => `₦${Math.round(amount).toLocaleString('en-NG')}`;

const roomStatus = (room: RoomState) => {
  if (room.occupants === 0 && (room.lightsOn || room.fanOn)) return { label: 'Waste risk', tone: 'destructive' };
  if (room.watts > room.baseline * 1.25) return { label: 'High load', tone: 'warning' };
  return { label: 'Efficient', tone: 'accent' };
};

const MonitoringDashboard = () => {
  const [rooms, setRooms] = useState<RoomState[]>(INITIAL_ROOMS);
  const [alerts, setAlerts] = useState<AlertItem[]>(seededAlerts);
  const [running, setRunning] = useState(true);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [browserAlerts, setBrowserAlerts] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const simulateTick = useCallback(() => {
    setRooms((current) => current.map((room) => {
      const occupancyChange = Math.random() > 0.78 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      const occupants = Math.max(0, Math.min(room.capacity, room.occupants + occupancyChange));
      const emptyRoom = occupants === 0;
      const automationTurnsOff = automationEnabled && emptyRoom && Math.random() > 0.35;
      const lightsOn = automationTurnsOff ? false : room.lightsOn;
      const fanOn = automationTurnsOff ? false : room.fanOn;
      const naturalLight = Math.max(12, Math.min(96, room.naturalLight + (Math.random() * 8 - 4)));
      const occupancyLoad = occupants > 0 ? occupants * 8 : 0;
      const equipmentLoad = Math.max(120, room.watts - room.occupants * 8 + (Math.random() * 80 - 40));
      const watts = Math.round(equipmentLoad + occupancyLoad + (lightsOn ? 260 : 0) + (fanOn ? 180 : 0));
      return {
        ...room,
        occupants,
        watts,
        lightsOn,
        fanOn,
        naturalLight,
        energyToday: room.energyToday + watts / 360000,
        lightsOnMinutes: lightsOn ? room.lightsOnMinutes + 1 : 0,
        temperature: Math.round((room.temperature + (Math.random() * 0.6 - 0.3)) * 10) / 10,
      };
    }));
    setLastUpdated(new Date());
  }, [automationEnabled]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(simulateTick, 5000);
    return () => window.clearInterval(interval);
  }, [running, simulateTick]);

  const derived = useMemo(() => {
    const totalWatts = rooms.reduce((sum, room) => sum + room.watts, 0);
    const totalEnergy = rooms.reduce((sum, room) => sum + room.energyToday, 0);
    const occupied = rooms.filter((room) => room.occupants > 0).length;
    const wasteRisk = rooms.filter((room) => room.occupants === 0 && (room.lightsOn || room.fanOn)).length;
    const highLoad = rooms.filter((room) => room.watts > room.baseline * 1.25).length;
    const projectedDailyCost = totalEnergy * 60 * 1.075;
    const projectedMonthlyCost = projectedDailyCost * 30;
    const projectedSavings = projectedMonthlyCost * 0.18;
    return { totalWatts, totalEnergy, occupied, wasteRisk, highLoad, projectedDailyCost, projectedMonthlyCost, projectedSavings };
  }, [rooms]);

  useEffect(() => {
    if (!running || !inAppAlerts) return;
    const room = rooms.find((item) => item.occupants === 0 && item.lightsOn && item.lightsOnMinutes > 120);
    if (!room) return;
    setAlerts((current) => current.some((alert) => alert.id === `empty-${room.id}`) ? current : [
      { id: `empty-${room.id}`, severity: 'critical', title: `${room.room} has been empty too long`, detail: `Lights and fans are still drawing ${room.watts.toLocaleString()}W.`, time: 'Just now' },
      ...current,
    ].slice(0, 5));
  }, [rooms, running, inAppAlerts]);

  const enableBrowserAlerts = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('This browser does not support notifications.');
      return;
    }
    if (window.top !== window.self) {
      setNotificationStatus('Open NairaVolt in its own browser tab to enable mobile alerts.');
      return;
    }
    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission === 'granted') {
      setBrowserAlerts(true);
      setNotificationStatus('Browser alerts are enabled on this device.');
      new Notification('NairaVolt monitoring enabled', { body: 'You will be notified when unusual classroom usage is detected.' });
    } else {
      setNotificationStatus('Notifications are blocked. Allow them in your browser site settings.');
    }
  };

  const resetSimulation = () => {
    setRooms(INITIAL_ROOMS);
    setAlerts(seededAlerts);
    setLastUpdated(new Date());
  };

  return (
    <section className="space-y-5" aria-label="IoT energy monitoring dashboard">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.16em]">
            <Radio size={14} className="animate-pulse" /> Live simulator
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Campus energy command centre</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">See which rooms are consuming most, catch waste early, and preview safe automation decisions before connecting hardware.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetSimulation} title="Reset simulated readings">
            <RefreshCw size={15} /> Reset
          </Button>
          <Button size="sm" onClick={() => setRunning((value) => !value)}>
            {running ? <Pause size={15} /> : <Play size={15} />}
            {running ? 'Pause feed' : 'Resume feed'}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 font-medium text-accent"><Wifi size={12} /> Simulated sensor network</span>
        <span>Updated {lastUpdated.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Live demand" value={`${(derived.totalWatts / 1000).toFixed(1)} kW`} detail="Across 5 rooms" icon={<Gauge size={17} />} tone="primary" />
        <Metric label="Today" value={`${derived.totalEnergy.toFixed(1)} kWh`} detail={formatNaira(derived.projectedDailyCost)} icon={<Zap size={17} />} tone="accent" />
        <Metric label="Occupied" value={`${derived.occupied}/${rooms.length}`} detail="Rooms active now" icon={<Users size={17} />} tone="primary" />
        <Metric label="Attention" value={`${derived.wasteRisk + derived.highLoad}`} detail={`${derived.wasteRisk} waste · ${derived.highLoad} high load`} icon={<ShieldAlert size={17} />} tone={derived.wasteRisk > 0 ? 'destructive' : 'warning'} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-card-foreground">Live room load</h3>
                <p className="mt-1 text-xs text-muted-foreground">Ranked by current demand so the biggest opportunities stay visible.</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"><Activity size={14} /> 5 spaces</span>
            </div>
            <div className="space-y-3">
              {[...rooms].sort((a, b) => b.watts - a.watts).map((room, index) => {
                const status = roomStatus(room);
                const loadPercent = Math.min(100, Math.round((room.watts / Math.max(room.baseline * 1.5, 1)) * 100));
                return (
                  <div key={room.id} className="rounded-xl border border-border/70 p-3 transition-colors hover:bg-secondary/40">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">0{index + 1}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-card-foreground">{room.room}</p>
                            <p className="text-[11px] text-muted-foreground">{room.building} · {room.occupants} of {room.capacity} people</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-sm font-bold tabular-nums text-foreground">{room.watts.toLocaleString()}W</p>
                            <StatusPill tone={status.tone}>{status.label}</StatusPill>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Progress value={loadPercent} className="h-1.5" />
                          <span className="w-10 text-right font-mono text-[10px] text-muted-foreground">{loadPercent}%</span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Lightbulb size={13} className={room.lightsOn ? 'text-warning' : ''} /> {room.lightsOn ? 'Lights on' : 'Lights off'}</span>
                          <span className="inline-flex items-center gap-1"><Fan size={13} className={room.fanOn ? 'text-primary' : ''} /> {room.fanOn ? 'Fans on' : 'Fans off'}</span>
                          <span className="inline-flex items-center gap-1"><CloudSun size={13} /> {Math.round(room.naturalLight)}% daylight</span>
                          <span className="inline-flex items-center gap-1"><Thermometer size={13} /> {room.temperature}°C</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="mt-2 shrink-0 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-card-foreground">Smart classroom actions</h3>
                <p className="mt-1 text-xs text-muted-foreground">Decision simulator: what NairaVolt would do with connected controls.</p>
              </div>
              <Switch checked={automationEnabled} onCheckedChange={setAutomationEnabled} aria-label="Enable classroom automation simulator" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <AutomationDecision icon={<Lightbulb size={17} />} title="Lights" text={automationEnabled ? 'Dim to 35% in bright rooms' : 'Manual control'} />
              <AutomationDecision icon={<Fan size={17} />} title="Fans" text={automationEnabled ? 'Run only while occupied' : 'Manual control'} />
              <AutomationDecision icon={<Users size={17} />} title="Occupancy" text={automationEnabled ? 'Learn class schedules' : 'Pattern learning paused'} />
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground">
              <Sparkles size={15} className="mt-0.5 shrink-0 text-primary" />
              <span><strong className="text-foreground">AI-ready insight:</strong> once enough history is collected, NairaVolt can predict likely room occupancy and pre-cool only the rooms that need it.</span>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-card-foreground">Alert centre</h3>
                <p className="mt-1 text-xs text-muted-foreground">Unusual usage and safety events</p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning"><BellRing size={16} /></span>
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex gap-3 border-b border-border/70 pb-3 last:border-0 last:pb-0">
                  <AlertIcon severity={alert.severity} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2"><p className="text-xs font-semibold text-card-foreground">{alert.title}</p><span className="shrink-0 text-[10px] text-muted-foreground">{alert.time}</span></div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{alert.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
            <div className="mb-4"><h3 className="font-bold text-card-foreground">Alert delivery</h3><p className="mt-1 text-xs text-muted-foreground">Choose how administrators stay informed.</p></div>
            <div className="space-y-3">
              <DeliveryRow icon={<Activity size={16} />} title="In-app alert centre" detail="Always available" checked={inAppAlerts} onCheckedChange={setInAppAlerts} />
              <DeliveryRow icon={<Bell size={16} />} title="Browser / mobile alerts" detail="This device" checked={browserAlerts} onCheckedChange={() => void enableBrowserAlerts()} />
              <DeliveryRow icon={<Mail size={16} />} title="Email summaries" detail="Daily admin digest" checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
            {notificationStatus && <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">{notificationStatus}</p>}
          </div>

          <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-elevated">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-75">Projected impact</p><h3 className="mt-2 text-2xl font-extrabold tabular-nums">{formatNaira(derived.projectedSavings)}<span className="ml-1 text-sm font-medium opacity-75">/ month</span></h3></div><ShieldCheck size={24} className="opacity-80" /></div>
            <p className="mt-2 text-xs leading-relaxed opacity-80">Estimated 18% reduction from occupancy-based switching and earlier anomaly detection.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-primary-foreground/15 pt-3"><div><p className="text-[10px] uppercase opacity-65">Annual saving</p><p className="mt-1 font-mono font-bold">{formatNaira(derived.projectedSavings * 12)}</p></div><div><p className="text-[10px] uppercase opacity-65">Simple payback</p><p className="mt-1 font-mono font-bold">8–14 months</p></div></div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-border pt-5 md:grid-cols-2">
        <InfoNote icon={<ShieldCheck size={17} />} title="Safety by design" text="If a sensor stops reporting, automation holds the last safe state and flags the room instead of making a blind change." />
        <InfoNote icon={<RefreshCw size={17} />} title="Practical rollout" text="Start with occupancy and power sensors, calibrate against your bills, then connect lighting and fan controls one room at a time." />
        <InfoNote icon={<Flame size={17} />} title="What can go wrong" text="Sensor drift, network outages, equipment maintenance, and false occupancy signals are tracked as exceptions for an administrator to review." />
        <InfoNote icon={<CheckCircle2 size={17} />} title="ROI is an estimate" text="Actual savings depend on tariffs, room schedules, hardware costs, and how often staff act on alerts. The simulator makes those assumptions visible." />
      </div>
    </section>
  );
};

const Metric = ({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: React.ReactNode; tone: 'primary' | 'accent' | 'warning' | 'destructive' }) => (
  <div className="rounded-2xl border border-border bg-card p-4 shadow-card"><div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-${tone}/10 text-${tone}`}>{icon}</div><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-1 font-mono text-xl font-extrabold tabular-nums text-card-foreground">{value}</p><p className="mt-1 text-[10px] text-muted-foreground">{detail}</p></div>
);

const StatusPill = ({ tone, children }: { tone: string; children: React.ReactNode }) => <span className={`mt-1 inline-flex rounded-full bg-${tone}/10 px-2 py-0.5 text-[10px] font-semibold text-${tone}`}>{children}</span>;

const AutomationDecision = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => <div className="rounded-xl bg-secondary/60 p-3"><div className="flex items-center gap-2 text-primary"><span>{icon}</span><span className="text-xs font-semibold text-foreground">{title}</span></div><p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{text}</p></div>;

const DeliveryRow = ({ icon, title, detail, checked, onCheckedChange }: { icon: React.ReactNode; title: string; detail: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) => <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-card-foreground">{title}</p><p className="text-[10px] text-muted-foreground">{detail}</p></div><Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} /></div>;

const AlertIcon = ({ severity }: { severity: AlertItem['severity'] }) => {
  if (severity === 'critical') return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><AlertTriangle size={14} /></span>;
  if (severity === 'warning') return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning"><Gauge size={14} /></span>;
  return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><CheckCircle2 size={14} /></span>;
};

const InfoNote = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => <div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span><div><p className="text-xs font-semibold text-foreground">{title}</p><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{text}</p></div></div>;

export default MonitoringDashboard;