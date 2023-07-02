import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../storage/firebase.js";

export const uploadImage = async (req, res) => {
  try {
    const storageRef = ref(storage, req.file.originalname);
    const metadata = {
      contentType: req.file.mimetype,
    };
    await uploadBytes(storageRef, req.file.buffer, metadata);

    const downloadURL = await getDownloadURL(storageRef);
    return res.send({
      name: req.file.originalname,
      type: req.file.mimetype,
      downloadURL: downloadURL,
    });
  } catch (err) {
    res.status(500).json({
      message: "Не удалось создать статью",
    });
  }
};

export const removeImage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const storageRef = ref(storage, id);
    await deleteObject(storageRef);
    return res.send({
      message: "succsessfully deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: "Не удалось удалить статью",
    });
  }
};

// userAvatar

export const uploadAvatar = async (req, res) => {
  try {
    const storageRef = ref(
      storage,
      `avatars/${req.userId}/${req.file.originalname}`
    );
    const metadata = {
      contentType: req.file.mimetype,
    };
    await uploadBytes(storageRef, req.file.buffer, metadata);

    const downloadURL = await getDownloadURL(storageRef);
    return res.send({
      name: req.file.originalname,
      type: req.file.mimetype,
      downloadURL: downloadURL,
    });
  } catch (err) {
    res.status(500).json({
      message: "Не удалось создать статью",
    });
  }
};
export const removeAvatar = async (req, res) => {
  const { userId } = req;
  const name = req.body.name;
  const storageRef = ref(storage, `avatars/${userId}/${name}`);
  await deleteObject(storageRef);
  return res.send({
    message: "succsessfully deleted",
  });
};
