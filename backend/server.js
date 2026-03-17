require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { ensureDemoUsers } = require("./utils/seedDemoUsers");
const { ensureGovernmentIncomeRecords } = require("./utils/seedGovernmentIncomeRecords");
const { ensureDefaultSchemes } = require("./utils/seedSchemes");
const { setDatabaseReady, setLastBootstrapError } = require("./utils/runtimeState");

const PORT = process.env.PORT || 5000;
const RETRY_DELAY_MS = 15000;

const bootstrapServices = async () => {
  try {
    console.log("Starting CivicShield database bootstrap...");
    await connectDB();
    await ensureDemoUsers();
    await ensureGovernmentIncomeRecords();
    await ensureDefaultSchemes();
    setDatabaseReady(true);
    setLastBootstrapError(null);
    console.log("CivicShield database bootstrap complete.");
  } catch (error) {
    setDatabaseReady(false);
    setLastBootstrapError(error.message);
    console.error("Failed to bootstrap CivicShield services:", error);
    console.log(`Retrying database bootstrap in ${RETRY_DELAY_MS / 1000} seconds...`);
    setTimeout(bootstrapServices, RETRY_DELAY_MS);
  }
};

app.listen(PORT, () => {
  console.log(`CivicShield backend listening on port ${PORT}`);
  bootstrapServices();
});
