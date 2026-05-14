import cloudinary from "../config/cloudinary.config.js";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

export const uploadFile = async (file, folder) => {
  try {
    if (!file || !file.buffer || !file.mimetype) {
      throw new Error("Invalid file input");
    }

    const mime = file.mimetype.toLowerCase();

    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size && file.size > MAX_SIZE) {
      throw new Error("File size exceeds allowed limit");
    }

    const allowedExtensions = [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "pdf",
      "mp4",
      "mov",
      "avi",
      "mkv",
      "xls",
      "xlsx",
      "csv",
    ];

    const originalName = file.originalname || "";
    const ext = originalName.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      throw new Error("Unsupported file type");
    }

    let processedFile = file;
    let resourceType = "image";

    if (mime.startsWith("image/")) {
      const compressedBuffer = await sharp(file.buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer();

      processedFile = {
        ...file,
        buffer: compressedBuffer,
        mimetype: "image/webp",
        originalname: originalName.replace(/\.\w+$/, ".webp"),
        size: compressedBuffer.length,
      };

      resourceType = "image";
    } else if (mime === "application/pdf") {
      const pdfDoc = await PDFDocument.load(file.buffer);
      const compressedPdf = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      processedFile = {
        ...file,
        buffer: Buffer.from(compressedPdf),
        mimetype: "application/pdf",
        size: compressedPdf.length,
      };

      resourceType = "raw";
    } else if (mime.startsWith("video/")) {
      resourceType = "video";
    } else {
      resourceType = "raw";
    }

    const base64Data = `data:${processedFile.mimetype};base64,${processedFile.buffer.toString(
      "base64",
    )}`;

    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: resourceType,

      use_filename: true,
      unique_filename: true,
      filename_override: originalName,
      format: ext,

      overwrite: false,
      timeout: 60000,
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);
    throw new Error("File upload failed");
  }
};
