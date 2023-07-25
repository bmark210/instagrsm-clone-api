import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import UserModel from "../models/User.js";
import mongoose from "mongoose";

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
    const user = await UserModel.findById(req.params.id)
      .select("_id username avatar")
      .exec();

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

export const getStories = async (req, res) => {
  try {
    const usersWithStorys = await UserModel.aggregate([
      {
        $project: {
          _id: 1,
          username: 1,
          avatar: 1,
        },
      },
    ]).limit(8);
    res.json(usersWithStorys);
  } catch (error) {
    console.log(error);
    res.json({
      message: "Failed to get stories",
    });
  }
};

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
  const user = await UserModel.findById(userId);
  try {
    let suggestions = [];

    if (user.following.length === 0) {
      // If user is not following anyone, get users with the most followers
      const usersWithMostFollowers = await UserModel.aggregate([
        { $project: { _id: 1, followersCount: { $size: "$followers" } } },
        { $sort: { followersCount: -1 } },
        { $limit: 5 },
      ]).exec();

      suggestions = usersWithMostFollowers.filter(
        (user) => user._id.toString() !== req.userId
      );
    } else {
      const followingIds = user.following.map((id) => id.toString());

      const usersYouDontFollowBack = await UserModel.find({
        _id: { $nin: [userId, ...followingIds] },
      })
        .limit(5 - suggestions.length) // Limit to remaining slots in suggestions
        .select("_id")
        .exec();

      suggestions = suggestions.concat(usersYouDontFollowBack);
    }
    res.json(suggestions);
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addAllSuggestions = async (req, res) => {
  const userId = req.userId;
  const user = await UserModel.findById(userId);
  try {
    let suggestions = [];

    if (user.following.length === 0) {
      // If user is not following anyone, get users with the most followers
      const usersWithMostFollowers = await UserModel.aggregate([
        { $project: { _id: 1, followersCount: { $size: "$followers" } } },
        { $sort: { followersCount: -1 } },
      ]).exec();

      suggestions = usersWithMostFollowers.filter(
        (user) => user._id.toString() !== req.userId
      );
    } else {
      const followingIds = user.following.map((id) => id.toString());

      const usersYouDontFollowBack = await UserModel.find({
        _id: { $nin: [userId, ...followingIds] },
      })
        .select("_id")
        .exec();

      suggestions = suggestions.concat(usersYouDontFollowBack);
    }
    res.json(suggestions);
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export async function getUsersByQuery(req, res) {
  const { query } = req.query; // Extract the 'query' property from req.query
  try {
    const users = await UserModel.find({
      $or: [
        { email: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    });
    const aggregatedUsers = await UserModel.aggregate([
      {
        $match: {
          _id: { $in: users.map((user) => user._id) },
        },
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          username: 1,
          avatar: 1,
        },
      },
    ]);

    res.json(aggregatedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
