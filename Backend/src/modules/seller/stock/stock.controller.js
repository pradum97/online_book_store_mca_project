const { pool } = require("../../../config/db");
const { success, error } = require("../../../utils/response");

exports.createStock = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      book_id,
      book_uom_id,
      quantity,
      mrp,
      purchase_rate,
      is_default_stock = false,
    } = req.body;

    const seller_id = req.user.user_id;

    await client.query("BEGIN");

    if (is_default_stock) {
      await client.query(
        `
        UPDATE tbl_stock
        SET is_default_stock = false
        WHERE book_id = $1
        AND seller_id = $2
        AND is_active = true
        `,
        [book_id, seller_id],
      );
    }

    const stock = await client.query(
      `
      INSERT INTO tbl_stock
      (
        book_id,
        seller_id,
        book_uom_id,
        quantity,
        mrp,
        purchase_rate,
        is_default_stock
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,

      [
        book_id,
        seller_id,
        book_uom_id,
        quantity,
        mrp,
        purchase_rate,
        is_default_stock,
      ],
    );

    await client.query("COMMIT");

    return success(
      res,
      "Stock Created",
      "Stock added successfully",
      stock.rows[0],
    );
  } catch (err) {
    await client.query("ROLLBACK");

    return error(res, "Create Failed", err.message);
  } finally {
    client.release();
  }
};

exports.updateStock = async (req, res) => {
  const client = await pool.connect();

  try {
    const { stock_id } = req.params;

    const { quantity, mrp, purchase_rate, is_default_stock } = req.body;

    await client.query("BEGIN");

    const stockData = await client.query(
      `SELECT * FROM tbl_stock WHERE stock_id=$1`,
      [stock_id],
    );

    if (!stockData.rows.length) {
      return error(res, "Stock Not Found", "Stock does not exist");
    }

    const stock = stockData.rows[0];

    if (is_default_stock === true) {
      await client.query(
        `
        UPDATE tbl_stock
        SET is_default_stock=false
        WHERE book_id=$1
        AND seller_id=$2
        AND is_active=true
        `,

        [stock.book_id, stock.seller_id],
      );
    }

    await client.query(
      `
      UPDATE tbl_stock
      SET
      quantity = COALESCE($1, quantity),
      mrp = COALESCE($2, mrp),
      purchase_rate = COALESCE($3, purchase_rate),
      is_default_stock = COALESCE($4, is_default_stock),
      updated_date = NOW()
      WHERE stock_id = $5
      `,

      [quantity, mrp, purchase_rate, is_default_stock, stock_id],
    );
    if (mrp || purchase_rate) {
      await client.query(
        `
        INSERT INTO tbl_stock_history
        (
        stock_id,
        old_mrp,
        new_mrp,
        old_purchase_rate,
        new_purchase_rate
        )
        VALUES ($1,$2,$3,$4,$5)
        `,

        [
          stock_id,
          stock.mrp,
          mrp || stock.mrp,
          stock.purchase_rate,
          purchase_rate || stock.purchase_rate,
        ],
      );
    }

    await client.query("COMMIT");

    return success(res, "Stock Updated", "Stock updated successfully");
  } catch (err) {
    await client.query("ROLLBACK");

    return error(res, "Update Failed", err.message);
  } finally {
    client.release();
  }
};

exports.getSellerStock = async (req, res) => {
  try {
    const seller_id = req.user.user_id;

    const { q, book_id, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    let filters = [`s.seller_id=$1`, `s.is_active=true`];
    let values = [seller_id];

    if (book_id) {
      values.push(book_id);
      filters.push(`s.book_id=$${values.length}`);
    }

    if (q) {
      values.push(`%${q}%`);
      filters.push(
        `(b.title ILIKE $${values.length} OR b.author ILIKE $${values.length})`,
      );
    }

    const where = `WHERE ${filters.join(" AND ")}`;

    const stock = await pool.query(
      `
      SELECT

      s.stock_id,
      s.quantity,
      s.mrp,
      s.purchase_rate,
      s.is_default_stock,

      b.book_id,
      b.title,
      b.author,

      u.uom_name,
      u.uom_code

      FROM tbl_stock s

      JOIN tbl_books b
      ON b.book_id = s.book_id

      JOIN tbl_book_uom bu
      ON bu.book_uom_id = s.book_uom_id

      JOIN tbl_uom u
      ON u.uom_id = bu.uom_id

      ${where}

      ORDER BY s.created_date DESC

      LIMIT ${limit}
      OFFSET ${offset}
      `,
      values,
    );

    return success(
      res,
      "Seller Stock",
      "Stock fetched successfully",
      stock.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.getStockHistory = async (req, res) => {
  try {
    const history = await pool.query(
      `
      SELECT

      sh.*,

      b.title

      FROM tbl_stock_history sh

      JOIN tbl_stock s
      ON s.stock_id = sh.stock_id

      JOIN tbl_books b
      ON b.book_id = s.book_id

      ORDER BY sh.changed_date DESC
      `,
    );

    return success(
      res,
      "Stock History",
      "History fetched successfully",
      history.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.deleteStock = async (req, res) => {
  try {
    const { stock_id } = req.params;

    await pool.query(
      `
      UPDATE tbl_stock
      SET is_active=false,
      updated_date=NOW()
      WHERE stock_id=$1
      `,

      [stock_id],
    );

    return success(res, "Stock Deleted", "Stock removed successfully");
  } catch (err) {
    return error(res, "Delete Failed", err.message);
  }
};
