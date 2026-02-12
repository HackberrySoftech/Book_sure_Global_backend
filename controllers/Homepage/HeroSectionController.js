import db from "../../config/db.js";
const REACT_BASE_URL = process.env.APP_URL || "http://localhost:8000";
export const getHero = (req, res) => {
  const sql = `
    SELECT 
      title,
      subtitle,
      button_text,
      button_link,
      background_image
    FROM herosectionmaster
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

    if (!result.length) {
      return res.status(200).json({
        success: true,
        message: "Hero section not found",
        data: null,
      });
    }

    const data = result[0];

    res.status(200).json({
      success: true,
      message: "Hero section fetched successfully",
      data: {
        ...data,
        background_image: data.background_image
          ? `http://localhost:8000/${data.background_image}`
          : null,
      },
    });
  });
};
export const updateHero = (req, res) => {
  const { title, subtitle, button_text, button_link } = req.body;

  // image from form-data
  const backgroundImagePath = req.file
    ? `uploads/hero/${req.file.filename}`
    : null;

  // 🛡 SAFETY CHECK
  if (
    title === undefined &&
    subtitle === undefined &&
    button_text === undefined &&
    button_link === undefined &&
    !req.file
  ) {
    return res.status(400).json({
      success: false,
      message: "At least one field is required to update",
    });
  }

  const sql = `
    UPDATE herosectionmaster
    SET 
      title = COALESCE(?, title),
      subtitle = COALESCE(?, subtitle),
      button_text = COALESCE(?, button_text),
      button_link = COALESCE(?, button_link),
      background_image = COALESCE(?, background_image)
    WHERE id = 1
  `;

  db.query(
    sql,
    [
      title ?? null,
      subtitle ?? null,
      button_text ?? null,
      button_link ?? null,
      backgroundImagePath,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Update failed",
        });
      }

      res.status(200).json({
        success: true,
        message: "Hero section updated successfully",
      });
    },
  );
};

export const getDashboardCardData = async (req, res) => {
  try {
    // 1️⃣ Total Active Services (is_active = 1)
    const [servicesResult] = await db.promise().query(
      "SELECT COUNT(*) AS totalServices FROM services WHERE is_active = 1"
    );

    // 2️⃣ Year Experience from homeaboutmaster
    const [experienceResult] = await db.promise().query(
      "SELECT year_experience FROM homeaboutmaster LIMIT 1"
    );

    // 3️⃣ Total Inquiry Count
    const [inquiryResult] = await db.promise().query(
      "SELECT COUNT(*) AS totalInquiries FROM pricing_inquiries"
    );

    res.status(200).json({
      success: true,
      data: {
        totalServices: servicesResult[0].totalServices,
        yearExperience: experienceResult.length > 0 
          ? experienceResult[0].year_experience 
          : 0,
        totalInquiries: inquiryResult[0].totalInquiries,
      },
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};





export default { getHero, updateHero ,getDashboardCardData};
