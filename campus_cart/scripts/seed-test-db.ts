import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { Listing } from "../src/models/Listing";
import { Enquiry } from "../src/models/Enquiry";
import { Favorite } from "../src/models/Favorite";
import { Notification } from "../src/models/Notification";
import { RateLimit } from "../src/models/RateLimit";

export async function seedTestDatabase() {
  const testUri = process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/campuscart_test";
  console.log(`🌱 Seeding Test Database at: ${testUri}...`);

  await connectDB(testUri);

  // 1. Wipe test database collections
  await Promise.all([
    User.deleteMany({}),
    Listing.deleteMany({}),
    Enquiry.deleteMany({}),
    Favorite.deleteMany({}),
    Notification.deleteMany({}),
    RateLimit.deleteMany({}),
  ]);

  // 2. Create password hash
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("password123", salt);

  // 3. Create Users
  const seller = await User.create({
    name: "Seller Sam",
    email: "seller@campus.edu",
    passwordHash,
    bio: "Computer science senior selling pre-loved gadgets and books.",
    university: "Delhi University",
    course: "B.Tech Computer Science",
    city: "New Delhi",
    contactPreference: "IN_APP",
    phone: "+91 98765 11111",
    showPhone: true,
    authProvider: "CREDENTIALS",
    location: {
      type: "Point",
      coordinates: [77.209, 28.692],
    },
  });

  const buyer = await User.create({
    name: "Buyer Bob",
    email: "buyer@campus.edu",
    passwordHash,
    bio: "First year literature student looking for essentials.",
    university: "Delhi University",
    course: "B.A. English",
    city: "New Delhi",
    contactPreference: "IN_APP",
    phone: "+91 98765 22222",
    showPhone: false,
    authProvider: "CREDENTIALS",
    location: {
      type: "Point",
      coordinates: [77.208, 28.691],
    },
  });

  // 4. Create Listings
  const bookListing = await Listing.create({
    seller: seller._id,
    title: "Engineering Physics Textbook Halliday",
    description: "Standard engineering textbook in good condition with no missing pages.",
    price: 450,
    category: "BOOKS",
    condition: "GOOD",
    listingType: "FOR_SALE",
    status: "AVAILABLE",
    isActive: true,
    locationText: "North Campus Library",
    location: {
      type: "Point",
      coordinates: [77.209, 28.692],
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        width: 600,
        height: 400,
      },
    ],
  });

  const headphoneListing = await Listing.create({
    seller: seller._id,
    title: "Wireless Noise Cancelling Headphones",
    description: "Great battery life, crystal clear audio, Bluetooth 5.2 compatible.",
    price: 1800,
    category: "ELECTRONICS",
    condition: "LIKE_NEW",
    listingType: "FOR_SALE",
    status: "AVAILABLE",
    isActive: true,
    locationText: "Hostel Block A",
    location: {
      type: "Point",
      coordinates: [77.21, 28.693],
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        width: 600,
        height: 400,
      },
    ],
  });

  const soldListing = await Listing.create({
    seller: seller._id,
    title: "Ergonomic Study Desk Chair",
    description: "Comfortable mesh back study chair. Already sold to another student.",
    price: 1200,
    category: "FURNITURE",
    condition: "GOOD",
    listingType: "FOR_SALE",
    status: "SOLD",
    isActive: true,
    soldAt: new Date(),
    locationText: "Main Gate",
    location: {
      type: "Point",
      coordinates: [77.211, 28.69],
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1580481077197-9b2f6ef5c345?auto=format&fit=crop&w=600&q=80",
        width: 600,
        height: 400,
      },
    ],
  });

  // 5. Create Favorites (Buyer has favorited available textbook and sold chair)
  await Favorite.create([
    {
      user: buyer._id,
      listing: bookListing._id,
    },
    {
      user: buyer._id,
      listing: soldListing._id,
    },
  ]);

  // 6. Create Enquiry (Buyer has sent an offer on the headphones)
  const enquiry = await Enquiry.create({
    listing: headphoneListing._id,
    seller: seller._id,
    buyer: buyer._id,
    message: "Hi! Can you do 1600 for the headphones? I can pick up today from campus.",
    offerPrice: 1600,
    status: "PENDING",
  });

  console.log("✔ Test database seeded successfully!");
  console.log(`  - Users: ${seller.email}, ${buyer.email}`);
  console.log(`  - Listings: 3 (Available: 2, Sold: 1)`);
  console.log(`  - Favorites: 2 (1 Available, 1 Sold/Unavailable)`);
  console.log(`  - Enquiry ID: ${enquiry._id.toString()}`);

  return {
    seller,
    buyer,
    bookListing,
    headphoneListing,
    soldListing,
    enquiry,
  };
}

if (require.main === module) {
  seedTestDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Test database seeding failed:", err);
      process.exit(1);
    });
}
