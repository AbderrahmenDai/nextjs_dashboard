const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true // Nullable for potentially OAuth users or drafted users
  },
  role: {
    type: DataTypes.ENUM('responsable recrutement', 'plant manger', 'drh', 'responsable RH', 'demander '),
    allowNull: true,
    defaultValue: 'demander ' 
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active'
  },
  avatarGradient: {
    type: DataTypes.STRING,
    defaultValue: 'from-gray-500 to-slate-500'
  },
  departmentId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  post: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'User',
  timestamps: false // The original schema didn't rely heavily on user timestamps, but good to check. Schema.prisma didn't have createdAt/updatedAt for User.
});

module.exports = User;
