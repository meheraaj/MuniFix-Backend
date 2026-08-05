const { VoteModel } = require('../models/vote.model.js');
const ApiError = require('../utils/apiError.js');

const handleVote = async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user_id;
    const { vote_type } = req.body;

    if (![1, -1].includes(vote_type)) {
      return next(new ApiError(400, "Invalid vote_type. Must be 1 (Upvote) or -1 (Downvote)."));
    }

    const result = await VoteModel.upsertOrDeleteVote(complaintId, userId, vote_type);

    return res.status(200).json({
      success: true,
      message: `Vote successfully ${result.action}.`,
      data: result
    });
  } catch (error) {
    console.error("Error processing vote:", error);
    return next(new ApiError(500, error.message || "Server error while processing vote."));
  }
};

const getComplaintVoters = async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const voteType = req.query.type; // Optional query filter: type=1 for upvoters, type=-1 for downvoters
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;

    const voters = await VoteModel.getVotersByComplaint(complaintId, voteType, limit, offset);

    return res.status(200).json({
      success: true,
      count: voters.length,
      voters
    });
  } catch (error) {
    console.error("Error fetching voters:", error);
    return next(new ApiError(500, error.message || "Failed to fetch voter list."));
  }
};

module.exports = {
  handleVote,
  getComplaintVoters
};