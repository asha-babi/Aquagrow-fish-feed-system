/**
 * ════════════════════════════════════════════════════════════
 *  Aquagrow – DATABASE FILE
 *  Judy Fish Facilities, Gaza Province, Mozambique
 *  Nile Tilapia (Oreochromis niloticus) Research
 * ════════════════════════════════════════════════════════════
 */

/* ─────────────────────────────────────────────────────────
   SECTION 1: INGREDIENT IMAGES
   Each entry links an ingredient name to a verified public image URL.
   ───────────────────────────────────────────────────────── */
const INGREDIENT_GALLERY = [
  {
    name:    "Fishmeal",
    caption: "Fish meal (60% CP) – high-quality primary protein source",
    url:     "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&q=80"
  },
  {
    name:    "Peanut cake",
    caption: "Peanut cake – rich plant protein & natural attractant",
    url:     "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&q=80"
  },
  {
    name:    "Rice bran",
    caption: "Rice bran – excellent local energy & fibre supplement",
    url:     "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80"
  },
  {
    name:    "Wheat bran",
    caption: "Wheat bran – energy & bulking agent",
    url:     "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=400&q=80"
  },
  {
    name:    "Cassava",
    caption: "Cassava – natural binder & starch source",
    url:     "https://images.unsplash.com/photo-1471771327165-aa841af98748?w=400&q=80"
  },
  {
    name:    "Soybean oil",
    caption: "Soybean oil – essential lipids, fatty acids & energy boost",
    url:     "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80"
  },
  {
    name:    "Maize bran",
    caption: "Maize bran – cost-effective local carbohydrate source",
    url:     "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80"
  },
  {
    name:    "Sunflower cake",
    caption: "Sunflower cake – alternative protein meal with high fiber",
    url:     "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&q=80"
  },
  {
    name:    "Bone meal",
    caption: "Bone meal – vital mineral source for skeletal development",
    url:     "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&q=80"
  }
];

/* ─────────────────────────────────────────────────────────
   SECTION 2: FAO NUTRITIONAL REQUIREMENTS
   ───────────────────────────────────────────────────────── */
const FAO_RANGES = {
  fry:      { protein:[40,50], lipid:[10,15], ash:[0,12], fiber:[0,8] },
  juvenile: { protein:[30,40], lipid:[8,12],  ash:[0,10], fiber:[0,8] },
  grower:   { protein:[28,30], lipid:[5,8],   ash:[0,10], fiber:[0,8] },
};

/* ─────────────────────────────────────────────────────────
   SECTION 3: STAGE FORMULATIONS
   ───────────────────────────────────────────────────────── */
const STAGES = [
  {
    name: "FRY",
    range: "0 – 5 g",
    requirements: FAO_RANGES.fry,
    ingredients: [
      { name:"Fishmeal",           pct:59.00, protein:35.40, lipid:5.80, ash:8.85, fiber:0.59 },
      { name:"Peanut cake",        pct:25.00, protein:10.00, lipid:2.00, ash:1.50, fiber:3.00 },
      { name:"Rice bran",          pct:1.25,  protein:0.10,  lipid:0.10, ash:0.12, fiber:0.12 },
      { name:"Wheat bran",         pct:4.00,  protein:0.56,  lipid:0.16, ash:0.20, fiber:0.40 },
      { name:"Cassava",            pct:3.00,  protein:0.09,  lipid:0.02, ash:0.06, fiber:0.06 },
      { name:"Soybean oil",        pct:6.00,  protein:0.00,  lipid:6.00, ash:0.00, fiber:0.00 },
      { name:"Wood ash/eggshells", pct:0.47,  protein:0.00,  lipid:0.00, ash:0.47, fiber:0.00 },
      { name:"Lysine+Methionine",  pct:0.78,  protein:0.78,  lipid:0.00, ash:0.00, fiber:0.00 },
      { name:"Vit/Min premix",     pct:0.50,  protein:0.00,  lipid:0.00, ash:0.10, fiber:0.00 },
      { name:"Calicium propionate",pct:0.20,  protein:0.00,  lipid:0.00, ash:0.10, fiber:0.00 },
    
    ],
    totals:{ protein:46.86, lipid:14.16, ash:11.28, fiber:4.12 },
    commercial:{ protein:"43% min", lipid:"6.5% min", fiber:"3% max", moisture:"12% max", ash:"–" },
  },
  {
    name: "JUVENILE",
    range: "5 – 50 g",
    requirements: FAO_RANGES.juvenile,
    ingredients: [
      { name:"Fishmeal",           pct:30.00, protein:18.00, lipid:3.00, ash:4.50, fiber:0.30 },
      { name:"Peanut cake",        pct:25.00, protein:10.00, lipid:2.00, ash:1.50, fiber:3.00 },
      { name:"Rice bran",          pct:12.25, protein:1.20,  lipid:1.20, ash:1.44, fiber:1.44 },
      { name:"Wheat bran",         pct:12.00, protein:1.68,  lipid:0.48, ash:0.60, fiber:1.20 },
      { name:"Cassava",            pct:8.00,  protein:0.24,  lipid:0.06, ash:0.16, fiber:0.16 },
      { name:"Soybean oil",        pct:6.00,  protein:0.00,  lipid:5.00, ash:0.00, fiber:0.00 },
      { name:"Wood ash/eggshells", pct:2.00,  protein:0.00,  lipid:0.00, ash:2.00, fiber:0.00 },
      { name:"Lysine+Methionine",  pct:0.78,  protein:0.78,  lipid:0.00, ash:0.00, fiber:0.00 },
      { name:"Premix",             pct:0.50,  protein:0.00,  lipid:0.00, ash:0.10, fiber:0.00 },
      { name:"Calcium propionate", pct:0.20,  protein:0.00,  lipid:0.00, ash:0.00, fiber:0.00 },
    ],
    totals:{ protein:32.04, lipid:11.74, ash:10.00, fiber:6.19},
    commercial:{ protein:"35% min", lipid:"7% min", fiber:"4% max", moisture:"12% max", ash:"12% max" },
  },
  {
    name: "GROWER",
    range: "> 50 g",
    requirements: FAO_RANGES.grower,
    ingredients: [
      { name:"Fishmeal (60% CP)",  pct:24.00, protein:14.40, lipid:2.40, ash:3.60, fiber:0.24 },
      { name:"Peanut cake",        pct:24.00, protein:9.60,  lipid:1.92, ash:1.44, fiber:2.88 },
      { name:"Rice bran",          pct:15.25, protein:1.50,  lipid:1.50, ash:1.80, fiber:1.80 },
      { name:"Wheat bran",         pct:14.00, protein:2.24,  lipid:0.70, ash:0.70, fiber:1.40 },
      { name:"Cassava",            pct:10.00, protein:0.30,  lipid:0.05, ash:0.20, fiber:0.20 },
      { name:"Soybean oil",        pct:2.00,  protein:0.00,  lipid:2.00, ash:0.00, fiber:0.00 },
      { name:"Wood ash/eggshells", pct:1.50,  protein:0.00,  lipid:0.00, ash:1.50, fiber:0.00 },
      { name:"Lysine+Methionine",  pct:0.78,  protein:0.78,  lipid:0.00, ash:0.00, fiber:0.00 },
      { name:"Vit/Min premix",     pct:0.50,  protein:0.00,  lipid:0.00, ash:0.10, fiber:0.00 },
      { name:"Calicium propionate",pct:0.20,  protein:0.00,  lipid:0.00, ash:0.10, fiber:0.00 },
    ],
    totals:{ protein:29.07, lipid:7.91, ash:9.51, fiber:6.69 },
    commercial:{ protein:"30% min", lipid:"5% min", fiber:"8% max", moisture:"12% max", ash:"10% max" },
  }
];

/* ─────────────────────────────────────────────────────────
   SECTION 4: COST DATA
   ───────────────────────────────────────────────────────── */
const COSTS = [
  { name:"Fishmeal (waste, 60% CP)", price:2.50, fryKg:5.900, juvKg:3.000, grwKg:2.400 },
  { name:"Peanut cake",              price:1.25, fryKg:2.500, juvKg:2.500, grwKg:2.400 },
  { name:"Rice bran",                price:0.40, fryKg:0.125, juvKg:1.225, grwKg:1.525 },
  { name:"Wheat bran",               price:0.45, fryKg:0.400, juvKg:1.200, grwKg:1.400 },
  { name:"Cassava",                  price:0.70, fryKg:0.300, juvKg:0.800, grwKg:1.000 },
  { name:"Soybean oil",              price:2.75, fryKg:0.600, juvKg:0.600, grwKg:0.200 },
  { name:"Wood ash/eggshells",       price:0.00, fryKg:0.047, juvKg:0.200, grwKg:0.150 },
  { name:"Lysine",                   price:3.80, fryKg:0.051, juvKg:0.051, grwKg:0.051 },
  { name:"Methionine",               price:5.50, fryKg:0.027, juvKg:0.027, grwKg:0.027 },
  { name:"Vit/Min premix",           price:4.00, fryKg:0.050, juvKg:0.050, grwKg:0.050 },
];

/* ─────────────────────────────────────────────────────────
   SECTION 5: INGREDIENTS CATALOGUE
   ───────────────────────────────────────────────────────── */
window.ingredients = [
  { id:1, name:"Fishmeal",            protein:60,  lipid:10,  ash:15,  fiber:1.0, price:2.50, stock:20 },
  { id:2, name:"Peanut cake",         protein:40,  lipid:8,   ash:6,   fiber:12,  price:1.25, stock:30 },
  { id:3, name:"Rice bran",           protein:8,   lipid:8,   ash:9.6, fiber:9.6, price:0.40, stock:15 },
  { id:4, name:"Wheat bran",          protein:14,  lipid:4,   ash:5,   fiber:10,  price:0.45, stock:20 },
  { id:5, name:"Cassava",             protein:3,   lipid:0.7, ash:2,   fiber:2,   price:0.70, stock:25 },
  { id:6, name:"Soybean oil",         protein:0,   lipid:100, ash:0,   fiber:0,   price:2.75, stock:10 },
  { id:7, name:"Wood ash/eggshells",  protein:0,   lipid:0,   ash:100, fiber:0,   price:0.00, stock:5  },
  { id:8, name:"Lysine+Methionine",   protein:100, lipid:0,   ash:0,   fiber:0,   price:4.50, stock:3  },
  { id:9, name:"Vit/Min premix",      protein:0,   lipid:0,   ash:20,  fiber:0,   price:4.00, stock:2  },
];
window.nextId = 10;

/* ─────────────────────────────────────────────────────────
   SECTION 6: PRODUCTION DATA
   ───────────────────────────────────────────────────────── */
let productionRecords = [
  { id:1, date:"2025-01-10", stage:"Fry",      batchKg:10, fcr:1.2, fishKg:0.5,  notes:"First trial batch" },
  { id:2, date:"2025-01-24", stage:"Fry",      batchKg:10, fcr:1.1, fishKg:0.8,  notes:"Good pellet binding" },
  { id:3, date:"2025-02-07", stage:"Juvenile", batchKg:10, fcr:1.5, fishKg:5.0,  notes:"Transferred from fry tank" },
  { id:4, date:"2025-02-21", stage:"Juvenile", batchKg:10, fcr:1.4, fishKg:12.0, notes:"Normal growth" },
  { id:5, date:"2025-03-07", stage:"Grower",   batchKg:10, fcr:1.8, fishKg:55.0, notes:"Moved to grow-out pond" },
  { id:6, date:"2025-03-21", stage:"Grower",   batchKg:10, fcr:1.7, fishKg:80.0, notes:"Harvest approaching" },
];
let nextProdId = 7;

/* ─────────────────────────────────────────────────────────
   SECTION 6b: CUSTOM FEED FORMULATIONS (farmer-created)
   Built on the Formulations page. Each entry:
   { id, name, stage, batchKg,
     ingredients:[{ingredientId, customName, pct, protein, lipid, ash, fiber}],
     totalProtein, totalLipid, totalAsh, totalFiber, createdDate }
   ───────────────────────────────────────────────────────── */
let customFormulations = [];
let nextFormulationId = 1;

/* ─────────────────────────────────────────────────────────
   SECTION 7: ABOUT US CONTENT
   ───────────────────────────────────────────────────────── */
const ABOUT = {
  headline: "Advancing Aquaculture Through Science",
  intro: "Aquagrow Fish Feed Ingredient Management platform (AFFIMP) is a research-driven platform developed at Judy Fish Facilities in Gaza Province, Mozambique. Our mission is to produce high-quality, cost-effective fish feed for Nile Tilapia (Oreochromis niloticus) that meets FAO nutritional standards using locally available ingredients.",
  mission: "We believe that African aquaculture can be self-sufficient. By formulating feeds from locally sourced ingredients — peanut cake, cassava, rice bran, and fishmeal from by-catch waste — we reduce dependency on imported commercial feeds and lower production costs for smallholder fish farmers across the region.",
  address:  "Judy Fish Facilities, Gaza Province, Mozambique",
  email:    "info@aquagrow-ffims.mz",
  phone:    "+258 84 000 0000",
  founded:  "2024",
};

/* ─────────────────────────────────────────────────────────
   SECTION 8: CONTACT FORM RECIPIENT EMAIL
   ───────────────────────────────────────────────────────── */
const CONTACT_EMAIL = "info@aquagrow-ffims.mz";