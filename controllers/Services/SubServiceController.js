import db from "../../config/db.js";
const REACT_BASE_URL = process.env.APP_URL || "http://localhost:8000";

export const addSubService = (req, res) => {
  const { service_id, title, description, points } = req.body;

  const image = req.file ? req.file.path.replace(/\\/g, "/") : "";

  if (!service_id || !title) {
    return res.status(400).json({
      success: false,
      message: "Service ID and title are required ❌",
    });
  }

  db.query(
    `INSERT INTO sub_services
     (service_id, image, title, description, points)
     VALUES (?, ?, ?, ?, ?)`,
    [
      service_id,
      image,
      title,
      description || "",
      JSON.stringify(points ? JSON.parse(points) : []),
    ],
    (err, result) => {
      if (err) {
        console.error("Add SubService Error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to add sub-service ❌",
        });
      }

      res.json({
        success: true,
        message: "Sub-Service Added Successfully ✅",
        id: result.insertId,
      });
    },
  );
};

export const getSubServicesBySlug = (req, res) => {
  const { slug } = req.params;

  db.query(
    `SELECT sub.*
     FROM services s
     JOIN sub_services sub ON s.id = sub.service_id
     WHERE s.slug = ? AND sub.is_active = 1`,
    [slug],
    (err, rows) => {
      if (err) {
        console.error("Get SubServices Error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch sub-services ❌",
        });
      }

      const data = rows.map((r) => ({
        id: r.id,
        service_id: r.service_id,
        title: r.title,
        description: r.description,
        points: JSON.parse(r.points || "[]"),
        is_active: r.is_active,
        image: r.image ? `${REACT_BASE_URL}/${r.image}` : null,
      }));

      res.json({
        success: true,
        data,
      });
    },
  );
};


export const getInActiveSubServicesBySlug = (req, res) => {
  const { slug } = req.params;

  db.query(
    `SELECT sub.*
     FROM services s
     JOIN sub_services sub ON s.id = sub.service_id
     WHERE s.slug = ? AND sub.is_active = 0`,
    [slug],
    (err, rows) => {
      if (err) {
        console.error("Get SubServices Error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch sub-services ❌",
        });
      }

      const data = rows.map((r) => ({
        id: r.id,
        service_id: r.service_id,
        title: r.title,
        description: r.description,
        points: JSON.parse(r.points || "[]"),
        is_active: r.is_active,
        image: r.image ? `${REACT_BASE_URL}/${r.image}` : null,
      }));

      res.json({
        success: true,
        data,
      });
    },
  );
};

export const updateSubService = (req, res) => {
  const { id } = req.params;
  const { title, description, points, service_id } = req.body;

  const newImage = req.file ? req.file.path.replace(/\\/g, "/") : null;

  /* ✅ Points Safe Parse */
  const parsedPoints = points ? JSON.parse(points) : [];

  /* ✅ SQL + Values */
  let sql = `
    UPDATE sub_services SET
      title = ?,
      service_id = ?,
      description = ?,
      points = ?
  `;

  let values = [
    title,
    service_id,
    description || "",
    JSON.stringify(parsedPoints),
  ];

  /* ✅ If New Image Uploaded */
  if (newImage) {
    sql += `, image = ?`;
    values.push(newImage);
  }

  sql += ` WHERE id = ?`;
  values.push(id);

  /* ✅ Execute Query */
  db.query(sql, values, (err) => {
    if (err) {
      console.error("Update SubService Error:", err);
      return res.status(500).json({
        success: false,
        message: "Sub-Service Update Failed ❌",
      });
    }

    res.json({
      success: true,
      message: "Sub-Service Updated Successfully ✅",
    });
  });
};
export const updateSubServiceStatus = (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  db.query(
    `UPDATE sub_services SET is_active=? WHERE id=?`,
    [is_active, id],
    (err) => {
      if (err) {
        console.error("SubService Status Error:", err);
        return res.status(500).json({
          success: false,
          message: "Status Update Failed ❌",
        });
      }

      res.json({
        success: true,
        message: "Sub-Service Status Updated ✅",
      });
    },
  );
};

export const deleteSubService = (req, res) => {
  const { id } = req.params;

  db.query(`DELETE FROM sub_services WHERE id=?`, [id], (err) => {
    if (err) {
      console.error("Delete SubService Error:", err);
      return res.status(500).json({
        success: false,
        message: "Sub-Service Delete Failed ❌",
      });
    }

    res.json({
      success: true,
      message: "Sub-Service Deleted Successfully ✅",
    });
  });
};

// ✅ GET Sub-Service By ID (For Edit Form)
export const getSubServiceById = (req, res) => {
  const { id } = req.params;

  db.query(`SELECT * FROM sub_services WHERE id = ?`, [id], (err, rows) => {
    if (err) {
      console.error("Get SubService By ID Error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch sub-service ❌",
      });
    }

    // ✅ Not Found
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sub-Service not found ❌",
      });
    }

    const subService = rows[0];

    res.json({
      success: true,
      data: {
        id: subService.id,
        service_id: subService.service_id,
        title: subService.title,
        description: subService.description,
        points: JSON.parse(subService.points || "[]"),
        is_active: subService.is_active,
        image: subService.image ? `${REACT_BASE_URL}/${subService.image}` : null,
      },
    });
  });
};

export default {
  addSubService,
  getSubServicesBySlug,
  updateSubService,
  updateSubServiceStatus,
  deleteSubService,
  getSubServiceById,getInActiveSubServicesBySlug
};
