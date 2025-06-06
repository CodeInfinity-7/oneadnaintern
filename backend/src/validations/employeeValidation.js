// src/validations/employeeValidation.js
const Joi = require("joi");

const employeeSchema = Joi.object({
  business_id: Joi.number().integer().required(),
  full_name: Joi.string().required(),
  designation: Joi.string().required(),
  mobile: Joi.string().required(),
  email: Joi.string().email().required(),
});

module.exports = { employeeSchema };
