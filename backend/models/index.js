const sequelize = require('../config/sequelize');
const User = require('./user.model');
const Department = require('./department.model');
// const Site = require('./site.model'); // Removed as Site is now an Enum in Department

const HiringRequest = require('./hiringRequest.model');
const Candidature = require('./candidature.model');
const Interview = require('./interview.model');
const Notification = require('./notification.model');
const Post = require('./post.model');
const PostSite = require('./postSite.model');

// Define Associations

// --- User ---
User.belongsTo(Department, { foreignKey: 'departmentId', as: 'departmentData' });
Department.hasMany(User, { foreignKey: 'departmentId', as: 'users' });

// --- Hiring Request ---
HiringRequest.belongsTo(User, { as: 'requester', foreignKey: 'requesterId' });
HiringRequest.belongsTo(User, { as: 'approver', foreignKey: 'approverId' });
HiringRequest.belongsTo(Department, { foreignKey: 'departmentId' });
HiringRequest.hasMany(Candidature, { foreignKey: 'hiringRequestId', as: 'candidatures' });

User.hasMany(HiringRequest, { as: 'hiringRequests', foreignKey: 'requesterId' });
User.hasMany(HiringRequest, { as: 'approvedRequests', foreignKey: 'approverId' });
Department.hasMany(HiringRequest, { foreignKey: 'departmentId' });

// --- Candidature ---
Candidature.belongsTo(HiringRequest, { foreignKey: 'hiringRequestId', as: 'hiringRequest' });
Candidature.belongsTo(Department, { foreignKey: 'departmentId' });
Candidature.hasMany(Interview, { foreignKey: 'candidatureId', as: 'interviews' });

Department.hasMany(Candidature, { foreignKey: 'departmentId' });

// --- Interview ---
Interview.belongsTo(Candidature, { foreignKey: 'candidatureId' });
Interview.belongsTo(User, { as: 'interviewer', foreignKey: 'interviewerId' });

// --- Notification ---
Notification.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Notification.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

User.hasMany(Notification, { as: 'sentNotifications', foreignKey: 'senderId' });
User.hasMany(Notification, { as: 'receivedNotifications', foreignKey: 'receiverId' });

// --- Post ---
Post.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(Post, { foreignKey: 'departmentId', as: 'posts' });

// --- PostSite ---
// PostSite is currently a standalone lookup/stats model for sites (TT, TTG)
// No direct foreign key on Department (which uses Enum 'site')
// We can add logic in services to sync stats if needed.


const db = {
    sequelize,
    User,
    Department,
    HiringRequest,
    Candidature,
    Interview,
    Notification,
    Post,
    PostSite
};

module.exports = db;
