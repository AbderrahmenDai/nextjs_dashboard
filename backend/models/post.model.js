const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Department',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Closed'),
    defaultValue: 'Active'
  },
  jobDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Post',
  timestamps: true // Track creation/updates for job posts
});

module.exports = Post;
