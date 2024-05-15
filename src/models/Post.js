import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    image: {
      type: Object,
      required: true,
    },
    caption: {
      type: String,
    },
    place: {
      type: String,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    likes: [
      {
        type: String,
        required: true,
      },
    ],
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
