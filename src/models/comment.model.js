import pool from '../config/db.js';

export const CommentModel = {
  // Add comment to complaint
   
  async createComment(complaintId, userId, content, imageUrl = null) {
    const result = await pool.query(
      `INSERT INTO comments (complaint_id, user_id, content, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, complaint_id, user_id, content, image_url, created_at`,
      [complaintId, userId, content, imageUrl]
    );
    return result.rows[0];
  },

  //get comment for specific complaint
  async getCommentsByComplaintId(complaintId, limit = 20, offset = 0) {
    const result = await pool.query(
      `SELECT 
          c.id, 
          c.complaint_id, 
          c.content, 
          c.image_url, 
          c.created_at,
          c.upvote_count,
          c.downvote_count,
          c.score,
          u.id AS author_id,
          u.name AS author_name,
          u.role AS author_role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.complaint_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [complaintId, limit, offset]
    );
    return result.rows;
  },

  /**
   * Delete a comment by ID (Author or Admin)
   */
  async deleteComment(commentId, userId, userRole) {
    let query = `DELETE FROM comments WHERE id = $1`;
    let params = [commentId];

    if (!['dept_admin', 'super_admin'].includes(userRole)) {
      query += ` AND user_id = $2`;
      params.push(userId);
    }

    query += ` RETURNING id`;

    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }
};