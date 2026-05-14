const { pool } = require("../../config/db");
const { success, error } = require("../../utils/response");

exports.getAllBooks = async (req, res) => {
  try {
    const { q, author, category_id, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    let filters = [];
    let values = [];

    if (q) {
      values.push(`%${q}%`);
      filters.push(`
        (
          b.title ILIKE $${values.length}
          OR b.author ILIKE $${values.length}
          OR b.description ILIKE $${values.length}
        )
      `);
    }

    if (author) {
      values.push(`%${author}%`);
      filters.push(`b.author ILIKE $${values.length}`);
    }

    if (category_id) {
      values.push(category_id);
      filters.push(`b.category_id = $${values.length}`);
    }

    values.push(req.user?.user_id || null);

    const where = filters.length ? `AND ${filters.join(" AND ")}` : "";

    const query = `
      SELECT
        b.book_id,
        b.title,
        b.author,

        COALESCE(MIN(i.image_url), NULL) AS image,

        ts.mrp AS price,
        ts.mrp AS "originalPrice",

        0 AS rating,
        0 AS reviews,
        0 AS discount,

        ts.stock_id,
        ts.quantity,

        EXISTS (
          SELECT 1
          FROM tbl_cart_items ci
          JOIN tbl_cart c ON c.cart_id = ci.cart_id
          WHERE c.user_id = $${values.length}
          AND c.is_active = true
          AND ci.book_id = b.book_id
        ) AS "is_in_cart",
         c.category_name

      FROM tbl_books b

      INNER JOIN tbl_stock ts 
        ON ts.book_id = b.book_id 
        AND ts.is_active = true 
        AND ts.is_default_stock = true

      LEFT JOIN tbl_book_images i 
        ON i.book_id = b.book_id

      LEFT JOIN tbl_categories c
      ON c.category_id=b.category_id

      WHERE b.is_active = true
      ${where}

      GROUP BY 
        b.book_id,
        ts.mrp,
        ts.stock_id,
        ts.quantity,
        c.category_name

      ORDER BY b.created_date DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const result = await pool.query(query, values);

    const BOOK_IMAGES = [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=600&fit=crop",
    ];

    const getBookImage = (id) => BOOK_IMAGES[id % BOOK_IMAGES.length];

    const rows = result.rows.map((book) => ({
      ...book,
      image: book.image || getBookImage(book.book_id),
    }));

    return success(res, "Books List", "Books fetched successfully", rows);
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.autocompleteBooks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return success(res, "Autocomplete", "Query too short", []);
    }

    const values = [`%${q.trim()}%`];

    const query = `
      SELECT DISTINCT
        b.book_id,
        b.title,
        b.author
      FROM tbl_books b
      INNER JOIN tbl_stock ts 
        ON ts.book_id = b.book_id 
        AND ts.is_active = true 
        AND ts.is_default_stock = true
      WHERE b.is_active = true
        AND (
          b.title ILIKE $1
          OR b.author ILIKE $1
        )
      ORDER BY b.title ASC
      LIMIT 8
    `;

    const result = await pool.query(query, values);
    return success(res, "Autocomplete", "Suggestions fetched", result.rows);
  } catch (err) {
    return error(res, "Autocomplete Failed", err.message);
  }
};

exports.createBook = async (req, res) => {
  const client = await pool.connect();

  try {
    const { title, author, category_id, description, uoms } = req.body;

    if (!title) {
      return error(res, "Validation Failed", "Book title is required");
    }

    if (!uoms || !uoms.length) {
      return error(res, "Validation Failed", "At least one UOM is required");
    }

    await client.query("BEGIN");

    const book = await client.query(
      `
      INSERT INTO tbl_books
      (
        title,
        author,
        category_id,
        description,
        seller_id,
        created_by,
        created_session_id
      )
      VALUES($1,$2,$3,$4,$5,$5,$6)
      RETURNING book_id
      `,
      [
        title,
        author,
        category_id,
        description,
        req.user.user_id,
        req.user.session_id,
      ],
    );

    const bookId = book.rows[0].book_id;

    for (const uom of uoms) {
      await client.query(
        `
        INSERT INTO tbl_book_uom
        (
          book_id,
          uom_id,
          base_quantity,
          is_default,
          created_session_id
        )
        VALUES($1,$2,$3,$4,$5)
        `,
        [
          bookId,
          uom.uom_id,
          uom.base_quantity || 1,
          uom.is_default || false,
          req.user.session_id,
        ],
      );
    }

    await client.query("COMMIT");

    return success(res, "Book Created", "Book and UOM created successfully", {
      book_id: bookId,
    });
  } catch (err) {
    await client.query("ROLLBACK");

    return error(res, "Creation Failed", err.message);
  } finally {
    client.release();
  }
};

exports.updateBook = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { title, author, category_id, description, uoms } = req.body;

    await client.query("BEGIN");

    await client.query(
      `
      UPDATE tbl_books
      SET
        title = COALESCE($1,title),
        author = COALESCE($2,author),
        category_id = COALESCE($3,category_id),
        description = COALESCE($4,description),
        updated_by = $5,
        updated_session_id = $6,
        updated_date = NOW()
      WHERE book_id = $7
      `,
      [
        title,
        author,
        category_id,
        description,
        req.user.user_id,
        req.user.session_id,
        id,
      ],
    );

    const existing = await client.query(
      `
      SELECT book_uom_id
      FROM tbl_book_uom
      WHERE book_id=$1
      `,
      [id],
    );

    const existingIds = existing.rows.map((r) => r.book_uom_id);

    const requestIds = [];

    if (uoms && uoms.length) {
      for (const uom of uoms) {
        if (uom.book_uom_id) {
          requestIds.push(uom.book_uom_id);

          await client.query(
            `
            UPDATE tbl_book_uom
            SET
              uom_id=$1,
              base_quantity=$2,
              is_default=$3,
              updated_session_id=$4,
              updated_date=NOW()
            WHERE book_uom_id=$5 AND book_id=$6
            `,
            [
              uom.uom_id,
              uom.base_quantity || 1,
              uom.is_default || false,
              req.user.session_id,
              uom.book_uom_id,
              id,
            ],
          );
        } else {
          await client.query(
            `
            INSERT INTO tbl_book_uom
            (
              book_id,
              uom_id,
              base_quantity,
              is_default,
              created_session_id
            )
            VALUES($1,$2,$3,$4,$5)
            `,
            [
              id,
              uom.uom_id,
              uom.base_quantity || 1,
              uom.is_default || false,
              req.user.session_id,
            ],
          );
        }
      }
    }

    for (const existingId of existingIds) {
      if (!requestIds.includes(existingId)) {
        const stock = await client.query(
          `
          SELECT 1
          FROM tbl_stock
          WHERE book_uom_id=$1
          LIMIT 1
          `,
          [existingId],
        );

        if (stock.rows.length) {
          throw new Error("Cannot delete UOM. Stock exists.");
        }

        const order = await client.query(
          `
          SELECT 1
          FROM tbl_order_items
          WHERE uom_id IN
          (
            SELECT uom_id
            FROM tbl_book_uom
            WHERE book_uom_id=$1
          )
          LIMIT 1
          `,
          [existingId],
        );

        if (order.rows.length) {
          throw new Error("Cannot delete UOM. Order already placed.");
        }

        await client.query(
          `
          DELETE FROM tbl_book_uom
          WHERE book_uom_id=$1
          `,
          [existingId],
        );
      }
    }

    await client.query("COMMIT");

    return success(res, "Book Updated", "Book and UOM updated successfully");
  } catch (err) {
    await client.query("ROLLBACK");

    return error(res, "Update Failed", err.message);
  } finally {
    client.release();
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE tbl_books
      SET
        is_active=false,
        updated_by=$1,
        updated_session_id=$2,
        updated_date=NOW()
      WHERE book_id=$3
      `,
      [req.user.user_id, req.user.session_id, id],
    );

    if (!result.rowCount) {
      return error(res, "Delete Failed", "Book not found");
    }

    return success(res, "Book Deleted", "Book deleted successfully");
  } catch (err) {
    return error(res, "Delete Failed", err.message);
  }
};

exports.getSellerBooks = async (req, res) => {
  try {
    const { q, category_id, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    let filters = [];
    let values = [];

    if (q) {
      values.push(`%${q}%`);
      filters.push(
        `(b.title ILIKE $${values.length} OR b.author ILIKE $${values.length})`,
      );
    }

    if (category_id) {
      values.push(category_id);
      filters.push(`b.category_id=$${values.length}`);
    }

    console.log("uuuuuuuuuu-", req.user.user_id);

    if (req.user.user_id) {
      values.push(req.user.user_id);
      filters.push(`b.created_by = $${values.length}`);
    }

    const where = filters.length ? `AND ${filters.join(" AND ")}` : "";

    const query = `
      SELECT
      b.book_id,
      b.title,
      b.author,
      b.description,
      c.category_name,
      b.category_id,

  COALESCE(
    json_agg(
      json_build_object(
        'image_id', i.image_id,
        'image_url', i.image_url
      )
    ) FILTER (WHERE i.image_id IS NOT NULL),
    '[]'
  ) AS images

      FROM tbl_books b

      LEFT JOIN tbl_categories c
      ON c.category_id=b.category_id

LEFT JOIN tbl_book_images i
ON i.book_id = b.book_id

      WHERE b.is_active=true
      ${where}

GROUP BY
b.book_id,
c.category_name

      ORDER BY b.created_date DESC
      LIMIT ${limit}
      OFFSET ${offset}
      `;

    const books = await pool.query(query, values);

    return success(res, "Books List", "Books fetched successfully", books.rows);
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.user_id || null;

    const book = await pool.query(
      `
      SELECT
      b.book_id,
      b.title,
      b.author,
      b.description,
      b.created_date,

      c.category_name,

      u.full_name AS seller_name,
      ts.stock_id,
              EXISTS (
          SELECT 1
          FROM tbl_cart_items ci
          JOIN tbl_cart c ON c.cart_id = ci.cart_id
          WHERE c.user_id = $2
          AND c.is_active = true
          AND ci.book_id = b.book_id
        ) AS "is_in_cart",

        ts.mrp AS price,
        ts.mrp AS "originalPrice",

        0 AS rating,
        0 AS reviews,
        0 AS discount,
        ts.quantity

      FROM tbl_books b

      LEFT JOIN tbl_categories c
      ON c.category_id=b.category_id

      LEFT JOIN tbl_users u
      ON u.user_id=b.seller_id

      INNER JOIN tbl_stock ts 
        ON ts.book_id = b.book_id 
        AND ts.is_active = true 
        AND ts.is_default_stock = true

      WHERE b.book_id=$1
      `,
      [id, userId],
    );

    if (!book.rows.length) {
      return error(res, "Book Not Found", "Book does not exist");
    }

    const images = await pool.query(
      `
      SELECT
      image_id,
      image_url
      FROM tbl_book_images
      WHERE book_id=$1
      `,
      [id],
    );

    return success(res, "Book Details", "Book fetched successfully", {
      ...book.rows[0],
      images: images.rows,
    });
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.getUoms = async (req, res) => {
  try {
    const {
      q,
      organization_id,
      installation_id,
      is_active = true,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;

    let filters = [];
    let values = [];

    if (q) {
      values.push(`%${q}%`);
      filters.push(
        `(u.uom_name ILIKE $${values.length} OR u.uom_code ILIKE $${values.length})`,
      );
    }

    if (organization_id) {
      values.push(organization_id);
      filters.push(`u.organization_id = $${values.length}`);
    }

    if (installation_id) {
      values.push(installation_id);
      filters.push(`u.installation_id = $${values.length}`);
    }

    if (is_active !== undefined) {
      values.push(is_active);
      filters.push(`u.is_active = $${values.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const result = await pool.query(
      `
      SELECT
        u.uom_id,
        u.uom_code,
        u.uom_name,
        u.description,
        u.is_active,
        u.organization_name,
        u.installation_name,
        u.created_at
      FROM tbl_uom u
      ${where}
      ORDER BY u.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
      `,
      values,
    );

    return success(res, "UOM List", "UOM fetched successfully", result.rows);
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.getBookEditData = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await pool.query(
      `
      SELECT
        book_id,
        title,
        author,
        category_id,
        description
      FROM tbl_books
      WHERE book_id = $1
      `,
      [id],
    );

    if (!book.rows.length) {
      return error(res, "Not Found", "Book not found");
    }

    const uoms = await pool.query(
      `
      SELECT
        bu.book_uom_id,
        bu.uom_id,
        bu.base_quantity,
        bu.is_default
      FROM tbl_book_uom bu
      WHERE bu.book_id = $1
      `,
      [id],
    );

    return success(res, "Book Edit Data", "Fetched successfully", {
      ...book.rows[0],
      uom_list: uoms.rows,
    });
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.getBookUOMs = async (req, res) => {
  try {
    const { book_id } = req.params;

    if (!book_id) {
      return error(res, "Validation Failed", "book_id is required");
    }

    const result = await pool.query(
      `
      SELECT
        bu.book_uom_id,
        bu.book_id,
        bu.uom_id,
        u.uom_name,
        u.uom_code,
        bu.base_quantity,
        bu.is_default
      FROM tbl_book_uom bu
      LEFT JOIN tbl_uom u
        ON u.uom_id = bu.uom_id
      WHERE bu.book_id = $1 AND u.is_active = true
      ORDER BY bu.book_uom_id DESC
      `,
      [book_id],
    );

    return success(
      res,
      "Book UOM List",
      "Book UOM fetched successfully",
      result.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};
