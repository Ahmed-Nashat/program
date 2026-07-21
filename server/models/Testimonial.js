import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    university: {
      type: String,
      trim: true,
    },
    role: {
      type: String, // e.g., "Web Developer", "Data Science Student"
      trim: true,
    },
    photo: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'hidden', 'featured'],
      default: 'pending',
    },
    studentUser: {
      // Optional link to actual user account
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    displayOrder: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
