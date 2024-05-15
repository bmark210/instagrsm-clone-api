import { body } from "express-validator";

export const registerValidation = [
  body("username", "Username must be unique ").isString(),
  body("email", "Invalid email format").isEmail(),
  body("password", "Password must be at least 5 characters long").isLength({
    min: 5,
  }),
  body("fullName", "Enter full name").isLength({ min: 3 }),
];

export const loginValidation = [
  body("email", "Invalid email format").isEmail(),
  body("password", "Password must be at least 5 characters long").isLength({
    min: 5,
  }),
];