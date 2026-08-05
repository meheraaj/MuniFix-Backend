const { CommentModel } = require('../models/comment.model.js');
const ApiError = require('../utils/apiError.js');
const cloudinary = require('../config/cloudinary.js');

const postComment = async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user_id;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return next(new ApiError(400, "Comment content cannot be empty."));
    }

    let imageUrl = null;

    // Stream image buffer to Cloudinary if an image attachment was uploaded
    if (req.file) {
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        imageUrl = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "munifix/comments" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(req.file.buffer);
        });
      } else {
        // Mock fallback if Cloudinary credentials are not configured in environment
        imageUrl = `https://via.placeholder.com/600x400.png?text=Mock+Comment+Upload+${Date.now()}`;
      }
    }

    const newComment = await CommentModel.createComment(
      complaintId,
      userId,
      content.trim(),
      imageUrl
    );

    return res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: newComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return next(new ApiError(500, error.message || "Server error while posting comment."));
  }
};

const fetchComments = async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;

    const comments = await CommentModel.getCommentsByComplaintId(
      complaintId,
      limit,
      offset
    );

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return next(new ApiError(500, error.message || "Server error while fetching comments."));
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user_id;
    const userRole = req.role;

    const deleted = await CommentModel.deleteComment(
      commentId,
      userId,
      userRole
    );

    if (!deleted) {
      return next(new ApiError(403, "Unauthorized or comment not found."));
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return next(new ApiError(500, error.message || "Server error while deleting comment."));
  }
};

module.exports = {
  postComment,
  fetchComments,
  deleteComment,
};