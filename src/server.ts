require("dotenv").config();

import express from "express";
import cors from "cors";
import userRoutes from "./api/routes/user.routes";
import tripRoutes from "./api/routes/trip.routes";
import reviewRoutes from "./api/routes/review.routes";
import chatRoutes from "./api/routes/chat.routes";

const app = express();

app.use((_, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,PATCH"
  );
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  response.header("Access-Control-Expose-Headers", "x-total-count");

  return next();
});

app.use(
  cors({
    origin: "*",
    // credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/users", userRoutes);
app.use("/trips", tripRoutes);
app.use("/reviews", reviewRoutes);
app.use("/chat", chatRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
