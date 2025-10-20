import dotenv from "dotenv";
import connectDB from "../config/database.js";
import User from "../models/User.js";

dotenv.config();

const migrateDeletionRequests = async () => {
  try {
    console.log("=== Starting Deletion Request Migration ===\n");

    await connectDB();

    // Find all users with deletion requests
    const usersWithDeletionRequests = await User.find({
      deletionRequested: true,
    });

    console.log(
      `Found ${usersWithDeletionRequests.length} users with deletion requests\n`
    );

    if (usersWithDeletionRequests.length === 0) {
      console.log("No deletion requests to migrate");
      process.exit(0);
    }

    let migratedCount = 0;

    for (const user of usersWithDeletionRequests) {
      // Check if already has status field
      if (!user.deletionRequestStatus) {
        user.deletionRequestStatus = "pending";
        await user.save();
        migratedCount++;

        console.log(
          `✅ Migrated: ${user.firstName} ${user.lastName} (${user.email})`
        );
      } else {
        console.log(
          `⏭️  Skipped: ${user.firstName} ${user.lastName} - already has status: ${user.deletionRequestStatus}`
        );
      }
    }

    console.log(`\n=== Migration Complete ===`);
    console.log(`Total users processed: ${usersWithDeletionRequests.length}`);
    console.log(`Migrated: ${migratedCount}`);
    console.log(`Skipped: ${usersWithDeletionRequests.length - migratedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration Error:", error);
    process.exit(1);
  }
};

migrateDeletionRequests();
