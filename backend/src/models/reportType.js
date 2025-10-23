const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReportType = sequelize.define('ReportType', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  department_id: { type: DataTypes.INTEGER },
  frequency: { type: DataTypes.STRING }
}, {
  tableName: 'report_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ReportType;
