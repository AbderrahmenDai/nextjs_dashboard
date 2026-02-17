const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  receiverId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'INFO'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  entityId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  actions: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'Notification',
  timestamps: true,
  updatedAt: false,
  createdAt: 'createdAt'
});

module.exports = Notification;
