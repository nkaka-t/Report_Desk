const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  user_id: { type: DataTypes.INTEGER },
  report_type_id: { type: DataTypes.INTEGER },
  file_path: { type: DataTypes.TEXT },
  reviewed_by: { type: DataTypes.INTEGER },
  reviewed_at: { type: DataTypes.DATE },
  review_comments: { type: DataTypes.TEXT },
  approved_by: { type: DataTypes.INTEGER },
  approved_at: { type: DataTypes.DATE },
  approval_comments: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' },
  due_date: { type: DataTypes.DATEONLY },
  submitted_at: { type: DataTypes.DATE },
  version: { type: DataTypes.INTEGER, defaultValue: 1 }
}, {
  tableName: 'reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Report;
