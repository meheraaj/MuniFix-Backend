const pool = require('../config/db.js');

const VoteModel = {
  async upsertOrDeleteVote(complaintId, userId, voteType) {
    const existingVote = await pool.query(
      `SELECT id, vote_type FROM complaint_votes WHERE complaint_id::text = $1 AND user_id::text = $2`,
      [complaintId, userId]
    );

    if (existingVote.rows.length > 0) {
      const currentVote = existingVote.rows[0].vote_type;

      if (currentVote === voteType) {
        // Remove vote
        await pool.query(
          `DELETE FROM complaint_votes WHERE complaint_id::text = $1 AND user_id::text = $2`,
          [complaintId, userId]
        );
        return { action: 'removed', voteType: null };
      } else {
        // Update vote type (e.g. upvote -> downvote)
        const result = await pool.query(
          `UPDATE complaint_votes SET vote_type = $1 WHERE complaint_id::text = $2 AND user_id::text = $3 RETURNING *`,
          [voteType, complaintId, userId]
        );
        return { action: 'updated', vote: result.rows[0] };
      }
    }

    // Insert new vote
    const result = await pool.query(
      `INSERT INTO complaint_votes (complaint_id, user_id, vote_type) VALUES ($1, $2, $3) RETURNING *`,
      [complaintId, userId, voteType]
    );
    return { action: 'created', vote: result.rows[0] };
  },

  // Get user's current vote on a specific complaint
  async getUserVote(complaintId, userId) {
    const result = await pool.query(
      `SELECT vote_type FROM complaint_votes WHERE complaint_id::text = $1 AND user_id::text = $2`,
      [complaintId, userId]
    );
    return result.rows[0] || null;
  },

  // Retrieve paginated list of voters for a complaint
  async getVotersByComplaint(complaintId, voteType = null, limit = 20, offset = 0) {
    let query = `
      SELECT 
        v.vote_type,
        v.created_at AS voted_at,
        u.id AS user_id,
        u.name AS user_name,
        u.avatar_url
      FROM complaint_votes v
      JOIN users u ON v.user_id = u.id
      WHERE v.complaint_id::text = $1
    `;
    const params = [complaintId];

    if (voteType !== null && voteType !== undefined) {
      params.push(parseInt(voteType, 10));
      query += ` AND v.vote_type = $${params.length}`;
    }

    query += ` ORDER BY v.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }
};

module.exports = { VoteModel };