export interface Appliance {
  id: string;
  name: string;
  average_watts: number;
  wise_usage: string;
  icon: string;
}

export const APPLIANCES: Appliance[] = [
  { id: "ac-1hp-inv", name: "AC (1HP Inverter)", average_watts: 750, wise_usage: "Set to 24°C to save up to 15% on cooling costs.", icon: "❄️" },
  { id: "ac-1.5hp-inv", name: "AC (1.5HP Inverter)", average_watts: 1100, wise_usage: "Keep the room sealed; a small gap wastes ₦100s per hour.", icon: "❄️" },
  { id: "ac-2hp-std", name: "AC (2HP Standard)", average_watts: 1800, wise_usage: "High drain! Use only during essential hours on Band A.", icon: "❄️" },
  { id: "iron-steam", name: "Electric Iron (Steam)", average_watts: 2000, wise_usage: "Iron in bulk once a week to avoid the 'startup' heat waste.", icon: "👔" },
  { id: "iron-dry", name: "Electric Iron (Dry)", average_watts: 1100, wise_usage: "Switch off 5 mins early and use residual heat for light clothes.", icon: "👔" },
  { id: "kettle", name: "Electric Kettle", average_watts: 2200, wise_usage: "Boiling a full kettle for one cup of tea costs ₦25 on Band A.", icon: "🫖" },
  { id: "deep-freezer", name: "Deep Freezer (Large)", average_watts: 350, wise_usage: "Opening the door frequently makes the compressor work 2x harder.", icon: "🧊" },
  { id: "fridge-double", name: "Fridge (Double Door)", average_watts: 250, wise_usage: "Ensure the door seal is airtight and coils are dust-free to prevent the compressor from overworking.", icon: "🧊" },
  { id: "pump-1hp", name: "Pumping Machine (1HP)", average_watts: 750, wise_usage: "Fill storage tanks in one single run to avoid frequent stop-and-start spikes that waste units.", icon: "💧" },
  { id: "water-heater", name: "Water Heater (Bathroom)", average_watts: 3000, wise_usage: "The king of waste! Switch off immediately after 15 mins.", icon: "🚿" },
  { id: "microwave", name: "Microwave", average_watts: 1200, wise_usage: "Perfect for quick reheats; defrost food in the fridge overnight instead of using the high-energy defrost setting.", icon: "📡" },
  { id: "washing-machine", name: "Washing Machine", average_watts: 500, wise_usage: "Use cold water wash cycles to reduce energy use by 80%.", icon: "🧺" },
  { id: "led-tv", name: "LED TV (32-43 inch)", average_watts: 50, wise_usage: "Kill the switch at the wall; that red standby light is a silent unit-eater.", icon: "📺" },
  { id: "plasma-tv", name: "Plasma TV (Old Model)", average_watts: 250, wise_usage: "High consumption! Consider upgrading to LED to save 75%.", icon: "📺" },
  { id: "home-theater", name: "Home Theater Sound System", average_watts: 150, wise_usage: "Turn off the 'Subwoofer' switch when listening to low volume.", icon: "🔊" },
  { id: "desktop", name: "Desktop Computer", average_watts: 300, wise_usage: "Use 'Sleep Mode' if stepping away for more than 10 mins.", icon: "🖥️" },
  { id: "laptop", name: "Laptop Charger", average_watts: 65, wise_usage: "Once fully charged, unplug the brick to stop 'phantom' drain.", icon: "💻" },
  { id: "standing-fan", name: "Standing Fan (18 inch)", average_watts: 75, wise_usage: "Clean the blades monthly; dust slows it down and wastes power.", icon: "🌬️" },
  { id: "ceiling-fan", name: "Ceiling Fan", average_watts: 85, wise_usage: "Check for 'humming' sounds; a bad capacitor wastes energy as heat.", icon: "🌀" },
  { id: "blender", name: "Blender/Grinder", average_watts: 400, wise_usage: "Sharpen blades so it grinds faster, reducing runtime.", icon: "🍹" },
  { id: "toaster", name: "Toaster", average_watts: 850, wise_usage: "Keep the tray clean to avoid blocked heating elements.", icon: "🍞" },
  { id: "air-fryer", name: "Air Fryer", average_watts: 1500, wise_usage: "Cooks faster than an oven, saving you money on long meals.", icon: "🍳" },
  { id: "gaming-console", name: "Gaming Console (PS5/Xbox)", average_watts: 200, wise_usage: "Turn off 'Always On' features in the console settings.", icon: "🎮" },
  { id: "starlink", name: "Starlink Dish", average_watts: 50, wise_usage: "Unplug at night if not downloading to save ₦1,000s monthly.", icon: "📡" },
  { id: "floodlight", name: "LED Floodlight (Security)", average_watts: 50, wise_usage: "Add a motion sensor so it only stays on when someone moves.", icon: "🔦" },
  { id: "incandescent-bulb", name: "Incandescent Bulb (Old)", average_watts: 100, wise_usage: "Replace with a 10W LED to get same light for 90% less cost.", icon: "💡" },
];

export interface TariffBand {
  id: string;
  name: string;
  rate: number;
  supplyHours: number;
  label: string;
}

export const TARIFF_BANDS: TariffBand[] = [
  { id: "A", name: "Band A", rate: 209.50, supplyHours: 24, label: "20+ hrs" },
  { id: "B", name: "Band B", rate: 60.00, supplyHours: 16, label: "16+ hrs" },
  { id: "C", name: "Band C", rate: 56.00, supplyHours: 12, label: "12+ hrs" },
  { id: "D", name: "Band D", rate: 32.48, supplyHours: 8, label: "8+ hrs" },
  { id: "E", name: "Band E", rate: 32.44, supplyHours: 4, label: "4+ hrs" },
];

export interface UserAppliance {
  appliance: Appliance;
  hoursPerDay: number;
  dailyCost: number;
  monthlyCost: number;
}
