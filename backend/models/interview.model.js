const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  candidatureId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Scheduled'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  interviewers: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'Interview',
  timestamps: true,
  updatedAt: false, // Schema had createdAt but no updatedAt explicitly shown in the first chunk, let's assume default unless specified
  createdAt: 'createdAt'
});

module.exports = Interview;
