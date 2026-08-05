##  Recent Database & API Updates

###  Database Schema & Migrations
- **Counter Columns Added:** Integrated `upvote_count`, `downvote_count`, and `comment_count` directly into the `complaints` table.
- **Voting Relational Table:** Created `complaint_votes` with a composite unique constraint `(complaint_id, user_id)` and strictly enforced `vote_type` values (`1` for upvote, `-1` for downvote).
- **Comments Relational Table:** Built `comments` table supporting text content and Cloudinary image attachments.
- **Query Performance Indexes:** Applied speed indexes (`idx_votes_lookup`, `idx_comments_complaint_paginated`) to optimize lookup speed and pagination.
- **Automated DB Triggers:** Implemented and re-bound PL/pgSQL database triggers (`update_complaint_vote_counts`, `update_complaint_comment_counts`) that automatically increment and decrement counter columns on `INSERT`, `UPDATE`, and `DELETE`.

---

###  API Endpoints & Controllers
- `POST /api/complain/:id/vote` – Cast, switch (upvote ↔ downvote), or toggle off votes for the authenticated user.
- `GET /api/complain/:id/voters` – Fetch list of users who voted on a complaint with optional filtering (`?type=1` or `?type=-1`).
- `GET /api/complain/:id/comments` – Retrieve paginated comments for a complaint, joining author metadata (`name`, `role`).
- `POST /api/complain/:id/comments` – Post a new comment with optional image attachments streamed directly to Cloudinary (`munifix/comments`).
- `DELETE /api/complain/comments/:commentId` – Delete a comment (restricted to comment owners or `dept_admin`/`super_admin`).



##  Future Roadmap & Feature Ideas

###  Comment Voting System
- Introduce upvoting and downvoting specifically for individual comments (`comment_votes` table).
- Highlight the most helpful or relevant community contributions at the top of complaint threads.

###  AI Auto-Reevaluation on High Downvotes
- Trigger an automated re-evaluation using Gemini API whenever a complaint's `downvote_count` crosses a critical threshold.
- Automatically adjust `ai_confidence_score`, flag potential duplicate/spam submissions, or escalate priority for administrative verification.

###  Duplicate Complaint Detection
- Perform text similarity matching and geospatial proximity checks upon submission to flag or merge duplicate issues reported in the same vicinity.

###  Real-time Notifications & WebSockets
- Implement WebSockets (Socket.io) or Web Push notifications to inform citizens in real-time when their complaints receive updates, votes, comments, or status changes.