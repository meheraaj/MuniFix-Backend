const {
  createComplaint,
  listComplaints,
  updateStatus,
  deleteComplaint
} = require("../../../src/controllers/complain.controller");
const { ComplainModel } = require("../../../src/models/complain.model");
const pool = require("../../../src/config/db");

jest.mock("../../../src/models/complain.model");
jest.mock("../../../src/config/db", () => ({ query: jest.fn() }));

describe("Complain Controller Basic Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { 
      query: {}, 
      params: {}, 
      body: {}, 
      headers: {}, 
      user_id: "user-123", 
      role: "dept_admin" 
    };
    res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    next = jest.fn();
    pool.query.mockResolvedValue({ rows: [], rowCount: 1 });
  });

  afterEach(() => jest.clearAllMocks());

  it("createComplaint rejects empty description", async () => {
    req.body = { description: "" };
    await createComplaint(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it("listComplaints handles basic fetching", async () => {
    ComplainModel.getComplaints.mockResolvedValue([{ id: 1 }]);
    await listComplaints(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("updateStatus updates status & records history", async () => {
    req.params.id = "1";
    req.user_id = "user-123";
    req.role = "dept_admin";
    req.body = { status: "in_progress", notes: "Work started" };

    ComplainModel.getComplaintById.mockResolvedValue({ 
      id: 1, 
      status: "pending", 
      citizen_id: "user-123" 
    });
    ComplainModel.updateComplaint.mockResolvedValue({ 
      id: 1, 
      status: "in_progress", 
      citizen_id: "user-123" 
    });
    ComplainModel.createStatusHistory.mockResolvedValue({});

    await updateStatus(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("deleteComplaint deletes complaint successfully", async () => {
    req.params.id = "1";
    req.user_id = "user-123";
    ComplainModel.deleteComplaint.mockResolvedValue(true);

    await deleteComplaint(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});