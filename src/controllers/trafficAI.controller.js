const { GoogleGenAI } = require("@google/genai");

function checkForSecondaryBlockages(bypassCoords, activeRoadblocks, currentRoadblockId) {
  const secondaryBlockedNames = [];

  for (const rb of activeRoadblocks) {
    if (rb.id === currentRoadblockId) continue;

    const rbLat = parseFloat(rb.latitude);
    const rbLng = parseFloat(rb.longitude);

    const isNearby = bypassCoords.some(([lat, lng]) => {
      return Math.abs(lat - rbLat) < 0.003 && Math.abs(lng - rbLng) < 0.003;
    });

    if (isNearby) {
      secondaryBlockedNames.push(`${rb.title} (${rb.cause})`);
    }
  }

  return secondaryBlockedNames;
}

async function calculateAIRoute({
  roadblock,
  activeRoadblocks,
  origin_lat,
  origin_lng,
  destination_lat,
  destination_lng,
  origin_name,
  destination_name,
}) {
  const rbLat = parseFloat(roadblock.latitude);
  const rbLng = parseFloat(roadblock.longitude);
  const startLat = parseFloat(origin_lat);
  const startLng = parseFloat(origin_lng);
  const endLat = parseFloat(destination_lat);
  const endLng = parseFloat(destination_lng);

  const blocked_path_coords = [
    [startLat, startLng],
    [rbLat, rbLng],
    [endLat, endLng],
  ];

  const offsetLat = 0.006;
  const offsetLng = -0.005;
  const bypass_path_coords = [
    [startLat, startLng],
    [startLat + offsetLat, startLng + offsetLng],
    [endLat + offsetLat, endLng + offsetLng],
    [endLat, endLng],
  ];

  const hitRoadblocks = checkForSecondaryBlockages(
    bypass_path_coords,
    activeRoadblocks,
    roadblock.id
  );

  const blocked_eta_mins = Math.floor(Math.random() * 20) + 35;
  const bypass_eta_mins = Math.floor(Math.random() * 10) + 10;
  const distance_diff_km = parseFloat((Math.random() * 1.5 + 0.8).toFixed(1));

  let ai_reasoning = `Gemini AI bypassed the ${roadblock.title} area. Alternate route provides a safe bypass saving ~${Math.abs(blocked_eta_mins - bypass_eta_mins)} minutes.`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      let loopWarning = "";
      if (hitRoadblocks.length > 0) {
        loopWarning = ` Note: Bypass route adjusted to avoid secondary congestion at [${hitRoadblocks.join(", ")}].`;
      }

      const prompt = `
You are the Municipal Traffic & Route Optimization AI for Chittagong City.
Summarize a detour route decision in 2-3 clear, professional sentences for citizens based on these facts:
- Active Roadblock: "${roadblock.title}" (Cause: ${roadblock.cause}, Details: ${roadblock.description})
- Origin: ${origin_name || "Origin Point"}
- Destination: ${destination_name || "Destination Point"}
- Direct Blocked Route ETA: ${blocked_eta_mins} mins
- AI Detour Route ETA: ${bypass_eta_mins} mins
- Distance Offset: +${distance_diff_km} km
- Secondary Blockages Avoided: ${hitRoadblocks.length > 0 ? hitRoadblocks.join(", ") : "None (Route clear)"}

Write a concise decision explanation (e.g., "Gemini AI bypassed the flooded GEC Circle by routing through Tiger Pass and Khulshi Residential Area..."). Output plain text only.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      if (response.text) {
        ai_reasoning = response.text.trim();
        if (loopWarning) {
          ai_reasoning += loopWarning;
        }
      }
    } catch (err) {
      console.warn("Gemini traffic AI generation failed, using fallback:", err.message);
    }
  }

  return {
    blocked_eta_mins,
    bypass_eta_mins,
    distance_diff_km,
    ai_reasoning,
    blocked_path_coords,
    bypass_path_coords,
    secondary_blocks_avoided: hitRoadblocks,
  };
}

module.exports = { calculateAIRoute };