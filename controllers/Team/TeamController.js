import db from "../../config/db.js";
const REACT_BASE_URL = process.env.REACT_BASE_URL || "http://localhost:8000";

// title section

export const updateTeamSection = (req, res) => {
  const {
    founder_title,
    founder_subtitle,
    team_title,
    team_subtitle,
    is_active,
  } = req.body;

  const fields = [];
  const values = [];

  if (founder_title !== undefined) {
    fields.push("founder_title=?");
    values.push(founder_title);
  }

  if (founder_subtitle !== undefined) {
    fields.push("founder_subtitle=?");
    values.push(founder_subtitle);
  }

  if (team_title !== undefined) {
    fields.push("team_title=?");
    values.push(team_title);
  }

  if (team_subtitle !== undefined) {
    fields.push("team_subtitle=?");
    values.push(team_subtitle);
  }

  if (is_active !== undefined) {
    if (is_active !== 0 && is_active !== 1) {
      return res.status(400).json({
        success: false,
        message: "is_active must be 0 or 1",
      });
    }
    fields.push("is_active=?");
    values.push(is_active);
  }

  if (!fields.length) {
    return res.status(400).json({
      success: false,
      message: "No fields provided to update",
    });
  }

  const sql = `
    UPDATE team_sections
    SET ${fields.join(", ")}
    WHERE id = 1
  `;

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to update team section",
        error: err,
      });
    }

    res.json({
      success: true,
      message: "Team section updated successfully",
    });
  });
};
export const getTeamSection = (req, res) => {
  db.query("SELECT * FROM team_sections LIMIT 1", (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch team section",
        error: err,
      });
    }

    res.json({
      success: true,
      data: rows[0] || null,
    });
  });
};

export const getTeamMembers = (req, res) => {
  const { type } = req.query;

  let sql = `SELECT * FROM team_members WHERE is_active = 1`;
  const params = [];

  if (type) {
    sql += ` AND member_type = ?`;
    params.push(type);
  }

  db.query(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch team members",
        error: err,
      });
    }

    res.json({
      success: true,
      data: rows.map((item) => ({
        ...item,
        // image: item.image ? `${REACT_BASE_URL}/uploads/team/${item.image}` : null,
      })),
    });
  });
};

export const deleteTeamMember = (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid member ID",
    });
  }

  db.query(`DELETE FROM team_members WHERE id=?`, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete team member",
        error: err,
      });
    }

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    res.json({
      success: true,
      message: "Team member deleted successfully",
    });
  });
};

export const addTeamMember = (req, res) => {

  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Request body missing. Check express.json() middleware.",
    });
  }

  const {
    name,
    education,
    experience,
    member_type,
    description,
    created_by,
  } = req.body;

  if (!name || !member_type) {
    return res.status(400).json({
      success: false,
      message: "Name and member type are required",
    });
  }

  const sql = `
    INSERT INTO team_members
    (name, education, experience, member_type, description, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      education || null,
      experience || null,
      member_type,
      description || null,
      created_by || null,
    ],
    (err, result) => {
      if (err) {
        console.error("DB ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to add team member",
        });
      }

      res.status(201).json({
        success: true,
        message: "Team member added successfully",
        member_id: result.insertId,
      });
    }
  );
};
export const updateTeamMemberById = (req, res) => {
  const { id } = req.params;
  const {
    name,
    education,
    experience,
    member_type,
    description,
    updated_by,
  } = req.body;

  // const image = req.file ? req.file.filename : null;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid member ID",
    });
  }

  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push("name=?");
    values.push(name);
  }

  if (education !== undefined) {
    fields.push("education=?");
    values.push(education);
  }

  if (experience !== undefined) {
    fields.push("experience=?");
    values.push(experience);
  }

 if (member_type !== undefined && member_type !== "") {
  fields.push("member_type=?");
  values.push(member_type);
}

  if (description !== undefined) {
    fields.push("description=?");
    values.push(description);
  }

  if (updated_by !== undefined) {
    fields.push("updated_by=?");
    values.push(updated_by);
  }

  // if (image) {
  //   fields.push("image=?");
  //   values.push(image);
  // }

  if (!fields.length) {
    return res.status(400).json({
      success: false,
      message: "No fields provided to update",
    });
  }

  const sql = `
    UPDATE team_members
    SET ${fields.join(", ")}
    WHERE id=?
  `;

  db.query(sql, [...values, id], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to update team member",
        error: err,
      });
    }

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    res.json({
      success: true,
      message: "Team member updated successfully",
    });
  });
};
export const updateTeamMemberStatus = (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (is_active !== 0 && is_active !== 1) {
    return res.status(400).json({
      success: false,
      message: "is_active must be 0 or 1",
    });
  }

  db.query(
    "UPDATE team_members SET is_active=? WHERE id=?",
    [is_active, id],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to update member status",
          error: err,
        });
      }

      res.json({
        success: true,
        message: "Status updated successfully",
      });
    },
  );
};

export const getActiveTeamMembers = (req, res) => {
  db.query(
    "SELECT * FROM team_members WHERE is_active=1 ORDER BY id",
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to fetch active team members",
          error: err,
        });
      }

      res.json({
        success: true,
        data: rows.map((item) => ({
          ...item,
          // image: item.image ? `${REACT_BASE_URL}/uploads/team/${item.image}` : null,
        })),
      });
    },
  );
};

export const getInactiveTeamMembers = (req, res) => {
  db.query(
    "SELECT * FROM team_members WHERE is_active=0 ORDER BY id",
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to fetch inactive team members",
          error: err,
        });
      }

      res.json({
        success: true,
        data: rows.map((item) => ({
          ...item,
          // image: item.image ? `${REACT_BASE_URL}/uploads/team/${item.image}` : null,
        })),
      });
    },
  );
};

export const getTeamMemberById = (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid member ID",
    });
  }

  db.query("SELECT * FROM team_members WHERE id = ?", [id], (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch team member",
        error: err,
      });
    }

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    const member = rows[0];

    res.status(200).json({
      success: true,
      message: "Team member fetched successfully",
      data: {
        ...member,
        // image: member.image ? `${REACT_BASE_URL}/uploads/team/${member.image}` : null,
      },
    });
  });
};

export default {
  getTeamSection,
  updateTeamSection,
  addTeamMember,
  deleteTeamMember,
  getTeamMembers,
  updateTeamMemberStatus,
  getActiveTeamMembers,
  getTeamMemberById,
  getInactiveTeamMembers,
  updateTeamMemberById,
};
