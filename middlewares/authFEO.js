import jwt from "jsonwebtoken";

const authFEO = async (req, res, next) => {
  try {
    const token = req.headers.dtoken;
    if (!token) {
      return res.json({ success: false, message: "Not Authorized. Login Again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ safer: attach to req instead of req.body
    req.feoId = decoded.id;

    next();
  } catch (error) {
    console.error("authFEO error:", error);
    res.json({ success: false, message: "Authentication failed" });
  }
};

export default authFEO;
