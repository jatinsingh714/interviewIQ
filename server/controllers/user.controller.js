import User from "../models/user.model.js"

export const getCurrentUser = async (req, res) => {
    try {
      console.log("req.userId:", req.userId);   // 🔥 debug
  
      if (!req.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
  
      const user = await User.findById(req.userId);
  
      if (!user) {
        return res.status(404).json({ message: "user does not found" });
      }
  
      return res.status(200).json(user);
    } catch (error) {
      console.log("Controller Error:", error);  // 🔥 IMPORTANT
      return res.status(500).json({ message: error.message });
    }
  };