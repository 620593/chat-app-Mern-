import User from "../models/user.model.js";
import { getOnlineUsers } from "../socket/socket.js";

// ─── Get users for sidebar ────────────────────────────────────────────────────
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find({ _id: { $ne: loggedInUserId } })
      .select("-password")
      .sort({ isOnline: -1, lastSeen: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("getUsersForSidebar error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Get user by ID ───────────────────────────────────────────────────────────
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("getUserById error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, username, profilePic } = req.body;

    const updateFields = {};
    if (fullName) updateFields.fullName = fullName;
    if (username) updateFields.username = username;
    if (profilePic) updateFields.profilePic = profilePic;

    // Check username uniqueness
    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: userId } });
      if (existing) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    }).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("updateProfile error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Update Settings ──────────────────────────────────────────────────────────
export const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { theme, notificationsEnabled, lastSeenVisibility } = req.body;

    const settingsFields = {};
    if (theme !== undefined) settingsFields["settings.theme"] = theme;
    if (notificationsEnabled !== undefined)
      settingsFields["settings.notificationsEnabled"] = notificationsEnabled;
    if (lastSeenVisibility !== undefined)
      settingsFields["settings.lastSeenVisibility"] = lastSeenVisibility;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: settingsFields },
      { new: true }
    ).select("settings");

    res.status(200).json(updatedUser.settings);
  } catch (error) {
    console.error("updateSettings error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Get Settings ─────────────────────────────────────────────────────────────
export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("settings");
    res.status(200).json(user.settings);
  } catch (error) {
    console.error("getSettings error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
