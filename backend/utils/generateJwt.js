import jwt from "jsonwebtoken";
//generate token and set cookie
const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true, //prevent xss attack cross-site scripting attacks
    sameSite: "strict", //CSRF attack cross-site request forgery attacks
    secure: process.env.NODE_ENV === "development" ? true : false,
  });
};

export default generateToken;
