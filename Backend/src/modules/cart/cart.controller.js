const { pool } = require("../../config/db");
const { success, error } = require("../../utils/response");

exports.getCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const cart = await pool.query(
      `
SELECT cart_id
FROM tbl_cart
WHERE user_id=$1
AND is_active=true
LIMIT 1
`,
      [user_id],
    );

    if (!cart.rows.length) {
      return success(res, "Cart Empty", "No items in cart", []);
    }

    const items = await pool.query(
      `
SELECT

ci.cart_item_id,
ci.quantity,

b.book_id,
b.title,
b.author,

s.stock_id,
s.mrp,

(ci.quantity * s.mrp) AS subtotal,

u.uom_name,
u.uom_code

FROM tbl_cart_items ci

JOIN tbl_stock s
ON s.stock_id = ci.stock_id

JOIN tbl_books b
ON b.book_id = ci.book_id

JOIN tbl_book_uom bu
ON bu.book_uom_id = s.book_uom_id

JOIN tbl_uom u
ON u.uom_id = bu.uom_id

WHERE ci.cart_id=$1
`,
      [cart.rows[0].cart_id],
    );

    return success(res, "Cart Items", "Cart fetched successfully", items.rows);
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.addCartItem = async (req, res) => {
  const client = await pool.connect();

  try {
    const user_id = req.user.user_id;

    const { book_id, stock_id, quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return error(
        res,
        "Invalid Quantity",
        "Quantity must be greater than zero",
      );
    }

    await client.query("BEGIN");

    const stock = await client.query(
      `
SELECT quantity,mrp
FROM tbl_stock
WHERE stock_id=$1
AND is_active=true
`,
      [stock_id],
    );

    if (!stock.rows.length) {
      return error(res, "Stock Not Found", "Invalid stock selected");
    }

    if (stock.rows[0].quantity < quantity) {
      return error(res, "Insufficient Stock", "Not enough stock available");
    }

    let cart = await client.query(
      `
SELECT cart_id
FROM tbl_cart
WHERE user_id=$1
AND is_active=true
LIMIT 1
`,
      [user_id],
    );

    if (!cart.rows.length) {
      cart = await client.query(
        `
    INSERT INTO tbl_cart(user_id)
    VALUES($1)
    RETURNING cart_id
    `,
        [user_id],
      );
    }

    const cart_id = cart.rows[0].cart_id;

    const existing = await client.query(
      `
        SELECT cart_item_id,quantity
        FROM tbl_cart_items
        WHERE cart_id=$1
        AND stock_id=$2
        `,
      [cart_id, stock_id],
    );

    if (existing.rows.length) {
      const newQty = existing.rows[0].quantity + quantity;

      if (stock.rows[0].quantity < newQty) {
        return error(res, "Stock Limit", "Cart quantity exceeds stock");
      }

      await client.query(
        `
        UPDATE tbl_cart_items
        SET quantity=$1
        WHERE cart_item_id=$2
        `,
        [newQty, existing.rows[0].cart_item_id],
      );
    } else {
      await client.query(
        `
INSERT INTO tbl_cart_items
(cart_id,book_id,stock_id,quantity)
VALUES($1,$2,$3,$4)
`,
        [cart_id, book_id, stock_id, quantity],
      );
    }

    await client.query("COMMIT");

    return success(res, "Cart Updated", "Item added to cart");
  } catch (err) {
    await client.query("ROLLBACK");

    return error(res, "Add Failed", err.message);
  } finally {
    client.release();
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { cart_item_id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return error(
        res,
        "Invalid Quantity",
        "Quantity must be greater than zero",
      );
    }

    console.log(cart_item_id);

    const item = await pool.query(
      `SELECT stock_id
        FROM tbl_cart_items
        WHERE cart_item_id=$1
        `,
      [cart_item_id],
    );

    if (!item.rows.length) {
      return error(res, "Item Not Found", "Cart item not found");
    }

    const stock = await pool.query(
      `
SELECT quantity
FROM tbl_stock
WHERE stock_id=$1
`,
      [item.rows[0].stock_id],
    );

    if (stock.rows[0].quantity < quantity) {
      return error(res, "Stock Limit", "Not enough stock available");
    }

    await pool.query(
      `
UPDATE tbl_cart_items
SET quantity=$1
WHERE cart_item_id=$2
`,
      [quantity, cart_item_id],
    );

    return success(res, "Cart Updated", "Quantity updated");
  } catch (err) {
    return error(res, "Update Failed", err.message);
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    const { cart_item_id } = req.params;

    await pool.query(
      `
DELETE FROM tbl_cart_items
WHERE cart_item_id=$1
`,
      [cart_item_id],
    );

    return success(res, "Item Removed", "Item removed from cart");
  } catch (err) {
    return error(res, "Delete Failed", err.message);
  }
};

exports.clearCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const cart = await pool.query(
      `
SELECT cart_id
FROM tbl_cart
WHERE user_id=$1
AND is_active=true
`,
      [user_id],
    );

    if (!cart.rows.length) {
      return success(res, "Cart Empty", "Cart already empty");
    }

    await pool.query(
      `
DELETE FROM tbl_cart_items
WHERE cart_id=$1
`,
      [cart.rows[0].cart_id],
    );

    return success(res, "Cart Cleared", "All items removed");
  } catch (err) {
    return error(res, "Clear Failed", err.message);
  }
};

exports.getCartBilling = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const cart = await pool.query(
      `
SELECT cart_id
FROM tbl_cart
WHERE user_id=$1
AND is_active=true
`,
      [user_id],
    );

    if (!cart.rows.length) {
      return success(res, "Cart Empty", "No billing data", {
        items: [],
        total_items: 0,
        subtotal: 0,
      });
    }

    const items = await pool.query(
      `
SELECT

b.title,
ci.quantity,
s.mrp,

(ci.quantity * s.mrp) AS total

FROM tbl_cart_items ci

JOIN tbl_stock s
ON s.stock_id = ci.stock_id

JOIN tbl_books b
ON b.book_id = ci.book_id

WHERE ci.cart_id=$1
`,
      [cart.rows[0].cart_id],
    );

    let subtotal = 0;
    let total_items = 0;

    items.rows.forEach((i) => {
      subtotal += Number(i.total);
      total_items += Number(i.quantity);
    });

    return success(res, "Billing Details", "Cart billing summary", {
      items: items.rows,
      total_items,
      subtotal,
    });
  } catch (err) {
    return error(res, "Billing Failed", err.message);
  }
};
