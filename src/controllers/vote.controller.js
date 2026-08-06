const { VoteModel } = require('../models/vote.model.js');
const ApiError = require('../utils/apiError.js');
const pool = require('../config/db.js');
const { sendLiveNotification, broadcastComplaintVote } = require('./socket.controller.js');

const handleVote = async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user_id;
    const { vote_type } = req.body;

    if (![1, -1].includes(vote_type)) {
      return next(new ApiError(400, "Invalid vote_type. Must be 1 (Upvote) or -1 (Downvote)."));
    }

    const result = await VoteModel.upsertOrDeleteVote(complaintId, userId, vote_type);

    // Fetch updated upvote and downvote counts
    const countsResult = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN vote_type = 1 THEN 1 ELSE 0 END), 0)::int as upvote_count,
         COALESCE(SUM(CASE WHEN vote_type = -1 THEN 1 ELSE 0 END), 0)::int as downvote_count
       FROM complaint_votes 
       WHERE complaint_id::text = $1`,
      [complaintId]
    );

    const { upvote_count, downvote_count } = countsResult.rows[0];

    // Determine the current user's vote type from result
    let user_vote = null;
    if (result.action !== 'removed') {
      user_vote = result.voteType !== undefined ? result.voteType : (result.vote ? result.vote.vote_type : vote_type);
    }

    // Broadcast live vote count to anyone currently viewing this complaint thread
    broadcastComplaintVote(complaintId, {
      complaint_id: complaintId,
      upvote_count,
      downvote_count,
    });

    // Notify the complaint owner if someone else voted on their complaint
    const complaintRes = await pool.query(
      `SELECT citizen_id, title FROM complaints WHERE id::text = $1`,
      [complaintId]
    );
    const complaint = complaintRes.rows[0];

    if (complaint && complaint.citizen_id !== userId && result.action !== 'removed') {
      const voterUser = await pool.query(`SELECT name FROM users WHERE id = $1`, [userId]);
      const voterName = voterUser.rows[0]?.name || "Someone";
      const actionText = vote_type === 1 ? "upvoted" : "downvoted";

      sendLiveNotification(complaint.citizen_id, {
        type: "COMPLAINT_VOTE",
        title: "New Vote on Your Complaint",
        message: `${voterName} ${actionText} your complaint.`,
        complaint_id: complaintId,
        created_at: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: `Vote successfully ${result.action}.`,
      upvote_count,
      downvote_count,
      user_vote
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