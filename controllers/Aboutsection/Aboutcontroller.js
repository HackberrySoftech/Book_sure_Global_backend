import db from "../../config/db.js";
const REACT_BASE_URL = process.env.APP_URL || "http://localhost:8000";

export const getImageUrl = (file) => {
  return file ? `${REACT_BASE_URL}/uploads/Aboutmain/${file}` : null;
};

export const getAboutSection = (req, res) => {
  const sql = `SELECT * FROM aboutmain_section WHERE status = 1 LIMIT 1`;

  db.query(sql, (err, rows) => {
    if (err)
      return res.status(500).json({
        success: false,
        message: "Database error ❌",
      });

    if (!rows.length)
      return res.json({
        success: false,
        message: "Data not found ❌",
      });

    const data = rows[0];

    /* ✅ Parse Experience List */
    data.experience_list = JSON.parse(data.experience_list || "[]");

    /* ✅ Correct Image URL */
    data.main_image = getImageUrl(data.main_image);

    res.json({
      success: true,
      data,
    });
  });
};
export const updateAboutSection = (req, res) => {
  const { subtitle, title, description, experience_list } = req.body;

  /* ✅ Upload Main Image */
  const mainImage = req.files?.main_image?.[0]?.filename || null;

  /* ✅ Convert Experience List */
  let experienceArray = [];
  try {
    experienceArray = JSON.parse(experience_list || "[]");
  } catch (err) {
    experienceArray = [];
  }

  const sql = `
    UPDATE aboutmain_section SET
      subtitle = ?,
      title = ?,
      description = ?,
      experience_list = ?,
      main_image = COALESCE(?, main_image)
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      subtitle,
      title,
      description,
      JSON.stringify(experienceArray),
      mainImage,
      req.params.id,
    ],
    (err) => {
      if (err) {
        console.error("Update Error:", err);
        return res.status(500).json({
          success: false,
          message: "Update failed ❌",
        });
      }

      res.json({
        success: true,
        message: "About section updated successfully ✅",
      });
    },
  );
};
export const getCompanyHighlights = (req, res) => {
  const sql = `SELECT * FROM company_highlights WHERE status = 1 LIMIT 1`;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.json(null);

    const data = rows[0];

    data.mission_image = getImageUrl(data.mission_image);
    data.vision_image = getImageUrl(data.vision_image);

    res.json(data);
  });
};
export const updateCompanyHighlights = (req, res) => {
  const {
    stat_1_value,
    stat_1_text,
    stat_2_value,
    stat_2_text,

    stat_4_value,
    stat_4_text,
    mission_title,
    mission_description,
    vision_title,
    vision_description,
  } = req.body;

  // ✅ Get ID from params
  const id = req.params.id;

  // ✅ Uploaded images (if user selects new one)
  const missionImg = req.files?.mission_image?.[0]?.filename || null;
  const visionImg = req.files?.vision_image?.[0]?.filename || null;

  const sql = `
    UPDATE company_highlights SET
      stat_1_value = ?, stat_1_text = ?,
      stat_2_value = ?, stat_2_text = ?,   
      stat_4_value = ?, stat_4_text = ?,
      mission_title = ?, mission_description = ?,
      vision_title = ?, vision_description = ?,
      mission_image = IFNULL(?, mission_image),
      vision_image  = IFNULL(?, vision_image)
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      stat_1_value,
      stat_1_text,

      stat_2_value,
      stat_2_text,

      stat_4_value,
      stat_4_text,

      mission_title,
      mission_description,

      vision_title,
      vision_description,

      missionImg,
      visionImg,

      id,
    ],
    (err, result) => {
      if (err) {
        console.log("Update Error:", err);
        return res.status(500).json({
          success: false,
          message: "Database Error",
        });
      }

      res.json({
        success: true,
        message: "Company Highlights Updated Successfully ✅",
      });
    },
  );
};

export const getHeroAssociate = (req, res) => {
  const sql = `SELECT * FROM hero_associate WHERE status = 1 LIMIT 1`;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.json(null);

    const data = rows[0];

    data.bg_image = getImageUrl(data.bg_image);

    res.json(data);
  });
};

export const updateHeroAssociate = (req, res) => {
  const { title, description } = req.body;

  const bgImage = req.file?.filename || null;
  const logoImage = req.file?.filename || null;
  const sql = `
    UPDATE hero_associate SET
      title = ?,
      description = ?,
      bg_image = COALESCE(?, bg_image),
       logo_image = COALESCE(?, logo_image)
    WHERE id = ?
  `;

  db.query(
    sql,
    [title, description, bgImage, logoImage, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ success: false });
      res.json({
        success: true,
        message: "Hero Associate section updated successfully",
      });
    },
  );
};

export default {
  getAboutSection,
  updateAboutSection,
  updateCompanyHighlights,
  getCompanyHighlights,
  getHeroAssociate,
  updateHeroAssociate,
};
