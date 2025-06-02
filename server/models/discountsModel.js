//const sql      = require('mssql/msnodesqlv8');
//const dbConfig = require('../config/db');
//
//// CREATE
//async function createDiscount(type, percentage, start_date, end_date, status = 'Active', createdBy) {
//  try {
//    await sql.connect(dbConfig);
//    await new sql.Request()
//      .input('type', sql.NVarChar(100), type)
//      .input('percentage', sql.Decimal(5, 2), percentage)
//      .input('start_date', sql.Date, start_date)
//      .input('end_date', sql.Date, end_date)
//      .input('status', sql.NVarChar(50), status)
//      .input('createdBy', sql.NVarChar(100), createdBy)
//      .query(`
//        INSERT INTO Discounts (type, percentage, start_date, end_date, status, createdBy)
//        VALUES (@type, @percentage, @start_date, @end_date, @status, @createdBy)
//      `);
//    return { message: 'Discount created successfully' };
//  } catch (err) {
//    console.error('Gabim ne createDiscount:', err);
//    throw err;
//  }
//}
//
//// READ ALL
//async function getAllDiscounts() {
//  try {
//    await sql.connect(dbConfig);
//    const result = await new sql.Request().query('SELECT * FROM Discounts');
//    return result.recordset;
//  } catch (err) {
//    console.error('Gabim ne getAllDiscounts:', err);
//    throw err;
//  }
//}
//
//// READ BY ID
//async function getDiscountById(discountId) {
//  try {
//    await sql.connect(dbConfig);
//    const result = await new sql.Request()
//      .input('discountId', sql.Int, discountId)
//      .query('SELECT * FROM Discounts WHERE discountId = @discountId');
//    return result.recordset[0];
//  } catch (err) {
//    console.error('Gabim ne getDiscountById:', err);
//    throw err;
//  }
//}
//
//// UPDATE
//async function updateDiscount(discountId, updates) {
//  try {
//    await sql.connect(dbConfig);
//    const setClauses = [];
//    const request = new sql.Request();
//    request.input('discountId', sql.Int, discountId);
//    if (updates.type !== undefined) {
//      setClauses.push('type = @type');
//      request.input('type', sql.NVarChar(100), updates.type);
//    }
//    if (updates.percentage !== undefined) {
//      setClauses.push('percentage = @percentage');
//      request.input('percentage', sql.Decimal(5, 2), updates.percentage);
//    }
//    if (updates.start_date !== undefined) {
//      setClauses.push('start_date = @start_date');
//      request.input('start_date', sql.Date, updates.start_date);
//    }
//    if (updates.end_date !== undefined) {
//      setClauses.push('end_date = @end_date');
//      request.input('end_date', sql.Date, updates.end_date);
//    }
//    if (updates.status !== undefined) {
//      setClauses.push('status = @status');
//      request.input('status', sql.NVarChar(50), updates.status);
//    }
//    if (updates.updatedBy !== undefined) {
//      setClauses.push('updatedBy = @updatedBy');
//      request.input('updatedBy', sql.NVarChar(100), updates.updatedBy);
//    }
//    setClauses.push('updatedAt = @updatedAt');
//    request.input('updatedAt', sql.DateTime, new Date());
//    if (setClauses.length === 1) {
//      return { message: 'Nothing to update' };
//    }
//    const sqlString = `UPDATE Discounts SET ${setClauses.join(', ')} WHERE discountId = @discountId`;
//    await request.query(sqlString);
//    return { message: 'Discount updated successfully' };
//  } catch (err) {
//    console.error('Gabim ne updateDiscount:', err);
//    throw err;
//  }
//}
//
//// DELETE
//async function deleteDiscount(discountId) {
//  try {
//    await sql.connect(dbConfig);
//    await new sql.Request()
//      .input('discountId', sql.Int, discountId)
//      .query('DELETE FROM Discounts WHERE discountId = @discountId');
//    return { message: 'Discount deleted successfully' };
//  } catch (err) {
//    console.error('Gabim ne deleteDiscount:', err);
//    throw err;
//  }
//}
//
//module.exports = {
//  createDiscount,
//  getAllDiscounts,
//  getDiscountById,
//  updateDiscount,
//  deleteDiscount
//};

const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

function formatDateTime(date) {
  if (!date) return null;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function formatDate(date) {
  if (!date) return null;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// CREATE
async function createDiscount(discount) {
  try {
    await sql.connect(dbConfig);

    const {
      type,
      percentage,
      start_date,
      end_date,
      status = 'Active',
      createdBy
    } = discount;

    const createdAt = new Date();

    const result = await new sql.Request()
      .input("type", sql.NVarChar(100), type)
      .input("percentage", sql.Decimal(5, 2), percentage)
      .input("start_date", sql.Date, start_date)
      .input("end_date", sql.Date, end_date)
      .input("status", sql.NVarChar(50), status)
      .input("createdAt", sql.DateTime, createdAt)
      .input("createdBy", sql.NVarChar(100), createdBy)
      .query(`
        INSERT INTO Discounts (type, percentage, start_date, end_date, status, createdAt, createdBy)
        VALUES (@type, @percentage, @start_date, @end_date, @status, @createdAt, @createdBy);
        SELECT SCOPE_IDENTITY() AS discountId;
      `);

    return { message: "Discount created successfully", discountId: result.recordset[0].discountId };
  } catch (err) {
    console.error("Error creating discount:", err);
    throw err;
  }
}

// READ ALL
async function getAllDiscounts() {
  try {
    await sql.connect(dbConfig);

    const result = await sql.query(`SELECT * FROM Discounts`);

    return result.recordset.map(discount => ({
      ...discount,
      createdAt: formatDateTime(discount.createdAt),
      updatedAt: formatDateTime(discount.updatedAt),
      start_date: formatDate(discount.start_date),
      end_date: formatDate(discount.end_date),
    }));
  } catch (err) {
    console.error("Error getting all discounts:", err);
    throw err;
  }
}

// READ BY ID
async function getDiscountById(id) {
  try {
    await sql.connect(dbConfig);

    const request = new sql.Request();
    request.input("discountId", sql.Int, id);

    const result = await request.query(`SELECT * FROM Discounts WHERE discountId = @discountId`);

    if (result.recordset.length === 0) return null;

    const discount = result.recordset[0];

    return {
      ...discount,
      createdAt: formatDateTime(discount.createdAt),
      updatedAt: formatDateTime(discount.updatedAt),
      start_date: formatDate(discount.start_date),
      end_date: formatDate(discount.end_date),
    };
  } catch (err) {
    console.error("Error getting discount by ID:", err);
    throw err;
  }
}

// UPDATE
async function updateDiscount(id, discount) {
  try {
    await sql.connect(dbConfig);

    const {
      type,
      percentage,
      start_date,
      end_date,
      status,
      updatedBy
    } = discount;

    const updatedAt = new Date();

    await new sql.Request()
      .input("discountId", sql.Int, id)
      .input("type", sql.NVarChar(100), type)
      .input("percentage", sql.Decimal(5, 2), percentage)
      .input("start_date", sql.Date, start_date)
      .input("end_date", sql.Date, end_date)
      .input("status", sql.NVarChar(50), status)
      .input("updatedAt", sql.DateTime, updatedAt)
      .input("updatedBy", sql.NVarChar(100), updatedBy)
      .query(`
        UPDATE Discounts SET
          type = @type,
          percentage = @percentage,
          start_date = @start_date,
          end_date = @end_date,
          status = @status,
          updatedAt = @updatedAt,
          updatedBy = @updatedBy
        WHERE discountId = @discountId
      `);

    return { message: "Discount updated successfully" };
  } catch (err) {
    console.error("Error updating discount:", err);
    throw err;
  }
}

// DELETE
async function deleteDiscount(id) {
  try {
    await sql.connect(dbConfig);

    await new sql.Request()
      .input("discountId", sql.Int, id)
      .query("DELETE FROM Discounts WHERE discountId = @discountId");

    return { message: "Discount deleted successfully" };
  } catch (err) {
    console.error("Error deleting discount:", err);
    throw err;
  }
}

module.exports = {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount
};
