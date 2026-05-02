require("dotenv").config();

const app = require("./app");
const { connectDB, prisma } = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Serveur demarre sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("Impossible de demarrer le serveur :", error.message);
    process.exit(1);
  }
};

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection :", error.message);
  process.exit(1);
});

const shutdown = async (signal) => {
  console.log(`${signal} recu, fermeture du serveur`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", () => {
  shutdown("SIGINT").catch((error) => {
    console.error("Erreur lors de la fermeture :", error.message);
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((error) => {
    console.error("Erreur lors de la fermeture :", error.message);
    process.exit(1);
  });
});

startServer();
