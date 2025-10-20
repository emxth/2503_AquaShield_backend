import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

// Test basic route
app.get("/", (req, res) => {
  res.json({ message: "Debug server running" });
});

console.log("🛠 Testing route loading...");

// Test routes in sequence
const testRoutes = async () => {
  try {
    // Test 1: Auth routes
    const authModule = await import("./routes/auth.js");
    app.use("/api/auth", authModule.default);
    console.log("✅ Auth routes loaded");

    // Test 2: User routes
    const userModule = await import("./routes/user.js");
    app.use("/api/users", userModule.default);
    console.log("✅ User routes loaded");

    // Test 3: FEO routes
    const feoModule = await import("./routes/feo.js");
    app.use("/api/feo", feoModule.default);
    console.log("✅ FEO routes loaded");

    // Test 4: Admin routes
    const adminModule = await import("./routes/admin.js");
    app.use("/api/admin", adminModule.default);
    console.log("✅ Admin routes loaded");

    // Test 5: Report routes (SUSPECTED CULPRIT)
    console.log("🔄 Testing report routes...");
    const reportModule = await import("./routes/reportRoutes.js");
    app.use("/api/report", reportModule.default);
    console.log("✅ Report routes loaded");

    // Test 6: Species routes
    console.log("🔄 Testing species routes...");
    const speciesModule = await import("./routes/speciesRoutes.js");
    app.use("/api/species", speciesModule.default);
    console.log("✅ Species routes loaded");

    // Test 7: Species Request routes
    console.log("🔄 Testing species request routes...");
    const speciesRequestModule = await import(
      "./routes/speciesRequestRoutes.js"
    );
    app.use("/api/speciesRequest", speciesRequestModule.default);
    console.log("✅ Species Request routes loaded");

    // Test 8: Favorites routes
    console.log("🔄 Testing favorites routes...");
    const favoritesModule = await import("./routes/favoritesRoutes.js");
    app.use("/api/favorites", favoritesModule.default);
    console.log("✅ Favorites routes loaded");

    // Test 9: Notification routes
    console.log("🔄 Testing notification routes...");
    const notificationModule = await import("./routes/notificationRoute.js");
    app.use("/api/notification", notificationModule.default);
    console.log("✅ Notification routes loaded");

    console.log("🎉 ALL ROUTES LOADED SUCCESSFULLY!");

    const PORT = process.env.PORT || 8081;
    app.listen(PORT, () => {
      console.log(`📍 Debug server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ ROUTE LOADING FAILED AT:", err.message);
    console.error("Stack trace:", err.stack);
    process.exit(1);
  }
};

testRoutes();
