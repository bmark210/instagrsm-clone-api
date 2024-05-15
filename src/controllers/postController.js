import PostModel from "../models/Post.js";
import UserModel from "../models/User.js";

export const getAll = async (req, res) => {
  const id = req.userId;
  const user = await UserModel.findById(id);
  const usersYoufollow = user.following.map((id) => id.toString());

  // Get all posts of users you follow and yours posts without comments, but if user commented
  // the post while created it will be getting in field "firstComment"
  try {
    const posts = await PostModel.find({
      user: { $in: [...usersYoufollow, id] },
    })
      .populate("user", "_id username avatar")
      .exec();

    const aggregatedPosts = await PostModel.aggregate([
      {
        $match: {
          _id: { $in: posts.map((post) => post._id) },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          image: 1,
          caption: 1,
          place: 1,
          createdAt: 1,
          commentsLength: { $size: "$comments" },
          likes: 1,
          user: {
            _id: "$user._id",
            username: "$user.username",
            avatar: "$user.avatar",
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    res.json(aggregatedPosts);
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
      place: req.body.place,
      user: req.userId,
      caption: req.body.text,
    });
    const post = await doc.save();

    // Update user's postsLength
    await UserModel.findByIdAndUpdate(req.userId, {
      $inc: { postsLength: 1 },
    });
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

export const getPopular = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate("user", "_id username avatar")
      .exec();

    const aggregatedPosts = await PostModel.aggregate([
      {
        $match: {
          _id: { $in: posts.map((post) => post._id) },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          image: 1,
          caption: 1,
          place: 1,
          createdAt: 1,
          commentsLength: { $size: "$comments" },
          likes: 1,
          likesLength: {
            $size: "$likes",
          },
          user: {
            _id: "$user._id",
            username: "$user.username",
            avatar: "$user.avatar",
          },
        },
      },
      {
        $match: {
          likesLength: { $gt: 2 },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    console.log("posts", aggregatedPosts);
    res.json(aggregatedPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllCreatedByUser = async (req, res) => {
  const { username } = req.params;
  const user = await UserModel.findOne({ username });
  try {
    const posts = await PostModel.find({ user: user._id })
      .populate("user")
      .exec();

    const aggregatedPosts = await PostModel.aggregate([
      {
        $match: {
          _id: { $in: posts.map((post) => post._id) },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          image: 1,
          caption: 1,
          place: 1,
          createdAt: 1,
          commentsLength: { $size: "$comments" },
          likes: 1,
          user: {
            _id: "$user._id",
            username: "$user.username",
            avatar: "$user.avatar",
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    res.json(aggregatedPosts);
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
      likes: userId,
    });

    if (isLiked) {
      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true }
      );
      res.json(updatedPost);
    } else {
      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true }
      );
      res.json(updatedPost);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await PostModel.findById(postId)
      .select("comments")
      .populate("comments.user", "_id username avatar")
      .exec();
    console.log("post", post);

    res.json(post.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.body.postId;
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      {
        $addToSet: {
          comments: {
            user: req.userId,
            comment: req.body.commentText,
          },
        },
      },
      { new: true }
    );
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
