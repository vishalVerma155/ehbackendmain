const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }
});

const BlogSchema = new mongoose.Schema({
  coverImage: { type: String },
  title: { type: String, required: true },
  subtitle: { type: String },
  content: { type: String, required: true },
  sections: [sectionSchema]
}, {
  timestamps: true
});

const Blog = mongoose.model("Blog", BlogSchema);
module.exports = Blog;
