import db from "../config/db.js";

const REACT_BASE_URL = process.env.REACT_BASE_URL || "http://localhost:8000";

/* ✅ IMAGE URL HELPER */
export const getImageUrl = (file, folder = "data_security") => {
  if (!file) return null;

  if (file.startsWith("http")) return file;

  if (file.startsWith("/uploads")) {
    return `${REACT_BASE_URL}${file}`;
  }

  return `${REACT_BASE_URL}/uploads/${folder}/${file}`;
};

/* ================================================= */
/* ✅ GET DATA SECURITY SECTION */
/* ================================================= */
export const getDataSecuritySection = (req, res) => {
  const sql = `SELECT * FROM data_security_section WHERE is_active=1 LIMIT 1`;

  db.query(sql, (err, rows) => {
    if (err)
      return res.status(500).json({
        success: false,
        message: "Database Error ❌",
      });

    if (!rows.length)
      return res.json({
        success: false,
        message: "Data Not Found ❌",
      });

    const data = rows[0];

    /* ✅ Parse JSON List */
    data.how_we_keep_secure = JSON.parse(data.how_we_keep_secure || "[]");

    /* ✅ Fix Image URLs */
    data.main_image = getImageUrl(data.main_image);

    res.json({
      success: true,
      data,
    });
  });
};

/* ================================================= */
/* ✅ UPDATE DATA SECURITY SECTION */
/* ================================================= */
export const updateDataSecuritySection = (req, res) => {
  try {
    const { section_tag, title, description, how_we_keep_secure } = req.body;

    /* ✅ Image */
    const mainImage = req.files?.main_image?.[0]?.filename || null;

    /* ✅ Safe JSON Parse */
    let secureArray = [];

    if (typeof how_we_keep_secure === "string") {
      secureArray = JSON.parse(how_we_keep_secure || "[]");
    } else if (Array.isArray(how_we_keep_secure)) {
      secureArray = how_we_keep_secure;
    }

    const sql = `
      UPDATE data_security_section SET
        section_tag=?,
        title=?,
        description=?,
        how_we_keep_secure=?,
        main_image = COALESCE(?, main_image)
      WHERE id=1
    `;

    db.query(
      sql,
      [section_tag, title, description, JSON.stringify(secureArray), mainImage],
      (err) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({
            success: false,
            message: "Database Update Failed ❌",
          });
        }

        res.json({
          success: true,
          message: "Updated Successfully ✅",
        });
      },
    );
  } catch (error) {
    console.error("Server Crash:", error);

    res.status(500).json({
      success: false,
      message: "Server Error ❌",
    });
  }
};

export default {
  getDataSecuritySection,
  updateDataSecuritySection,
};
