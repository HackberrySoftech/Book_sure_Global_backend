import db from "../../config/db.js";
const REACT_BASE_URL = process.env.REACT_BASE_URL || "http://localhost:8000";

export const getImageUrl = (folder, filename) => {
  if (!filename) return null;

  // ✅ Already full URL? Return directly
  if (filename.startsWith("http")) return filename;

  return `${REACT_BASE_URL}/uploads/${folder}/${filename}`;
};
export const addFounder = (req, res) => {
  const { name, designation, description } = req.body;

  const image = req.file?.filename || null;

  const sql = `
    INSERT INTO our_associate (name, designation, description, image)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, designation, description, image], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "DB Error" });
    }

    res.json({
      success: true,
      message: "Founder Added Successfully ✅",
    });
  });
};

export const getAllFounders = (req, res) => {
  const sql = `SELECT * FROM our_associate ORDER BY id DESC`;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);

    rows.forEach((item) => {
      item.image = getImageUrl("Ourassociate", item.image);
    });

    res.json({ success: true, data: rows });
  });
};

export const getActiveFounders = (req, res) => {
  const sql = `SELECT * FROM our_associate WHERE status=1`;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);

    rows.forEach((item) => {
      item.image = getImageUrl("Ourassociate", item.image);
    });

    res.json({ success: true, data: rows });
  });
};

export const getInactiveFounders = (req, res) => {
  const sql = `SELECT * FROM our_associate WHERE status=0`;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);

    rows.forEach((item) => {
      item.image = getImageUrl("Ourassociate", item.image);
    });

    res.json({ success: true, data: rows });
  });
};

export const getFounderById = (req, res) => {
  const sql = `SELECT * FROM our_associate WHERE id=?`;

  db.query(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json(err);

    if (!rows.length)
      return res.json({ success: false, message: "Founder Not Found" });

    const data = rows[0];
    data.image = getImageUrl("Ourassociate", data.image);

    res.json({ success: true, data });
  });
};

export const updateFounder = (req, res) => {
  const { name, designation, description } = req.body;

  const newImage = req.file?.filename || null;

  const sql = `
    UPDATE our_associate SET
      name=?,
      designation=?,
      description=?,
      image = COALESCE(?, image)
    WHERE id=?
  `;

  db.query(
    sql,
    [name, designation, description, newImage, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({
        success: true,
        message: "Founder Updated Successfully ✅",
      });
    },
  );
};
export const deleteFounder = (req, res) => {
  const sql = `DELETE FROM our_associate WHERE id=?`;

  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      success: true,
      message: "Founder Deleted ✅",
    });
  });
};
export const updateFounderStatus = (req, res) => {
  const { status } = req.body;

  const sql = `UPDATE our_associate SET status=? WHERE id=?`;

  db.query(sql, [status, req.params.id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      success: true,
      message: "Founder Status Updated ✅",
    });
  });
};
