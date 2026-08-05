Database Schema & Migrations

Added counter columns (upvote_count, downvote_count, comment_count) to the main complaints table.

Created the complaint_votes relational table with composite unique constraints (complaint_id, user_id) and type validation (1 for upvote, -1 for downvote).

Created the comments relational table supporting textual content and attached Cloudinary image URLs.

Created speed indexes (idx_votes_lookup, idx_comments_complaint_paginated) for fast pagination.

Created and re-bound automated PL/pgSQL database triggers (update_complaint_vote_counts, update_complaint_comment_counts) to automatically maintain counter totals on INSERT, UPDATE, or DELETE.

API Endpoints & Controllers

POST /api/complain/:id/vote: Handles casting, updating (switch upvote/downvote), and toggling off votes using req.user_id.

GET /api/complain/:id/voters: Fetches the list of users who upvoted or downvoted a complaint with optional filtering via ?type=1 or ?type=-1.

GET /api/complain/:id/comments: Returns paginated comments for a complaint, joining author details (name, role).

POST /api/complain/:id/comments: Accepts comments with optional image attachments streamed directly to Cloudinary (munifix/comments).

DELETE /api/complain/comments/:commentId: Allows comment owners or admins (dept_admin, super_admin) to delete comments.

Bug Fixes & Refactoring

Fixed SQLSTATE 42804 foreign key datatype mismatch between UUID / INTEGER references.

Fixed SQLSTATE 22P02 (invalid input syntax for type uuid: "NaN") by removing parseInt() on UUID parameters.

Refactored Model and Controller layers from ES module syntax (import/export) to CommonJS (require/module.exports) to align with app.js and db.js.

Updated Bruno testing collection documentation for all new endpoints.

🚀 Future Work & Roadmap Ideas
Comment Voting System

Add upvoting and downvoting specifically for individual comments (comment_votes table).

Allow citizens and admins to highlight the most helpful or relevant community comments on a complaint thread.

AI Auto-Reevaluation on High Downvotes

Trigger an automated AI check (using Gemini) if a complaint's downvote_count exceeds a set threshold (or if downvotes significantly outnumber upvotes).

Auto-adjust parameters like ai_confidence_score, flag potential spam/fake complaints, or escalate priority for administrative review.

Duplicate Complaint Detection

Run similarity checks on description text and geolocation proximity when a new complaint is filed to prevent duplicate entries for the same issue.

Real-time Notifications

Integrate WebSockets (Socket.io) or push notifications so citizens receive real-time updates when someone comments on or upvotes their complaint, or when status changes occur.