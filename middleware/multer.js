import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const uniqueCode = uuidv4(); // Generate a unique code
    const sanitizedOriginalname = file.originalname.replace(/\s+/g, "-"); // Replace spaces with hyphens
    const filename = `${Date.now()}-${uniqueCode}-${sanitizedOriginalname}.png`;
    cb(null, filename);
  },
});

// const storage =multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10000000, // 10MB in bytes
  },
  fileFilter: (req, file, cb) => {
    // Check the file type here (e.g., by examining the file's mimetype)
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept the file/ Accept the file
    } else {
      cb(new Error('Invalid file type'), false); // Reject the file
    }
  },
});

export default { upload };
