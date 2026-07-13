import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';

// @route   POST /api/courses/:courseId/lessons
// @access  Private (instructor only, must own the course)
export const addLesson = async (req, res) => {
  try {
    const { title, videoUrl } = req.body;
    const { courseId } = req.params;

    if (!title || !videoUrl) {
      return res.status(400).json({ message: 'Title and video URL are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Ownership check: an instructor can only add lessons to their own courses.
    // Without this, any logged-in instructor could add lessons to anyone's course.
    if (course.instructor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'You do not own this course' });
    }

    // Auto-number the lesson based on how many already exist, so the
    // instructor never has to think about ordering manually.
    const existingCount = await Lesson.countDocuments({ course: courseId });

    const lesson = await Lesson.create({
      title,
      videoUrl,
      course: courseId,
      order: existingCount + 1,
    });

    res.status(201).json({ lesson });
  } catch (error) {
    res.status(500).json({ message: 'Server error adding lesson', error: error.message });
  }
};
