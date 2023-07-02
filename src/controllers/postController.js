import mongoose from "mongoose";
import PostModel from "../models/Post.js";

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate("user", "_id username avatar")
      // .select("imageUrl text place comments createdAt likes")
      .sort({ createdAt: -1 })
      .exec();

    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не удалось найти статьи",
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      image: req.body.image,
      text: req.body.text,
      place: req.body.place,
      user: req.userId,
    });
    const post = await doc.save();
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to create a post",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPost = await PostModel.findOne({ _id: id })
      .populate("user")
      .exec();
    if (!updatedPost) {
      return res.status(404).json({ message: "Статья не найдена" });
    }
    res.json(updatedPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Не удалось получить статьи" });
  }
};

export const explore = async (req, res) => {
  try {
    const posts = await PostModel.aggregate([
      {
        $project: {
          imageUrl: 1,
          text: 1,
          place: 1,
          comments: 1,
          tags: 1,
          user: 1,
          likes: 1,
          likesLength: {
            $size: "$likes",
          },
        },
      },
      {
        $match: {
          likesLength: { $gt: 2 },
        },
      },
      // {
      //   $sort: { likesCount: -1 },
      // },
    ]).exec();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//

export const getAllCreatedByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const posts = await PostModel.find({ user: userId })
      .populate("user")
      .exec();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// likes
export const setPostLiked = async (req, res) => {
  try {
    const postId = req.body.postId;
    const userId = req.userId;

    const isLiked = await PostModel.findOne({
      _id: postId,
      "likes._id": userId,
    });

    if (isLiked) {
      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        { $pull: { likes: { _id: userId } } },
        { new: true }
      );
      res.json(updatedPost);
    } else {
      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: { _id: userId } } },
        { new: true }
      );
      res.json(updatedPost);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
