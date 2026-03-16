require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { ensureDemoUsers } = require("./utils/seedDemoUsers");
const { ensureGovernmentIncomeRecords } = require("./utils/seedGovernmentIncomeRecords");
const { ensureDefaultSchemes } = require("./utils/seedSchemes");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await ensureDemoUsers();
  await ensureGovernmentIncomeRecords();
  await ensureDefaultSchemes();

  app.listen(PORT, () => {
    console.log(`CivicShield backend listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start CivicShield:", error.message);
  process.exit(1);
});
