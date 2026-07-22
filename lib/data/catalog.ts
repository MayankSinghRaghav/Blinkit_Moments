export type Category =
  | "Beverages"
  | "Snacks"
  | "Home"
  | "Desserts"
  | "Mixers"
  | "Pet"
  | "Baby"
  | "PersonalCare"
  | "Wellness"
  | "Groceries";

export type Product = {
  id: string;
  name: string;
  category: Category;
  price_inr: number;
  tags: string[];
  starter?: boolean;
  /** demo social proof — only on high-consideration items */
  rating?: number;
  reviews?: number;
  proof?: string;
};

/** Categories a first-timer hesitates over — these need a trust cue. */
export const HIGH_CONSIDERATION: Category[] = ["Pet", "Baby", "PersonalCare", "Wellness"];

export const CATEGORIES: Category[] = [
  "Beverages",
  "Snacks",
  "Home",
  "Desserts",
  "Mixers",
  "Pet",
  "Baby",
  "PersonalCare",
  "Wellness",
  "Groceries",
];

export const PRODUCTS: Product[] = [
  // Beverages
  { id: "bev_beer", name: "Kingfisher Ultra 6-pack", category: "Beverages", price_inr: 780, tags: ["party", "adult"] },
  { id: "bev_cola", name: "Coca-Cola 1.25L", category: "Beverages", price_inr: 70, tags: ["party", "kids"] },
  { id: "bev_juice", name: "Real Mixed Fruit Juice 1L", category: "Beverages", price_inr: 120, tags: ["kids", "breakfast"] },
  { id: "bev_ginger_tea", name: "Ginger Masala Chai 250g", category: "Beverages", price_inr: 165, tags: ["monsoon", "comfort"] },
  { id: "bev_cold_brew", name: "Sleepy Owl Cold Brew Pack", category: "Beverages", price_inr: 299, tags: ["morning"] },

  // Snacks
  { id: "snk_nachos", name: "Doritos Nacho Cheese 150g", category: "Snacks", price_inr: 99, tags: ["party", "game"] },
  { id: "snk_chips", name: "Lay's Magic Masala 90g", category: "Snacks", price_inr: 50, tags: ["party"] },
  { id: "snk_dip", name: "Salsa & Cheese Dip Combo", category: "Snacks", price_inr: 210, tags: ["party", "game"] },
  { id: "snk_noodles", name: "Maggi 2-Minute Noodles 8-pack", category: "Snacks", price_inr: 128, tags: ["monsoon", "comfort"] },
  { id: "snk_pakora", name: "Instant Pakora Mix 200g", category: "Snacks", price_inr: 85, tags: ["monsoon", "comfort"] },

  // Home
  { id: "hom_plates", name: "Disposable Party Plates (25)", category: "Home", price_inr: 149, tags: ["party", "cleanup"] },
  { id: "hom_napkins", name: "Paper Napkins 100-sheet", category: "Home", price_inr: 65, tags: ["party", "cleanup"] },
  { id: "hom_trash", name: "Garbage Bags Medium (30)", category: "Home", price_inr: 129, tags: ["cleanup"] },
  { id: "hom_floor", name: "Floor Cleaner Citrus 1L", category: "Home", price_inr: 189, tags: ["cleanup", "pet"] },
  { id: "hom_diya", name: "Diya & Tealight Set (24)", category: "Home", price_inr: 199, tags: ["festival"] },

  // Desserts
  { id: "des_choco_tub", name: "Choco Fudge Tub 750ml", category: "Desserts", price_inr: 320, tags: ["party", "game"] },
  { id: "des_icecream", name: "Vanilla Ice Cream 1L", category: "Desserts", price_inr: 260, tags: ["party"] },
  { id: "des_gulab", name: "Gulab Jamun Tin 500g", category: "Desserts", price_inr: 180, tags: ["festival"] },
  { id: "des_brownie", name: "Fudge Brownie Bites (6)", category: "Desserts", price_inr: 150, tags: ["monsoon", "comfort"] },

  // Mixers
  { id: "mix_tonic", name: "Schweppes Tonic Water (4)", category: "Mixers", price_inr: 180, tags: ["party", "adult"] },
  { id: "mix_lime", name: "Fresh Lime & Mint Pack", category: "Mixers", price_inr: 60, tags: ["party"] },
  { id: "mix_soda", name: "Club Soda 750ml (2)", category: "Mixers", price_inr: 70, tags: ["party", "adult"] },

  // Pet (high consideration)
  {
    id: "pet_treats",
    name: "Dog Training Treats — Starter 100g",
    category: "Pet",
    price_inr: 149,
    tags: ["pet", "first-time"],
    starter: true,
    rating: 4.6,
    reviews: 2140,
    proof: "8 in 10 first-time pet parents reorder within a month",
  },
  { id: "pet_litter", name: "Clumping Cat Litter 5kg", category: "Pet", price_inr: 549, tags: ["pet"], rating: 4.4, reviews: 890 },
  { id: "pet_bowl", name: "Anti-Skid Steel Pet Bowl", category: "Pet", price_inr: 299, tags: ["pet", "first-time"], rating: 4.5, reviews: 610 },

  // Baby (high consideration)
  {
    id: "bab_wipes",
    name: "Baby Water Wipes — Starter 24s",
    category: "Baby",
    price_inr: 99,
    tags: ["baby", "first-time"],
    starter: true,
    rating: 4.7,
    reviews: 5320,
    proof: "Most-added first Baby item by new parents on the app",
  },
  { id: "bab_diapers", name: "Pant-Style Diapers M (32)", category: "Baby", price_inr: 649, tags: ["baby"], rating: 4.5, reviews: 3100 },
  { id: "bab_lotion", name: "Baby Moisturising Lotion 200ml", category: "Baby", price_inr: 265, tags: ["baby"], rating: 4.6, reviews: 1450 },

  // PersonalCare (high consideration)
  {
    id: "pc_facewash",
    name: "Gentle Face Wash — Starter 50ml",
    category: "PersonalCare",
    price_inr: 119,
    tags: ["care", "first-time"],
    starter: true,
    rating: 4.4,
    reviews: 1870,
    proof: "Small pack — 4.4★ from 1.8k buyers, returns accepted",
  },
  { id: "pc_handwash", name: "Foaming Hand Wash 250ml", category: "PersonalCare", price_inr: 149, tags: ["care", "pet", "baby"], rating: 4.5, reviews: 2300 },
  { id: "pc_sanitizer", name: "Pocket Sanitiser Duo", category: "PersonalCare", price_inr: 89, tags: ["care"], rating: 4.3, reviews: 720 },

  // Wellness (high consideration)
  {
    id: "wel_immunity",
    name: "Immunity Drink Mix — Starter 7 sachets",
    category: "Wellness",
    price_inr: 179,
    tags: ["wellness", "monsoon", "first-time"],
    starter: true,
    rating: 4.5,
    reviews: 1240,
    proof: "7-day pack — 62% of monsoon buyers repeat in 3 weeks",
  },
  { id: "wel_protein", name: "Whey Protein Trial 250g", category: "Wellness", price_inr: 499, tags: ["wellness", "fitness", "first-time"], starter: true, rating: 4.4, reviews: 980 },
  { id: "wel_vitc", name: "Vitamin C Effervescent (20)", category: "Wellness", price_inr: 235, tags: ["wellness", "monsoon"], rating: 4.6, reviews: 1610 },

  // Groceries
  { id: "gro_milk", name: "Amul Toned Milk 1L", category: "Groceries", price_inr: 68, tags: ["staple"] },
  { id: "gro_bread", name: "Brown Bread 400g", category: "Groceries", price_inr: 55, tags: ["staple"] },
  { id: "gro_eggs", name: "Farm Eggs (12)", category: "Groceries", price_inr: 96, tags: ["staple"] },
];

export const byId = (id: string) => PRODUCTS.find((p) => p.id === id);
export const isHighConsideration = (c: string) => HIGH_CONSIDERATION.includes(c as Category);
