import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'folder', // e.g., a lucide icon name or generic SVG class
    },
    bannerImage: {
      type: String,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'archived'],
      default: 'active',
    },
    // Cached stats for performance
    stats: {
      totalCourses: { type: Number, default: 0 },
      totalEnrollments: { type: Number, default: 0 },
      revenueGenerated: { type: Number, default: 0 },
    }
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
