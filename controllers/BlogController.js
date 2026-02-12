import db from "../config/db.js";
const REACT_BASE_URL = process.env.REACT_BASE_URL || "http://localhost:8000";
export const createBlog = (req, res) => {
  const {
    title,
    category,
    publish_date,
    short_description,
    main_description,
    quote_text,
    section_title,
    section_description,
    bullet_points,
    writer_name,
    created_by,
  } = req.body;

  if (!title || !category) {
    return res.status(400).json({
      success: false,
      message: "Title & Category are required",
    });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const image = req.file?.filename || null;

  const sql = `
    INSERT INTO blogs
    (title, slug, category, publish_date, thumbnail_image,
     short_description, main_description, quote_text,
     section_title, section_description, bullet_points,
     writer_name, created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  db.query(
    sql,
    [
      title,
      slug,
      category,
      publish_date,
      image,
      short_description,
      main_description,
      quote_text,
      section_title,
      section_description,
      JSON.stringify(bullet_points || []),
      writer_name,
      created_by,
    ],
    (err) => {
      if (err)
        return res.status(500).json({
          success: false,
          message: "Failed to create blog",
          error: err,
        });

      res.json({
        success: true,
        message: "Blog created successfully",
      });
    }
  );
};

export const getActiveBlogs = (req, res) => {
  const sql = `
    SELECT id, title, slug, category, publish_date,
           thumbnail_image, writer_name
    FROM blogs
    WHERE Is_Active = 1
    ORDER BY publish_date DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);

    const data = rows.map((item) => ({
      ...item,
      thumbnail_image: item.thumbnail_image
        ? `${REACT_BASE_URL}/uploads/${item.thumbnail_image}`
        : null,
    }));

    res.json(data);
  });
};
export const getBlogBySlug = (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({
      success: false,
      message: "Slug is required",
    });
  }

  const sql = `
    SELECT *
    FROM blogs
    WHERE slug = ? AND Is_Active = 1
    LIMIT 1
  `;

  db.query(sql, [slug], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to load blog details",
        error: err,
      });
    }

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    let blog = rows[0];

    // Parse bullet_points safely
    try {
      blog.bullet_points = JSON.parse(blog.bullet_points || "[]");
    } catch {
      blog.bullet_points = [];
    }

    res.json({
      success: true,
      message: "Blog fetched successfully",
      data: blog,
    });
  });
};

export const getBlogById = (req, res) => {
  db.query("SELECT * FROM blogs WHERE id=?", [req.params.id], (err, rows) => {
    if (err || !rows.length) return res.status(404).json({});

    const blog = rows[0];

    blog.thumbnail_image = blog.thumbnail_image
      ? `${REACT_BASE_URL}/uploads/${blog.thumbnail_image}`
      : null;

    blog.bullet_points = JSON.parse(blog.bullet_points || "[]");

    res.json(blog);
  });
};
export const updateBlog = (req, res) => {
  const { id } = req.params;

  const {
    title,
    category,
    publish_date,
    short_description,
    main_description,
    quote_text,
    section_title,
    section_description,
    bullet_points,
    writer_name,
    updated_by,
  } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Blog ID is required",
    });
  }

  if (!title || !category) {
    return res.status(400).json({
      success: false,
      message: "Title & Category are required",
    });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const image = req.file?.filename || null;

  const sql = `
    UPDATE blogs SET
      title = ?,
      slug = ?,
      category = ?,
      publish_date = ?,
      short_description = ?,
      main_description = ?,
      quote_text = ?,
      section_title = ?,
      section_description = ?,
      bullet_points = ?,
      writer_name = ?,
      updated_by = ?,
      thumbnail_image = COALESCE(?, thumbnail_image)
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      title,
      slug,
      category,
      publish_date,
      short_description,
      main_description,
      quote_text,
      section_title,
      section_description,
      JSON.stringify(bullet_points || []),
      writer_name,
      updated_by,
      image,
      id,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to update blog",
          error: err,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      res.json({
        success: true,
        message: "Blog updated successfully",
      });
    }
  );
};

export const updateBlogStatus = (req, res) => {
  const { id } = req.params;
  const { Is_Active } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Blog ID is required",
    });
  }

  if (Is_Active !== 0 && Is_Active !== 1) {
    return res.status(400).json({
      success: false,
      message: "Status must be 0 or 1",
    });
  }

  const sql = "UPDATE blogs SET Is_Active = ? WHERE id = ?";

  db.query(sql, [Is_Active, id], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to update blog status",
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      message: "Blog status updated successfully",
    });
  });
};
export const deleteBlog = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Blog ID is required",
    });
  }

  const sql = "DELETE FROM blogs WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete blog",
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  });
};

export default {
  createBlog,
  getActiveBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  updateBlogStatus,
  deleteBlog,
};
