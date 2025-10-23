const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReviewHistory = sequelize.define('ReviewHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  report_id: { type: DataTypes.INTEGER },
  reviewer_id: { type: DataTypes.INTEGER },
  action: { type: DataTypes.STRING },
  comments: { type: DataTypes.TEXT }
}, {
  tableName: 'review_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ReviewHistory;
