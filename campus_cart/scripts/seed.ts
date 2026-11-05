import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import { User, type IUser } from "../src/models/User";
import { Listing, type IListing } from "../src/models/Listing";
import { Enquiry, type IEnquiry } from "../src/models/Enquiry";
import { Favorite } from "../src/models/Favorite";
import { Notification } from "../src/models/Notification";

async function runSeed() {
  console.log("==========================================");
  console.log("🌱 CampusCart Database Seeder Starting...");
  console.log("==========================================");

  try {
    await connectDB();
    console.log(" Connected to MongoDB successfully.");

    // 1. CLEAR COLLECTIONS (Make seed idempotent and re-runnable)
    console.log("\n🧹 Clearing existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Listing.deleteMany({}),
      Enquiry.deleteMany({}),
      Favorite.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log(" Collections cleared.");

    // 2. CREATE 10 USERS
    console.log("\n👥 Creating 10 seed users with hashed passwords...");
    const salt = await bcrypt.genSalt(10);
    const sharedPasswordHash = await bcrypt.hash("password123", salt);

    // Coordinate anchor: Delhi University North Campus [77.2090, 28.6920]
    const baseLng = 77.2090;
    const baseLat = 28.6920;

    const userData: Partial<IUser>[] = [
      {
        name: "Alex Chen",
        email: "alex.chen@campus.edu",
        passwordHash: sharedPasswordHash,
        image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
        bio: "Senior CS Major. Passionate about AI, open source, and campus tech.",
        university: "Delhi University",
        course: "B.Tech Computer Science",
        city: "New Delhi",
        location: { type: "Point", coordinates: [baseLng + 0.002, baseLat + 0.001] },
        contactPreference: "IN_APP",
        phone: "+91 98765 43210",
        showPhone: false,
        authProvider: "CREDENTIALS",
      },
      {
        name: "Priya Patel",
        email: "priya.patel@campus.edu",
        passwordHash: sharedPasswordHash,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
        bio: "Economics pre-grad. Selling pre-loved textbooks and dorm furniture.",
        university: "Delhi University",
        course: "B.A. Economics (Hons)",
        city: "New Delhi",
        location: { type: "Point", coordinates: [baseLng - 0.003, baseLat + 0.002] },
        contactPreference: "WHATSAPP",
        phone: "+91 98111 22233",
        showPhone: true,
        authProvider: "CREDENTIALS",
      },
      {
        name: "Marcus Johnson",
        email: "marcus.j@campus.edu",
        passwordHash: sharedPasswordHash,
        image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80",
        bio: "Engineering student & audiophile. Always swapping tech gear and gadgets.",
        university: "IIT Delhi",
        course: "M.Tech Electrical Engineering",
        city: "New Delhi",
        location: { type: "Point", coordinates: [baseLng + 0.005, baseLat - 0.004] },
        contactPreference: "IN_APP",
        phone: "+91 98222 33344",
        showPhone: false,
        authProvider: "CREDENTIALS",
      },
      {
        name: "Emma Watson",
        email: "emma.watson@campus.edu",
        passwordHash: sharedPasswordHash,
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
        bio: "Literature & creative arts enthusiast. Graduating soon and downsizing!",
        university: "Delhi University",
        course: "M.A. English Literature",
        city: "New Delhi",
        location: { type: "Point", coordinates: [baseLng - 0.001, baseLat - 0.002] },
        contactPreference: "EMAIL",
        phone: "+91 98333 44455",
        showPhone: false,
        authProvider: "CREDENTIALS",
      },
      {
        name: "Rahul Sharma",
        email: "rahul.sharma@campus.edu",
        passwordHash: sharedPasswordHash,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        bio: "Pre-med student. Books in mint condition with careful highlighter notes.",
        university: "AIIMS New Delhi",
        course: "MBBS",
        city: "New Delhi",
        location: { type: "Point", coordinates: [baseLng + 0.004, baseLat + 0.003] },
        contactPreference: "PHONE",
        phone: "+91 98444 55566",
        showPhone: true,
        authProvider: "CREDENTIALS",
      },
      {
        name: "Sophia Rodriguez",
        email: "sophia.r@campus.edu",
        passwordHash: sharedPasswordHash,
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
        bio: "Architecture student. Plenty of drafting stationery and models to pass down.",
        university: "School of Planning and Architecture",
        course: "B.Arch",
        city: "New Delhi",
        location: { type: "Point", coordinates: [baseLng - 0.004, baseLat - 0.001] },
        contactPreference: "WHATSAPP",
        phone: "+91 98555 66677",
        showPhone: true,
        authProvider: "CREDENTIALS",
      },
      {
        name: "Liam Smith",
        email: "liam.smith@campus.edu",
        passwordHash: sharedPasswordHash,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        bio: "Physics research scholar. Keen on astronomy, lab tools, and cycling.",
        university: "Delhi University",
        course: "Ph.D. Physics",
        city: "New Delhi",
        location: { type: "Point", coordinates: [baseLng + 0.001, baseLat + 0.005] },
        contactPreference: "IN_APP",
        phone: "+91 98666 77788",
        showPhone: false,
        authProvider: "CREDENTIALS",
      },
      {
        name: "Ananya Deshmukh",
        email: "ananya.d@campus.edu",
        passwordHash: sharedPasswordHash,
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
        bio: "Design student. Upcycling dorm furniture and trading creative craft items.",
        university: "NIFT Delhi",
        course: "B.Des Fashion Design",
        city: "New Delhi",
        location: { type: "Point", coordinates: [baseLng - 0.002, baseLat + 0.004] },
        contactPreference: "EMAIL",
        phone: "+91 98777 88899",
        showPhone: false,
        authProvider: "CREDENTIALS",
      },
      {
        name: "Noah Kim",
        email: "noah.kim@campus.edu",
        passwordHash: sharedPasswordHash,
        image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
        bio: "Exchange student studying International Relations. Moving out end of semester.",
        university: "Jawaharlal Nehru University",
        course: "M.A. International Relations",
        city: "New Delhi",
        location: { type: "Point", coordinates: [baseLng + 0.003, baseLat - 0.003] },
        contactPreference: "IN_APP",
        phone: "+91 98888 99900",
        showPhone: false,
        authProvider: "CREDENTIALS",
      },
      {
        name: "Olivia Davis",
        email: "olivia.davis@campus.edu",
        passwordHash: sharedPasswordHash,
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        bio: "Business administration sophomore. Managing the student marketplace club.",
        university: "Delhi University",
        course: "BBA",
        city: "New Delhi",
        location: { type: "Point", coordinates: [baseLng - 0.005, baseLat - 0.005] },
        contactPreference: "IN_APP",
        phone: "+91 98999 00011",
        showPhone: true,
        authProvider: "CREDENTIALS",
      },
    ];

    const createdUsers = await User.insertMany(userData);
    console.log(` Created ${createdUsers.length} users.`);
    console.log("   👉 Test Login: alex.chen@campus.edu / password123");

    // 3. CREATE 40 REALISTIC LISTINGS
    console.log("\n📦 Creating 40 realistic listings across categories and types...");

    const getSellerId = (index: number) => createdUsers[index % createdUsers.length]._id;
    const getCoords = (offsetLng: number, offsetLat: number): [number, number] => [
      baseLng + offsetLng,
      baseLat + offsetLat,
    ];

    const rawListings: Partial<IListing>[] = [
      // --- BOOKS (10 items) ---
      {
        seller: getSellerId(0),
        title: "Introduction to Algorithms (CLRS) - 4th Edition",
        description: "Standard MIT press textbook for data structures and algorithms. Clean pages, no missing sheets, slight wear on corner binding.",
        price: 1200,
        category: "BOOKS",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "North Campus Library / Faculty of Technology",
        location: { type: "Point", coordinates: getCoords(0.001, 0.001) },
        images: [{ url: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 48,
      },
      {
        seller: getSellerId(1),
        title: "Calculus: Early Transcendentals by James Stewart (8th Ed)",
        description: "Essential for 1st-year mathematics and engineering students. Hardcover edition with complete formula tear-out sheet intact.",
        price: 850,
        category: "BOOKS",
        condition: "LIKE_NEW",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "Miranda House Campus Gate",
        location: { type: "Point", coordinates: getCoords(-0.002, 0.002) },
        images: [{ url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 32,
      },
      {
        seller: getSellerId(4),
        title: "Medical Physiology by Guyton and Hall (14th Edition)",
        description: "Official textbook for MBBS first year physiology. Crisp diagrams and minimal pencil highlighting in chapters 1-5.",
        price: 1800,
        category: "BOOKS",
        condition: "LIKE_NEW",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "AIIMS Hostel Block B",
        location: { type: "Point", coordinates: getCoords(0.003, -0.004) },
        images: [{ url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 65,
      },
      {
        seller: getSellerId(3),
        title: "Principles of Economics by N. Gregory Mankiw",
        description: "Complete foundational text for economics majors. Includes all problem sets and micro/macro summaries.",
        price: 750,
        category: "BOOKS",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "RESERVED",
        isActive: true,
        locationText: "Delhi School of Economics",
        location: { type: "Point", coordinates: getCoords(0.001, 0.003) },
        images: [{ url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 41,
      },
      {
        seller: getSellerId(2),
        title: "Operating System Concepts (Silberschatz) - 10th Ed Dinosaur Book",
        description: "The classic operating systems guide. Explains virtualization, kernels, and memory management. Barely used.",
        price: 950,
        category: "BOOKS",
        condition: "LIKE_NEW",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "IIT Delhi Main Gate",
        location: { type: "Point", coordinates: getCoords(0.004, -0.003) },
        images: [{ url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 29,
      },
      {
        seller: getSellerId(6),
        title: "Organic Chemistry by Paula Yurkanis Bruice (Global Edition)",
        description: "Covers organic reactions, mechanisms, and stereochemistry. Slightly worn cover, but all interior pages are clean.",
        price: 600,
        category: "BOOKS",
        condition: "FAIR",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "St. Stephen's College Lawns",
        location: { type: "Point", coordinates: getCoords(-0.001, 0.001) },
        images: [{ url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 22,
      },
      {
        seller: getSellerId(0),
        title: "Engineering Mechanics: Statics & Dynamics (Vector Edition)",
        description: "Old semester textbook. Giving away for free to any freshman who needs it for physics/mechanics classes.",
        price: null,
        category: "BOOKS",
        condition: "POOR",
        listingType: "FREE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "North Campus Central Library Steps",
        location: { type: "Point", coordinates: getCoords(0.002, 0.002) },
        images: [{ url: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 78,
      },
      {
        seller: getSellerId(7),
        title: "Atomic Habits by James Clear (Hardcover)",
        description: "Great productivity read for college students. Open to exchange for 'Psychology of Money' or 'Sapiens'.",
        price: null,
        category: "BOOKS",
        condition: "GOOD",
        listingType: "EXCHANGE",
        exchangeFor: "The Psychology of Money or Sapiens by Yuval Noah Harari",
        status: "AVAILABLE",
        isActive: true,
        locationText: "Kamla Nagar Market Cafe",
        location: { type: "Point", coordinates: getCoords(-0.003, 0.003) },
        images: [{ url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 51,
      },
      {
        seller: getSellerId(8),
        title: "GRE Prep 2024: Manhattan 5lb Book of Practice Problems",
        description: "Over 1,800 practice questions for GRE quant and verbal. Unmarked, no pencil writing.",
        price: 500,
        category: "BOOKS",
        condition: "LIKE_NEW",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "JNU Central Canteen",
        location: { type: "Point", coordinates: getCoords(0.003, -0.005) },
        images: [{ url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 19,
      },
      {
        seller: getSellerId(9),
        title: "GATE Computer Science: 20 Years Chapterwise Solved Papers",
        description: "Topic-wise solved questions with detailed explanations. Solved me through my GATE preparation.",
        price: 400,
        category: "BOOKS",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "SOLD",
        soldAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isActive: true,
        locationText: "Hindu College Boys Hostel",
        location: { type: "Point", coordinates: getCoords(0.001, 0.002) },
        images: [{ url: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 88,
      },

      // --- ELECTRONICS (10 items) ---
      {
        seller: getSellerId(2),
        title: "Texas Instruments TI-84 Plus CE Graphing Calculator",
        description: "Rechargeable battery, crisp color screen. Approved for SAT, ACT, and university calculus and statistics exams.",
        price: 3500,
        category: "ELECTRONICS",
        condition: "LIKE_NEW",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "IIT Delhi SAC Center",
        location: { type: "Point", coordinates: getCoords(0.005, -0.004) },
        images: [{ url: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 54,
      },
      {
        seller: getSellerId(0),
        title: "Dell 24-inch Full HD IPS Monitor (75Hz, HDMI + VGA)",
        description: "Excellent secondary monitor for coding and multitasking. Zero dead pixels, comes with original HDMI cable and power cord.",
        price: 5500,
        category: "ELECTRONICS",
        condition: "LIKE_NEW",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "Roop Nagar Student Dorms",
        location: { type: "Point", coordinates: getCoords(-0.001, 0.003) },
        images: [{ url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 112,
      },
      {
        seller: getSellerId(1),
        title: "Logitech K380 Multi-Device Bluetooth Wireless Keyboard",
        description: "Compact wireless keyboard. Pairs with up to 3 devices (laptop, tablet, phone) simultaneously. Mint dark grey finish.",
        price: 1400,
        category: "ELECTRONICS",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "Arts Faculty Campus",
        location: { type: "Point", coordinates: getCoords(0.000, 0.001) },
        images: [{ url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 42,
      },
      {
        seller: getSellerId(3),
        title: "Sony WH-CH520 Wireless Over-Ear Bluetooth Headphones",
        description: "Up to 50 hours of battery life with crisp sound quality and mic for online lectures. 6 months old.",
        price: 2200,
        category: "ELECTRONICS",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "RESERVED",
        isActive: true,
        locationText: "Hudson Lane Metro Station",
        location: { type: "Point", coordinates: getCoords(-0.002, 0.004) },
        images: [{ url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 76,
      },
      {
        seller: getSellerId(5),
        title: "Raspberry Pi 4 Model B (4GB RAM) Starter Kit",
        description: "Includes official case, heatsinks, 32GB microSD pre-flashed with Raspbian, and micro-HDMI cable. Perfect for IoT projects.",
        price: 4200,
        category: "ELECTRONICS",
        condition: "LIKE_NEW",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "SPA Architecture Campus Gate",
        location: { type: "Point", coordinates: getCoords(-0.004, -0.001) },
        images: [{ url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 63,
      },
      {
        seller: getSellerId(7),
        title: "Anker PowerCore 20,000mAh Portable Power Bank",
        description: "High-capacity dual USB-A + USB-C power bank. Keeps phone and tablet charged through long lecture days.",
        price: 1600,
        category: "ELECTRONICS",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "NIFT Delhi Campus Reception",
        location: { type: "Point", coordinates: getCoords(-0.002, 0.005) },
        images: [{ url: "https://images.unsplash.com/photo-1609592426507-6a165cf40f90?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 38,
      },
      {
        seller: getSellerId(8),
        title: "Logitech M331 Silent Plus Ergonomic Wireless Mouse",
        description: "90% noise reduction click feel, battery lasts over 18 months. Great for quiet study in libraries.",
        price: 450,
        category: "ELECTRONICS",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "JNU Library Lawn",
        location: { type: "Point", coordinates: getCoords(0.003, -0.004) },
        images: [{ url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 26,
      },
      {
        seller: getSellerId(9),
        title: "Apple 20W USB-C Power Adapter with 1m Braided Cable",
        description: "Genuine Apple fast charger, purchased with iPad. No longer needed as I upgraded to multi-port charger.",
        price: 1100,
        category: "ELECTRONICS",
        condition: "NEW",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "Vishwa Vidyalaya Metro Gate 3",
        location: { type: "Point", coordinates: getCoords(0.000, 0.002) },
        images: [{ url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 45,
      },
      {
        seller: getSellerId(2),
        title: "Baseus Metal Laptop Cooling Pad (4 Ultra-Quiet Fans)",
        description: "Keeps gaming and engineering laptops cool under heavy render loads. Open to exchange for study desk lamp.",
        price: null,
        category: "ELECTRONICS",
        condition: "GOOD",
        listingType: "EXCHANGE",
        exchangeFor: "Rechargeable LED desk lamp or USB-C HDMI hub",
        status: "AVAILABLE",
        isActive: true,
        locationText: "IIT Delhi Hostels",
        location: { type: "Point", coordinates: getCoords(0.004, -0.004) },
        images: [{ url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 34,
      },
      {
        seller: getSellerId(6),
        title: "Bundle: High-Speed 2m HDMI Cable & Type-C OTG Adapters",
        description: "Spare cables and adapters collected over college. Free for any student presenting slides or connecting displays.",
        price: null,
        category: "ELECTRONICS",
        condition: "GOOD",
        listingType: "FREE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "North Campus Physics Dept",
        location: { type: "Point", coordinates: getCoords(0.002, 0.001) },
        images: [{ url: "https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 59,
      },

      // --- FURNITURE (8 items) ---
      {
        seller: getSellerId(1),
        title: "Green Soul Ergonomic Breathable Mesh Study Chair",
        description: "High-back study chair with lumbar support and smooth hydraulic height adjustment. Great for long study sessions.",
        price: 2800,
        category: "FURNITURE",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "Vijay Nagar Single Room PG",
        location: { type: "Point", coordinates: getCoords(-0.002, 0.003) },
        images: [{ url: "https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 94,
      },
      {
        seller: getSellerId(0),
        title: "Foldable Wooden Bed Table & Laptop Stand with Cup Holder",
        description: "Compact wooden desk for studying in bed or floor seating. Folds flat in seconds.",
        price: 400,
        category: "FURNITURE",
        condition: "LIKE_NEW",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "Malka Ganj Student Accommodations",
        location: { type: "Point", coordinates: getCoords(-0.001, 0.000) },
        images: [{ url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 47,
      },
      {
        seller: getSellerId(3),
        title: "4-Tier Metal Wire Bookshelf & Dorm Organizer",
        description: "Holds up to 40 textbooks plus storage boxes. Sturdy black powder-coated steel frame. Disassembles easily for transport.",
        price: 1200,
        category: "FURNITURE",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "Miranda House Hostel",
        location: { type: "Point", coordinates: getCoords(-0.002, 0.002) },
        images: [{ url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 58,
      },
      {
        seller: getSellerId(5),
        title: "Large Faux Leather Bean Bag (XL Size - Dark Brown)",
        description: "Very comfortable gaming and reading chair. Recently refilled with 1.5kg fresh beans.",
        price: 900,
        category: "FURNITURE",
        condition: "FAIR",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "SPA Student Hostel",
        location: { type: "Point", coordinates: getCoords(-0.003, -0.001) },
        images: [{ url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 68,
      },
      {
        seller: getSellerId(7),
        title: "Minimalist Solid Pine Study Desk with Storage Drawer",
        description: "Dimensions: 100cm x 60cm. Sturdy wooden frame, fits perfectly in compact dorm rooms and studio apartments.",
        price: 1800,
        category: "FURNITURE",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "RESERVED",
        isActive: true,
        locationText: "Hauz Khas Student PG",
        location: { type: "Point", coordinates: getCoords(0.004, -0.005) },
        images: [{ url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 82,
      },
      {
        seller: getSellerId(8),
        title: "Memory Foam Ergonomic Footrest for Desk Work",
        description: "Relieves back and knee strain when sitting for long hours. Free for whoever picks it up first.",
        price: null,
        category: "FURNITURE",
        condition: "LIKE_NEW",
        listingType: "FREE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "JNU Student Activity Hub",
        location: { type: "Point", coordinates: getCoords(0.002, -0.004) },
        images: [{ url: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 40,
      },
      {
        seller: getSellerId(9),
        title: "Set of 3 Wall-Mounted Floating Bookshelves (White)",
        description: "Never installed, still in packaging with all mounting screws and anchors included.",
        price: 700,
        category: "FURNITURE",
        condition: "NEW",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "Roop Nagar Main Road",
        location: { type: "Point", coordinates: getCoords(-0.001, 0.002) },
        images: [{ url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 31,
      },
      {
        seller: getSellerId(4),
        title: "Full-Length Standing Mirror with Wooden Frame & Stand",
        description: "Clear HD reflection, sturdy rear stand. Graduating this month, pickup before Friday.",
        price: 950,
        category: "FURNITURE",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "SOLD",
        soldAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        isActive: true,
        locationText: "Kamla Nagar Market",
        location: { type: "Point", coordinates: getCoords(-0.003, 0.002) },
        images: [{ url: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 97,
      },

      // --- STATIONERY (6 items) ---
      {
        seller: getSellerId(5),
        title: "Professional 72-Color Prismacolor Premier Colored Pencil Set",
        description: "Used for 1 semester in design studio. Only 3-4 pencils slightly sharpened, all 72 pieces accounted for in original tin box.",
        price: 1500,
        category: "STATIONERY",
        condition: "LIKE_NEW",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "SPA Architecture Studio 4",
        location: { type: "Point", coordinates: getCoords(-0.003, -0.002) },
        images: [{ url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 46,
      },
      {
        seller: getSellerId(2),
        title: "Rotring Rapid Pro 0.5mm Mechanical Technical Drawing Pencil",
        description: "Full metal body, cushioned lead mechanism for technical drawing and math problem sets. Flawless condition.",
        price: 850,
        category: "STATIONERY",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "IIT Delhi Mech Dept",
        location: { type: "Point", coordinates: getCoords(0.005, -0.003) },
        images: [{ url: "https://images.unsplash.com/photo-1585336261026-778848d6cb87?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 39,
      },
      {
        seller: getSellerId(1),
        title: "A4 Dot Grid Spiral Notebooks (Pack of 4, 160 Pages Each)",
        description: "Brand new shrink-wrapped notebooks. 100 GSM fountain-pen friendly paper, ideal for bullet journaling and lecture notes.",
        price: 300,
        category: "STATIONERY",
        condition: "NEW",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "Patel Chest Stationery Lane",
        location: { type: "Point", coordinates: getCoords(0.001, 0.002) },
        images: [{ url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 35,
      },
      {
        seller: getSellerId(0),
        title: "Magnetic Dry Erase Whiteboard (2ft x 1.5ft) with Markers & Eraser",
        description: "Great for solving algorithms and exam countdown reminders. Comes with mounting hooks and magnetic eraser.",
        price: 350,
        category: "STATIONERY",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "North Campus Metro Station",
        location: { type: "Point", coordinates: getCoords(0.000, 0.001) },
        images: [{ url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 61,
      },
      {
        seller: getSellerId(5),
        title: "Architecture Drafting Board with Parallel Ruler & T-Square",
        description: "Heavy-duty drawing table board. Will trade for spiral graph paper reams and fine-liner drawing pens.",
        price: null,
        category: "STATIONERY",
        condition: "FAIR",
        listingType: "EXCHANGE",
        exchangeFor: "Pack of 0.1 to 0.8mm pigment fineliners & grid notebooks",
        status: "AVAILABLE",
        isActive: true,
        locationText: "SPA Design Workshop",
        location: { type: "Point", coordinates: getCoords(-0.004, -0.002) },
        images: [{ url: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 28,
      },
      {
        seller: getSellerId(3),
        title: "College Stationery Starter Pack: Highlighters, Clips, Sticky Notes",
        description: "Surplus stationery from semester exams. 6 pastel highlighters, 30 binder clips, and 4 packs of sticky notes.",
        price: null,
        category: "STATIONERY",
        condition: "NEW",
        listingType: "FREE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "Arts Faculty Coffee Point",
        location: { type: "Point", coordinates: getCoords(0.001, 0.000) },
        images: [{ url: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 71,
      },

      // --- OTHER (6 items) ---
      {
        seller: getSellerId(6),
        title: "Hero Sprint 26T 21-Speed Hybrid Bicycle with Front Basket",
        description: "Campus commuter bike with front basket and cable lock. Perfect for commuting between hostels and lecture halls.",
        price: 3200,
        category: "OTHER",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "St. Stephen's Bicycle Parking",
        location: { type: "Point", coordinates: getCoords(-0.001, 0.001) },
        images: [{ url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 145,
      },
      {
        seller: getSellerId(0),
        title: "Philips LED Eye-Care Rechargeable Study Lamp (3 Color Modes)",
        description: "Dimmable brightness, touch controls, and 5-hour internal battery backup during power cuts.",
        price: 750,
        category: "OTHER",
        condition: "LIKE_NEW",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "Roop Nagar Gali 4",
        location: { type: "Point", coordinates: getCoords(-0.001, 0.003) },
        images: [{ url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 52,
      },
      {
        seller: getSellerId(4),
        title: "Standard White Unisex Cotton Lab Coat (Size M)",
        description: "Clean medical / chemistry lab coat with breast pocket and pen holder. Washed and sanitized.",
        price: 250,
        category: "OTHER",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "AIIMS Medical Bookstore",
        location: { type: "Point", coordinates: getCoords(0.003, -0.004) },
        images: [{ url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 37,
      },
      {
        seller: getSellerId(8),
        title: "Pigeon Electric Kettle 1.5L (Stainless Steel)",
        description: "Lifesaver for hostel tea, coffee, and late-night ramen. Auto shut-off feature works perfectly.",
        price: 500,
        category: "OTHER",
        condition: "GOOD",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "JNU Brahmaputra Hostel",
        location: { type: "Point", coordinates: getCoords(0.002, -0.005) },
        images: [{ url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 66,
      },
      {
        seller: getSellerId(2),
        title: "Pair of Yonex Nanoray Badminton Racquets + Mavis 350 Shuttles",
        description: "Includes protective dual-racquet carry bag and tube of 3 nylon shuttles. Barely used this term.",
        price: 1600,
        category: "OTHER",
        condition: "LIKE_NEW",
        listingType: "FOR_SALE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "IIT Delhi Sports Complex",
        location: { type: "Point", coordinates: getCoords(0.005, -0.004) },
        images: [{ url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 59,
      },
      {
        seller: getSellerId(1),
        title: "Heavy-Duty Windproof Campus Umbrella (Auto Open/Close)",
        description: "Moving back home, don't need second umbrella. Sturdy reinforced ribs, completely free to take.",
        price: null,
        category: "OTHER",
        condition: "NEW",
        listingType: "FREE",
        status: "AVAILABLE",
        isActive: true,
        locationText: "Chhatra Marg Bus Stop",
        location: { type: "Point", coordinates: getCoords(0.000, 0.002) },
        images: [{ url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80", width: 800, height: 600 }],
        viewCount: 44,
      },
    ];

    const createdListings = await Listing.insertMany(rawListings);
    console.log(` Created ${createdListings.length} realistic listings.`);

    // 4. CREATE ENQUIRIES & OFFERS
    console.log("\n💬 Creating sample enquiries and counter-offers across statuses...");

    const sampleEnquiries: Partial<IEnquiry>[] = [
      {
        listing: createdListings[0]._id, // CLRS Algorithm book
        buyer: createdUsers[2]._id,       // Marcus (buyer)
        seller: createdListings[0].seller, // Alex (seller)
        message: "Hey Alex! Is this book still available? Can we meet tomorrow at the North Campus library?",
        offerPrice: 1000,
        status: "PENDING",
        statusHistory: [
          { status: "PENDING", at: new Date(Date.now() - 2 * 60 * 60 * 1000), note: "Initial enquiry with offer ₹1000" },
        ],
      },
      {
        listing: createdListings[1]._id, // Stewart Calculus
        buyer: createdUsers[0]._id,       // Alex (buyer)
        seller: createdListings[1].seller, // Priya (seller)
        message: "Hello Priya, does this edition include the multi-variable calculus chapters?",
        offerPrice: 800,
        status: "ACCEPTED",
        responseMessage: "Yes it does! All chapters 1-17 included. ₹800 works, let's meet at Miranda House.",
        respondedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        statusHistory: [
          { status: "PENDING", at: new Date(Date.now() - 12 * 60 * 60 * 1000), note: "Offer ₹800 made" },
          { status: "ACCEPTED", at: new Date(Date.now() - 6 * 60 * 60 * 1000), note: "Seller accepted offer" },
        ],
      },
      {
        listing: createdListings[2]._id, // Guyton Physiology
        buyer: createdUsers[5]._id,       // Sophia
        seller: createdListings[2].seller, // Rahul
        message: "Would you consider ₹1200 for Guyton? On a tight student budget.",
        offerPrice: 1200,
        status: "REJECTED",
        responseMessage: "Sorry, ₹1800 is already discounted significantly from the ₹3400 retail price.",
        respondedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        statusHistory: [
          { status: "PENDING", at: new Date(Date.now() - 36 * 60 * 60 * 1000), note: "Offer ₹1200" },
          { status: "REJECTED", at: new Date(Date.now() - 24 * 60 * 60 * 1000), note: "Offer rejected by seller" },
        ],
      },
      {
        listing: createdListings[11]._id, // Dell 24-inch monitor
        buyer: createdUsers[6]._id,        // Liam
        seller: createdListings[11].seller, // Alex
        message: "Interested in the Dell monitor! Can I test the HDMI connection before buying?",
        offerPrice: 5000,
        status: "WITHDRAWN",
        statusHistory: [
          { status: "PENDING", at: new Date(Date.now() - 48 * 60 * 60 * 1000), note: "Offer made" },
          { status: "WITHDRAWN", at: new Date(Date.now() - 30 * 60 * 60 * 1000), note: "Buyer found another monitor" },
        ],
      },
      {
        listing: createdListings[34]._id, // Hero cycle
        buyer: createdUsers[4]._id,        // Rahul
        seller: createdListings[34].seller, // Liam
        message: "Can pickup the cycle this evening from St. Stephen's parking.",
        offerPrice: 3000,
        status: "EXPIRED",
        statusHistory: [
          { status: "PENDING", at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), note: "Submitted" },
          { status: "EXPIRED", at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), note: "48-hour response window elapsed" },
        ],
      },
    ];

    const createdEnquiries = await Enquiry.insertMany(sampleEnquiries);
    console.log(` Created ${createdEnquiries.length} enquiries across statuses.`);

    // 5. CREATE FAVORITES
    console.log("\n⭐ Creating sample student favorites / wishlists...");
    const sampleFavorites = [
      { user: createdUsers[0]._id, listing: createdListings[10]._id }, // Alex likes TI-84 calculator
      { user: createdUsers[0]._id, listing: createdListings[20]._id }, // Alex likes Green Soul chair
      { user: createdUsers[1]._id, listing: createdListings[0]._id },  // Priya likes CLRS
      { user: createdUsers[1]._id, listing: createdListings[11]._id }, // Priya likes Dell monitor
      { user: createdUsers[2]._id, listing: createdListings[14]._id }, // Marcus likes Raspberry Pi
      { user: createdUsers[3]._id, listing: createdListings[7]._id },  // Emma likes Atomic Habits
      { user: createdUsers[4]._id, listing: createdListings[34]._id }, // Rahul likes Hero cycle
      { user: createdUsers[5]._id, listing: createdListings[28]._id }, // Sophia likes Prismacolor
    ];

    const createdFavorites = await Favorite.insertMany(sampleFavorites);
    console.log(` Created ${createdFavorites.length} favorite entries.`);

    // 6. CREATE NOTIFICATIONS
    console.log("\n🔔 Creating sample user notifications...");
    const sampleNotifications = [
      {
        user: createdUsers[0]._id, // Alex (seller of CLRS)
        type: "ENQUIRY_RECEIVED",
        title: "New enquiry on Introduction to Algorithms",
        body: "Marcus Johnson submitted an enquiry with an offer of ₹1,000.",
        link: `/dashboard/enquiries`,
        readAt: null,
      },
      {
        user: createdUsers[0]._id, // Alex (buyer of Stewart Calculus)
        type: "ENQUIRY_ACCEPTED",
        title: "Offer Accepted! Calculus by James Stewart",
        body: "Priya Patel accepted your offer of ₹800. Review message for meeting details.",
        link: `/dashboard/enquiries`,
        readAt: new Date(),
      },
      {
        user: createdUsers[5]._id, // Sophia
        type: "ENQUIRY_REJECTED",
        title: "Offer Declined: Medical Physiology",
        body: "Rahul Sharma was unable to accept your offer of ₹1,200.",
        link: `/dashboard/enquiries`,
        readAt: null,
      },
      {
        user: createdUsers[1]._id, // Priya
        type: "FAVORITE_PRICE_DROP",
        title: "Price drop on an item in your wishlist!",
        body: "Introduction to Algorithms (CLRS) price was updated to ₹1,200.",
        link: `/listings/${createdListings[0]._id}`,
        readAt: null,
      },
      {
        user: createdUsers[0]._id,
        type: "SYSTEM",
        title: "Welcome to CampusCart!",
        body: "Your campus marketplace account is verified. Start browsing or listing essentials.",
        link: `/profile`,
        readAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
    ];

    const createdNotifications = await Notification.insertMany(sampleNotifications);
    console.log(` Created ${createdNotifications.length} notifications.`);

    // 7. SYNC INDEXES AND VERIFY
    console.log("\n⚡ Calling syncIndexes() on all models to ensure complete index setup...");
    await Promise.all([
      User.syncIndexes(),
      Listing.syncIndexes(),
      Enquiry.syncIndexes(),
      Favorite.syncIndexes(),
      Notification.syncIndexes(),
    ]);
    console.log(" syncIndexes() completed successfully for all collections.");

    // Retrieve and verify existing indexes from MongoDB driver
    console.log("\n🔍 Verifying generated indexes from MongoDB:");
    const userIndexes = await User.collection.indexes();
    const listingIndexes = await Listing.collection.indexes();
    const enquiryIndexes = await Enquiry.collection.indexes();
    const favoriteIndexes = await Favorite.collection.indexes();
    const notificationIndexes = await Notification.collection.indexes();

    console.log(`- User indexes (${userIndexes.length}):`, userIndexes.map((i) => i.name).join(", "));
    console.log(`- Listing indexes (${listingIndexes.length}):`, listingIndexes.map((i) => i.name).join(", "));
    console.log(`- Enquiry indexes (${enquiryIndexes.length}):`, enquiryIndexes.map((i) => i.name).join(", "));
    console.log(`- Favorite indexes (${favoriteIndexes.length}):`, favoriteIndexes.map((i) => i.name).join(", "));
    console.log(`- Notification indexes (${notificationIndexes.length}):`, notificationIndexes.map((i) => i.name).join(", "));

    // 8. FINAL COUNT VERIFICATION
    console.log("\n📊 Final Collection Counts Summary:");
    const [userCount, listingCount, enquiryCount, favCount, notifCount] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Enquiry.countDocuments(),
      Favorite.countDocuments(),
      Notification.countDocuments(),
    ]);

    console.log(`   - Users:         ${userCount} (Target: 10)`);
    console.log(`   - Listings:      ${listingCount} (Target: 40)`);
    console.log(`   - Enquiries:     ${enquiryCount} (Target: 5)`);
    console.log(`   - Favorites:     ${favCount} (Target: 8)`);
    console.log(`   - Notifications: ${notifCount} (Target: 5)`);

    console.log("\n==========================================");
    console.log("🎉 CampusCart Database Seed Succeeded!");
    console.log("==========================================");
  } catch (error) {
    console.error("❌ Seed script error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
    process.exit(0);
  }
}

runSeed();

