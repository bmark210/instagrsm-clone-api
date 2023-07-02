import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
});
const likesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
});

const PostSchema = new mongoose.Schema(
  {
    image: {
      type: Object,
      required: true,
    },
    text: {
      type: String,
    },
    place: {
      type: String,
    },
    comments: [commentSchema],
    tags: {
      type: String,
    },
    likes: [likesSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Post", PostSchema);
