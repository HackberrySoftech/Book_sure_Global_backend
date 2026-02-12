import db from "../config/db.js";
import mailTransporter from "../config/Mail.js";
import path from "path";
export const submitCareerApplication = (req, res) => {
  const { full_name, position, email, phone } = req.body || {};

  const resume = req.file ? req.file.filename : null;

  // ✅ Validation
  if (!full_name || !position || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be filled",
    });
  }

  // 1️⃣ Save application
  db.query(
    `INSERT INTO career_applications  
     (full_name, position, email, phone, resume)
     VALUES (?,?,?,?,?)`,
    [full_name, position, email, phone, resume],
    (err) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to submit application",
        });
      }

      // 2️⃣ Fetch active HR emails
      db.query(
        "SELECT email FROM career_emails WHERE is_active = 1",
        async (err, rows) => {
          if (err) {
            console.error("Email fetch error:", err);
            return res.json({
              success: true,
              message: "Application saved (email fetch error)",
            });
          }

          // ✅ SAME WORKING PATTERN AS INQUIRY
          const adminEmails = (rows || []).map((r) => r.email).filter(Boolean);

          if (!adminEmails.length) {
            console.warn("No active career emails found");
            return res.json({
              success: true,
              message: "Application submitted (no HR emails configured)",
            });
          }

          try {
            await mailTransporter.sendMail({
              from: `"Career Application" <${process.env.MAIL_USER}>`,
              to: adminEmails.join(","), // ✅ EXACTLY LIKE INQUIRY
              replyTo: email,
              subject: `New Job Application – ${position}`,
              html: `
                <h3>New Career Application</h3>
                <p><b>Name:</b> ${full_name}</p>
                <p><b>Position:</b> ${position}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Phone:</b> ${phone}</p>               
              `,
              attachments: resume
                ? [
                    {
                      filename: resume,
                      path: `uploads/careers/${resume}`,
                    },
                  ]
                : [],
            });

            console.log("Career mail sent to:", adminEmails);
          } catch (mailErr) {
            console.error("Career mail failed:", mailErr);
          }

          // 3️⃣ Always return success to user
          res.json({
            success: true,
            message: "Application submitted successfully",
          });
        },
      );
    },
  );
};

const addCareerEmail = (req, res) => {
  db.query(
    "INSERT INTO career_emails (email) VALUES (?)",
    [req.body.email],
    () => res.json({ success: true }),
  );
};

const getCareerEmails = (req, res) => {
  db.query("SELECT * FROM career_emails", (_, rows) =>
    res.json({ success: true, data: rows }),
  );
};

const updateCareerEmailStatus = (req, res) => {
  db.query(
    "UPDATE career_emails SET is_active=? WHERE id=?",
    [Number(req.body.is_active), req.params.id],
    () => res.json({ success: true }),
  );
};

const deleteCareerEmail = (req, res) => {
  db.query("DELETE FROM career_emails WHERE id=?", [req.params.id], () =>
    res.json({ success: true }),
  );
};

const getCareerApplications = (req, res) => {
  const REACT_BASE_URL = `${req.protocol}://${req.get("host")}`;

  db.query(
    "SELECT * FROM career_applications ORDER BY created_at DESC",
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database Error",
        });
      }

      // ✅ Attach Full Resume URL
      const updatedRows = rows.map((item) => ({
        ...item,
        resume: item.resume
          ? `${REACT_BASE_URL}/uploads/resume/${item.resume}`
          : null,
      }));

      res.json({
        success: true,
        message: "Career Applications fetched successfully ✅",
        data: updatedRows,
      });
    },
  );
};
const deleteCareerApplication = (req, res) => {
  db.query("DELETE FROM career_applications WHERE id=?", [req.params.id], () =>
    res.json({ success: true }),
  );
};

export default {
  submitCareerApplication,
  addCareerEmail,
  getCareerEmails,
  updateCareerEmailStatus,
  deleteCareerEmail,
  getCareerApplications,
  deleteCareerApplication,
};
