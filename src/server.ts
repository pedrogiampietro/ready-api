require("dotenv").config();

import express, { Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import userRoutes from "./api/routes/user.routes";
import tripRoutes from "./api/routes/trip.routes";
import reviewRoutes from "./api/routes/review.routes";
import chatRoutes from "./api/routes/chat.routes";
import { rateLimit } from "express-rate-limit";

const app = express();

app.set("trust proxy", true);
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    exposedHeaders: ["x-total-count"],
  })
);

app.use((_: any, response: Response, next: NextFunction) => {
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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30, // Limit each IP to 30 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

app.use(limiter);

app.use("/users", userRoutes);
app.use("/trips", tripRoutes);
app.use("/reviews", reviewRoutes);
app.use("/chat", chatRoutes);
app.use("/tmp", express.static(path.join(__dirname, "..", "tmp")));

const port = process.env.PORT || 3333;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
