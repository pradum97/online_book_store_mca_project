const { pool } = require("../../config/db");
const { success, error } = require("../../utils/response");

exports.createReview = async (req, res) => {
  const client = await pool.connect();

  try {
    const { book_id, rating, comment } = req.body;
    const user_id = req.user.user_id;

    await client.query("BEGIN");

    if (!book_id || !rating) {
      await client.query("ROLLBACK");
      return error(res, "Invalid Input", "Book id and rating are required");
    }

    if (rating < 1 || rating > 5) {
      await client.query("ROLLBACK");
      return error(res, "Invalid Rating", "Rating must be between 1 and 5");
    }

    const book = await client.query(
      `
      SELECT book_id
      FROM tbl_books
      WHERE book_id=$1
      AND is_active=true
      `,
      [book_id],
    );

    if (!book.rows.length) {
      await client.query("ROLLBACK");
      return error(res, "Book Not Found", "Invalid book");
    }

    const existing = await client.query(
      `
      SELECT review_id
      FROM tbl_reviews
      WHERE book_id=$1
      AND user_id=$2
      AND is_active=true
      `,
      [book_id, user_id],
    );

    if (existing.rows.length) {
      await client.query("ROLLBACK");
      return error(res, "Duplicate Review", "You already reviewed this book");
    }

    const review = await client.query(
      `
      INSERT INTO tbl_reviews
      (
        book_id,
        user_id,
        rating,
        comment,
        created_by,
        created_session_id,
        organization_id,
        installation_id
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING review_id
      `,
      [
        book_id,
        user_id,
        rating,
        comment || null,
        user_id,
        req.session_id || null,
        req.user.organization_id || null,
        req.user.installation_id || null,
      ],
    );

    await client.query("COMMIT");

    return success(res, "Review Added", "Review submitted successfully", {
      review_id: review.rows[0].review_id,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    return error(res, "Review Failed", err.message);
  } finally {
    client.release();
  }
};

exports.getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;

    const reviews = await pool.query(
      `
      SELECT
        r.review_id,
        r.rating,
        r.comment,
        r.created_date,
        u.username
      FROM tbl_reviews r
      JOIN tbl_users u
      ON r.user_id = u.user_id
      WHERE r.book_id=$1
      AND r.is_active=true
      ORDER BY r.created_date DESC
      `,
      [bookId],
    );

    const ratingSummary = await pool.query(
      `
      SELECT
        AVG(rating)::numeric(10,2) as average_rating,
        COUNT(*) as total_reviews
      FROM tbl_reviews
      WHERE book_id=$1
      AND is_active=true
      `,
      [bookId],
    );

    return success(res, "Book Reviews", "Reviews fetched successfully", {
      reviews: reviews.rows,
      summary: ratingSummary.rows[0],
    });
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.deleteReview = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    await client.query("BEGIN");

    const review = await client.query(
      `
      UPDATE tbl_reviews
      SET
        is_active=false,
        updated_by=$1,
        updated_session_id=$2,
        updated_date=NOW()
      WHERE review_id=$3
      AND user_id=$1
      AND is_active=true
      RETURNING review_id
      `,
      [user_id, req.session_id || null, id],
    );

    if (!review.rows.length) {
      await client.query("ROLLBACK");
      return error(res, "Delete Failed", "Review not found");
    }

    await client.query("COMMIT");

    return success(res, "Review Deleted", "Review removed successfully", {
      review_id: id,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    return error(res, "Delete Failed", err.message);
  } finally {
    client.release();
  }
};
