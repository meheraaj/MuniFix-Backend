const { CommentVoteModel } = require("../models/commentVote.model.js");
const { sendLiveNotification, broadcastCommentVote } = require("./socket.controller.js");
const ApiError = require("../utils/apiError.js");
const pool = require("../config/db.js");

// POST /api/complain/comments/:commentId/vote
const handleCommentVote = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { vote_type } = req.body || {};

    if (![1, -1].includes(vote_type)) {
      return next(new ApiError(400, "vote_type must be 1 (upvote) or -1 (downvote)."));
    }

    const comment = await CommentVoteModel.getCommentDetails(commentId);
    if (!comment) {
      return next(new ApiError(404, "Comment not found."));
    }

    const existingVote = await CommentVoteModel.findVote(commentId, req.user_id);
    let action = "";

    if (!existingVote) {
      await CommentVoteModel.addVote(commentId, req.user_id, vote_type);
      action = vote_type === 1 ? "upvoted" : "downvoted";
    } else if (existingVote.vote_type === vote_type) {
      // clicking same vote again removes it
      await CommentVoteModel.removeVote(commentId, req.user_id);
      action = "removed";
    } else {
      // flip vote type
      await CommentVoteModel.updateVote(commentId, req.user_id, vote_type);
      action = vote_type === 1 ? "switched_to_upvote" : "switched_to_downvote";
    }

    const updatedComment = await CommentVoteModel.getCommentDetails(commentId);

    // emit websocket update to everyone reading this complaint thread
    broadcastCommentVote(comment.complaint_id, {
      comment_id: commentId,
      upvote_count: updatedComment.upvote_count,
      downvote_count: updatedComment.downvote_count,
      score: updatedComment.score,
    });

    // notify comment owner if someone upvoted their work
    if (vote_type === 1 && action !== "removed" && comment.author_id !== req.user_id) {
      const voterUser = await pool.query(`SELECT name FROM users WHERE id = $1`, [req.user_id]);
      const voterName = voterUser.rows[0]?.name || "Someone";

      sendLiveNotification(comment.author_id, {
        type: "COMMENT_UPVOTE",
        title: "Comment Upvoted",
        message: `${voterName} upvoted your comment.`,
        comment_id: commentId,
        complaint_id: comment.complaint_id,
        created_at: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: `Comment vote ${action} successfully.`,
      data: {
        comment_id: commentId,
        current_user_vote: action === "removed" ? null : vote_type,
        upvote_count: updatedComment.upvote_count,
        downvote_count: updatedComment.downvote_count,
        score: updatedComment.score,
      },
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// GET /api/complain/comments/:commentId/voters
const getCommentVoters = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { type, limit = 20, offset = 0 } = req.query;

    const voters = await CommentVoteModel.getVotersByComment(commentId, type, limit, offset);

    return res.status(200).json({
      success: true,
      count: voters.length,
      voters,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

// PATCH /api/complain/comments/:commentId/pin
const pinComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { is_pinned } = req.body || {};

    if (typeof is_pinned !== "boolean") {
      return next(new ApiError(400, "is_pinned must be a boolean value."));
    }

    const comment = await CommentVoteModel.getCommentDetails(commentId);
    if (!comment) {
      return next(new ApiError(404, "Comment not found."));
    }

    // only admins or the original complaint author can pin solutions
    if (!["dept_admin", "super_admin"].includes(req.role)) {
      const complaintRes = await pool.query(`SELECT user_id FROM complaints WHERE id = $1`, [comment.complaint_id]);
      if (complaintRes.rows[0]?.user_id !== req.user_id) {
        return next(new ApiError(403, "Forbidden: Only admins or complaint authors can pin comments."));
      }
    }

    const updated = await CommentVoteModel.togglePinComment(commentId, is_pinned);

    return res.status(200).json({
      success: true,
      message: `Comment successfully ${is_pinned ? "pinned" : "unpinned"}.`,
      comment: updated,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

module.exports = {
  handleCommentVote,
  getCommentVoters,
  pinComment,
};