import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    files: 5,
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file.originalname);

    if (isImage) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});
export const ImagePdfUpload = multer({
  storage,
  limits: {
    files: 6,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|bmp|pdf)$/i.test(file.originalname);

    if (allowed) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});
