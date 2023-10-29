
import userSchema from "../models/user.js";


const keyCheckMiddleware = async (req, res, next) => {
  try {
    const key = req.params.key;

    const user = await userSchema.findOne({ key });

    if (user) { 
        req.body.userId=user._id
        next()
      } else {
        res.status(404).json({ message: 'auth failed' });
      }
  
  } catch (error) {
    return res.status(401).send({
      message: "auth failed",
      success: false,
    });
  }
};
export default keyCheckMiddleware;
