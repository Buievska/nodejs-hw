// src/validations/authValidation.js
import { Joi } from 'celebrate';

//POST auth/register
export const registerUserSchema = Joi.object({
  email: Joi.string().email().required(),

  password: Joi.string().min(8).required(),
});

//POST auth/login
export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),

  password: Joi.string().required(),
});
