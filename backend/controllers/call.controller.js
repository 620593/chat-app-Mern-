import Call from "../models/call.model.js";

// ─── Get call history for current user ───────────────────────────────────────
export const getCallHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const calls = await Call.find({
      $or: [{ callerId: userId }, { receiverId: userId }],
    })
      .populate("callerId", "fullName username profilePic")
      .populate("receiverId", "fullName username profilePic")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(calls);
  } catch (error) {
    console.error("getCallHistory error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Get single call detail ───────────────────────────────────────────────────
export const getCallById = async (req, res) => {
  try {
    const call = await Call.findById(req.params.callId)
      .populate("callerId", "fullName username profilePic")
      .populate("receiverId", "fullName username profilePic");

    if (!call) return res.status(404).json({ error: "Call not found" });
    res.status(200).json(call);
  } catch (error) {
    console.error("getCallById error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
