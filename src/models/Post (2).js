import mongoose from "mongoose";

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
    comments: [
      {
        userId: {
          type: String,
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
