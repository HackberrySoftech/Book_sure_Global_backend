import db from "../../config/db.js";

const REACT_BASE_URL = process.env.APP_URL || "http://localhost:8000";  
export const getHomeHelp = (req, res) => {
  const sql = `
    SELECT
      mainimage,
      maintitle,
      title,
      helpcontent
    FROM homehelpsectionmaster
    WHERE id = 1
    LIMIT 1
  `;

  const REACT_BASE_URL = process.env.APP_URL || "http://localhost:8000";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (!results.length) {
      return res.status(404).json({
        success: false,
        message: "Home Help content not found",
      });
    }

    const data = results[0];

    res.status(200).json({
      success: true,
      data: {
        ...data,
        mainimage: data.mainimage
          ? `${REACT_BASE_URL}/${data.mainimage}`
          : null,
      },
    });
  });
};

export const updateHomeHelp = (req, res) => {
  const { maintitle, title, helpcontent, updated_by } = req.body;

  const fields = [];
  const values = [];

  // ✅ image
  if (req.files?.mainimage?.length) {
    fields.push("mainimage = ?");
    values.push(`uploads/homehelp/${req.files.mainimage[0].filename}`);
  }

  // ✅ text fields
  if (maintitle !== undefined) {
    fields.push("maintitle = ?");
    values.push(maintitle);
  }

  if (title !== undefined) {
    fields.push("title = ?");
    values.push(title);
  }

  if (helpcontent !== undefined) {
    fields.push("helpcontent = ?");
    values.push(helpcontent);
  }

  if (updated_by !== undefined) {
    fields.push("updated_by = ?");
    values.push(updated_by);
  }

  // 🛡 safety
  if (!fields.length) {
    return res.status(400).json({
      success: false,
      message: "No fields provided to update",
    });
  }

  const sql = `
    UPDATE homehelpsectionmaster
    SET ${fields.join(", ")}
    WHERE id = 1
  `;

  db.query(sql, values, (err) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({
        success: false,
        message: "Update failed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Home Help section updated successfully",
    });
  });
};

export default {
  getHomeHelp,
  updateHomeHelp,
};