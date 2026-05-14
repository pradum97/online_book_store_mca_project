const { pool } = require("../../config/db");
const { success, error } = require("../../utils/response");
const PDFDocument = require("pdfkit");

exports.getReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await pool.query(
      `
      SELECT 
      o.order_id,
      o.order_number,
      o.total_amount,
      o.created_date,

      oa.full_name,
      oa.mobile,
      oa.address_line1,
      oa.address_line2,
      oa.city,
      oa.state,
      oa.postal_code

      FROM tbl_orders o

      LEFT JOIN tbl_order_addresses oa
      ON oa.order_id = o.order_id

      WHERE o.order_id = $1
      `,
      [orderId],
    );

    if (!order.rows.length) {
      return error(res, "Order Not Found", "Invalid order");
    }

    const items = await pool.query(
      `
      SELECT
      order_item_id,
      book_title,
      quantity,
      selling_price,
      total_amount
      FROM tbl_order_items
      WHERE order_id=$1
      `,
      [orderId],
    );

    return success(res, "Receipt Data", "Receipt fetched successfully", {
      order: order.rows[0],
      items: items.rows,
    });
  } catch (err) {
    return error(res, "Fetch Failed", err.message);
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (num) => {
  return "₹" + Number(num).toFixed(2);
};

function buildCustomerInvoice(doc, order, items) {
  const W = 595;
  const margin = 45;
  const contentW = W - margin * 2;
  let y = 22;

  // Header
  doc
    .fillColor("#000000")
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("BookStore", margin, y);

  doc
    .fillColor("#666666")
    .fontSize(8)
    .font("Helvetica")
    .text("www.bookstore.com", margin, y + 24);

  doc
    .fillColor("#000000")
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("TAX INVOICE", margin, y + 4, { width: contentW, align: "right" });

  doc
    .fillColor("#666666")
    .fontSize(8)
    .font("Helvetica")
    .text("Original for Buyer", margin, y + 24, {
      width: contentW,
      align: "right",
    });

  y += 46;

  // Line
  doc
    .moveTo(margin, y)
    .lineTo(W - margin, y)
    .stroke("#cccccc");
  y += 12;

  // Order meta
  doc.fillColor("#444444").fontSize(8.5).font("Helvetica");
  doc.text(`Order No: ${order.order_number}`, margin, y);
  doc.text(`Date: ${formatDate(order.created_date)}`, margin, y, {
    width: contentW,
    align: "right",
  });
  y += 20;

  // Two column boxes
  const colW = (contentW - 16) / 2;

  // Sold By box
  doc.rect(margin, y, colW, 95).stroke("#dddddd");
  doc
    .fillColor("#888888")
    .fontSize(7.5)
    .font("Helvetica-Bold")
    .text("SOLD BY", margin + 10, y + 10);
  doc
    .fillColor("#222222")
    .fontSize(8.5)
    .font("Helvetica-Bold")
    .text("BookStore India Pvt. Ltd.", margin + 10, y + 23);
  doc
    .fillColor("#555555")
    .fontSize(8)
    .font("Helvetica")
    .text("123, Book Market, MG Road", margin + 10, y + 36)
    .text("Mumbai, Maharashtra - 400001", margin + 10, y + 48)
    .text("GSTIN: 27AABCU9603R1ZX", margin + 10, y + 60)
    .text("support@bookstore.com", margin + 10, y + 72);

  // Ship To box
  const col2X = margin + colW + 16;
  doc.rect(col2X, y, colW, 95).stroke("#dddddd");
  doc
    .fillColor("#888888")
    .fontSize(7.5)
    .font("Helvetica-Bold")
    .text("SHIP TO", col2X + 10, y + 10);
  doc
    .fillColor("#222222")
    .fontSize(8.5)
    .font("Helvetica-Bold")
    .text(order.full_name || "", col2X + 10, y + 23);
  doc
    .fillColor("#555555")
    .fontSize(8)
    .font("Helvetica")
    .text(`Ph: ${order.mobile || ""}`, col2X + 10, y + 36)
    .text(order.address_line1 || "", col2X + 10, y + 48, { width: colW - 20 })
    .text(
      `${order.city || ""}, ${order.state || ""} - ${order.postal_code || ""}`,
      col2X + 10,
      y + 60,
      { width: colW - 20 },
    );

  y += 110;

  // Table header
  doc.rect(margin, y, contentW, 22).fill("#f0f0f0");
  doc.rect(margin, y, contentW, 0.5).fill("#cccccc");

  const c = {
    sno: { x: margin + 6, w: 24 },
    title: { x: margin + 32, w: 235 },
    qty: { x: margin + 272, w: 40 },
    price: { x: margin + 316, w: 80 },
    tax: { x: margin + 400, w: 40 },
    total: { x: margin + 444, w: 61 },
  };

  doc.fillColor("#000000").fontSize(8).font("Helvetica-Bold");
  doc.text("#", c.sno.x, y + 7);
  doc.text("Book Title", c.title.x, y + 7);
  doc.text("Qty", c.qty.x, y + 7);
  doc.text("Unit Price", c.price.x, y + 7);
  doc.text("Tax", c.tax.x, y + 7);
  doc.text("Total", c.total.x, y + 7, { width: c.total.w, align: "right" });

  y += 22;

  // Table rows
  items.forEach((item, i) => {
    const rowH = 22;
    doc.rect(margin, y + rowH - 0.5, contentW, 0.5).fill("#eeeeee");

    doc.fillColor("#333333").fontSize(8).font("Helvetica");
    doc.text(String(i + 1), c.sno.x, y + 7);
    doc.text(item.book_title, c.title.x, y + 7, {
      width: c.title.w - 6,
      ellipsis: true,
    });
    doc.text(String(item.quantity), c.qty.x, y + 7);
    doc.text(formatMoney(item.selling_price), c.price.x, y + 7);
    doc.text("0%", c.tax.x, y + 7);
    doc
      .font("Helvetica-Bold")
      .text(formatMoney(item.total_amount), c.total.x, y + 7, {
        width: c.total.w,
        align: "right",
      });

    y += rowH;
  });

  doc.rect(margin, y, contentW, 0.5).fill("#cccccc");
  y += 16;

  // Totals
  const subtotal = items.reduce((s, it) => s + Number(it.total_amount), 0);
  const totalsX = margin + contentW * 0.55;
  const totalsW = contentW * 0.45;

  const row = (label, value, bold = false) => {
    doc
      .fillColor(bold ? "#000000" : "#666666")
      .fontSize(bold ? 9 : 8.5)
      .font(bold ? "Helvetica-Bold" : "Helvetica");
    doc.text(label, totalsX, y);
    doc.text(value, totalsX, y, { width: totalsW, align: "right" });
    y += 16;
  };

  row("Subtotal:", formatMoney(subtotal));
  row("Shipping:", "FREE");
  row("Tax (GST):", "₹0.00");

  doc
    .moveTo(totalsX, y)
    .lineTo(totalsX + totalsW, y)
    .stroke("#cccccc");
  y += 12;

  // Grand total
  doc
    .fillColor("#000000")
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("GRAND TOTAL", totalsX, y)
    .text(formatMoney(order.total_amount), totalsX, y, {
      width: totalsW,
      align: "right",
    });

  y += 35;

  // Payment strip
  doc.rect(margin, y, contentW, 28).fill("#f9f9f9");
  doc
    .fillColor("#444444")
    .fontSize(8)
    .font("Helvetica")
    .text("Payment:", margin + 12, y + 5);
  doc
    .fillColor("#000000")
    .font("Helvetica-Bold")
    .text("Online Payment  •  Status: PAID", margin + 65, y + 5);
  doc
    .fillColor("#444444")
    .font("Helvetica")
    .text("Order Status:", margin + 12, y + 17);
  doc
    .fillColor("#2e7d32")
    .font("Helvetica-Bold")
    .text("CONFIRMED", margin + 80, y + 17);

  y += 46;

  // Footer
  doc
    .moveTo(margin, y)
    .lineTo(W - margin, y)
    .stroke("#dddddd");
  y += 10;
  doc
    .fillColor("#999999")
    .fontSize(7.5)
    .font("Helvetica")
    .text(
      "This is a computer generated invoice. | For queries: support@bookstore.com",
      margin,
      y,
      { width: contentW, align: "center" },
    );
  y += 12;
  doc
    .fillColor("#000000")
    .fontSize(8.5)
    .font("Helvetica-Bold")
    .text("Thank you for shopping with BookStore!", margin, y, {
      width: contentW,
      align: "center",
    });
}

function buildSellerReceipt(doc, order, items) {
  const W = 280;
  const margin = 12;
  const contentW = W - margin * 2;
  let y = 12;

  const solidLine = () => {
    doc
      .moveTo(margin, y)
      .lineTo(W - margin, y)
      .strokeColor("#000000")
      .lineWidth(0.6)
      .stroke();
    y += 6;
  };

  const dashedLine = () => {
    let x = margin;
    while (x < W - margin) {
      doc
        .moveTo(x, y)
        .lineTo(Math.min(x + 6, W - margin), y)
        .strokeColor("#666666")
        .lineWidth(0.4)
        .stroke();
      x += 12;
    }
    y += 6;
  };

  // Header
  doc
    .fillColor("#000000")
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("BOOKSTORE", margin, y, { width: contentW, align: "center" });
  y += 22;

  doc
    .fontSize(7.5)
    .font("Helvetica")
    .fillColor("#333333")
    .text("123, Book Market, MG Road", margin, y, {
      width: contentW,
      align: "center",
    });
  y += 10;
  doc.text("Mumbai - 400001 | +91-98765-43210", margin, y, {
    width: contentW,
    align: "center",
  });
  y += 10;
  doc.text("GSTIN: 27AABCU9603R1ZX", margin, y, {
    width: contentW,
    align: "center",
  });
  y += 14;

  solidLine();

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#000000")
    .text("SALES RECEIPT", margin, y, { width: contentW, align: "center" });
  y += 14;

  dashedLine();

  // Order Info
  doc.fontSize(8).font("Helvetica").fillColor("#000000");
  doc.text(`Order : ${order.order_number}`, margin, y);
  y += 12;
  doc.text(`Date  : ${formatDate(order.created_date)}`, margin, y);
  y += 12;
  doc.text(`Name  : ${order.full_name || ""}`, margin, y);
  y += 12;
  doc.text(`City  : ${order.city || ""}`, margin, y);
  y += 14;

  dashedLine();

  // Table Headers
  const tableStart = margin;
  const itemCol = { x: tableStart, width: 110 };
  const qtyCol = { x: tableStart + 115, width: 30 };
  const priceCol = { x: tableStart + 150, width: 55 };
  const amtCol = { x: tableStart + 210, width: 58 };

  doc.fontSize(8).font("Helvetica-Bold").fillColor("#000000");
  doc.text("ITEM", itemCol.x, y);
  doc.text("QTY", qtyCol.x, y);
  doc.text("PRICE", priceCol.x, y);
  doc.text("AMT", amtCol.x, y, { width: amtCol.width, align: "right" });
  y += 12;

  solidLine();

  // Items
  items.forEach((item) => {
    const itemY = y;

    doc.fontSize(8).font("Helvetica-Bold").fillColor("#000000");

    const title = item.book_title;
    const maxWidth = itemCol.width - 5;
    const titleWidth = doc.widthOfString(title, {
      font: "Helvetica-Bold",
      size: 8,
    });

    if (titleWidth > maxWidth) {
      let currentLine = "";
      const words = title.split(" ");
      let lastY = y;

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + (currentLine ? " " : "") + words[i];
        const testWidth = doc.widthOfString(testLine, {
          font: "Helvetica-Bold",
          size: 8,
        });

        if (testWidth > maxWidth && currentLine) {
          doc.text(currentLine, itemCol.x, lastY, { width: maxWidth });
          lastY += 10;
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        doc.text(currentLine, itemCol.x, lastY, { width: maxWidth });
      }

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#000000")
        .text(String(item.quantity), qtyCol.x, itemY, {
          width: qtyCol.width,
          align: "center",
        })
        .text(formatMoney(item.selling_price), priceCol.x, itemY, {
          width: priceCol.width,
          align: "right",
        })
        .text(formatMoney(item.total_amount), amtCol.x, itemY, {
          width: amtCol.width,
          align: "right",
        });

      y = lastY + 12;
    } else {
      doc.text(title, itemCol.x, y, { width: maxWidth });
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#000000")
        .text(String(item.quantity), qtyCol.x, y, {
          width: qtyCol.width,
          align: "center",
        })
        .text(formatMoney(item.selling_price), priceCol.x, y, {
          width: priceCol.width,
          align: "right",
        })
        .text(formatMoney(item.total_amount), amtCol.x, y, {
          width: amtCol.width,
          align: "right",
        });
      y += 14;
    }
  });

  solidLine();

  // Totals
  const subtotal = items.reduce((s, it) => s + Number(it.total_amount), 0);
  const totalsStartX = margin + 130;
  const totalsLabelWidth = 65;
  const totalsValueWidth = contentW - 140;

  const tRow = (label, value, bold = false) => {
    doc
      .fontSize(8)
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fillColor("#000000");
    doc.text(label, totalsStartX, y);
    doc.text(value, totalsStartX + totalsLabelWidth, y, {
      width: totalsValueWidth,
      align: "right",
    });
    y += 12;
  };

  tRow("Subtotal:", formatMoney(subtotal));
  tRow("Shipping:", "FREE");
  tRow("Tax (GST):", "₹0.00");

  y += 4;
  solidLine();

  // Grand Total
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("#000000")
    .text("TOTAL", margin, y)
    .text(formatMoney(order.total_amount), margin, y, {
      width: contentW,
      align: "right",
    });
  y += 20;

  dashedLine();

  // Summary
  doc
    .fontSize(7.5)
    .font("Helvetica")
    .fillColor("#444444")
    .text(
      `Items: ${items.length}  |  Order: ${order.order_number}`,
      margin,
      y,
      { width: contentW, align: "center" },
    );
  y += 14;

  dashedLine();

  // Footer
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#000000")
    .text("** Thank You **", margin, y, { width: contentW, align: "center" });
  y += 14;
  doc
    .fontSize(7.5)
    .font("Helvetica")
    .fillColor("#555555")
    .text("Goods once sold will not be returned.", margin, y, {
      width: contentW,
      align: "center",
    });
  y += 10;
  doc
    .fontSize(8)
    .font("Helvetica-Bold")
    .fillColor("#000000")
    .text("bookstore.com", margin, y, { width: contentW, align: "center" });
}

exports.downloadReceipt = async (req, res) => {
  const { pool } = require("../../config/db");
  const { error } = require("../../utils/response");

  try {
    const { orderId } = req.params;
    const { flag } = req.query;

    if (!flag) return error(res, "Flag Required", "Use CUSTOMER or SELLER");

    const orderResult = await pool.query(
      `SELECT o.order_number, o.total_amount, o.created_date,
       oa.full_name, oa.mobile, oa.address_line1, oa.address_line2,
       oa.city, oa.state, oa.postal_code
       FROM tbl_orders o
       LEFT JOIN tbl_order_addresses oa ON oa.order_id = o.order_id
       WHERE o.order_id=$1`,
      [orderId],
    );

    if (!orderResult.rows.length)
      return error(res, "Order Not Found", "Invalid order");

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT book_title, quantity, selling_price, total_amount
       FROM tbl_order_items WHERE order_id=$1`,
      [orderId],
    );
    const items = itemsResult.rows;

    let doc;

    if (flag === "CUSTOMER") {
      doc = new PDFDocument({
        size: "A4",
        margin: 0,
        info: { Title: `Invoice-${order.order_number}` },
      });
    } else if (flag === "SELLER") {
      doc = new PDFDocument({
        size: [300, 900],
        margin: 0,
        info: { Title: `Receipt-${order.order_number}` },
      });
    } else {
      return error(res, "Invalid Flag", "Use CUSTOMER or SELLER");
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${order.order_number}.pdf`,
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "no-cache");

    doc.pipe(res);

    if (flag === "CUSTOMER") buildCustomerInvoice(doc, order, items);
    if (flag === "SELLER") buildSellerReceipt(doc, order, items);

    doc.end();
  } catch (err) {
    const { error: errFn } = require("../../utils/response");
    return errFn(res, "Receipt Failed", err.message);
  }
};
