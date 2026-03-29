import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
	try {
		const { fullName, username, password, confirmPassword, gender, profilePic } = req.body;

		if (password !== confirmPassword) {
			return res.status(400).json({ error: "Passwords don't match" });
		}

		const user = await User.findOne({ username });

		if (user) {
			return res.status(400).json({ error: "Username already exists" });
		}

		// HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Prepare Emoji-based Profile Pictures
		const boyEmojis = ["👨", "🧑", "👨‍🦱", "👨‍🦰", "👱‍♂️", "👨‍🦳", "👨‍🦲", "🧔", "🦸‍♂️", "🥷", "👮‍♂️", "🕵️‍♂️", "💂‍♂️", "👷‍♂️", "🤴", "👳‍♂️", "👲", "🧝‍♂️", "🧙‍♂️", "🧛‍♂️", "🧟‍♂️", "🦹‍♂️", "🧜‍♂️"];
		const girlEmojis = ["👩", "👧", "👩‍🦱", "👩‍🦰", "👱‍♀️", "👩‍🦳", "👩‍🦲", "🦸‍♀️", "🥷", "👮‍♀️", "🕵️‍♀️", "💂‍♀️", "👷‍♀️", "👸", "👳‍♀️", "🧕", "🧝‍♀️", "🧙‍♀️", "🧛‍♀️", "🧟‍♀️", "🦹‍♀️", "🧜‍♀️"];

		const randomEmoji = gender === "male" 
			? boyEmojis[Math.floor(Math.random() * boyEmojis.length)] 
			: girlEmojis[Math.floor(Math.random() * girlEmojis.length)];
		
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${randomEmoji}</text></svg>`;
		const profilePicDataUri = profilePic || `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

		const newUser = new User({
			fullName,
			username,
			password: hashedPassword,
			gender,
			profilePic: profilePicDataUri,
		});

		if (newUser) {
			// Generate JWT token here
			generateTokenAndSetCookie(newUser._id, res);
			await newUser.save();

			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				profilePic: newUser.profilePic,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);

		console.log(`[AUTH] Login successful for user: ${username}`);
		console.log(`[AUTH] Set-Cookie header being sent: ${res.getHeader("set-cookie") ? "YES" : "NO"}`);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			profilePic: user.profilePic,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
