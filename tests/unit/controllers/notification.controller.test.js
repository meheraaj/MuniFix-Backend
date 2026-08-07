const {
  getNotifications,
  markAsRead,
} = require("../../../src/controllers/notification.controller");
const pool = require("../../../src/config/db");

jest.mock("../../../src/config/db", () => ({
  query: jest.fn(),
}));

describe("Notification Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, user_id: "user-uuid-123" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("getNotifications", () => {
    it("should return 401 if req.user_id is missing", async () => {
      req.user_id = null;

      await getNotifications(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, message: "Unauthorized" })
      );
    });

    it("should return notifications list on success", async () => {
      const mockNotifications = [
        { id: "1", message: "Test alert", is_read: false },
      ];
      pool.query.mockResolvedValueOnce({ rows: mockNotifications });

      await getNotifications(req, res, next);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [
        "user-uuid-123",
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        notifications: mockNotifications,
      });
    });
  });

  describe("markAsRead", () => {
    it("should return 404 if notification was not found or access denied", async () => {
      req.params.id = "notif-1";
      pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      await markAsRead(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: "Notification not found or access denied",
        })
      );
    });

    it("should mark notification as read successfully", async () => {
      req.params.id = "notif-1";
      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: "notif-1", is_read: true }],
      });

      await markAsRead(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Marked as read",
      });
    });
  });
});