import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Lesson from '../models/Lesson.js';
import Category from '../models/Category.js';
import Section from '../models/Section.js';
import { escapeRegex } from '../utils/escapeRegex.js';

// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalSuperAdmins = await User.countDocuments({ role: 'superadmin' });

    // Calculate growth (mocked logic or real if we track timestamps, User model has createdAt)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const getGrowth = async (role) => {
      const currentPeriod = await User.countDocuments({ role, createdAt: { $gte: thirtyDaysAgo } });
      const previousPeriod = await User.countDocuments({ role, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
      
      if (previousPeriod === 0) return currentPeriod > 0 ? 100 : 0;
      return Number((((currentPeriod - previousPeriod) / previousPeriod) * 100).toFixed(1));
    };

    const growth = {
      students: await getGrowth('student'),
      instructors: await getGrowth('instructor'),
      admins: await getGrowth('admin'),
      superAdmins: await getGrowth('superadmin'),
    };

    // Calculate total revenue and enrollments by category
    const enrollments = await Enrollment.find().populate('course');
    let totalRevenue = 0;
    const categoryCounts = {};

    enrollments.forEach(enr => {
      totalRevenue += enr.amountPaid || 0;
      if (enr.course && enr.course.category) {
        const cat = enr.course.category;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    });

    const platformCommission = 30;
    const companyShare = (totalRevenue * platformCommission) / 100;

    res.status(200).json({
      totalStudents,
      totalInstructors,
      totalAdmins,
      totalSuperAdmins,
      totalRevenue,
      platformCommission,
      companyShare,
      categoryCounts,
      growth
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const { search, page, limit, role, status, isVerified, includeDeleted } = req.query;
    
    // By default, exclude soft-deleted users
    let query = {};
    if (includeDeleted !== 'true') {
      query.isDeleted = { $ne: true };
    }

    if (role) query.role = role;
    if (status) query.status = status;
    if (isVerified !== undefined) query.emailVerified = isVerified === 'true';
    
    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { university: searchRegex }
      ];
    }

    // If neither page nor limit provided, keep existing behavior (return all results)
    if (page === undefined && limit === undefined) {
      const users = await User.find(query).sort({ createdAt: -1 });
      return res.status(200).json({ users });
    }

    // Parse and validate pagination params
    let pageNum = parseInt(page, 10);
    let limitNum = parseInt(limit, 10);
    if (Number.isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (Number.isNaN(limitNum) || limitNum < 1) limitNum = 10;

    const skip = (pageNum - 1) * limitNum;

    const [totalItems, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum)
    ]);

    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    res.status(200).json({ users, pagination: { page: pageNum, limit: limitNum, totalPages, totalItems } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// @route   PATCH /api/admin/users/:id/block
// @access  Private (Admin)
export const toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't let an admin block themselves easily
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error blocking user' });
  }
};

const ASSIGNABLE_ROLES = ['student', 'instructor', 'admin'];

// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin, Superadmin)
// Unified role-change endpoint — replaces the old separate promote/demote
// actions. 'superadmin' is deliberately not an assignable role here: that
// tier stays untouchable through this endpoint in either direction, and a
// plain admin can't change another admin's role — only a superadmin can.
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!ASSIGNABLE_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot change a superadmin\'s role' });
    }

    if (user.role === 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmins can change another admin\'s role' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: `User's role changed to ${role}`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error changing user role' });
  }
};

// @route   GET /api/admin/transactions
// @access  Private (Admin)
export const getTransactions = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // If neither page nor limit provided, keep existing behavior
    if (page === undefined && limit === undefined) {
      const enrollments = await Enrollment.find()
        .populate('student', 'name email phone')
        .populate('course', 'title price')
        .sort({ createdAt: -1 });

      return res.status(200).json({ transactions: enrollments });
    }

    let pageNum = parseInt(page, 10);
    let limitNum = parseInt(limit, 10);
    if (Number.isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (Number.isNaN(limitNum) || limitNum < 1) limitNum = 10;
    const skip = (pageNum - 1) * limitNum;

    const [totalItems, enrollments] = await Promise.all([
      Enrollment.countDocuments(),
      Enrollment.find()
        .populate('student', 'name email phone')
        .populate('course', 'title price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
    ]);

    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    res.status(200).json({ transactions: enrollments, pagination: { page: pageNum, limit: limitNum, totalPages, totalItems } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

// @route   GET /api/admin/financial
// @access  Private (Admin)
export const getFinancialStats = async (req, res) => {
  try {
    const enrollments = await Enrollment.find();
    
    let totalRevenue = 0;
    enrollments.forEach(e => {
      totalRevenue += e.amountPaid || 0;
    });

    const platformCommission = 30; // Configured at 30%
    const companyShare = (totalRevenue * platformCommission) / 100;
    const instructorEarnings = totalRevenue - companyShare;
    const totalEnrollments = enrollments.length;
    // We don't have a payout model yet, so mock outstanding payouts as 5% of instructor earnings
    const outstandingPayouts = instructorEarnings * 0.05; 

    res.status(200).json({
      totalRevenue,
      platformCommission,
      companyShare,
      instructorEarnings,
      outstandingPayouts,
      totalEnrollments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching financial stats' });
  }
};

// @route   GET /api/admin/financial/analytics
// @access  Private (Admin)
export const getFinancialAnalytics = async (req, res) => {
  try {
    const platformCommission = 30;
    const { timeframe } = req.query; // '7d', '30d', '12m'
    
    // Aggregate revenue
    const enrollments = await Enrollment.find();
    
    const dataMap = {};
    const now = new Date();
    
    if (timeframe === '7d' || timeframe === '30d') {
      const days = timeframe === '7d' ? 7 : 30;
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const label = timeframe === '7d' ? dayNames[d.getDay()] : `${d.getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]}`;
        
        dataMap[key] = {
          label,
          order: d.getTime(),
          totalRevenue: 0
        };
      }
      
      enrollments.forEach(e => {
        if (!e.createdAt) return;
        const d = new Date(e.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (dataMap[key]) {
          dataMap[key].totalRevenue += e.amountPaid || 0;
        }
      });
    } else {
      // Default: 12m
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        dataMap[key] = {
          label: monthNames[d.getMonth()],
          order: d.getTime(),
          totalRevenue: 0
        };
      }
      
      enrollments.forEach(e => {
        if (!e.createdAt) return;
        const d = new Date(e.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (dataMap[key]) {
          dataMap[key].totalRevenue += e.amountPaid || 0;
        }
      });
    }

    // Convert map to sorted array
    let sortedData = Object.values(dataMap).sort((a, b) => a.order - b.order);

    const monthlyRevenue = [];
    const monthlyGrowth = [];
    
    let totalCompanyShare = 0;
    let totalInstructorEarnings = 0;

    sortedData.forEach((data, index) => {
      const rev = data.totalRevenue;
      const comp = (rev * platformCommission) / 100;
      
      totalCompanyShare += comp;
      totalInstructorEarnings += (rev - comp);
      
      monthlyRevenue.push({
        month: data.label,
        totalRevenue: rev,
        companyShare: comp
      });

      let growthPct = 0;
      if (index > 0) {
        const prevRev = sortedData[index - 1].totalRevenue;
        if (prevRev === 0) {
          growthPct = rev > 0 ? 100 : 0;
        } else {
          growthPct = Number((((rev - prevRev) / prevRev) * 100).toFixed(1));
        }
      }
      
      monthlyGrowth.push({
        month: data.label,
        revenue: rev,
        growthPct
      });
    });

    res.status(200).json({
      platformCommission,
      monthlyRevenue,
      monthlyGrowth,
      revenueDistribution: {
        companyShare: totalCompanyShare,
        instructorEarnings: totalInstructorEarnings
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

// @route   GET /api/admin/activity
// @access  Private (Admin)
export const getRecentActivity = async (req, res) => {
  try {
    // Fetch latest users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    
    // Fetch latest enrollments
    const recentEnrollments = await Enrollment.find().populate('student course').sort({ createdAt: -1 }).limit(5);

    // Fetch latest courses
    const recentCourses = await Course.find().populate('instructor').sort({ createdAt: -1 }).limit(5);

    const activities = [];

    // Map users to activity format
    recentUsers.forEach(u => {
      if (u.role === 'admin' || u.role === 'superadmin') {
        activities.push({
          id: `usr_${u._id}`,
          type: 'user',
          title: `New ${u.role === 'superadmin' ? 'Super Admin' : 'Admin'} Added`,
          description: `Account created for ${u.name} (${u.email}).`,
          date: u.createdAt,
          icon: '🛡️',
          color: '#ef4444' // Red
        });
      }
    });

    // Map enrollments to activity format
    recentEnrollments.forEach(e => {
      activities.push({
        id: `enr_${e._id}`,
        type: 'enrollment',
        title: 'New Student Enrollment',
        description: `${e.student?.name || 'A student'} enrolled in '${e.course?.title || 'a course'}'.`,
        date: e.createdAt,
        icon: '🎓',
        color: '#3b82f6' // Blue
      });
    });

    // Map courses to activity format
    recentCourses.forEach(c => {
      activities.push({
        id: `crs_${c._id}`,
        type: 'course',
        title: `Course ${c.status === 'published' ? 'Published' : 'Submitted'}`,
        description: `'${c.title}' was ${c.status === 'published' ? 'published' : 'submitted'} by ${c.instructor?.name || 'an instructor'}.`,
        date: c.createdAt,
        icon: '📚',
        color: '#f59e0b' // Yellow
      });
    });

    // Sort all combined activities by date descending
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Keep only the 10 most recent across all types
    const latest10 = activities.slice(0, 10);

    // Format timestamps nicely for frontend (e.g., "2 hours ago")
    const formatTimeAgo = (date) => {
      if (!date) return 'Unknown time';
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      let interval = Math.floor(seconds / 31536000);
      if (interval > 1) return interval + " years ago";
      interval = Math.floor(seconds / 2592000);
      if (interval > 1) return interval + " months ago";
      interval = Math.floor(seconds / 86400);
      if (interval > 1) return interval + " days ago";
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
      interval = Math.floor(seconds / 60);
      if (interval >= 1) return interval + (interval === 1 ? " minute ago" : " mins ago");
      return "Just now";
    };

    const finalActivities = latest10.map(a => ({
      ...a,
      timestamp: formatTimeAgo(a.date)
    }));

    res.status(200).json(finalActivities);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching activity' });
  }
};

// @route   PATCH /api/admin/users/:id/suspend
// @access  Private (Admin)
export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot suspend yourself' });
    }
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot suspend a superadmin' });
    }
    
    user.status = 'suspended';
    user.isBlocked = true;
    await user.save();
    res.status(200).json({ message: 'User suspended', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   PATCH /api/admin/users/:id/activate
// @access  Private (Admin)
export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.status = 'active';
    user.isBlocked = false;
    await user.save();
    res.status(200).json({ message: 'User activated', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/admin/users/:id/soft-delete
// @access  Private (Admin)
export const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete a superadmin' });
    }

    user.isDeleted = true;
    user.status = 'suspended'; 
    user.isBlocked = true;
    await user.save();
    res.status(200).json({ message: 'User deleted successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   PATCH /api/admin/users/:id/restore
// @access  Private (Admin)
export const restoreUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isDeleted = false;
    user.status = 'active';
    user.isBlocked = false;
    await user.save();
    res.status(200).json({ message: 'User restored successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/admin/users/bulk-suspend
// @access  Private (Admin)
export const bulkSuspend = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds)) return res.status(400).json({ message: 'Invalid payload' });

    await User.updateMany(
      { _id: { $in: userIds }, role: { $ne: 'superadmin' }, _id: { $ne: req.user.id } },
      { $set: { status: 'suspended', isBlocked: true } }
    );
    res.status(200).json({ message: 'Users suspended successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/admin/users/bulk-activate
// @access  Private (Admin)
export const bulkActivate = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds)) return res.status(400).json({ message: 'Invalid payload' });

    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { status: 'active', isBlocked: false } }
    );
    res.status(200).json({ message: 'Users activated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/admin/users/bulk-delete
// @access  Private (Admin)
export const bulkDelete = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds)) return res.status(400).json({ message: 'Invalid payload' });

    await User.updateMany(
      { _id: { $in: userIds }, role: { $ne: 'superadmin' }, _id: { $ne: req.user.id } },
      { $set: { isDeleted: true, status: 'suspended', isBlocked: true } }
    );
    res.status(200).json({ message: 'Users deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==========================================
// COURSE MANAGEMENT ENDPOINTS
// ==========================================

// @route   GET /api/admin/courses/stats
// @access  Private (Admin)
export const getCourseStats = async (req, res) => {
  try {
    const total = await Course.countDocuments({ status: { $ne: 'deleted' } });
    const published = await Course.countDocuments({ status: 'published' });
    const draft = await Course.countDocuments({ status: 'draft' });
    const archived = await Course.countDocuments({ status: 'archived' });
    const pending = await Course.countDocuments({ status: 'pending' });

    res.status(200).json({ total, published, draft, archived, pending });
  } catch (err) {
    console.error("Error fetching course stats:", err);
    res.status(500).json({ message: "Error fetching course stats" });
  }
};

// @route   GET /api/admin/courses
// @access  Private (Admin)
export const getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, category, sortField = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let query = { status: { $ne: 'deleted' } };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      query.title = searchRegex;
    }

    const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
    
    // Explicit projection of instructor fields to prevent leaking sensitive info
    const courses = await Course.find(query)
      .populate('instructor', 'name email avatarUrl role') 
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const total = await Course.countDocuments(query);
    
    res.status(200).json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalItems: total
    });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Error fetching courses" });
  }
};

// @route   PATCH /api/admin/courses/:id/status
// @access  Private (Admin)
export const changeCourseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['draft', 'published', 'pending', 'archived', 'hidden', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const course = await Course.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (err) {
    console.error("Error updating course status:", err);
    res.status(500).json({ message: "Error updating course status" });
  }
};

// @route   DELETE /api/admin/courses/:id
// @access  Private (Admin)
export const softDeleteAdminCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { status: 'deleted' }, { new: true });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ message: "Error deleting course" });
  }
};

// @route   POST /api/admin/courses/bulk
// @access  Private (Admin)
export const bulkUpdateCourses = async (req, res) => {
  try {
    const { courseIds, action } = req.body;
    if (!courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({ message: "Invalid course IDs" });
    }
    
    let update = {};
    if (action === 'delete') {
      update = { status: 'deleted' };
    } else {
      update = { status: action };
    }
    
    await Course.updateMany({ _id: { $in: courseIds } }, update);
    res.status(200).json({ message: "Bulk action successful" });
  } catch (err) {
    console.error("Error performing bulk action:", err);
    res.status(500).json({ message: "Error performing bulk action" });
  }
};

// ==========================================
// LESSON MANAGEMENT
// ==========================================

export const getLessonStats = async (req, res) => {
  try {
    const total = await Lesson.countDocuments({ status: { $ne: 'deleted' } });
    const published = await Lesson.countDocuments({ status: 'published' });
    const draft = await Lesson.countDocuments({ status: 'draft' });
    const archived = await Lesson.countDocuments({ status: 'archived' });
    const hidden = await Lesson.countDocuments({ status: 'hidden' });
    
    res.json({ total, published, draft, archived, hidden });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLessons = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "all", type = "all", course = "all" } = req.query;
    
    const query = { status: { $ne: 'deleted' } };
    
    if (status !== 'all') query.status = status;
    if (type !== 'all') query.lessonType = type;
    if (course !== 'all' && course) {
      const sections = await Section.find({ course });
      const sectionIds = sections.map(s => s._id);
      query.section = { $in: sectionIds };
    }
    
    if (search) {
      query.title = { $regex: escapeRegex(search), $options: 'i' };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const lessons = await Lesson.find(query)
      .populate({
        path: 'section',
        populate: {
          path: 'course',
          select: 'title category instructor status'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    // Populate instructor explicitly through the section.course
    const populatedLessons = await User.populate(lessons, {
      path: 'section.course.instructor',
      select: 'name email avatarUrl role'
    });

    const total = await Lesson.countDocuments(query);
    
    res.json({
      lessons: populatedLessons,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalItems: total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changeLessonStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['draft', 'published', 'hidden', 'archived'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    await Lesson.findByIdAndUpdate(id, { status });
    res.status(200).json({ message: "Lesson status updated" });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const softDeleteLesson = async (req, res) => {
  try {
    await Lesson.findByIdAndUpdate(req.params.id, { status: 'deleted' });
    res.status(200).json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const bulkUpdateLessons = async (req, res) => {
  try {
    const { lessonIds, action } = req.body;
    if (!lessonIds || !action) return res.status(400).json({ message: "Invalid request" });
    
    let update = {};
    if (action === 'delete') {
      update = { status: 'deleted' };
    } else {
      update = { status: action };
    }
    
    await Lesson.updateMany({ _id: { $in: lessonIds } }, update);
    res.status(200).json({ message: "Bulk action successful" });
  } catch (err) {
    res.status(500).json({ message: "Error performing bulk action" });
  }
};

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================

export const getCategoryStats = async (req, res) => {
  try {
    const total = await Category.countDocuments({ status: { $ne: 'deleted' } });
    const active = await Category.countDocuments({ status: 'active' });
    const hidden = await Category.countDocuments({ status: 'hidden' });
    
    // Aggregation for courses and enrollments
    const allCats = await Category.find({ status: { $ne: 'deleted' } });
    const totalCourses = allCats.reduce((acc, cat) => acc + (cat.stats?.totalCourses || 0), 0);
    const totalEnrollments = allCats.reduce((acc, cat) => acc + (cat.stats?.totalEnrollments || 0), 0);

    res.json({ total, active, hidden, totalCourses, totalEnrollments });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const { search = "", status = "all" } = req.query;
    const query = { status: { $ne: 'deleted' } };
    if (status !== 'all') query.status = status;
    if (search) query.name = { $regex: escapeRegex(search), $options: 'i' };
    
    const categories = await Category.find(query).sort({ displayOrder: 1, createdAt: -1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, displayOrder, isFeatured, status } = req.body;
    
    const existing = await Category.findOne({ name });
    if (existing && existing.status !== 'deleted') {
      return res.status(400).json({ message: "Category with this name already exists." });
    }

    const cat = new Category({ name, description, icon, displayOrder, isFeatured, status });
    await cat.save();
    res.status(201).json({ message: "Category created", category: cat });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.name) {
      const existing = await Category.findOne({ name: updates.name, _id: { $ne: id }, status: { $ne: 'deleted' } });
      if (existing) return res.status(400).json({ message: "Another category already uses this name." });
    }

    const cat = await Category.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: "Category updated", category: cat });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const softDeleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { status: 'deleted' });
    res.status(200).json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const bulkUpdateCategories = async (req, res) => {
  try {
    const { categoryIds, action } = req.body;
    if (!categoryIds || !action) return res.status(400).json({ message: "Invalid request" });
    
    let update = {};
    if (action === 'delete') {
      update = { status: 'deleted' };
    } else {
      update = { status: action };
    }
    
    await Category.updateMany({ _id: { $in: categoryIds } }, update);
    res.status(200).json({ message: "Bulk action successful" });
  } catch (err) {
    res.status(500).json({ message: "Error performing bulk action" });
  }
};
