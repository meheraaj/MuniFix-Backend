const {
  createComplaint,
  getComplaint,
  manualAssignComplaint,
  searchComplaints,
  overrideCategory,
} = require("../../../src/controllers/complain.controller");
const { ComplainModel } = require("../../../src/models/complain.model");
const pool = require("../../../src/config/db");

jest.mock("../../../src/models/complain.model");
jest.mock("../../../src/config/db", () => ({
  query: jest.fn(),
}));

describe("Complain Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      headers: {},
      user_id: "user-123",
      role: "citizen",
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("createComplaint (Emergency Bypass Path)", () => {
    it("should bypass external Gemini AI when is_emergency is true and issue notifications", async () => {
      req.body = {
        description: "Severe fire and electric wire risk near school",
        is_emergency: "true",
      };

      ComplainModel.createComplaint.mockResolvedValueOnce({
        id: "emerg-1",
        description: req.body.description,
        priority: "critical",
        status: "pending",
      });
      ComplainModel.createStatusHistory.mockResolvedValueOnce({});
      
      // Activity log query
      pool.query.mockResolvedValueOnce({});
      // Admin lookup query for emergency notification dispatch
      pool.query.mockResolvedValueOnce({
        rows: [{ id: "admin-1" }],
      });
      // Insert notification query
      pool.query.mockResolvedValueOnce({});

      await createComplaint(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Emergency dispatch sent successfully",
        })
      );
    });
  });

  describe("getComplaint", () => {
    it("should return complaint details with assignments and status history", async () => {
      req.params.id = "comp-1";

      ComplainModel.getComplaintById.mockResolvedValueOnce({
        id: "comp-1",
        description: "Broken road",
      });
      ComplainModel.getAssignment.mockResolvedValueOnce({
        worker_id: "w-1",
      });
      ComplainModel.getStatusHistory.mockResolvedValueOnce([
        { old_status: "none", new_status: "pending" },
      ]);

      await getComplaint(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          complaint: expect.anything(),
          assignment: expect.anything(),
          history: expect.anything(),
        })
      );
    });
  });

  describe("manualAssignComplaint", () => {
    it("should require either worker_id or department_id", async () => {
      req.params.id = "comp-1";
      req.body = {}; // empty override

      await manualAssignComplaint(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it("should override AI department assignment and assign field worker", async () => {
      req.params.id = "comp-1";
      req.role = "dept_admin";
      req.body = { worker_id: "w-50", department_id: "2", notes: "Manual override" };

      ComplainModel.getComplaintById.mockResolvedValueOnce({
        id: "comp-1",
        status: "pending",
      });
      ComplainModel.updateComplaint.mockResolvedValue({
        id: "comp-1",
        status: "assigned",
      });
      ComplainModel.assignComplaint.mockResolvedValueOnce({ id: "assign-1" });
      ComplainModel.createStatusHistory.mockResolvedValueOnce({});

      // Activity logs
      pool.query.mockResolvedValue({});

      await manualAssignComplaint(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Complaint manual assignment processed successfully.",
        })
      );
    });
  });

  describe("searchComplaints", () => {
    it("should map search parameters and query complaints model", async () => {
      req.role = "citizen";
      req.query = {
        q: "waterlogging",
        category: "water",
        status: "in progress",
        priority: "high",
        date: "today",
      };

      ComplainModel.searchComplaints.mockResolvedValueOnce([
        { id: "comp-1", description: "Waterlogging near GEC" },
      ]);

      await searchComplaints(req, res, next);

      expect(ComplainModel.searchComplaints).toHaveBeenCalledWith({
        q: "waterlogging",
        category: "Waterlogging",
        status: "in_progress",
        priority: "high",
        date: "today",
        role: "citizen",
        user_id: "user-123",
        department_id: null,
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("overrideCategory", () => {
    it("should restrict category override to admins", async () => {
      req.role = "citizen";
      req.params.id = "comp-1";
      req.body = { category: "Road Repair" };

      await overrideCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it("should allow dept_admin to override AI predicted category", async () => {
      req.role = "dept_admin";
      req.params.id = "comp-1";
      req.body = { category: "Road Repair" };

      ComplainModel.getComplaintById.mockResolvedValueOnce({
        id: "comp-1",
        category: "Other",
      });
      ComplainModel.updateComplaint.mockResolvedValueOnce({
        id: "comp-1",
        category: "Road Repair",
        ai_override: true,
      });
      ComplainModel.createStatusHistory.mockResolvedValueOnce({});
      pool.query.mockResolvedValueOnce({}); // Activity log query

      await overrideCategory(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });
});