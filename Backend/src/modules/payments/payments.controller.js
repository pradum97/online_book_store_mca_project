const { pool } = require("../../config/db");
const { success, error } = require("../../utils/response");

exports.initiatePayment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { order_id, payment_mode_id, payment_fields } = req.body;

    await client.query("BEGIN");

    const mode = await client.query(
      `
SELECT payment_mode_id
FROM tbl_payment_modes
WHERE payment_mode_id=$1
AND is_active=true
`,
      [payment_mode_id],
    );

    if (!mode.rows.length) {
      await client.query("ROLLBACK");
      return error(res, "Invalid Payment Mode", "Payment mode not found");
    }

    const order = await client.query(
      `
      SELECT total_amount, order_status
      FROM tbl_orders
      WHERE order_id=$1
      `,
      [order_id],
    );

    if (!order.rows.length) {
      await client.query("ROLLBACK");
      return error(res, "Order Not Found", "Invalid order");
    }

    if (order.rows[0].order_status !== "PAYMENT_PENDING") {
      await client.query("ROLLBACK");
      return error(res, "Invalid Order Status", "Payment already processed");
    }

    const amount = order.rows[0].total_amount;

    const payment = await client.query(
      `
      INSERT INTO tbl_payments
      (
        order_id,
        payment_mode_id,
        amount,
        payment_status
      )
      VALUES
      ($1,$2,$3,'SUCCESS')
      RETURNING payment_id
      `,
      [order_id, payment_mode_id, amount],
    );

    const payment_id = payment.rows[0].payment_id;

    if (payment_fields && Object.keys(payment_fields).length > 0) {
      for (const [field, value] of Object.entries(payment_fields)) {
        await client.query(
          `
      INSERT INTO tbl_payment_details
      (
        payment_id,
        payment_mode_id,
        field_name,
        field_value,
        reference_number,
        transaction_id,
        payment_note,
        screenshot_url,
        created_session_id,
        created_by,
        organization_id,
        installation_id
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      `,
          [
            payment_id,
            payment_mode_id,
            field,
            value,
            req.body.reference_number || null,
            req.body.transaction_id || null,
            req.body.payment_note || null,
            req.body.screenshot_url || null,
            req.session_id || null,
            req.user?.user_id || null,
            req.user?.organization_id || null,
            req.user?.installation_id || null,
          ],
        );
      }
    }

    await client.query(
      `
      INSERT INTO tbl_payment_attempts
      (
        payment_id,
        attempt_number,
        status
      )
      VALUES
      ($1,1,'PENDING')
      `,
      [payment_id],
    );

    await client.query(
      `
      INSERT INTO tbl_payment_logs
      (
        payment_id,
        log_message
      )
      VALUES
      ($1,'Payment initiated')
      `,
      [payment_id],
    );

    await client.query("COMMIT");

    return success(res, "Payment Initiated", "Payment created successfully", {
      payment_id,
      amount,
      status: "PENDING",
      attempt: 1,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    return error(res, "Payment Failed", err.message);
  } finally {
    client.release();
  }
};

exports.verifyPayment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { payment_id, gateway_reference, status } = req.body;

    await client.query("BEGIN");

    const allowedStatus = ["SUCCESS", "FAILED"];

    if (!allowedStatus.includes(status)) {
      await client.query("ROLLBACK");
      return error(res, "Invalid Status", "Invalid payment status");
    }

    const paymentStatus = await client.query(
      `
SELECT order_id, payment_status
FROM tbl_payments
WHERE payment_id=$1
`,
      [payment_id],
    );

    if (!paymentStatus.rows.length) {
      await client.query("ROLLBACK");
      return error(res, "Payment Not Found", "Invalid payment id");
    }

    if (paymentStatus.rows[0].payment_status === "SUCCESS") {
      await client.query("ROLLBACK");
      return error(res, "Already Processed", "Payment already verified");
    }

    const order_id = paymentStatus.rows[0].order_id;

    await client.query(
      `
      UPDATE tbl_payment_attempts
SET gateway_reference=$1,
status=$2
WHERE payment_id=$3
AND attempt_number=(
  SELECT MAX(attempt_number)
  FROM tbl_payment_attempts
  WHERE payment_id=$3
)
AND status='PENDING'
      `,
      [gateway_reference, status, payment_id],
    );

    await client.query(
      `
      INSERT INTO tbl_payment_verifications
      (
        payment_id,
        attempt_number,
        verification_status,
        response_data
      )
      VALUES
      (
        $1,
        (
          SELECT MAX(attempt_number)
          FROM tbl_payment_attempts
          WHERE payment_id=$1
        ),
        $2,
        $3
      )
      `,
      [payment_id, status, gateway_reference],
    );

    await client.query(
      `
      UPDATE tbl_payments
      SET payment_status=$1
      WHERE payment_id=$2
      `,
      [status, payment_id],
    );

    await client.query(
      `
    UPDATE tbl_payment_details
    SET
    transaction_id=$1,
    updated_by=$2,
    updated_session_id=$3,
    updated_date=NOW()
    WHERE payment_id=$4
    AND is_active=true
    `,
      [
        gateway_reference,
        req.user?.user_id || null,
        req.session_id || null,
        payment_id,
      ],
    );

    if (status === "SUCCESS") {
      const orderStatus = await client.query(
        `
        SELECT order_status
        FROM tbl_orders
        WHERE order_id=$1
        `,
        [order_id],
      );

      const old_status = orderStatus.rows[0].order_status;

      await client.query(
        `
        UPDATE tbl_orders
        SET order_status='CONFIRMED'
        WHERE order_id=$1
        `,
        [order_id],
      );

      await client.query(
        `
        INSERT INTO tbl_order_status_logs
        (
          order_id,
          old_status,
          new_status,
          changed_by
        )
        VALUES ($1,$2,'CONFIRMED',$3)
        `,
        [order_id, old_status, req.user.user_id],
      );
    }

    await client.query(
      `
      INSERT INTO tbl_payment_logs
      (
        payment_id,
        log_message
      )
      VALUES
      ($1,$2)
      `,
      [payment_id, `Payment verification result: ${status}`],
    );

    await client.query("COMMIT");

    return success(res, "Payment Verified", "Payment processed successfully", {
      payment_status: status,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    return error(res, "Verification Failed", err.message);
  } finally {
    client.release();
  }
};

exports.retryPayment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { payment_id } = req.body;

    await client.query("BEGIN");

    const payment = await client.query(
      `
SELECT payment_status
FROM tbl_payments
WHERE payment_id=$1
`,
      [payment_id],
    );

    if (!payment.rows.length) {
      await client.query("ROLLBACK");
      return error(res, "Payment Not Found", "Invalid payment");
    }

    if (payment.rows[0].payment_status === "SUCCESS") {
      await client.query("ROLLBACK");
      return error(res, "Retry Not Allowed", "Payment already successful");
    }

    const attempts = await client.query(
      `
      SELECT COUNT(*) AS total
      FROM tbl_payment_attempts
      WHERE payment_id=$1
      `,
      [payment_id],
    );

    const attemptNumber = parseInt(attempts.rows[0].total);

    if (attemptNumber >= 2) {
      await client.query(
        `
    INSERT INTO tbl_payment_logs
    (
    payment_id,
    log_message
    )
    VALUES
    ($1,'Retry limit reached')
    `,
        [payment_id],
      );

      await client.query("ROLLBACK");

      return error(
        res,
        "Retry Limit Reached",
        "Maximum retry attempts exceeded",
      );
    }

    const newAttempt = attemptNumber + 1;

    await client.query(
      `
      INSERT INTO tbl_payment_attempts
      (
        payment_id,
        attempt_number,
        status
      )
      VALUES
      ($1,$2,'PENDING')
      `,
      [payment_id, newAttempt],
    );

    await client.query(
      `
      INSERT INTO tbl_payment_logs
      (
        payment_id,
        log_message
      )
      VALUES
      ($1,$2)
      `,
      [payment_id, `Retry attempt ${newAttempt}`],
    );

    await client.query("COMMIT");

    return success(res, "Payment Retry", "Retry created successfully", {
      attempt_number: newAttempt,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    return error(res, "Retry Failed", err.message);
  } finally {
    client.release();
  }
};

exports.getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await pool.query(
      `
     SELECT
p.*,
o.order_number,
json_agg(
json_build_object(
'field_name',pd.field_name,
'field_value',pd.field_value,
'reference_number',pd.reference_number,
'transaction_id',pd.transaction_id,
'screenshot_url',pd.screenshot_url
)
) FILTER (WHERE pd.payment_detail_id IS NOT NULL) AS payment_details
FROM tbl_payments p
LEFT JOIN tbl_payment_details pd
ON p.payment_id=pd.payment_id
LEFT JOIN tbl_orders o
ON p.order_id=o.order_id
WHERE p.payment_id=$1
GROUP BY p.payment_id,o.order_number
      `,
      [paymentId],
    );

    if (!payment.rows.length) {
      return error(res, "Payment Not Found", "Invalid payment id");
    }

    return success(
      res,
      "Payment Details",
      "Payment fetched successfully",
      payment.rows[0],
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

exports.getPaymentsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payments = await pool.query(
      `
      SELECT
        p.payment_id,
        p.amount,
        p.payment_status,
        pm.mode_name
        FROM tbl_payments p
        LEFT JOIN tbl_payment_modes pm
        ON p.payment_mode_id=pm.payment_mode_id
        WHERE p.order_id=$1
      `,
      [orderId],
    );

    return success(
      res,
      "Order Payments",
      "Payments fetched successfully",
      payments.rows,
    );
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};
