import db from "../../config/db.js";
const REACT_BASE_URL = process.env.REACT_BASE_URL || "http://localhost:8000";

export const getImageUrl = (file) => {
  if (!file) return null;

  // ✅ Already full URL
  if (file.startsWith("http")) return file;

  // ✅ If stored with /uploads already
  if (file.startsWith("/uploads")) {
    return `${REACT_BASE_URL}${file}`;
  }

  // ✅ Only filename stored
  return `${REACT_BASE_URL}/uploads/whychosseus/${file}`;
};



export const getWhyChooseUs = (req, res) => {
  const sql = `SELECT * FROM whychosseusmaster LIMIT 1`;

  db.query(sql, (err, rows) => {
    if (err)
      return res.status(500).json({
        success: false,
        message: "Database error ❌",
      });

    if (!rows.length)
      return res.json({
        success: false,
        message: "Data Not Found ❌",
      });

    const data = rows[0];

    // ✅ Parse speciality list
    data.speciality_list = JSON.parse(data.speciality_list || "[]");

    // ✅ Correct Image URL
    data.whychosseus_image = getImageUrl(data.whychosseus_image);

    res.json({
      success: true,
      data,
    });
  });
};

export const updateWhyChooseUs = (req, res) => {
  const {
    section_title,
    section_subtitle,
    content_title,
    content_para,
    speciality_list,
  } = req.body;

  /* ✅ Image */
  const newImage = req.file?.filename || null;

  /* ✅ Convert speciality_list safely */
  let specialityArray = [];

  try {
    specialityArray = JSON.parse(speciality_list || "[]");
  } catch (error) {
    specialityArray = [];
  }

  const sql = `
    UPDATE whychosseusmaster SET
      section_title=?,
      section_subtitle=?,
      content_title=?,
      content_para=?,
      speciality_list=?,
      whychosseus_image = COALESCE(?, whychosseus_image)
    WHERE id=1
  `;

  db.query(
    sql,
    [
      section_title,
      section_subtitle,
      content_title,
      content_para,
      JSON.stringify(specialityArray),
      newImage,
    ],
    (err) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "Update Failed ❌",
        });

      res.json({
        success: true,
        message: "Updated Successfully ✅",
      });
    }
  );
};
export default {
  getWhyChooseUs,
  updateWhyChooseUs,
};
