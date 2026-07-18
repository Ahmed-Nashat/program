import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['General', 'Maintenance', 'Feature Update', 'Promotion', 'Emergency'],
      default: 'General',
    },
    audience: {
      type: String,
      enum: ['Everyone', 'Students', 'Instructors', 'Admins'],
      default: 'Everyone',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    showAsBanner: {
      type: Boolean,
      default: false,
    },
    expirationDate: {
      type: Date,
    },
    scheduledPublishDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
