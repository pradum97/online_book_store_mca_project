const { pool } = require("../../config/db");
const { success, error } = require("../../utils/response");
const cloudinary = require("../../config/cloudinary.config");
const { uploadFile } = require("../../utils/cloudinary-upload.util");
const {
  generateRequestNumber,
  generateSellerNumber,
} = require("../../utils/numberGenerator");

exports.upsertSeller = async (req, res) => {
  const client = await pool.connect();

  try {
    const data = req.body;
    const files = req.files || {};

    delete data.confirm_account_number;

    await client.query("BEGIN");

    let sellerId = data.seller_id;

    if (sellerId) {
      await client.query(
        `
        UPDATE tbl_sellers
        SET
          first_name=$1,
          last_name=$2,
          email=$3,
          mobile=$4,
          dob=$5,
          gender=$6,
          address=$7,
          city=$8,
          state=$9,
          pincode=$10,
          updated_by=$11,
          updated_session_id=$12,
          updated_date=NOW()
        WHERE seller_id=$13
        `,
        [
          data.first_name,
          data.last_name,
          data.email,
          data.mobile,
          data.dob,
          data.gender,
          data.address,
          data.city,
          data.state,
          data.pincode,
          req.user.user_id,
          req.user.session_id,
          sellerId,
        ],
      );
    } else {
      const requestNumber = await generateRequestNumber(client, data.state);

      const result = await client.query(
        `
        INSERT INTO tbl_sellers
        (
          user_id,
          first_name,
          last_name,
          email,
          mobile,
          dob,
          gender,
          address,
          city,
          state,
          pincode,
          created_by,
          created_session_id,
          request_number
        )
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$1,$12,$13)
        RETURNING seller_id
        `,
        [
          req.user.user_id,
          data.first_name,
          data.last_name,
          data.email,
          data.mobile,
          data.dob,
          data.gender,
          data.address,
          data.city,
          data.state,
          data.pincode,
          req.user.session_id,
          requestNumber,
        ],
      );

      sellerId = result.rows[0].seller_id;
    }

    await client.query(
      `
      INSERT INTO tbl_seller_business_details
      (
        seller_id,
        business_name,
        business_type,
        gst_number,
        pan_number,
        business_email,
        business_phone,
        business_address,
        business_city,
        business_state,
        business_pincode,
        years_in_business
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (seller_id)
      DO UPDATE SET
        business_name=$2,
        business_type=$3,
        gst_number=$4,
        pan_number=$5,
        business_email=$6,
        business_phone=$7,
        business_address=$8,
        business_city=$9,
        business_state=$10,
        business_pincode=$11,
        years_in_business=$12
      `,
      [
        sellerId,
        data.business_name || null,
        data.business_type || null,
        data.gst_number || null,
        data.pan_number || null,
        data.business_email || null,
        data.business_phone || null,
        data.business_address || null,
        data.business_city || null,
        data.business_state || null,
        data.business_pincode || null,
        data.years_in_business || null,
      ],
    );

    await client.query(
      `
      INSERT INTO tbl_seller_bank_details
      (
        seller_id,
        account_holder,
        bank_name,
        account_number,
        ifsc_code,
        account_type
      )
      VALUES($1,$2,$3,$4,$5,$6)
      ON CONFLICT (seller_id)
      DO UPDATE SET
        account_holder=$2,
        bank_name=$3,
        account_number=$4,
        ifsc_code=$5,
        account_type=$6
      `,
      [
        sellerId,
        data.account_holder || null,
        data.bank_name || null,
        data.account_number || null,
        data.ifsc_code || null,
        data.account_type || null,
      ],
    );

    const docTypes = [
      "aadhaar_front",
      "aadhaar_back",
      "pan_card",
      "gst_certificate",
      "cancelled_cheque",
      "business_registration",
    ];

    for (const type of docTypes) {
      const file = files[type]?.[0];
      if (!file) continue;

      const existing = await client.query(
        `SELECT document_id, public_id FROM tbl_seller_documents WHERE seller_id=$1 AND document_type=$2`,
        [sellerId, type.toUpperCase()],
      );

      const upload = await uploadFile(file, "bookstore/sellers");

      if (existing.rows.length) {
        await client.query(
          `
          UPDATE tbl_seller_documents
          SET
            file_url=$1,
            public_id=$2,
            file_type=$3,
            file_size=$4,
            uploaded_date=NOW()
          WHERE document_id=$5
          `,
          [
            upload.url,
            upload.public_id,
            upload.format,
            upload.bytes,
            existing.rows[0].document_id,
          ],
        );

        if (existing.rows[0].public_id) {
          await cloudinary.uploader.destroy(existing.rows[0].public_id);
        }
      } else {
        await client.query(
          `
          INSERT INTO tbl_seller_documents
          (
            seller_id,
            document_type,
            file_url,
            public_id,
            file_type,
            file_size
          )
          VALUES($1,$2,$3,$4,$5,$6)
          `,
          [
            sellerId,
            type.toUpperCase(),
            upload.url,
            upload.public_id,
            upload.format,
            upload.bytes,
          ],
        );
      }
    }

    await client.query("COMMIT");

    return success(res, "Success", "All seller data saved", {
      seller_id: sellerId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    return error(res, "Failed", err.message);
  } finally {
    client.release();
  }
};

exports.getSellerRequestStatus = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await pool.query(
      `
      SELECT request_number, seller_number, status, rejection_message
      FROM tbl_sellers
      WHERE user_id=$1
      ORDER BY created_date DESC
      LIMIT 1
      `,
      [userId],
    );

    if (!result.rows.length) {
      return res.json({
        action: "error",
        title: "Not Found",
        message: "No request found",
      });
    }

    const data = result.rows[0];

    if (data.status === "APPROVED") {
      return res.json({
        action: "success",
        title: "Congratulations 🎉",

        data: {
          seller_number: data.seller_number,
          status: data.status,
          message:
            "🎉 Congratulations! Your seller account is approved. You can now start selling and grow your business with us 🚀",
        },
      });
    }

    if (data.status === "REJECTED") {
      return res.json({
        action: "error",
        title: "Request Rejected",

        data: {
          request_number: data.request_number,
          status: data.status,
          message:
            data.rejection_message ||
            "Your request was rejected. Please contact support.",
        },
      });
    }

    return res.json({
      action: "success",
      title: "Request Submitted",
      message: "Your request is under review.",
      data: {
        request_number: data.request_number,
        status: data.status,
      },
    });
  } catch (err) {
    return res.json({
      action: "error",
      title: "Error",
      message: err.message,
    });
  }
};

exports.getAllSellers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [];
    const params = [];
    let idx = 1;

    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      conditions.push(`s.status = $${idx++}`);
      params.push(status);
    }

    if (search) {
      conditions.push(`(
        s.first_name ILIKE $${idx} OR
        s.last_name ILIKE $${idx} OR
        s.email ILIKE $${idx} OR
        b.business_name ILIKE $${idx} OR
        s.seller_number ILIKE $${idx} OR
        s.request_number ILIKE $${idx}
      )`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM tbl_sellers s
      LEFT JOIN tbl_seller_business_details b ON b.seller_id = s.seller_id
      ${where}
      `,
      params,
    );

    const summaryResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'PENDING')  AS pending,
        COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved,
        COUNT(*) FILTER (WHERE status = 'REJECTED') AS rejected,
        COUNT(*)                                     AS total
      FROM tbl_sellers
    `);

    const dataResult = await pool.query(
      `
      SELECT
        s.seller_id,
        s.request_number,
        s.seller_number,
        s.first_name,
        s.last_name,
        s.email,
        s.mobile,
        s.city,
        s.state,
        s.status,
        s.created_date  ,
        b.business_name,
        bt.business_type_name AS business_type,
        b.gst_number,
        s.full_name
      FROM tbl_sellers s
      LEFT JOIN tbl_seller_business_details b ON b.seller_id = s.seller_id
      LEFT JOIN tbl_business_types bt ON bt.business_type_code = b.business_type
      ${where}
      ORDER BY
        CASE s.status WHEN 'PENDING' THEN 0 WHEN 'REJECTED' THEN 1 ELSE 2 END,
        s.created_date DESC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...params, parseInt(limit), offset],
    );

    const total = parseInt(countResult.rows[0].total);
    const summary = summaryResult.rows[0];

    return res.json({
      action: "success",
      data: {
        sellers: dataResult.rows,
        summary: {
          total: parseInt(summary.total),
          pending: parseInt(summary.pending),
          approved: parseInt(summary.approved),
          rejected: parseInt(summary.rejected),
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
          hasNext: offset + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.getSellerById = async (req, res) => {
  try {
    const { id } = req.params;

    const sellerResult = await pool.query(
      `
      SELECT
        s.*,
        u.email AS user_email,
        u.user_type_code
      FROM tbl_sellers s
      LEFT JOIN tbl_users u ON u.user_id = s.user_id
      WHERE s.seller_id = $1
      `,
      [id],
    );

    if (!sellerResult.rows.length) {
      return error(res, "Not Found", "Seller not found");
    }

    const businessResult = await pool.query(
      `SELECT *,bt.business_type_name AS business_type FROM tbl_seller_business_details 
      LEFT JOIN tbl_business_types bt ON bt.business_type_code = tbl_seller_business_details.business_type
      WHERE seller_id = $1`,
      [id],
    );

    const bankResult = await pool.query(
      `
      SELECT
        account_holder,
        bank_name,
        CONCAT(REPEAT('X', LENGTH(account_number) - 4), RIGHT(account_number, 4)) AS account_number,
        ifsc_code,
        account_type
      FROM tbl_seller_bank_details
      WHERE seller_id = $1
      `,
      [id],
    );

    const docsResult = await pool.query(
      `
      SELECT
        document_type,
        file_url,
        file_type,
        file_size,
        uploaded_date
      FROM tbl_seller_documents
      WHERE seller_id = $1
      ORDER BY uploaded_date DESC
      `,
      [id],
    );

    const seller = sellerResult.rows[0];
    const business = businessResult.rows[0] || null;
    const bank = bankResult.rows[0] || null;

    const docs = {};
    for (const doc of docsResult.rows) {
      docs[doc.document_type.toLowerCase()] = {
        uploaded: true,
        url: doc.file_url,
        file_type: doc.file_type,
        uploaded_date: doc.uploaded_date,
      };
    }

    return res.json({
      action: "success",
      data: {
        seller,
        business,
        bank,
        docs,
      },
    });
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.updateSellerStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    const { seller_id, action, message } = req.body;

    if (!seller_id) {
      throw new Error("seller_id is required");
    }

    if (!["APPROVE", "REJECT"].includes(action)) {
      throw new Error("Invalid action. Must be APPROVE or REJECT");
    }

    if (action === "REJECT" && !message?.trim()) {
      throw new Error("Rejection message is required");
    }

    await client.query("BEGIN");

    const sellerRes = await client.query(
      `SELECT * FROM tbl_sellers WHERE seller_id = $1 FOR UPDATE`,
      [seller_id],
    );

    if (!sellerRes.rows.length) {
      throw new Error("Seller not found");
    }

    const seller = sellerRes.rows[0];

    if (seller.status === "APPROVED") {
      throw new Error("Seller is already approved");
    }

    let sellerNumber = null;
    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

    if (action === "APPROVE") {
      sellerNumber = await generateSellerNumber(client, seller.state);

      await client.query(
        `UPDATE tbl_users SET user_type_code = 'SELLER', updated_date = NOW() WHERE user_id = $1`,
        [seller.user_id],
      );
    }

    await client.query(
      `
      UPDATE tbl_sellers
      SET
        status              = $1,
        seller_number       = COALESCE($2, seller_number),
        rejection_message   = $3,
        reviewed_by         = $4,
        reviewed_date       = NOW(),
        updated_by          = $5,
        updated_session_id  = $6,
        updated_date        = NOW()
      WHERE seller_id = $7
      `,
      [
        newStatus,
        sellerNumber,
        newStatus === "REJECTED" ? message.trim() : null,
        req.user.user_id,
        req.user.user_id,
        req.user.session_id,
        seller_id,
      ],
    );

    await client.query(
      `
      INSERT INTO tbl_seller_status_log
        (seller_id, action, message, actioned_by, actioned_session_id)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        seller_id,
        newStatus,
        message || null,
        req.user.user_id,
        req.user.session_id,
      ],
    );

    await client.query("COMMIT");

    return res.json({
      action: "success",
      title: newStatus === "APPROVED" ? "Seller Approved" : "Seller Rejected",
      message:
        newStatus === "APPROVED"
          ? "Seller has been approved."
          : "Seller has been rejected.",
      data: {
        seller_id,
        seller_number: sellerNumber,
        status: newStatus,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    return error(res, "Status Update Failed", err.message);
  } finally {
    client.release();
  }
};

exports.deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE tbl_sellers
      SET
        is_active          = false,
        updated_by         = $1,
        updated_session_id = $2,
        updated_date       = NOW()
      WHERE seller_id = $3
      RETURNING seller_id
      `,
      [req.user.user_id, req.user.session_id, id],
    );

    if (!result.rowCount) {
      return error(res, "Not Found", "Seller not found");
    }

    return success(res, "Deleted", "Seller has been deactivated");
  } catch (err) {
    return error(res, "Delete Failed", err.message);
  }
};

exports.getSellerDashboardStats = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const sellerId = userId;

    const totalsRes = await pool.query(
      `
      SELECT
        COUNT(DISTINCT b.book_id)    AS total_books,
        COUNT(DISTINCT b.category_id) AS total_categories,
        COUNT(DISTINCT bi.image_id)  AS total_images,
        COUNT(DISTINCT CASE
          WHEN DATE_TRUNC('month', b.created_date) = DATE_TRUNC('month', NOW())
          THEN b.book_id
        END) AS books_this_month
      FROM tbl_books b
      LEFT JOIN tbl_book_images bi ON bi.book_id = b.book_id
      WHERE b.seller_id = $1 AND b.is_active = true
      `,
      [userId],
    );

    // -- Category breakdown --
    const categoryRes = await pool.query(
      `
      SELECT
        c.category_name  AS name,
        COUNT(b.book_id) AS count
      FROM tbl_books b
      JOIN tbl_categories c ON c.category_id = b.category_id
      WHERE b.seller_id = $1 AND b.is_active = true
      GROUP BY c.category_name
      ORDER BY count DESC
      `,
      [sellerId],
    );

    // -- Books added per month (last 8 months) --
    const monthlyRes = await pool.query(
      `
      SELECT
        TO_CHAR(DATE_TRUNC('month', b.created_date), 'Mon YY') AS month,
        COUNT(b.book_id) AS count
      FROM tbl_books b
      WHERE b.seller_id = $1
        AND b.is_active = true
        AND b.created_date >= NOW() - INTERVAL '8 months'
      GROUP BY DATE_TRUNC('month', b.created_date)
      ORDER BY DATE_TRUNC('month', b.created_date)
      `,
      [sellerId],
    );

    const topCatRes = await pool.query(
      `
      SELECT
        c.category_name          AS category,
        COUNT(DISTINCT b.book_id)  AS books,
        COUNT(DISTINCT bi.image_id) AS images
      FROM tbl_books b
      JOIN tbl_categories c ON c.category_id = b.category_id
      LEFT JOIN tbl_book_images bi ON bi.book_id = b.book_id
      WHERE b.seller_id = $1 AND b.is_active = true
      GROUP BY c.category_name
      ORDER BY books DESC
      LIMIT 6
      `,
      [sellerId],
    );

    const totals = totalsRes.rows[0];

    return res.json({
      action: "success",
      data: {
        totalBooks: parseInt(totals.total_books),
        totalCategories: parseInt(totals.total_categories),
        totalImages: parseInt(totals.total_images),
        booksThisMonth: parseInt(totals.books_this_month),
        categoryBreakdown: categoryRes.rows.map((r) => ({
          name: r.name,
          count: parseInt(r.count),
        })),
        booksByMonth: monthlyRes.rows.map((r) => ({
          month: r.month,
          count: parseInt(r.count),
        })),
        topCategories: topCatRes.rows.map((r) => ({
          category: r.category,
          books: parseInt(r.books),
          images: parseInt(r.images),
        })),
      },
    });
  } catch (err) {
    return error(res, "Stats Failed", err.message);
  }
};
