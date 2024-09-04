import multer from "multer";

const storage = multer.memoryStorage();

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
