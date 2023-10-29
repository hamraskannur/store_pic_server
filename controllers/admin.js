import bcrypt from "bcrypt";

import { generateToken } from "../utils/jws.js";
import UserCollection from "../models/user.js";

const saltRounds = 10;
const passwordPattern =
  /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (email != "admin@gmail.com" || !password)
      return res.send({ message: "Email or password wrong ", status: false });
    if (!passwordPattern.test(password))
      return res.send({
        message:
          "Password contain minimum 6 letters and combination of Alphabets and numbers and a special character",
        status: false,
      });

    const findAdmin = await UserCollection.findOne({ email });
    if (findAdmin && findAdmin.admin) {
      const passwordVerify = await bcrypt.compare(password, findAdmin.password);
      if (passwordVerify) {
        const token = await generateToken({
          id: findAdmin._id.toString(),
        });

        res.status(200).send({
          message: "",
          status: true,
          token: token,
        });
      } else {
        res.send({ message: " Password is wrong", status: false });
      }
    } else {
      res.send({ message: "wrong Email", status: false });
    }
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await UserCollection.find({ admin: { $ne: true } }).select('-password');
    res.status(200).send({message: "" ,status: true , users: users});

  } catch (error) {
    next(error);
  }
};

export const blockUser = async (req, res, next) => {
    try {
       // Assuming you have the user's ID as a parameter in your request
       const userId = req.params.userId;

       // Find the user by ID
       const user = await UserCollection.findById(userId);
   
       if (!user) {
         return res.status(404).json({ message: 'User not found', status: false });
       }
   
       // Toggle the "status" field
       user.status = !user.status;
   
       // Save the updated user document
       await user.save();
   
       // Respond with the updated user document
       res.json({ message: 'User status updated', status: true, user });
   
  
    } catch (error) {
      next(error);
    }
  };
