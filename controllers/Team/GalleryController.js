import db from "../../config/db.js";
import fs from "fs";
const REACT_BASE_URL = process.env.REACT_BASE_URL || "http://localhost:8000";

export const addGallery = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one image is required",
    });
  }

  const { isActive = 1, created_by = "admin" } = req.body;

  // Prepare bulk insert values
  const values = req.files.map(file => [
    `uploads/gallery/${file.filename}`,
    Number(isActive),
    created_by,
  ]);

  const sql =
    "INSERT INTO gallery (image, isActive, created_by) VALUES ?";

  db.query(sql, [values], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({
      success: true,
      message: "Gallery images uploaded successfully",
      totalUploaded: req.files.length,
    });
  });
};

/* ================= GET ALL ================= */
export const getAllGallery = (req, res) => { 

  db.query("SELECT * FROM gallery ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json(err);

    const data = rows.map(item => ({
      ...item,
      image: item.image
        ? `${REACT_BASE_URL}/${item.image}`
        : null,
    }));

    res.json({
      success: true,
      data,
    });
  });
};
/* ================= GET ACTIVE ================= */
export const getActiveGallery = (req, res) => {
  db.query(
    "SELECT * FROM gallery WHERE isActive = 1 ORDER BY id DESC",
    (err, rows) => {
      if (err) return res.status(500).json(err);

      const data = rows.map(item => ({
        ...item,
        image: item.image
          ? `${REACT_BASE_URL}/${item.image}`
          : null,
      }));

      res.json({ success: true, data, });
    }
  );
};


/* ================= GET InACTIVE ================= */
export const getInactiveGallery = (req, res) => {
  db.query(
    "SELECT * FROM gallery WHERE isActive = 0 ORDER BY id DESC",
    (err, rows) => {
      if (err) return res.status(500).json(err);

      const data = rows.map(item => ({
        ...item,
        image: item.image
          ? `${REACT_BASE_URL}/${item.image}`
          : null,
      }));

      res.json({ success: true, data });
    }
  );
};



/* ================= UPDATE STATUS ================= */
export const updateGalleryStatus = (req, res) => {
  const { id } = req.params;
  const isActive = Number(req.body.isActive);
  const updated_by = req.body.updated_by || "admin";

  if (![0, 1].includes(isActive)) {
    return res.status(400).json({
      success: false,
      message: "isActive must be 0 or 1",
    });
  }

  db.query(
    "UPDATE gallery SET isActive = ?, updated_by = ? WHERE id = ?",
    [isActive, updated_by, id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (!result.affectedRows) {
        return res.status(404).json({
          success: false,
          message: "Gallery image not found",
        });
      }

      res.json({
        success: true,
        message: "Gallery status updated",
      });
    }
  );
};

/* ================= DELETE IMAGE ================= */
export const deleteGalleryById = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT image FROM gallery WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Image not found",
        });
      }

      const imagePath = rows[0].image;

      db.query("DELETE FROM gallery WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json(err);

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }

        res.json({
          success: true,
          message: "Gallery image deleted",
        });
      });
    }
  );
};


export default {
  
  addGallery,
  getAllGallery,
  getActiveGallery,
  getInactiveGallery,
  updateGalleryStatus,
  deleteGalleryById
};
