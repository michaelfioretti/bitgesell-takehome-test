const yup = require('yup');

const itemSchema = yup.object().shape({
  name: yup.string().min(1).required(),
  category: yup.string().min(1).required(),
  price: yup.number().positive().required(),
});

async function validateItem(req, res, next) {
  try {
    await itemSchema.validate(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

module.exports = validateItem;
