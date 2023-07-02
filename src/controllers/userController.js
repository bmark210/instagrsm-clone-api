import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import UserModel from "../models/User.js";

export const getSuggestions = async (req, res) => {
  console.log("req.body", req.body);

  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }
    res.json(user);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({
      message: "Не удалось найти пользователя",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );
    if (!isValidPass) {
      return res.status(400).json({
        message: "Неверный логин или пароль",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );
    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Не удалось авторизоваться" });
  }
};

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      username: req.body.username,
      passwordHash: hash,
      fullName: req.body.fullName,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );
    const { passwordHash, ...userData } = user._doc;
    res.json({
      ...userData,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Регистрация не удалась" });
  }
};
export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }
    const { passwordHash, ...userData } = user._doc;
    res.json({
      ...userData,
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "Нет доступа",
    });
  }
};

export const updateAvatar = async (req, res) => {
  const userId = req.userId;
  const avatarData = req.body.avatar;
  console.log("userId", userId);
  console.log("avatar", avatarData);

  try {
    if (avatarData) {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { avatar: avatarData ? avatarData : null },
        { new: true }
      );
      res.json({
        message: "success",
        user: updatedUser,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      message: "Failed to update avatar URL",
    });
  }
};

export const getOneByUsername = async (req, res) => {
  console.log("req.userId", req.userId);
  try {
    const user = await UserModel.findOne({ username: req.params.username });
    res.json(user);
  } catch (error) {
    console.log(error);
    res.json({
      message: "Не удалось найти пользователя",
    });
  }
};

export const getOneByUserId = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    res.json(user);
  } catch (error) {
    console.log(error);
    res.json({
      message: "Не удалось найти пользователя",
    });
  }
};

export const updateCaption = async (req, res) => {
  const bio = req.body.bio;
  const userId = req.userId;
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { bio: bio },
      { new: true }
    );
    res.json({
      message: "success",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "Failed to update caption",
    });
  }
};

export const updateFollowers = async (req, res) => {
  const userId = req.userId;
  const userIdToUpdateFollowers = req.body.userIdToUpdateFollowers;

  try {
    const user = await UserModel.findById(userIdToUpdateFollowers);
    if (user.followers.includes(userId)) {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userIdToUpdateFollowers,
        { $pull: { followers: userId } },
        { new: true }
      );
      res.json({
        message: "success",
        user: updatedUser,
      });
    } else {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userIdToUpdateFollowers,
        { $addToSet: { followers: userId } },
        { new: true }
      );
      res.json({
        message: "success",
        user: updatedUser,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      message: "Failed to update followers",
    });
  }
};

// const userId = req.userId;
//   const userIdToUpdateFollowers = req.body.userIdToUpdateFollowers;
//   console.log('userIdToUpdateFollowers', userIdToUpdateFollowers);
//   console.log('userId', userId);

//   try {
//     const updatedUser = await UserModel.findByIdAndUpdate(
//       userIdToUpdateFollowers,
//       { followers: userId },
//       { new: true }
//     );
//     res.json({
//       message: "success",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({
//       message: "Failed to update followers",
//     });
//   }

export const updateFollowings = async (req, res) => {
  const userId = req.userId;
  const userIdToFollow = req.body.userIdToFollow;

  try {
    const user = await UserModel.findById(userId);
    if (user.following.includes(userIdToFollow)) {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $pull: { following: userIdToFollow } },
        { new: true }
      );
      res.json({
        message: "success",
        user: updatedUser,
      });
    } else {
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $addToSet: { following: userIdToFollow } },
        { new: true }
      );
      res.json({
        message: "success",
        user: updatedUser,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      message: "Failed to update followers",
    });
  }
};

export const addSuggestions = async (req, res) => {
  const userId = req.userId;
  console.log("userId", userId);

  try {
    const usersWithMostFollowers = await UserModel.aggregate([
      { $project: { _id: 1, followersCount: { $size: "$followers" } } },
      { $sort: { followersCount: -1 } },
    ]);

    const userIdWithMostFollowers = usersWithMostFollowers[0]._id;
    console.log("userIdWithMostFollowers", userIdWithMostFollowers);

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { suggestionsList: userIdWithMostFollowers } },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("Failed to update user");
    }

    res.json({
      message: "Success",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to add suggestions",
      error: error.message,
    });
  }
};
