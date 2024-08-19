import multer from "multer";
import path from "path";
import { randomUUID as uuidv4 } from "node:crypto";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "banner") {
      cb(null, "tmp/trips/banner");
    } else if (file.fieldname === "images") {
      cb(null, "tmp/trips/images");
    } else if (file.fieldname === "avatar") {
      cb(null, "tmp/avatars");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const validFields = ["banner", "images", "avatar"];
    if (validFields.includes(file.fieldname)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Unexpected field"));
    }
  },
});

export { upload };
