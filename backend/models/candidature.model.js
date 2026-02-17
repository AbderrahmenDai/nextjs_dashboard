const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Candidature = sequelize.define('Candidature', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  source: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'NEW'
  },
  hiringRequestId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  cvFile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  hireDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Candidature',
  timestamps: true
});

module.exports = Candidature;
