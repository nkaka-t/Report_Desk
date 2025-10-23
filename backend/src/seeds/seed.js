const { sequelize, Department, ReportType, User } = require('../models');
const { hash } = require('../utils/hash');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB OK');

    // Create departments
    const depts = ['Finance', 'HR', 'Operations', 'IT'].map((name) => ({ name }));
    for (const d of depts) {
      await Department.findOrCreate({ where: { name: d.name }, defaults: d });
    }

    const finance = await Department.findOne({ where: { name: 'Finance' } });

    // Create some report types
    await ReportType.findOrCreate({ where: { name: 'Monthly Financials' }, defaults: { name: 'Monthly Financials', department_id: finance.id, frequency: 'monthly' } });

    // Create users: admin, reviewer, approver, employee
    const users = [
      { email: 'admin@example.com', password: 'AdminPass123!', full_name: 'Admin User', role: 'admin' },
      { email: 'reviewer@example.com', password: 'Reviewer123!', full_name: 'Dept Reviewer', role: 'reviewer', department_id: finance.id },
      { email: 'approver@example.com', password: 'Approver123!', full_name: 'COO Approver', role: 'approver' },
      { email: 'employee@example.com', password: 'Employee123!', full_name: 'Regular Employee', role: 'employee', department_id: finance.id }
    ];

    for (const u of users) {
      const [existing] = await User.findOrCreate({ where: { email: u.email }, defaults: { email: u.email, password_hash: await hash(u.password), full_name: u.full_name, role: u.role, department_id: u.department_id || null } });
      if (existing) console.log('User exists', existing.email);
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
