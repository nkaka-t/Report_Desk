const sequelize = require('../config/database');
const User = require('./user');
const Department = require('./department');
const ReportType = require('./reportType');
const Report = require('./report');
const ReviewHistory = require('./reviewHistory');
const Notification = require('./notification');

// Associations
User.belongsTo(Department, { foreignKey: 'department_id' });
Department.hasMany(User, { foreignKey: 'department_id' });
ReportType.belongsTo(Department, { foreignKey: 'department_id' });

Report.belongsTo(User, { foreignKey: 'user_id' });
Report.belongsTo(ReportType, { foreignKey: 'report_type_id' });
ReviewHistory.belongsTo(Report, { foreignKey: 'report_id' });
ReviewHistory.belongsTo(User, { foreignKey: 'reviewer_id' });

module.exports = {
  sequelize,
  User,
  Department,
  ReportType,
  Report,
  ReviewHistory
  ,Notification
};
