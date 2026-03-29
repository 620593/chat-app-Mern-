import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});

	const nodeEnv = process.env.NODE_ENV || "production";
	const isProduction = nodeEnv === "production";

	res.cookie("jwt", token, {
		maxAge: 15 * 24 * 60 * 60 * 1000, // MS
		httpOnly: true, // prevent XSS attacks cross-site scripting attacks
		sameSite: isProduction ? "none" : "lax",
		secure: isProduction,
	});
};

export default generateTokenAndSetCookie;
