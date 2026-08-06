const { TrafficModel } = require("../models/traffic.model.js");
const { calculateAIRoute } = require("../controllers/trafficAI.controller.js");
const ApiError = require("../utils/apiError.js");
const pool = require("../config/db.js");

const submitRoadblock = async (req, res, next) => {
  try {
    if (req.role === "citizen") {
      return next(
        new ApiError(
          403,
          "Forbidden: Citizens cannot create traffic roadblocks directly. Only municipal workers and administrators can submit."
        )
      );
    }

    if (!req.body) {
      return next(new ApiError(400, "Request body is required."));
    }

    const {
      title,
      description,
      cause,
      severity,
      latitude,
      longitude,
      affected_radius_meters,
      blocked_polyline,
      department_id,
    } = req.body;

    if (!title || !description || !latitude || !longitude) {
      return next(
        new ApiError(400, "title, description, latitude, and longitude are required.")
      );
    }

    const newRoadblock = await TrafficModel.createRoadblock({
      department_id: department_id ? parseInt(department_id, 10) : null,
      title: title.trim(),
      description: description.trim(),
      cause: cause || "waterlogging",
      severity: severity || "severe",
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      affected_radius_meters: affected_radius_meters || 300,
      blocked_polyline: blocked_polyline || null,
      created_by: req.user_id,
    });

    await pool.query(
      `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user_id,
        "roadblock_created",
        "roadblock",
        newRoadblock.id,
        `Active roadblock published: ${newRoadblock.title}`,
      ]
    ).catch((err) => console.error("Activity log error:", err));

    return res.status(201).json({
      success: true,
      message: "Roadblock published successfully.",
      roadblock: newRoadblock,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const getRoadblocks = async (req, res, next) => {
  try {
    const roadblocks = await TrafficModel.getActiveRoadblocks();
    return res.status(200).json({
      success: true,
      count: roadblocks.length,
      roadblocks,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const requestAIReroute = async (req, res, next) => {
  try {
    if (!req.body) {
      return next(new ApiError(400, "JSON request body is required."));
    }

    const {
      roadblock_id,
      origin_lat,
      origin_lng,
      destination_lat,
      destination_lng,
      origin_name,
      destination_name,
    } = req.body;

    if (!roadblock_id || !origin_lat || !origin_lng || !destination_lat || !destination_lng) {
      return next(
        new ApiError(
          400,
          "roadblock_id, origin_lat, origin_lng, destination_lat, and destination_lng are required."
        )
      );
    }

    // 1. Fetch roadblock record from database
    const roadblock = await TrafficModel.getRoadblockById(roadblock_id);
    if (!roadblock) {
      return next(new ApiError(404, "Roadblock not found."));
    }

    // 2. CHECK: If roadblock is inactive/resolved, do NOT run AI reasoning or route calculations
    if (!roadblock.is_active) {
      return next(
        new ApiError(
          400,
          "Roadblock is inactive or has been resolved. AI rerouting is disabled for resolved roadblocks."
        )
      );
    }

    // 3. Fetch active roadblocks for loop checking
    const activeRoadblocks = await TrafficModel.getActiveRoadblocks();

    // 4. Calculate route geometries & call Gemini AI reasoning only for active roadblocks
    const routeResults = await calculateAIRoute({
      roadblock,
      activeRoadblocks,
      origin_lat,
      origin_lng,
      destination_lat,
      destination_lng,
      origin_name: origin_name || "Selected Origin",
      destination_name: destination_name || "Target Destination",
    });

    // 5. Cache result
    const savedOptimization = await TrafficModel.saveRouteOptimization({
      roadblock_id,
      user_id: req.user_id || null,
      origin_name,
      destination_name,
      origin_lat,
      origin_lng,
      destination_lat,
      destination_lng,
      ...routeResults,
    });

    return res.status(200).json({
      success: true,
      message: "AI detour route generated successfully.",
      data: {
        optimization_id: savedOptimization.id,
        roadblock: {
          id: roadblock.id,
          title: roadblock.title,
          cause: roadblock.cause,
          severity: roadblock.severity,
          is_active: roadblock.is_active,
        },
        metrics: {
          blocked_eta_mins: routeResults.blocked_eta_mins,
          bypass_eta_mins: routeResults.bypass_eta_mins,
          distance_diff_km: routeResults.distance_diff_km,
          time_saved_mins: Math.max(0, routeResults.blocked_eta_mins - routeResults.bypass_eta_mins),
        },
        ai_reasoning: routeResults.ai_reasoning,
        paths: {
          blocked_path: routeResults.blocked_path_coords,
          bypass_path: routeResults.bypass_path_coords,
        },
      },
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

const updateRoadblockStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body || {};

    if (typeof is_active !== "boolean") {
      return next(new ApiError(400, "is_active must be a boolean value."));
    }

    const updated = await TrafficModel.updateRoadblockStatus(id, is_active);
    if (!updated) {
      return next(new ApiError(404, "Roadblock record not found."));
    }

    return res.status(200).json({
      success: true,
      message: `Roadblock successfully ${is_active ? "activated" : "deactivated/resolved"}.`,
      roadblock: updated,
    });
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

module.exports = {
  submitRoadblock,
  getRoadblocks,
  requestAIReroute,
  updateRoadblockStatus,
};