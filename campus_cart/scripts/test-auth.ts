import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import { User } from "../src/models/User";
import { registerUser } from "../src/features/auth/actions";
import { authConfig } from "../src/auth.config";
import { loginSchema } from "../src/features/auth/schemas";

async function testAuth() {
  console.log("==========================================");
  console.log("🧪 CampusCart Task 3 Auth Test Suite");
  console.log("==========================================");

  try {
    await connectDB();
    console.log(" Connected to MongoDB.");

    // 1. TEST REGISTRATION SERVER ACTION
    console.log("\n[Test 1] Testing User Registration Server Action...");
    const testEmail = `test.student.${Date.now()}@campus.edu`;
    const regResult = await registerUser({
      name: "Test Student",
      email: testEmail,
      password: "testpassword123",
      confirmPassword: "testpassword123",
    });

    if (!regResult.success) {
      throw new Error(`Registration failed: ${regResult.error}`);
    }
    console.log(" User registered successfully:", testEmail);

    // Verify stored user and bcrypt password hash
    const created = await User.findOne({ email: testEmail });
    if (!created) {
      throw new Error("Created user not found in MongoDB!");
    }
    if (!created.passwordHash || !created.passwordHash.startsWith("$2")) {
      throw new Error("Password was not properly hashed with bcrypt!");
    }
    const isPasswordValid = await bcrypt.compare("testpassword123", created.passwordHash);
    if (!isPasswordValid) {
      throw new Error("bcrypt.compare failed on stored password hash!");
    }
    console.log(" Password securely hashed with bcrypt ($2a/$2b prefix confirmed).");

    // Test duplicate registration rejection
    console.log("\n[Test 2] Testing Duplicate Email Rejection...");
    const dupResult = await registerUser({
      name: "Duplicate User",
      email: testEmail,
      password: "password456",
      confirmPassword: "password456",
    });

    if (dupResult.success) {
      throw new Error("Duplicate registration should have failed but succeeded!");
    }
    console.log(" Duplicate email properly rejected:", dupResult.error);

    // 2. TEST CREDENTIALS AUTHORIZATION LOGIC
    console.log("\n[Test 3] Testing Credentials Verification (Existing Seed User)...");
    const testLoginEmail = "alex.chen@campus.edu";
    const testLoginPassword = "password123";

    // Valid credentials test
    const parsedValid = loginSchema.safeParse({ email: testLoginEmail, password: testLoginPassword });
    if (!parsedValid.success) throw new Error("Schema validation failed for valid login");

    const seedUser = await User.findOne({ email: parsedValid.data.email });
    if (!seedUser || !seedUser.passwordHash) throw new Error("Seed user alex.chen@campus.edu not found");

    const validMatch = await bcrypt.compare(parsedValid.data.password, seedUser.passwordHash);
    if (!validMatch) throw new Error("Seed user password match failed");
    console.log(" Valid credentials successfully verified for:", testLoginEmail);

    // Invalid password test
    const invalidMatch = await bcrypt.compare("wrongpassword", seedUser.passwordHash);
    if (invalidMatch) throw new Error("Wrong password should not match");
    console.log(" Invalid password correctly rejected.");

    // 3. TEST EDGE-SAFE MIDDLEWARE AUTHORIZED CALLBACK
    console.log("\n[Test 4] Testing Edge Middleware Route Protection Rules...");
    const authorized = authConfig.callbacks?.authorized;
    if (!authorized) throw new Error("authorized callback missing in authConfig");

    // Case A: Unauthenticated user accessing /dashboard
    type AuthParam = Parameters<NonNullable<typeof authConfig.callbacks>["authorized"]>[0];
    const mockUnauthDashboard = {
      auth: null,
      request: { nextUrl: new URL("http://localhost:3000/dashboard") },
    } as unknown as AuthParam;
    const resA = authorized(mockUnauthDashboard);
    if (!(resA instanceof Response) || resA.status !== 307 && resA.status !== 302 && !resA.headers.get("location")?.includes("/login")) {
      throw new Error("Unauthenticated request to /dashboard should redirect to /login");
    }
    console.log(" /dashboard correctly redirects unauthenticated user to:", resA.headers.get("location"));

    // Case B: Unauthenticated user accessing /listings/new
    const mockUnauthNew = {
      auth: null,
      request: { nextUrl: new URL("http://localhost:3000/listings/new") },
    } as unknown as AuthParam;
    const resB = authorized(mockUnauthNew);
    if (!(resB instanceof Response) || !resB.headers.get("location")?.includes("/login?callbackUrl=")) {
      throw new Error("Unauthenticated request to /listings/new should redirect with callbackUrl");
    }
    console.log(" /listings/new correctly redirects with callbackUrl to:", resB.headers.get("location"));

    // Case C: Authenticated user accessing /dashboard
    const mockAuthDashboard = {
      auth: { user: { id: "123", email: "alex@campus.edu" } },
      request: { nextUrl: new URL("http://localhost:3000/dashboard") },
    } as unknown as AuthParam;
    const resC = authorized(mockAuthDashboard);
    if (resC !== true) {
      throw new Error("Authenticated request to /dashboard should be allowed (return true)");
    }
    console.log(" /dashboard correctly permits authenticated session.");

    // Case D: Public route /
    const mockPublicHome = {
      auth: null,
      request: { nextUrl: new URL("http://localhost:3000/") },
    } as unknown as AuthParam;
    const resD = authorized(mockPublicHome);
    if (resD !== true) {
      throw new Error("Public route / should be allowed");
    }
    console.log(" Public landing page / is accessible to all.");

    // Cleanup test student
    await User.deleteOne({ email: testEmail });
    console.log("\n🧹 Test user cleaned up.");

    console.log("\n==========================================");
    console.log("🎉 All Task 3 Authentication Tests Passed!");
    console.log("==========================================");
  } catch (error) {
    console.error("❌ Auth test failure:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testAuth();

