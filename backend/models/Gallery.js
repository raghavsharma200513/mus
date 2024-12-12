const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("MessaGalleryge", GallerySchema);
