export interface Appliance {
  id: string;
  name: string;
  average_watts: number;
  wise_usage: string;
  icon: string;
}

export const APPLIANCES: Appliance[] = [
  { id: "ac-1hp-inv", name: "AC (1HP Inverter)", average_watts: 750, wise_usage: "Set to 24°C to save up to 15% on cooling costs. Switch off 30 mins before leaving; trapped cool air lasts longer than you think.", icon: "❄️" },
  { id: "ac-1.5hp-inv", name: "AC (1.5HP Inverter)", average_watts: 1100, wise_usage: "Keep the room sealed; a small gap wastes ₦100s per hour. Switch off 30 mins before leaving; trapped cool air lasts longer than you think.", icon: "❄️" },
  { id: "ac-2hp-std", name: "AC (2HP Standard)", average_watts: 1800, wise_usage: "High drain! Use only during essential hours. Switch off 30 mins before leaving; trapped cool air lasts longer than you think.", icon: "❄️" },
  { id: "iron-steam", name: "Electric Iron (Steam)", average_watts: 2000, wise_usage: "Iron in bulk once a week to avoid the 'startup' heat waste. Use residual heat for light fabrics after unplugging.", icon: "👔" },
  { id: "iron-dry", name: "Electric Iron (Dry)", average_watts: 1100, wise_usage: "Switch off 5 mins early and use residual heat for light clothes.", icon: "👔" },
  { id: "kettle", name: "Electric Kettle", average_watts: 2200, wise_usage: "Boil only what you need; a full kettle for one cup is pure money waste. Costs ₦25 on Band A per boil.", icon: "🫖" },
  { id: "deep-freezer", name: "Deep Freezer (Large)", average_watts: 350, wise_usage: "Opening the door frequently makes the compressor work 2x harder.", icon: "🧊" },
  { id: "fridge-double", name: "Fridge (Double Door)", average_watts: 250, wise_usage: "Keep coils dust-free and check the door seal; a leaking seal overworks the compressor. Keep 4 inches from the wall for airflow.", icon: "🧊" },
  { id: "pump-1hp", name: "Pumping Machine (1HP)", average_watts: 750, wise_usage: "Fill storage tanks in one single run to avoid frequent stop-and-start spikes that waste units.", icon: "💧" },
  { id: "water-heater", name: "Water Heater (Bathroom)", average_watts: 3000, wise_usage: "The king of waste! Switch off immediately after 15 mins.", icon: "🚿" },
  { id: "microwave", name: "Microwave", average_watts: 1200, wise_usage: "Perfect for quick reheats; defrost food in the fridge overnight instead of using the high-energy defrost setting. Unplug when not in use.", icon: "📡" },
  { id: "washing-machine", name: "Washing Machine", average_watts: 500, wise_usage: "Use cold water wash cycles to reduce energy use by 80%.", icon: "🧺" },
  { id: "led-tv", name: "LED TV (32-43 inch)", average_watts: 50, wise_usage: "Kill the switch at the wall; that red standby light is a silent unit-eater. Lower backlight in settings.", icon: "📺" },
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
  { id: "led-bulb", name: "LED Bulb (10W)", average_watts: 10, wise_usage: "Switch off when not in use and maximize natural daylight.", icon: "💡" },
  { id: "energy-saving-bulb", name: "Energy Saving Bulb (CFL)", average_watts: 25, wise_usage: "Don't switch on and off frequently — CFLs last longer with steady use.", icon: "💡" },
  { id: "rechargeable-fan", name: "Rechargeable Fan", average_watts: 45, wise_usage: "Charge fully and unplug; overcharging degrades the battery over time.", icon: "🌬️" },
  { id: "rechargeable-lamp", name: "Rechargeable Lamp/Lantern", average_watts: 20, wise_usage: "Use LED rechargeable lamps instead of candles or kerosene for safety and savings.", icon: "🔦" },
  { id: "phone-charger", name: "Phone Charger", average_watts: 10, wise_usage: "Unplug after charging; leaving it plugged drains small but constant phantom units.", icon: "📱" },
  { id: "hair-dryer", name: "Hair Dryer", average_watts: 1500, wise_usage: "Use on low heat setting; towel-dry first to reduce drying time by half.", icon: "💇" },
  { id: "hair-clipper", name: "Hair Clipper (Barbing)", average_watts: 15, wise_usage: "Very low wattage — charge and use cordlessly to save even more.", icon: "✂️" },
  { id: "electric-cooker", name: "Electric Cooker (Hot Plate)", average_watts: 1500, wise_usage: "Use flat-bottomed pots for better heat contact; cover pots to cook faster.", icon: "🍲" },
  { id: "induction-cooker", name: "Induction Cooker", average_watts: 1800, wise_usage: "Heats faster than hot plates, saving 30-50% energy. Use induction-compatible pots.", icon: "🍲" },
  { id: "electric-oven", name: "Electric Oven", average_watts: 2000, wise_usage: "Preheat only when necessary. Avoid opening the door frequently while baking.", icon: "🍞" },
  { id: "rice-cooker", name: "Rice Cooker", average_watts: 700, wise_usage: "Switch to 'warm' automatically; unplug once rice is done to avoid wasting units.", icon: "🍚" },
  { id: "food-processor", name: "Food Processor", average_watts: 500, wise_usage: "Prep ingredients in batches to reduce total run time.", icon: "🥘" },
  { id: "chest-freezer-small", name: "Chest Freezer (Small)", average_watts: 200, wise_usage: "Keep it at least 3/4 full — frozen items help maintain cold temperature.", icon: "🧊" },
  { id: "fridge-single", name: "Fridge (Single Door)", average_watts: 150, wise_usage: "Keep the door closed as much as possible and defrost regularly.", icon: "🧊" },
  { id: "dispenser", name: "Water Dispenser (Hot & Cold)", average_watts: 550, wise_usage: "Turn off the hot water switch when not needed — it runs a heating element constantly.", icon: "🚰" },
  { id: "pressing-iron-industrial", name: "Industrial Pressing Iron", average_watts: 2500, wise_usage: "Used in tailoring shops — iron in large batches and use a timer to avoid overheating.", icon: "👔" },
  { id: "sewing-machine", name: "Electric Sewing Machine", average_watts: 100, wise_usage: "Low consumption — keep motor oiled for efficient operation.", icon: "🧵" },
  { id: "printer", name: "Printer (Inkjet/Laser)", average_watts: 50, wise_usage: "Turn off after use; laser printers use more power when warming up.", icon: "🖨️" },
  { id: "router-wifi", name: "Wi-Fi Router", average_watts: 12, wise_usage: "Runs 24/7 but uses little power. Restart weekly for better performance.", icon: "📶" },
  { id: "decoder-dstv", name: "DSTV/GOtv Decoder", average_watts: 30, wise_usage: "Switch off at the wall when not watching — standby mode still draws power.", icon: "📺" },
  { id: "electric-stove", name: "Electric Stove (4-Burner)", average_watts: 3000, wise_usage: "Use one burner at a time when possible. Match pot size to burner size.", icon: "🔥" },
  { id: "security-camera", name: "CCTV/Security Camera (per unit)", average_watts: 15, wise_usage: "Use motion-activated recording to reduce DVR power consumption.", icon: "📹" },
  { id: "dvr-nvr", name: "DVR/NVR (Security Recording)", average_watts: 60, wise_usage: "Set recording to motion-detect mode instead of continuous to save power.", icon: "📹" },
  { id: "inverter-charger", name: "Inverter Battery Charger", average_watts: 500, wise_usage: "Charge batteries only when NERC power is on. Avoid overcharging — use auto-shutoff inverters.", icon: "🔋" },
  { id: "stabilizer", name: "Voltage Stabilizer", average_watts: 50, wise_usage: "Low draw but always on — turn off when the appliance it protects is not in use.", icon: "⚡" },
  { id: "electric-shower", name: "Instant Electric Shower", average_watts: 3500, wise_usage: "Extremely high wattage! Limit to 5-minute showers to control costs.", icon: "🚿" },
  { id: "bread-maker", name: "Bread Maker", average_watts: 600, wise_usage: "Use the timer function to bake during off-peak hours.", icon: "🍞" },
  { id: "vacuum-cleaner", name: "Vacuum Cleaner", average_watts: 1400, wise_usage: "Clean filters regularly for maximum suction and shorter cleaning time.", icon: "🧹" },
  { id: "hand-mixer", name: "Hand Mixer", average_watts: 200, wise_usage: "Uses less power than a blender for light mixing tasks.", icon: "🥄" },
  { id: "exhaust-fan", name: "Exhaust Fan (Kitchen/Bathroom)", average_watts: 40, wise_usage: "Clean the blades quarterly — grease buildup reduces efficiency.", icon: "🌀" },
  { id: "table-fan", name: "Table Fan (Small)", average_watts: 50, wise_usage: "Great low-cost alternative to AC for small spaces.", icon: "🌬️" },
  { id: "mosquito-killer", name: "Electric Mosquito Killer/Repeller", average_watts: 10, wise_usage: "Very low consumption — can run overnight safely.", icon: "🦟" },
  { id: "pos-machine", name: "POS Machine (Charging)", average_watts: 15, wise_usage: "Unplug once fully charged. Most POS terminals charge in 2-3 hours.", icon: "💳" },
  { id: "sandwich-maker", name: "Sandwich Maker/Grill", average_watts: 750, wise_usage: "Preheat briefly and cook in batches to reduce total on-time.", icon: "🥪" },
  { id: "popcorn-maker", name: "Popcorn Maker", average_watts: 1200, wise_usage: "Quick use appliance — unplug immediately after popping.", icon: "🍿" },
  { id: "electric-grill", name: "Electric Grill/BBQ", average_watts: 1800, wise_usage: "High wattage — use outdoors with proper ventilation and limit use time.", icon: "🍖" },
  { id: "projector", name: "Projector", average_watts: 250, wise_usage: "Use eco mode for lower brightness and longer lamp life.", icon: "🎬" },
  { id: "sound-bar", name: "Sound Bar", average_watts: 30, wise_usage: "Turn off when not in use — much more efficient than full surround systems.", icon: "🔊" },
  { id: "electric-blanket", name: "Electric Blanket", average_watts: 200, wise_usage: "Use on low setting and turn off before sleeping.", icon: "🛏️" },
  { id: "treadmill", name: "Treadmill", average_watts: 800, wise_usage: "Walk instead of running to use less motor power.", icon: "🏃" },
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
  quantity: number;
  hoursPerDay: number;
  dailyCost: number;
  monthlyCost: number;
}
