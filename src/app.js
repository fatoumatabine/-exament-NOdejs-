const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/auth.routes");
const fournisseurRoutes = require("./routes/fournisseur.routes");
const produitRoutes = require("./routes/produit.routes");
const approvisionnementRoutes = require("./routes/approvisionnement.routes");
const swaggerSpec = require("./config/swagger");
const authenticate = require("./middlewares/auth.middleware");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API operationnelle"
  });
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true
    }
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/fournisseurs", authenticate, fournisseurRoutes);
app.use("/api/produits", authenticate, produitRoutes);
app.use("/api/approvisionnements", authenticate, approvisionnementRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
