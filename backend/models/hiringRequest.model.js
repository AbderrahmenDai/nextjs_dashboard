const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const HiringRequest = sequelize.define('HiringRequest', {
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
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending HR'
  },
  requesterId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  approverId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  budget: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  contractType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  site: {
    type: DataTypes.STRING, // Kept as string or should match Department Site Enum? Schema had it as string.
    allowNull: true
  },
  businessUnit: {
    type: DataTypes.STRING,
    allowNull: true
  },
  desiredStartDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  replacementFor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  replacementReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  increaseType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  increaseDateRange: {
    type: DataTypes.STRING,
    allowNull: true
  },
  educationRequirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  skillsRequirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  roleId: {
      type: DataTypes.STRING, // Legacy field, might not be needed anymore but keeping for schema compatibility if referenced
      allowNull: true
  }
}, {
  tableName: 'HiringRequest',
  timestamps: true // Schema had createdAt and updatedAt
});

module.exports = HiringRequest;
