const pool = require("../config/db.js");

const CommentVoteModel = {
  async findVote(comment_id, user_id) {
    const query = `SELECT * FROM comment_votes WHERE comment_id = $1 AND user_id = $2;`;
    const result = await pool.query(query, [comment_id, user_id]);
    return result.rows[0] || null;
  },

  async addVote(comment_id, user_id, vote_type) {
    const query = `
      INSERT INTO comment_votes (comment_id, user_id, vote_type)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const result = await pool.query(query, [comment_id, user_id, vote_type]);
    return result.rows[0];
  },

  async updateVote(comment_id, user_id, vote_type) {
    const query = `
      UPDATE comment_votes
      SET vote_type = $1, updated_at = CURRENT_TIMESTAMP
      WHERE comment_id = $2 AND user_id = $3
      RETURNING *;
    `;
    const result = await pool.query(query, [vote_type, comment_id, user_id]);
    return result.rows[0];
  },

  async removeVote(comment_id, user_id) {
    const query = `
      DELETE FROM comment_votes
      WHERE comment_id = $1 AND user_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [comment_id, user_id]);
    return result.rows[0];
  },

  async getCommentDetails(comment_id) {
    const query = `
      SELECT c.id, c.complaint_id, c.user_id AS author_id, c.upvote_count, c.downvote_count, c.score, c.is_pinned
      FROM comments c
      WHERE c.id = $1;
    `;
    const result = await pool.query(query, [comment_id]);
    return result.rows[0] || null;
  },

  async getVotersByComment(comment_id, type = null, limit = 20, offset = 0) {
    let query = `
      SELECT cv.vote_type, cv.created_at AS voted_at,
             u.id AS user_id, u.name, u.role, u.avatar_url
      FROM comment_votes cv
      JOIN users u ON cv.user_id = u.id
      WHERE cv.comment_id = $1
    `;
    const values = [comment_id];

    if (type !== null) {
      query += ` AND cv.vote_type = $2`;
      values.push(parseInt(type, 10));
    }

    query += ` ORDER BY cv.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2};`;
    values.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await pool.query(query, values);
    return result.rows;
  },

  async togglePinComment(comment_id, is_pinned) {
    const query = `
      UPDATE comments
      SET is_pinned = $1
      WHERE id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [is_pinned, comment_id]);
    return result.rows[0];
  }
};

module.exports = { CommentVoteModel };