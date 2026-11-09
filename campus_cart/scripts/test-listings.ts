import {
  createListingSchema,
  updateListingSchema,
  updateListingStatusSchema,
} from "../src/features/listings/schemas";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`✅ PASS: ${message}`);
}

const validBase = {
  title: "Engineering Mathematics Textbook",
  description: "Comprehensive textbook in like-new condition, highlighted on chapters 1-3 only.",
  category: "BOOKS" as const,
  condition: "GOOD" as const,
  images: [
    {
      url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
      publicId: "campuscart/mock1",
    },
  ],
};

function runListingSchemaTests() {
  console.log("==================================================");
  console.log("🧪 CampusCart Task 5: Listing Zod Schema Test Suite");
  console.log("==================================================");

  // 1. FOR_SALE - Valid price
  {
    const res = createListingSchema.safeParse({
      ...validBase,
      listingType: "FOR_SALE",
      price: 450,
    });
    assert(res.success && res.data.price === 450, "FOR_SALE with positive price passes");
  }

  // 2. FOR_SALE - Missing price should fail
  {
    const res = createListingSchema.safeParse({
      ...validBase,
      listingType: "FOR_SALE",
    });
    assert(!res.success, "FOR_SALE with missing price fails");
  }

  // 3. FOR_SALE - Zero or negative price should fail
  {
    const resZero = createListingSchema.safeParse({
      ...validBase,
      listingType: "FOR_SALE",
      price: 0,
    });
    assert(!resZero.success, "FOR_SALE with 0 price fails");

    const resNeg = createListingSchema.safeParse({
      ...validBase,
      listingType: "FOR_SALE",
      price: -50,
    });
    assert(!resNeg.success, "FOR_SALE with negative price fails");
  }

  // 4. FREE - Valid null price
  {
    const res = createListingSchema.safeParse({
      ...validBase,
      listingType: "FREE",
      price: null,
    });
    assert(res.success && res.data.price === null, "FREE with null price passes");
  }

  // 5. FREE - Positive price should fail
  {
    const res = createListingSchema.safeParse({
      ...validBase,
      listingType: "FREE",
      price: 100,
    });
    assert(!res.success, "FREE with positive price fails");
  }

  // 6. FREE - Omitting price normalizes to null
  {
    const res = createListingSchema.safeParse({
      ...validBase,
      listingType: "FREE",
    });
    assert(res.success && res.data.price === null, "FREE with omitted price is normalized to null");
  }

  // 7. EXCHANGE - Valid exchangeFor
  {
    const res = createListingSchema.safeParse({
      ...validBase,
      listingType: "EXCHANGE",
      exchangeFor: "Scientific calculator or laptop stand",
    });
    assert(
      res.success && res.data.exchangeFor === "Scientific calculator or laptop stand",
      "EXCHANGE with exchangeFor passes"
    );
  }

  // 8. EXCHANGE - Missing exchangeFor should fail
  {
    const res = createListingSchema.safeParse({
      ...validBase,
      listingType: "EXCHANGE",
    });
    assert(!res.success, "EXCHANGE with missing exchangeFor fails");

    const resShort = createListingSchema.safeParse({
      ...validBase,
      listingType: "EXCHANGE",
      exchangeFor: "ab",
    });
    assert(!resShort.success, "EXCHANGE with exchangeFor < 3 chars fails");
  }

  // 9. Title length constraints (5 - 100 chars)
  {
    const resTooShort = createListingSchema.safeParse({
      ...validBase,
      title: "Book",
      listingType: "FOR_SALE",
      price: 100,
    });
    assert(!resTooShort.success, "Title < 5 chars fails");

    const resMin = createListingSchema.safeParse({
      ...validBase,
      title: "12345",
      listingType: "FOR_SALE",
      price: 100,
    });
    assert(resMin.success, "Title of exactly 5 chars passes");

    const resTooLong = createListingSchema.safeParse({
      ...validBase,
      title: "a".repeat(101),
      listingType: "FOR_SALE",
      price: 100,
    });
    assert(!resTooLong.success, "Title > 100 chars fails");

    const resMax = createListingSchema.safeParse({
      ...validBase,
      title: "a".repeat(100),
      listingType: "FOR_SALE",
      price: 100,
    });
    assert(resMax.success, "Title of exactly 100 chars passes");
  }

  // 10. Description length constraints (20 - 2000 chars)
  {
    const resTooShort = createListingSchema.safeParse({
      ...validBase,
      description: "Short description",
      listingType: "FOR_SALE",
      price: 100,
    });
    assert(!resTooShort.success, "Description < 20 chars fails");

    const resMin = createListingSchema.safeParse({
      ...validBase,
      description: "a".repeat(20),
      listingType: "FOR_SALE",
      price: 100,
    });
    assert(resMin.success, "Description of exactly 20 chars passes");

    const resTooLong = createListingSchema.safeParse({
      ...validBase,
      description: "a".repeat(2001),
      listingType: "FOR_SALE",
      price: 100,
    });
    assert(!resTooLong.success, "Description > 2000 chars fails");

    const resMax = createListingSchema.safeParse({
      ...validBase,
      description: "a".repeat(2000),
      listingType: "FOR_SALE",
      price: 100,
    });
    assert(resMax.success, "Description of exactly 2000 chars passes");
  }

  // 11. Image count constraints (1 - 8 images)
  {
    const resZeroImages = createListingSchema.safeParse({
      ...validBase,
      images: [],
      listingType: "FOR_SALE",
      price: 100,
    });
    assert(!resZeroImages.success, "0 images fails (min 1 required)");

    const nineImages = Array.from({ length: 9 }, (_, i) => ({
      url: `https://images.unsplash.com/photo-${i}`,
    }));
    const resNineImages = createListingSchema.safeParse({
      ...validBase,
      images: nineImages,
      listingType: "FOR_SALE",
      price: 100,
    });
    assert(!resNineImages.success, "9 images fails (max 8 allowed)");

    const eightImages = Array.from({ length: 8 }, (_, i) => ({
      url: `https://images.unsplash.com/photo-${i}`,
    }));
    const resEightImages = createListingSchema.safeParse({
      ...validBase,
      images: eightImages,
      listingType: "FOR_SALE",
      price: 100,
    });
    assert(resEightImages.success, "8 images passes");
  }

  // 12. UpdateListingSchema
  {
    const res = updateListingSchema.safeParse({
      ...validBase,
      title: "Updated Title for Textbook",
      listingType: "FOR_SALE",
      price: 350,
    });
    assert(res.success && res.data.title === "Updated Title for Textbook", "updateListingSchema passes");
  }

  // 13. UpdateListingStatusSchema
  {
    const resAvail = updateListingStatusSchema.safeParse({ status: "AVAILABLE" });
    const resReserved = updateListingStatusSchema.safeParse({ status: "RESERVED" });
    const resSold = updateListingStatusSchema.safeParse({ status: "SOLD" });
    const resInvalid = updateListingStatusSchema.safeParse({ status: "ARCHIVED" });

    assert(resAvail.success && resReserved.success && resSold.success, "Valid statuses pass");
    assert(!resInvalid.success, "Invalid status fails");
  }

  console.log("==================================================");
  console.log(`🎉 All ${passedTests}/${totalTests} schema unit tests passed!`);
  console.log("==================================================");
}

runListingSchemaTests();

