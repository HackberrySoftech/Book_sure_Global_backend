import db from "../../config/db.js";
const REACT_BASE_URL = process.env.APP_URL || "http://localhost:8000";

export const getSoftwareSectionMaster = (req, res) => {
  const sql = `
    SELECT
      title,
      subtitle
    FROM software_section_master
    WHERE id = 1
    LIMIT 1
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (!rows.length) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No software section data found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  });
};

export const getSoftware = (req, res) => {
  const masterSql = `
    SELECT id, title, subtitle
    FROM software_section_master
    WHERE id = 1
    LIMIT 1
  `;

  const imageSql = `
    SELECT id, image, isActive
    FROM software_section_images
    WHERE section_id = 1
    ORDER BY id DESC
  `;

  db.query(masterSql, (err, master) => {
    if (err) return res.status(500).json({ success: false });

    if (!master.length) {
      return res.json({ success: true, data: null });
    }

    db.query(imageSql, (err, images) => {
      if (err) return res.status(500).json({ success: false });

      res.json({
        success: true,
        data: {
          ...master[0],
          images: images.map((img) => ({
            id: img.id,
            isActive: img.isActive,
            image: `${REACT_BASE_URL}/${img.image}`,
          })),
        },
      });
    });
  });
};

export const addSoftware = (req, res) => {
  if (!req.files || !req.files.length) {
    return res.status(400).json({
      success: false,
      message: "At least one image is required",
    });
  }

  const values = req.files.map((file) => [
    1,
    `uploads/software/${file.filename}`,
  ]);

  const sql = `
    INSERT INTO software_section_images (section_id, image)
    VALUES ?
  `;

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to add software images",
      });
    }

    res.json({
      success: true,
      message: "Software images added successfully",
      totalInserted: result.affectedRows,
    });
  });
};

export const updateSoftware = (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const fields = [];
  const values = [];

  if (req.file) {
    fields.push("image = ?");
    values.push(`uploads/software/${req.file.filename}`);
  }

  if (isActive !== undefined) {
    fields.push("isActive = ?");
    values.push(Number(isActive));
  }

  if (!fields.length) {
    return res.status(400).json({
      success: false,
      message: "No fields to update",
    });
  }

  const sql = `
    UPDATE software_section_images
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  values.push(id);

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ success: false });

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    res.json({
      success: true,
      message: "Software image updated successfully",
    });
  });
};
/* ============= ==== BY ID ================= */
export const getSoftwareById = (req, res) => {
  const { id } = req.params;

  // 🛡 Validate ID
  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Valid software image ID is required",
    });
  }

  const sql = `
    SELECT id, image, isActive
    FROM software_section_images
    WHERE id = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error while fetching software image",
      });
    }

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Software image not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Software image fetched successfully",
      data: {
        id: rows[0].id,
        isActive: rows[0].isActive,
        image: `${REACT_BASE_URL}/${rows[0].image}`,
      },
    });
  });
};
/* ================= ACTIVE / INACTIVE ================= */
export const getSoftwareActive = (req, res) => {
  const sql = `
    SELECT id, image
    FROM software_section_images
    WHERE section_id = 1 AND isActive = 1
    ORDER BY id DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ success: false });

    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        image: `${REACT_BASE_URL}/${r.image}`,
      })),
    });
  });
};

export const getSoftwareInactive = (req, res) => {
  const sql = `
    SELECT id, image
    FROM software_section_images
    WHERE section_id = 1 AND isActive = 0
    ORDER BY id DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ success: false });

    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        image: `${REACT_BASE_URL}/${r.image}`,
      })),
    });
  });
};
/* ================= DELETE ================= */
export const deleteSoftwareById = (req, res) => {
  const sql = `DELETE FROM software_section_images WHERE id = ?`;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ success: false });

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    res.json({
      success: true,
      message: "Software image deleted successfully",
    });
  });
};

export const updateSoftwareSectionMaster = (req, res) => {
  const { title, subtitle } = req.body;

  // 🛡 safety check
  if (title === undefined && subtitle === undefined) {
    return res.status(400).json({
      success: false,
      message: "At least one field (title or subtitle) is required",
    });
  }

  const fields = [];
  const values = [];

  if (title !== undefined) {
    fields.push("title = ?");
    values.push(title);
  }

  if (subtitle !== undefined) {
    fields.push("subtitle = ?");
    values.push(subtitle);
  }

  const sql = `
    UPDATE software_section_master
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

    res.json({
      success: true,
      message: "Software section updated successfully",
    });
  });
};
export const updateSoftwareImageStatus = (req, res) => {
  const { id } = req.params; // image id
  const { isActive } = req.body; // 0 or 1

  // Validation
  if (isActive !== 0 && isActive !== 1) {
    return res.status(400).json({
      success: false,
      message: "isActive must be 0 or 1",
    });
  }

  const sql = `
    UPDATE software_section_images
    SET isActive = ?
    WHERE id = ?
  `;

  db.query(sql, [isActive, id], (err, result) => {
    if (err) {
      console.error("Update Error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    res.json({
      success: true,
      message: `Image status updated successfully`,
    });
  });
};

export default {
  getSoftware,
  addSoftware,
  updateSoftware,
  getSoftwareById,
  getSoftwareActive,
  getSoftwareInactive,
  deleteSoftwareById,
  updateSoftwareSectionMaster,
  getSoftwareSectionMaster,
  updateSoftwareImageStatus,
};
