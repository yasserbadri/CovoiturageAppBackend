const Joi = require('joi');

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]{10,20}$/),
    user_type: Joi.string().valid('client', 'chauffeur').required(),
    vehicle_type: Joi.when('user_type', {
      is: 'chauffeur',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    license_plate: Joi.when('user_type', {
      is: 'chauffeur',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    })
  });

  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  return schema.validate(data);
};

const rideValidation = (data) => {
  const schema = Joi.object({
    start_lat: Joi.number().min(-90).max(90).required(),
    start_lng: Joi.number().min(-180).max(180).required(),
    end_lat: Joi.number().min(-90).max(90).required(),
    end_lng: Joi.number().min(-180).max(180).required(),
    start_address: Joi.string().required(),
    end_address: Joi.string().required(),
    price: Joi.number().min(0).required(),
    distance: Joi.number().min(0).required(),
    duration: Joi.number().min(0).required()
  });

  return schema.validate(data);
};

const ratingValidation = (data) => {
  const schema = Joi.object({
    ride_id: Joi.number().integer().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(500).optional().allow('')
  });

  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  rideValidation,
  ratingValidation
};