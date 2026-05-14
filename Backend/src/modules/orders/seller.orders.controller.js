const { pool } = require("../../config/db");
const { success, error } = require("../../utils/response");

exports.getSellerOrders = async (req, res) => {
  try {
    const seller_id = req.user.user_id;

    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const orders = await pool.query(
      `
  SELECT
    o.order_id,
    o.order_number,
    o.order_status,
    o.created_date,

    COUNT(oi.order_item_id) AS total_items,
    SUM(oi.total_amount) AS seller_total,

    p.payment_status

  FROM tbl_order_items oi

  JOIN tbl_orders o
  ON o.order_id = oi.order_id

  LEFT JOIN LATERAL (
    SELECT payment_status
    FROM tbl_payments p
    WHERE p.order_id = o.order_id
    ORDER BY p.payment_id DESC
    LIMIT 1
  ) p ON true

  WHERE oi.seller_id=$1

  GROUP BY
    o.order_id,
    o.order_number,
    o.order_status,
    o.created_date,
    p.payment_status

  ORDER BY o.created_date DESC

  LIMIT ${limit}
  OFFSET ${offset}
  `,
      [seller_id],
    );

    return success(
      res,
      "Seller Orders",
      "Orders fetched successfully",
      orders.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.getSellerOrderItems = async (req, res) => {
  try {
    const seller_id = req.user.user_id;
    const { orderId } = req.params;

    const items = await pool.query(
      `
      SELECT

      oi.order_item_id,
      oi.book_title,
      oi.book_author,
      oi.quantity,
      oi.selling_price,
      oi.subtotal,
      oi.total_amount,
      oi.item_status,
      oi.created_at

      FROM tbl_order_items oi

      WHERE oi.order_id=$1
      AND oi.seller_id=$2
      `,
      [orderId, seller_id],
    );

    return success(
      res,
      "Order Items",
      "Seller order items fetched successfully",
      items.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.updateOrderItemStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    const seller_id = req.user.user_id;
    const { order_item_id } = req.params;
    const { item_status } = req.body;

    await client.query("BEGIN");

    const item = await client.query(
      `
      SELECT
      order_id,
      item_status
      FROM tbl_order_items
      WHERE order_item_id=$1
      AND seller_id=$2
      `,
      [order_item_id, seller_id],
    );

    if (!item.rows.length) {
      return error(res, "Order Item Not Found", "Invalid order item");
    }

    const order_id = item.rows[0].order_id;
    const old_status = item.rows[0].item_status;

    if (old_status === "DELIVERED" || old_status === "CANCELLED") {
      return error(res, "Invalid Action", "Order already completed");
    }

    await client.query(
      `
      UPDATE tbl_order_items
      SET
      item_status=$1,
      updated_at=NOW()
      WHERE order_item_id=$2
      AND seller_id=$3
      `,
      [item_status, order_item_id, seller_id],
    );

    await client.query(
      `
      INSERT INTO tbl_order_status_logs
      (
        order_id,
        order_item_id,
        old_status,
        new_status,
        changed_by,
        changed_date
      )
      VALUES ($1,$2,$3,$4,$5,NOW())
      `,
      [order_id, order_item_id, old_status, item_status, seller_id],
    );

    const remaining = await client.query(
      `
      SELECT COUNT(*)
      FROM tbl_order_items
      WHERE order_id=$1
      AND item_status!='DELIVERED'
      `,
      [order_id],
    );

    if (parseInt(remaining.rows[0].count) === 0) {
      await client.query(
        `
        UPDATE tbl_orders
        SET order_status='DELIVERED'
        WHERE order_id=$1
        `,
        [order_id],
      );
    }

    await client.query("COMMIT");

    return success(
      res,
      "Order Updated",
      "Order item status updated successfully",
    );
  } catch (err) {
    await client.query("ROLLBACK");

    return error(res, "Update Failed", err.message);
  } finally {
    client.release();
  }
};

exports.getSellerOrderById = async (req, res) => {
  try {
    const seller_id = req.user.user_id;
    const { orderId } = req.params;

    const order = await pool.query(
      `
      SELECT
      o.order_id,
      o.order_number,
      o.order_status,
      o.created_date
      FROM tbl_orders o

      JOIN tbl_order_items oi
      ON oi.order_id=o.order_id

      WHERE oi.seller_id=$1
      AND o.order_id=$2

      GROUP BY
      o.order_id,
      o.order_number,
      o.order_status,
      o.created_date
      `,
      [seller_id, orderId],
    );

    if (!order.rows.length) {
      return error(res, "Order Not Found", "Order does not exist");
    }

    return success(
      res,
      "Order Details",
      "Seller order fetched successfully",
      order.rows[0],
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

const getStatusLabel = (status) => {
  const map = {
    PENDING: "Return Requested",
    APPROVED: "Return Approved",
    REJECTED: "Return Rejected",
    PICKED_UP: "Item Picked Up",
    REFUNDED: "Refund Processed",
  };
  return map[status] ?? status;
};

exports.getAllReturns = async (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params = [];

    if (status) {
      params.push(status);
      whereClause = `WHERE r.return_status = $${params.length}`;
    }

    const result = await pool.query(
      `
      SELECT
        r.return_id,
        r.order_id,
        r.order_item_id,
        r.return_reason,
        r.return_sub_reason,
        r.description,
        r.return_status,
        r.admin_remark,
        r.refund_amount,
        r.refund_date,
        r.created_date,
        r.actioned_date,
 
        -- Order info
        o.order_number,
 
        -- Item info
        oi.book_title,
        oi.book_author,
        oi.quantity,
        oi.subtotal,
        oi.mrp,
         u.full_name   AS customer_name,
        u.email  AS customer_email,
        u.mobile AS customer_mobile
 
      FROM tbl_order_returns r
      JOIN tbl_orders o      ON o.order_id      = r.order_id
      JOIN tbl_order_items oi ON oi.order_item_id = r.order_item_id
      JOIN tbl_users u        ON u.user_id        = r.user_id
 
      ${whereClause}
 
      ORDER BY
        CASE r.return_status WHEN 'PENDING' THEN 0 ELSE 1 END,
        r.created_date DESC
 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, limit, offset],
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM tbl_order_returns r ${whereClause}`,
      params,
    );

    return success(res, "Returns List", "Fetched successfully", {
      returns: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.actionReturn = async (req, res) => {
  const client = await pool.connect();
  try {
    const admin_id = req.user.user_id;
    const { returnId } = req.params;
    const { action, remark } = req.body;
    // action: APPROVED | REJECTED | PICKED_UP | REFUNDED

    const VALID_ACTIONS = ["APPROVED", "REJECTED", "PICKED_UP", "REFUNDED"];
    if (!VALID_ACTIONS.includes(action)) {
      return error(
        res,
        "Invalid Action",
        "Use APPROVED, REJECTED, PICKED_UP or REFUNDED",
      );
    }

    await client.query("BEGIN");

    const returnRow = await client.query(
      `SELECT return_id, return_status, order_item_id, refund_amount
       FROM tbl_order_returns WHERE return_id = $1 FOR UPDATE`,
      [returnId],
    );

    if (!returnRow.rows.length) {
      await client.query("ROLLBACK");
      return error(res, "Not Found", "Return request not found");
    }

    const current = returnRow.rows[0];

    const VALID_TRANSITIONS = {
      PENDING: ["APPROVED", "REJECTED"],
      APPROVED: ["PICKED_UP", "REJECTED"],
      PICKED_UP: ["REFUNDED"],
    };

    if (!VALID_TRANSITIONS[current.return_status]?.includes(action)) {
      await client.query("ROLLBACK");
      return error(
        res,
        "Invalid Transition",
        `Cannot move from ${current.return_status} to ${action}`,
      );
    }

    const refundDate = action === "REFUNDED" ? "NOW()" : "refund_date";

    await client.query(
      `UPDATE tbl_order_returns
   SET return_status = $1,
       admin_remark  = $2,
       actioned_by   = $3,
       actioned_date = NOW(),
       refund_date   = ${refundDate},
       updated_at    = NOW()
   WHERE return_id = $4`,
      [action, remark ?? null, admin_id, returnId],
    );

    console.log("itemStatusMap--", action);

    await client.query(
      `INSERT INTO tbl_return_status_logs (return_id, old_status, new_status, remark, changed_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [returnId, current.return_status, action, remark ?? null, admin_id],
    );

    const itemStatusMap = {
      APPROVED: "RETURN_APPROVED",
      REJECTED: "DELIVERED",
      PICKED_UP: "RETURN_PICKED_UP",
      REFUNDED: "REFUNDED",
    };

    await client.query(
      `UPDATE tbl_order_items
       SET item_status = $1, updated_at = NOW()
       WHERE order_item_id = $2`,
      [itemStatusMap[action], current.order_item_id],
    );

    const oldItemRow = await client.query(
      `SELECT order_id, item_status
   FROM tbl_order_items
   WHERE order_item_id = $1
   FOR UPDATE`,
      [current.order_item_id],
    );

    const oldItemStatus = oldItemRow.rows[0].item_status;
    const orderId = oldItemRow.rows[0].order_id;

    await client.query(
      `INSERT INTO tbl_order_status_logs
   (
     order_id,
     order_item_id,
     old_status,
     new_status,
     changed_by,
     changed_date
   )
   VALUES (
     $1,
     $2,
     $3::order_status_enum,
     $4::order_status_enum,
     $5,
     NOW()
   )`,
      [
        orderId,
        current.order_item_id,
        oldItemStatus,
        itemStatusMap[action],
        admin_id,
      ],
    );

    if (action === "PICKED_UP" || action === "REFUNDED") {
      await client.query(
        `
    UPDATE tbl_stock s
    SET s.quantity = s.quantity + oi.quantity,
        updated_at = NOW()
    FROM tbl_order_items oi
    WHERE oi.order_item_id = $1
      AND s.stock_id = oi.stock_id
    `,
        [current.order_item_id],
      );
    }

    await client.query("COMMIT");

    return success(
      res,
      "Return Updated",
      `Return ${action.toLowerCase()} successfully`,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    return error(res, "Action Failed", err.message);
  } finally {
    client.release();
  }
};

exports.getReturnStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE return_status = 'PENDING')   AS pending,
        COUNT(*) FILTER (WHERE return_status = 'APPROVED')  AS approved,
        COUNT(*) FILTER (WHERE return_status = 'REJECTED')  AS rejected,
        COUNT(*) FILTER (WHERE return_status = 'PICKED_UP') AS picked_up,
        COUNT(*) FILTER (WHERE return_status = 'REFUNDED')  AS refunded,
        COUNT(*)                                              AS total,
        COALESCE(SUM(refund_amount) FILTER (WHERE return_status = 'REFUNDED'), 0) AS total_refunded
      FROM tbl_order_returns
    `);
    return success(res, "Return Stats", "Fetched", stats.rows[0]);
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};
