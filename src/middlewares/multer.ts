// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     if (file.fieldname === "banner") {
//       cb(null, "tmp/trips/banner");
//     } else if (file.fieldname === "images") {
//       cb(null, "tmp/trips/images");
//     } else if (file.fieldname === "avatar") {
//       cb(null, "tmp/avatar");
//     }
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const validFields = ["banner", "images", "avatar"];
//     if (validFields.includes(file.fieldname)) {
//       cb(null, true);
//     } else {
//       // cb(new multer.MulterError("Unexpected field"));
//     }
//   },
// });

// export { upload };

import multer from "multer";

// Configurar o storage para usar memória em vez de disco
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const validFields = ["banner", "images", "avatar"];
    if (validFields.includes(file.fieldname)) {
      cb(null, true);
    } else {
      // cb(new multer.MulterError();
    }
  },
});

export { upload };
