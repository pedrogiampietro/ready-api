require("dotenv").config();

import express from "express";
import userRoutes from "./api/routes/user.routes";
import tripRoutes from "./api/routes/trip.routes";
import reviewRoutes from "./api/routes/review.routes";

const app = express();

// Middleware para parsear o corpo das requisições
app.use(express.json());

// Rotas
app.use("/users", userRoutes);
app.use("/trips", tripRoutes);
app.use("/reviews", reviewRoutes);

// Iniciar o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
