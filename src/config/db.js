const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const connectDB = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("La variable DATABASE_URL est manquante.");
  }

  await prisma.$connect();
  console.log("Connexion base de donnees reussie");
};

module.exports = {
  connectDB,
  prisma
};
