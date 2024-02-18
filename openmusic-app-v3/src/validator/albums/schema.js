const currentYear = new Date().getFullYear();
const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().min(1900).max(currentYear).required(),
});
module.exports = { AlbumPayloadSchema };
