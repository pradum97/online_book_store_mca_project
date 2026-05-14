const { pool } = require("../../config/db");
const { success, error } = require("../../utils/response");

exports.createOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const user_id = req.user.user_id;
    const { address_id } = req.body;

    await client.query("BEGIN");

    const cart = await client.query(
      `SELECT cart_id FROM tbl_cart WHERE user_id=$1 AND is_active=true`,
      [user_id],
    );

    if (!cart.rows.length) {
      await client.query("ROLLBACK");
      return error(res, "Cart Empty", "Cart not found");
    }

    const cart_id = cart.rows[0].cart_id;

    const address = await client.query(
      `
    SELECT *
    FROM tbl_user_addresses
    WHERE address_id=$1
    AND user_id=$2
    `,
      [address_id, user_id],
    );

    if (!address.rows.length) {
      await client.query("ROLLBACK");
      return error(res, "Address Not Found", "Invalid address");
    }

    const cartItems = await client.query(
      `
      SELECT
      ci.cart_item_id,
      ci.book_id,
      ci.stock_id,
      ci.quantity,

      b.title,
      b.author,
      b.seller_id,

      s.mrp,
      s.purchase_rate,
s.quantity AS available_quantity

      FROM tbl_cart_items ci

      JOIN tbl_books b
      ON b.book_id = ci.book_id

      JOIN tbl_stock s
      ON s.stock_id = ci.stock_id

      WHERE ci.cart_id=$1
      FOR UPDATE
      `,
      [cart_id],
    );

    if (!cartItems.rows.length) {
      await client.query("ROLLBACK");
      return error(res, "Cart Empty", "No items in cart");
    }

    const order = await client.query(
      `
      INSERT INTO tbl_orders
      (
        order_number,
        user_id,
        order_status,
        total_amount
      )
      VALUES
      (
        'ORD-' || FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000) || '-' || FLOOR(RANDOM()*1000),
        $1,
        'CONFIRMED',
        0
      )
      RETURNING *
      `,
      [user_id],
    );

    const order_id = order.rows[0].order_id;
    const addr = address.rows[0];

    await client.query(
      `
INSERT INTO tbl_order_addresses
(
  order_id,
  full_name,
  mobile,
  address_line1,
  address_line2,
  city,
  state,
  country,
  postal_code
)
VALUES
($1,$2,$3,$4,$5,$6,$7,$8,$9)
`,
      [
        order_id,
        addr?.full_name,
        addr?.mobile,
        addr?.address_line1,
        addr?.address_line2,
        addr?.city,
        addr?.state,
        addr?.country,
        addr?.postal_code,
      ],
    );

    let totalAmount = 0;

    for (const item of cartItems.rows) {
      if (item.quantity > item.available_quantity) {
        await client.query("ROLLBACK");
        return error(res, "Stock Not Available", "Insufficient stock");
      }

      const subtotal = item.mrp * item.quantity;

      totalAmount += subtotal;

      const orderItem = await client.query(
        `
          INSERT INTO tbl_order_items
          (
            order_id,
            book_id,
            stock_id,
            seller_id,
            quantity,
            price,
            book_title,
            book_author,
            mrp,
            selling_price,
            subtotal,
            total_amount
          )
          VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
          RETURNING order_item_id
          `,
        [
          order_id,
          item.book_id,
          item.stock_id,
          item.seller_id,
          item.quantity,
          item.mrp,
          item.title,
          item.author,
          item.mrp,
          item.mrp,
          subtotal,
          subtotal,
        ],
      );

      const order_item_id = orderItem.rows[0].order_item_id;

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
        [order_id, order_item_id, null, "PAYMENT_PENDING", user_id],
      );
    }

    await client.query(
      `
      UPDATE tbl_orders
      SET total_amount=$1
      WHERE order_id=$2
      `,
      [totalAmount, order_id],
    );

    await client.query(`DELETE FROM tbl_cart_items WHERE cart_id=$1`, [
      cart_id,
    ]);

    await client.query("COMMIT");

    return success(res, "Order Created", "Order created successfully", {
      order_id,
      totalAmount,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    return error(res, "Order Failed", err.message);
  } finally {
    client.release();
  }
};

exports.getMyOrdersWithItems = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const orders = await pool.query(
      `
      SELECT
        o.order_id,
        o.order_number,
        o.order_status,
        o.total_amount,
        o.created_date,
        oa.full_name,
        oa.mobile,
        oa.address_line1,
        oa.city,
        oa.state,
        oa.postal_code
      FROM tbl_orders o
      LEFT JOIN tbl_order_addresses oa ON oa.order_id = o.order_id
      WHERE o.user_id = $1
      ORDER BY o.created_date DESC
      `,
      [user_id],
    );

    if (!orders.rows.length) {
      return success(res, "My Orders", "No orders found", []);
    }

    const order_ids = orders.rows.map((o) => o.order_id);

    const items = await pool.query(
      `
      SELECT
        oi.order_item_id,
        oi.order_id,
        oi.book_id,
        oi.book_title,
        oi.book_author,
        oi.quantity,
        oi.mrp,
        oi.selling_price,
        oi.subtotal,
        oi.item_status
      FROM tbl_order_items oi
      WHERE oi.order_id = ANY($1::uuid[])
      ORDER BY oi.order_id, oi.order_item_id
      `,
      [order_ids],
    );

    const itemsByOrder = {};
    for (const item of items.rows) {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }
      itemsByOrder[item.order_id].push(item);
    }

    const result = orders.rows.map((order) => ({
      ...order,
      items: itemsByOrder[order.order_id] || [],
    }));

    return success(res, "My Orders", "Orders fetched successfully", result);
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.getOrders = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const orders = await pool.query(
      `
     SELECT
  o.order_id,
  o.order_number,
  o.order_status,
  o.total_amount,
  o.created_date,
 
  oa.city,
  oa.state,
  oa.postal_code,
 
  COUNT(oi.order_item_id) AS total_items,
  SUM(oi.quantity) AS total_quantity,
 
  MIN(oi.book_title) AS preview_title
 
FROM tbl_orders o
 
LEFT JOIN tbl_order_addresses oa
  ON oa.order_id = o.order_id
 
LEFT JOIN tbl_order_items oi
  ON oi.order_id = o.order_id
 
WHERE o.user_id = $1
 
GROUP BY
  o.order_id,
  oa.city,
  oa.state,
  oa.postal_code
 
ORDER BY o.created_date DESC
      `,
      [user_id],
    );

    return success(
      res,
      "Orders List",
      "Orders fetched successfully",
      orders.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { value } = req.params;
    const { flag } = req.query;

    let query = "";
    let params = [value];

    if (flag === "ORDER_ID") {
      query = `
        SELECT 
          o.order_id,
          o.order_number,
          o.user_id,
          o.order_status,
          o.total_amount,
          o.created_date,
 
          oa.full_name,
          oa.mobile,
          oa.address_line1,
          oa.city,
          oa.state,
          oa.postal_code
        FROM tbl_orders o
        LEFT JOIN tbl_order_addresses oa ON oa.order_id = o.order_id
        WHERE o.order_id = $1
      `;
    } else if (flag === "ORDER_NUMBER") {
      query = `
        SELECT 
          o.order_id,
          o.order_number,
          o.user_id,
          o.order_status,
          o.total_amount,
          o.created_date,
 
          oa.full_name,
          oa.mobile,
          oa.address_line1,
          oa.city,
          oa.state,
          oa.postal_code
        FROM tbl_orders o
        LEFT JOIN tbl_order_addresses oa ON oa.order_id = o.order_id
        WHERE o.order_number = $1
      `;
    } else {
      return error(res, "Invalid Flag", "Use ORDER_ID or ORDER_NUMBER");
    }

    const order = await pool.query(query, params);

    if (!order.rows.length) {
      return error(res, "Order Not Found", "Order does not exist");
    }

    return success(
      res,
      "Order Details",
      "Order fetched successfully",
      order.rows[0],
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.getOrderItems = async (req, res) => {
  try {
    const { order_id } = req.params;

    const items = await pool.query(
      `
      SELECT
      order_item_id,
      book_title,
      book_author,
      quantity,
      selling_price,
      subtotal,
      total_amount,
      item_status
      FROM tbl_order_items
      WHERE order_id=$1
      `,
      [order_id],
    );

    return success(
      res,
      "Order Items",
      "Items fetched successfully",
      items.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.updateOrderItemStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    const { order_item_id } = req.params;
    const { item_status } = req.body;

    await client.query("BEGIN");

    const item = await client.query(
      `
      SELECT order_id, item_status
      FROM tbl_order_items
      WHERE order_item_id=$1
      `,
      [order_item_id],
    );

    if (!item.rows.length) {
      return error(res, "Order Item Not Found", "Invalid order item");
    }

    const order_id = item.rows[0].order_id;
    const old_status = item.rows[0].item_status;

    await client.query(
      `
      UPDATE tbl_order_items
      SET item_status=$1,
      updated_at=NOW()
      WHERE order_item_id=$2
      `,
      [item_status, order_item_id],
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
      [order_id, order_item_id, old_status, item_status, req.user.user_id],
    );

    await client.query("COMMIT");

    return success(
      res,
      "Order Item Updated",
      "Order item status updated successfully",
    );
  } catch (err) {
    await client.query("ROLLBACK");
    return error(res, "Update Failed", err.message);
  } finally {
    client.release();
  }
};

const getDisplayStatus = (status) => {
  switch (status) {
    case "PAYMENT_PENDING":
      return "Order Placed";
    case "CONFIRMED":
      return "Packed";
    case "SHIPPED":
      return "Shipped";
    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Status Updated";
  }
};

exports.getOrderStatusHistory = async (req, res) => {
  try {
    const { order_id } = req.params;
    const user_id = req.user.user_id;

    const orderCheck = await pool.query(
      `SELECT order_id FROM tbl_orders WHERE order_id=$1 AND user_id=$2`,
      [order_id, user_id],
    );

    if (!orderCheck.rows.length) {
      return error(res, "Order Not Found", "Invalid order or access denied");
    }

    const history = await pool.query(
      `
      SELECT
        order_status_log_id,
        order_item_id,
        old_status,
        new_status,
        remarks,
        changed_by,
        changed_date
      FROM tbl_order_status_logs
      WHERE order_id=$1
      ORDER BY changed_date ASC
      `,
      [order_id],
    );

    const formattedHistory = history.rows.map((item, index) => {
      const status = item.new_status || item.old_status || "UNKNOWN";
      const statusLabel = getDisplayStatus(status);

      return {
        order_status_log_id: item.order_status_log_id,
        order_item_id: item.order_item_id,
        status,
        status_label: statusLabel,
        remark: item.remarks ? item.remarks : `${statusLabel} successfully`,
        changed_date: item.changed_date,
        changed_by: item.changed_by,
        is_completed: true,
        is_current: index === history.rows.length - 1,
      };
    });

    return success(
      res,
      "Order Status History",
      "Status history fetched successfully",
      formattedHistory,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

const VALID_REASONS = [
  "DAMAGED_PRODUCT",
  "WRONG_ITEM",
  "NOT_AS_DESCRIBED",
  "MISSING_PARTS",
  "POOR_QUALITY",
  "CHANGED_MIND",
  "OTHER",
];

const getReasonLabel = (reason) => {
  const map = {
    DAMAGED_PRODUCT: "Product Damaged",
    WRONG_ITEM: "Wrong Item Received",
    NOT_AS_DESCRIBED: "Not as Described",
    MISSING_PARTS: "Missing Parts / Pages",
    POOR_QUALITY: "Poor Quality",
    CHANGED_MIND: "Changed My Mind",
    OTHER: "Other",
  };
  return map[reason] ?? reason;
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

exports.createReturnRequest = async (req, res) => {
  const client = await pool.connect();
  try {
    const user_id = req.user.user_id;
    const { orderId, itemId } = req.params;
    const { return_reason, return_sub_reason, description } = req.body;

    if (!return_reason || !VALID_REASONS.includes(return_reason)) {
      return error(
        res,
        "Invalid Reason",
        "Please provide a valid return reason",
      );
    }

    await client.query("BEGIN");

    const itemCheck = await client.query(
      `
      SELECT
        oi.order_item_id,
        oi.item_status,
        oi.subtotal,
        o.user_id
      FROM tbl_order_items oi
      JOIN tbl_orders o ON o.order_id = oi.order_id
      WHERE oi.order_item_id = $1
        AND oi.order_id = $2
        AND o.user_id = $3
      `,
      [itemId, orderId, user_id],
    );

    if (!itemCheck.rows.length) {
      await client.query("ROLLBACK");
      return error(res, "Not Found", "Order item not found or access denied");
    }

    const item = itemCheck.rows[0];

    if (item.item_status !== "DELIVERED") {
      await client.query("ROLLBACK");
      return error(res, "Not Eligible", "Only delivered items can be returned");
    }

    const existing = await client.query(
      `SELECT return_id, return_status FROM tbl_order_returns
       WHERE order_item_id = $1 AND return_status NOT IN ('REJECTED')`,
      [itemId],
    );

    if (existing.rows.length) {
      await client.query("ROLLBACK");
      return error(
        res,
        "Already Requested",
        `A return request already exists with status: ${existing.rows[0].return_status}`,
      );
    }

    const returnRow = await client.query(
      `
      INSERT INTO tbl_order_returns
        (order_id, order_item_id, user_id, return_reason, return_sub_reason, description, refund_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING return_id
      `,
      [
        orderId,
        itemId,
        user_id,
        return_reason,
        return_sub_reason ?? null,
        description ?? null,
        item.subtotal,
      ],
    );

    const return_id = returnRow.rows[0].return_id;

    await client.query(
      `INSERT INTO tbl_return_status_logs (return_id, old_status, new_status, changed_by)
       VALUES ($1, NULL, 'PENDING', $2)`,
      [return_id, user_id],
    );

    await client.query(
      `UPDATE tbl_order_items SET item_status = 'RETURN_REQUESTED', updated_at = NOW()
       WHERE order_item_id = $1`,
      [itemId],
    );

    await client.query("COMMIT");

    return success(
      res,
      "Return Requested",
      "Return request submitted successfully",
      {
        return_id,
      },
    );
  } catch (err) {
    await client.query("ROLLBACK");
    return error(res, "Request Failed", err.message);
  } finally {
    client.release();
  }
};

exports.getItemReturnStatus = async (req, res) => {
  try {
    const client = await pool.connect();
    const user_id = req.user.user_id;
    const { orderId, itemId } = req.params;

    const result = await client.query(
      `
      SELECT r.*
      FROM tbl_order_returns r
      JOIN tbl_orders o ON o.order_id = r.order_id
      WHERE r.order_item_id = $1
        AND r.order_id = $2
        AND o.user_id = $3
      ORDER BY r.created_date DESC
      LIMIT 1
      `,
      [itemId, orderId, user_id],
    );

    if (!result.rows.length) {
      return success(res, "No Return", "No return request found", null);
    }

    return success(
      res,
      "Return Status",
      "Fetched successfully",
      result.rows[0],
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.cancelOrderItem = async (req, res) => {
  const client = await pool.connect();

  try {
    const user_id = req.user.user_id;
    const { orderId, orderItemId } = req.params;

    await client.query("BEGIN");

    const itemCheck = await client.query(
      `
      SELECT 
        oi.order_item_id,
        oi.item_status,
        oi.order_id,
        o.user_id
      FROM tbl_order_items oi
      JOIN tbl_orders o ON o.order_id = oi.order_id
      WHERE oi.order_item_id = $1
        AND oi.order_id = $2
        AND o.user_id = $3
      `,
      [orderItemId, orderId, user_id],
    );

    if (!itemCheck.rows.length) {
      await client.query("ROLLBACK");
      return error(res, "Not Found", "Order item not found");
    }

    const item = itemCheck.rows[0];

    if (item.item_status === "DELIVERED") {
      await client.query("ROLLBACK");
      return error(res, "Not Allowed", "Delivered item cannot be cancelled");
    }

    if (item.item_status === "CANCELLED") {
      await client.query("ROLLBACK");
      return error(res, "Already Cancelled", "Item already cancelled");
    }

    const old_status = item.item_status;

    await client.query(
      `
      UPDATE tbl_order_items
      SET item_status='CANCELLED',
          updated_at=NOW()
      WHERE order_item_id=$1
      `,
      [orderItemId],
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
      VALUES ($1,$2,$3,'CANCELLED',$4,NOW())
      `,
      [orderId, orderItemId, old_status, user_id],
    );

    await client.query(
      `
    UPDATE tbl_stock
    SET quantity = tbl_stock.quantity + oi.quantity
    FROM tbl_order_items oi
    WHERE oi.order_item_id = $1
      AND tbl_stock.stock_id = oi.stock_id
    `,
      [orderItemId],
    );

    await client.query("COMMIT");

    return success(res, "Order Cancelled", "Order item cancelled successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    return error(res, "Cancel Failed", err.message);
  } finally {
    client.release();
  }
};
