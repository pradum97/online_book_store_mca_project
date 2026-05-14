const { pool } = require("../../../config/db");
const { success, error } = require("../../../utils/response");
const { uploadFile } = require("../../../utils/cloudinary-upload.util");
const cloudinary = require("cloudinary").v2;

exports.getBookImages = async (req, res) => {
  try {
    const { book_id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        image_id,
        image_url,
        public_id,
        resource_type,
        format,
        bytes,
        created_date
      FROM tbl_book_images
      WHERE book_id = $1
      ORDER BY created_date DESC
      `,
      [book_id],
    );

    return success(
      res,
      "Images Fetched",
      "Book images fetched successfully",
      result.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.addBookImages = async (req, res) => {
  const client = await pool.connect();

  try {
    const { bookId } = req.params;

    const { organization_id, installation_id, created_by, created_session_id } =
      req.body;

    if (!req.files || req.files.length === 0) {
      return error(res, "Upload Failed", "Images are required");
    }

    await client.query("BEGIN");

    const insertedImages = [];

    for (const file of req.files) {
      const uploaded = await uploadFile(file, "bookstore/books");

      const result = await client.query(
        `
        INSERT INTO tbl_book_images
        (
          book_id,
          image_url,
          public_id,
          resource_type,
          format,
          bytes,
          organization_id,
          installation_id,
          created_date
        )
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,NOW())
        RETURNING *
        `,
        [
          bookId,
          uploaded.url,
          uploaded.public_id,
          uploaded.resource_type,
          uploaded.format,
          uploaded.bytes,
          organization_id,
          installation_id,
        ],
      );
      insertedImages.push(result.rows[0]);
    }

    await client.query("COMMIT");

    return success(
      res,
      "Images Uploaded",
      `${insertedImages.length} images uploaded successfully`,
      insertedImages,
    );
  } catch (err) {
    await client.query("ROLLBACK");

    return error(res, "Upload Failed", err.message);
  } finally {
    client.release();
  }
};

exports.deleteBookImage = async (req, res) => {
  const client = await pool.connect();

  try {
    const { image_id } = req.params;

    await client.query("BEGIN");

    const image = await client.query(
      `
      SELECT public_id
      FROM tbl_book_images
      WHERE image_id = $1
      `,
      [image_id],
    );

    if (!image.rowCount) {
      await client.query("ROLLBACK");
      return error(res, "Delete Failed", "Image not found");
    }

    const { public_id } = image.rows[0];

    await cloudinary.uploader.destroy(public_id);

    await client.query(
      `
      DELETE FROM tbl_book_images
      WHERE image_id = $1
      `,
      [image_id],
    );

    await client.query("COMMIT");

    return success(
      res,
      "Image Deleted",
      "Book image deleted successfully",
      null,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    return error(res, "Delete Failed", err.message);
  } finally {
    client.release();
  }
};
