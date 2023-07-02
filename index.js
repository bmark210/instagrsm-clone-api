import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { loginValidation, registerValidation } from "./src/validation.js";
import handleValidationErrors from "./src/utils/handleValidationErrors.js";
import {
  imageController,
  postController,
  userController,
} from "./src/controllers/index.js";
import checkAuth from "./src/utils/getAuth.js";
import multer from "multer";

const app = express();
const port = 4444;

mongoose
  .connect(
    "mongodb+srv://markbaltenko:0uu1H5ykn2NekEJT@cluster0.9wmsj4c.mongodb.net/instagram-clone-db?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("DB ok!");
  })
  .catch((error) => {
    console.log("DB error", error);
  });

app.use(cors());

app.use(express.json());

// user req

app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  userController.login
);
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  userController.register
);

app.get("/auth/me", checkAuth, userController.getMe);

app.get("/users/:username", checkAuth, userController.getOneByUsername);

app.patch("/users/caption", checkAuth, userController.updateCaption);

app.patch("/users/avatar", checkAuth, userController.updateAvatar);

app.patch("/users/followers", checkAuth, userController.updateFollowers);

app.patch("/users/followings", checkAuth, userController.updateFollowings);

app.get("/users/suggestions", checkAuth, userController.getSuggestions);

// image req

const upload = multer({ storage: multer.memoryStorage() });

app.post(
  "/image",
  upload.single("image"),
  checkAuth,
  imageController.uploadImage
);

app.post(
  "/avatar",
  upload.single("avatar"),
  checkAuth,
  imageController.uploadAvatar
);

app.patch("/avatar", checkAuth, imageController.removeAvatar);

app.post("/image/remove/:id", checkAuth, imageController.removeImage);

// post req

app.post("/posts/create", checkAuth, postController.create);

app.get("/posts", checkAuth, postController.getAll);
app.get("/posts/explore", checkAuth, postController.explore);
app.get("/posts/:id", checkAuth, postController.getOne);
app.patch("/posts", checkAuth, postController.setPostLiked);
app.get("/posts/p/:userId", checkAuth, postController.getAllCreatedByUser);

app.listen(port, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log(`Server on port ${port} OK!`);
});
