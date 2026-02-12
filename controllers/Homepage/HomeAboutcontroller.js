import db from "../../config/db.js";
const REACT_BASE_URL = process.env.APP_URL || "http://localhost:8000";
export const getHomeAbout = (req, res) => {
  const sql = `
    SELECT
      mainimage,
      secondimage,
      year_experience,
      toptitle,
      title,
      aboutcontent,
      created_by,
      updated_by,
      created_at,
      updated_at
    FROM HomeAboutMaster
    WHERE id = 1
    LIMIT 1
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Home About content not found",
      });
    }
    const data = results[0];
    res.status(200).json({
      success: true,
      data: {
        ...data,
        mainimage: data.mainimage ? `${REACT_BASE_URL}/${data.mainimage}` : null,
        secondimage: data.secondimage
          ? `${REACT_BASE_URL}/${data.secondimage}`
          : null,
      },
    });
  });
};

export const updateHomeAboutSection = (req, res) => {
  const { year_experience, toptitle, title, aboutcontent, updated_by } =
    req.body;

  const fields = [];
  const values = [];

  // ✅ images
  if (req.files?.mainimage?.length) {
    fields.push("mainimage = ?");
    values.push(`uploads/homeabout/${req.files.mainimage[0].filename}`);
  }

  if (req.files?.secondimage?.length) {
    fields.push("secondimage = ?");
    values.push(`uploads/homeabout/${req.files.secondimage[0].filename}`);
  }

  // ✅ text fields
  if (year_experience !== undefined) {
    fields.push("year_experience = ?");
    values.push(year_experience);
  }

  if (toptitle !== undefined) {
    fields.push("toptitle = ?");
    values.push(toptitle);
  }

  if (title !== undefined) {
    fields.push("title = ?");
    values.push(title);
  }

  if (aboutcontent !== undefined) {
    fields.push("aboutcontent = ?");
    values.push(aboutcontent);
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
    UPDATE HomeAboutMaster
    SET ${fields.join(", ")}
    WHERE id = 1
  `;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({
        success: false,
        message: "Update failed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Home About section updated successfully",
    });
  });
};

export default { getHomeAbout, updateHomeAboutSection };
