import db from "../config/db.js";

const REACT_BASE_URL = process.env.REACT_BASE_URL || "http://localhost:8000";

const getSettings = (req, res) => {
  const sql = `
    SELECT 
      id,
      WebTitle,
      Logo,
      Favicon,
      DATE_FORMAT(created_at, '%d-%m-%Y %H:%i:%s') AS created_at,
      DATE_FORMAT(updated_at, '%d-%m-%Y %H:%i:%s') AS updated_at
    FROM webdetailsmaster
    WHERE id = 1
    LIMIT 1
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...result[0],
        Logo: result[0]?.Logo ? `${REACT_BASE_URL}/${result[0].Logo}` : null,
        Favicon: result[0]?.Favicon ? `${REACT_BASE_URL}/${result[0].Favicon}` : null,
      },
    });
  });
};

const updateSettings = (req, res) => {
  const { WebTitle } = req.body;

  if (!WebTitle) {
    return res.status(400).json({
      success: false,
      message: "WebTitle is required",
    });
  }

  const logoPath = req.files?.logo
    ? `uploads/websettings/${req.files.logo[0].filename}`
    : null;

  const faviconPath = req.files?.favicon
    ? `uploads/websettings/${req.files.favicon[0].filename}`
    : null;

  const sql = `
    UPDATE webdetailsmaster
    SET
      WebTitle = COALESCE(?, WebTitle),
      Logo     = COALESCE(?, Logo),
      Favicon  = COALESCE(?, Favicon)
    WHERE id = 1
  `;

  db.query(sql, [WebTitle, logoPath, faviconPath], (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Update failed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
    });
  });
};


export default {
  getSettings,
  updateSettings,
};
