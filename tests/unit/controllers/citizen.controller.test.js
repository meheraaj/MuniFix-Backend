const {
  getComplainByUserId,
} = require("../../../src/controllers/citizen.controller");
const { ComplainModel } = require("../../../src/models/complain.model");

jest.mock("../../../src/models/complain.model");

describe("Citizen Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { query: {}, user_id: "citizen-123" };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should return 404 if user has no complaints", async () => {
    ComplainModel.userComplainList.mockResolvedValueOnce([]);

    await getComplainByUserId(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: "No complaints found",
      })
    );
  });

  it("should return formatted complaint list with pagination metadata", async () => {
    const mockDbComplaints = [
      {
        id: "comp-1",
        title: "Pothole",
        image_url: ["http://img.com/1.png"],
        created_at: "2026-01-01",
        description: "Large pothole on main road",
        longitude: 91.83,
        latitude: 22.35,
        street: "GEC Circle",
        city: "Chittagong",
      },
    ];

    ComplainModel.userComplainList.mockResolvedValueOnce(mockDbComplaints);

    await getComplainByUserId(req, res, next);

    expect(ComplainModel.userComplainList).toHaveBeenCalledWith(
      "citizen-123",
      10,
      0
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "1 complaints found",
      page: 1,
      limit: 10,
      hasMore: false,
      complaints: [
        {
          id: "comp-1",
          title: "Pothole",
          poster: ["http://img.com/1.png"],
          created_at: "2026-01-01",
          description: "Large pothole on main road",
          longitude: 91.83,
          latitude: 22.35,
          street: "GEC Circle",
          city: "Chittagong",
        },
      ],
    });
  });
});