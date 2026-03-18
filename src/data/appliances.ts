export interface Appliance {
  id: string;
  name: string;
  average_watts: number;
  wise_usage: string;
  icon: string;
}

export const APPLIANCES: Appliance[] = [
  { id: "led-bulb", name: "LED Bulb (10W)", average_watts: 10, wise_usage: "Switch off when not in use and maximize natural daylight.", icon: "💡" },
  { id: "ceiling-fan", name: "Ceiling Fan", average_watts: 75, wise_usage: "Use at low speed when possible and turn off when leaving the room.", icon: "🌀" },
  { id: "standing-fan", name: "Standing Fan", average_watts: 60, wise_usage: "Position near windows for better airflow instead of running at high speed.", icon: "🌬️" },
  { id: "fridge-single", name: "Refrigerator (Single Door)", average_watts: 150, wise_usage: "Keep the door closed as much as possible and defrost regularly.", icon: "🧊" },
  { id: "fridge-double", name: "Refrigerator (Double Door)", average_watts: 250, wise_usage: "Avoid overloading and ensure proper ventilation around the unit.", icon: "🧊" },
  { id: "kettle", name: "Electric Kettle", average_watts: 2000, wise_usage: "Boil only the amount of water you need to save energy.", icon: "🫖" },
  { id: "microwave", name: "Microwave Oven", average_watts: 1200, wise_usage: "Use for reheating small portions instead of cooking large meals.", icon: "📡" },
  { id: "iron", name: "Electric Iron", average_watts: 1000, wise_usage: "Iron clothes in bulk to reduce repeated heating cycles.", icon: "👔" },
  { id: "ac-1hp", name: "Air Conditioner (1 HP)", average_watts: 750, wise_usage: "Set temperature to 24–26°C and close doors/windows while in use.", icon: "❄️" },
  { id: "ac-1.5hp", name: "Air Conditioner (1.5 HP)", average_watts: 1100, wise_usage: "Use energy-saving mode and service filters regularly.", icon: "❄️" },
  { id: "laptop", name: "Laptop", average_watts: 50, wise_usage: "Lower screen brightness and unplug when fully charged.", icon: "💻" },
  { id: "desktop", name: "Desktop Computer", average_watts: 200, wise_usage: "Enable sleep mode when idle for long periods.", icon: "🖥️" },
  { id: "tv", name: "Television (LED, 32-inch)", average_watts: 50, wise_usage: "Turn off completely instead of leaving on standby.", icon: "📺" },
  { id: "washing-machine", name: "Washing Machine", average_watts: 500, wise_usage: "Wash full loads and use cold water settings when possible.", icon: "🧺" },
  { id: "water-pump", name: "Water Pump (0.5 HP)", average_watts: 370, wise_usage: "Run only when necessary and fix leaks to reduce usage.", icon: "💧" },
];

export interface TariffBand {
  id: string;
  name: string;
  rate: number;
  supplyHours: number;
  label: string;
}

export const TARIFF_BANDS: TariffBand[] = [
  { id: "A", name: "Band A", rate: 209.50, supplyHours: 20, label: "20+ hrs" },
  { id: "B", name: "Band B", rate: 60.00, supplyHours: 16, label: "16+ hrs" },
  { id: "C", name: "Band C", rate: 56.00, supplyHours: 12, label: "12+ hrs" },
  { id: "D", name: "Band D", rate: 32.00, supplyHours: 8, label: "8+ hrs" },
  { id: "E", name: "Band E", rate: 32.00, supplyHours: 4, label: "4+ hrs" },
];

export interface UserAppliance {
  appliance: Appliance;
  hoursPerDay: number;
  monthlyCost: number;
}
