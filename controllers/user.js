import mongoose from "mongoose";
import bcrypt from "bcrypt";
import sharp from "sharp";
import fetch from "node-fetch";
import { promises as fsPromises } from "fs";
import { v4 as uuidv4 } from "uuid";

import { generateToken } from "../utils/jws.js";
import UserCollection from "../models/user.js";
import imageSchema from "../models/image.js";

const saltRounds = 10;
const passwordPattern =
  /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.send({ message: "Email or password wrong ", status: false });
    if (!passwordPattern.test(password))
      return res.send({
        message:
          "Password contain minimum 6 letters and combination of Alphabets and numbers and a special character",
        status: false,
      });

    const findUser = await UserCollection.findOne({ email });
    if (findUser) {
      const passwordVerify = await bcrypt.compare(password, findUser.password);
      if (passwordVerify) {
        const token = await generateToken({
          id: findUser._id.toString(),
        });

        if (!findUser.status) {
          res.status(200).send({
            message: "",
            user: findUser,
            status: true,
            token: token,
          });
        } else {
          res.send({
            message: "Admin blocked please sent email from admin",
            status: false,
          });
        }
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

export const singup = async (req, res, next) => {
  let status = false;
  let message = "";
  try {
    const { email, password, userName } = req.body;
    const user = await UserCollection.findOne({ email });
    const newKey = uuidv4();

    if (user) {
      message = "Email Exist";
      res.json({ message, status });
    } else {
      const existName = await UserCollection.findOne({ username: userName });
      if (existName) {
        message = "userName Exist";
        return res.json({ message, status });
      }

      const user = await new UserCollection({
        username: userName,
        email,
        password: await bcrypt.hash(password, saltRounds),
        key:newKey
      }).save();
      const token = await generateToken({
        id: user._id.toString(),
      });
      message = "successfully registered";
      status = true;
      res.status(201).json({ message, status, token, user });
    }
  } catch (error) {
    next(error);
  }
};

export const upload = async (req, res, next) => {
  try {
    const { expirationTime, userId } = req.body;
    let expirationDate = new Date();

    if (req.fileValidationError) {
      return res.json({
        message: "File size exceeds the limit (10MB)",
        success: false,
      });
    }

    if (expirationTime != 0) {
      expirationDate.setTime(
        expirationDate.getTime() + expirationTime * 24 * 60 * 60 * 1000
      );
    } else {
      expirationDate = null;
    }

    const url = req.protocol + "://" + req.get("host");
    const imageUrl = url + "/" + req.file.filename;
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch the image");
    }

    const imageBuffer = await response.buffer();

    const thumbnailBuffer = await sharp(imageBuffer) // Use the imageBuffer
      .resize(100, 75)
      .toBuffer();

    const thumbnailBase64 = thumbnailBuffer.toString("base64");

    const image = new imageSchema({
      image: imageUrl,
      userId: userId,
      Thumbnail: `data:image/jpeg;base64,${thumbnailBase64}`,
      expiration: expirationDate,
      fullLink: "",
      html: "",
      thumbnailHtml: "",
    });

    image._id = image._id;

    image.fullLink = `${process.env.BASE_URL}/#/oneImage/${image._id}`;
    image.html = `<a href="${process.env.BASE_URL}/#/oneImage/${image._id}"><img src="${image.image}" alt="pexels-efe-ersoy-17102321" border="0" /></a>`;
    image.thumbnailHtml = `<a href="${process.env.BASE_URL}/#/oneImage/${image._id}"><img src="${image.Thumbnail}" border="0" /></a>`;

    await image.save();

    res.status(200).json({
      message: "image fetched successfully",
      image,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const user = await UserCollection.findById(userId).select("-password");
    return res.json({
      message: "comments fetched successfully",
      user: user,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllImages = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const images = await imageSchema.find({ userId }).sort({ $natural: -1 });

    return res.json({
      message: "images fetched successfully",
      images,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getOneImages = async (req, res, next) => {
  try {
    const id = req.params.imageId;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({
        message: "not fetched image",
        success: false,
      });
    }
    const image = await imageSchema.findOne({ _id: id }).sort({ $natural: -1 });
    if (image) {
      return res.json({
        message: "images fetched successfully",
        image,
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const imageId = req.params.imageId;
    const image = await imageSchema.findById(imageId);
    if (!image) {
      return res.json({ success: false, message: "Image not found" });
    }

    if (image.userId != req.body.userId) {
      return res.json({ success: false, message: "key not valid" });
    }

    // Delete the image from the file system
    const imageFilePath = `public/${image.image.split("/").pop()}`;

    await fsPromises.unlink(imageFilePath);

    // Delete the image from the database
    await imageSchema.findByIdAndDelete(imageId);

    res.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateUserImage = async (req, res, next) => {
  try {
    const { userId, username } = req.body;


    if (req.fileValidationError) {
      return res.json({
        message: "File size exceeds the limit (10MB)",
        success: false,
      });
    }

    // Find the user by ID
    const user = await UserCollection.findById(userId);
    const existUser = await UserCollection.findOne({ username: username });

    if (existUser && userId != existUser._id) {
      return res.json({ message: "exist User Name", success: false });
    }

    if (!user) {
      return res.json({ message: "User not found", success: false });
    }


    if (req.file.filename) {
      if(user.profileImage){
        try {
          await fsPromises.unlink(`public/${user.profileImage.split('/').pop()}`);
        } catch (error) {
          
        }
      }
      const url = req.protocol + "://" + req.get("host");
      const imageUrl = url + "/" + req.file.filename;
      user.profileImage = imageUrl;
      user.username = username;
    }
    // Save the updated user document
    const updatedUser = await user.save();

    // Respond with the updated user document
    res.json({
      message: "User status updated",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserName = async (req, res, next) => {
  try {
    const { userId, username } = req.body;
    // Find the user by ID
    const user = await UserCollection.findById(userId);
    const existUser = await UserCollection.findOne({ username: username });
    if (existUser && userId != existUser._id) {
      return res.json({ message: "exist User Name", success: false });
    }
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    console.log(username);
    if (username != user.username) {
      user.username = username;
    } else {
      return res.json({
        message: "The user has already been updated",
        status: true,
      });
    }
    // Save the updated user document
    const updatedUser = await user.save();

    // Respond with the updated user document
    res.json({
      message: "User data updated",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const changeKey = async (req, res, next) => {
  try {
    const { userId } = req.body;

    // Generate a new unique key
    const newKey = uuidv4();

    // Update the user's key in the database
    const updatedUser = await UserCollection.findOneAndUpdate(
      { _id: userId },
      { key: newKey },
      { new: true, fields: { password: 0 } } // Return the updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the updated user object as a response
    res.json({
      success: true,
      message: "Key updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
