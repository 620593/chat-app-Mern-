import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    theme: { type: String, default: "dark" },
    notificationsEnabled: { type: Boolean, default: true },
    lastSeenVisibility: {
      type: String,
      enum: ["everyone", "contacts", "nobody"],
      default: "everyone",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    gender: { type: String, required: true, enum: ["male", "female"] },
    profilePic: { type: String, default: "" },

    // Presence
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },

    // Settings
    settings: { type: settingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
