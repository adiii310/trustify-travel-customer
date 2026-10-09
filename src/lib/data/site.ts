export const SITE = {
  name: "Trustify Trips",
  tagline: "TRAVEL. VERIFIED.",
  whatsapp: "919999999999",
  whatsappMessage: "Hi Trustify Trips, I need help choosing a travel company.",
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/companies", label: "Verified Companies" },
  { href: "/compare", label: "Compare" },
  { href: "/trips", label: "My Trips" },
  { href: "/reviews", label: "Reviews" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

export const HERO_STATS = [
  { icon: "🏢", value: "450+", label: "Verified Companies" },
  { icon: "📍", value: "90+", label: "Destinations" },
  { icon: "💬", value: "50,000+", label: "Verified Reviews" },
  { icon: "🛡️", value: "9", label: "Trust Parameters" },
];

export const TRUST_BADGES = [
  { icon: "✔", label: "Verified & Tested" },
  { icon: "👤", label: "Background Checked" },
  { icon: "📄", label: "Transparent Pricing" },
  { icon: "⚙", label: "Service Tested" },
  { icon: "🎧", label: "Best Customer Support" },
];

export const VERIFY_STEPS = [
  { icon: "📝", title: "Application", detail: "The company applies with its basic details." },
  { icon: "🪪", title: "Document Verification", detail: "GST, registration and tourism licences are checked." },
  { icon: "🔍", title: "Background Check", detail: "Owners, history and complaints are reviewed." },
  { icon: "📦", title: "Package Analysis", detail: "Itineraries and pricing are checked for transparency." },
  { icon: "🕵️", title: "Mystery Booking", detail: "Our team books and experiences a real trip." },
  { icon: "💬", title: "Customer Feedback", detail: "Traveller reviews are verified and analysed." },
  { icon: "✅", title: "Final Inspection", detail: "A final review of service quality and safety." },
  { icon: "🏅", title: "Trust Score", detail: "A score out of 100 is published and re-evaluated regularly." },
];

export const RESOURCES = [
  {
    q: "How to choose a trustworthy travel company",
    a: "Check that the company shows a verified registration, a real office address and a clear cancellation policy. Compare itineraries line by line, not just the headline price.",
  },
  {
    q: "Kedarnath yatra checklist",
    a: "Carry a rain jacket, warm layers, a valid photo ID, your yatra registration and any regular medicines. Book stays before the peak season from May to June.",
  },
  {
    q: "How the Trust Score works",
    a: "Each company is scored out of 100 across 9 parameters, including itinerary quality, safety, transparency and support, after documents, mystery bookings and customer feedback are checked.",
  },
  {
    q: "Spotting hidden charges",
    a: "Ask what is not included: entry fees, permits, heater or oxygen charges, and pony or helicopter costs. A trustworthy company lists inclusions and exclusions in writing.",
  },
  {
    q: "Best time to visit popular destinations",
    a: "Kedarnath and Spiti are best from May to October, Leh Ladakh from June to September, Kerala from September to March and Bali from April to October.",
  },
  {
    q: "Travel safety basics",
    a: "Share your itinerary with family, keep digital copies of documents, buy travel insurance and confirm the operator's emergency contact before you leave.",
  },
];

export const INTERESTS = [
  "Pilgrimage",
  "Trekking",
  "Photography",
  "Food",
  "Wildlife",
  "Beaches",
  "Heritage",
  "Adventure sports",
  "Offbeat stays",
  "Shopping",
];

export const BUDGET_RANGES = [
  { label: "Under ₹8,000", min: 0, max: 8000 },
  { label: "₹8,000 - ₹12,000", min: 8000, max: 12000 },
  { label: "₹12,000 - ₹18,000", min: 12000, max: 18000 },
  { label: "₹18,000 - ₹40,000", min: 18000, max: 40000 },
  { label: "₹40,000 & above", min: 40000, max: Number.MAX_SAFE_INTEGER },
];

export const DURATIONS = [
  { label: "2N / 3D", nights: [2] },
  { label: "3N / 4D", nights: [3] },
  { label: "4N / 5D", nights: [4] },
  { label: "5N / 6D & above", nights: [5, 6, 7, 8] },
];
