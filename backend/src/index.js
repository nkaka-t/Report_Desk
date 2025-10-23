require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const deptRoutes = require('./routes/departments');
const rtRoutes = require('./routes/reportTypes');
const reportsRoutes = require('./routes/reports');
const notificationsRoutes = require('./routes/notifications');

app.get('/', (req, res) => res.json({status: 'ok', name: 'ReportDesk API'}));

app.use('/api/auth', authRoutes);
app.use('/api/departments', deptRoutes);
app.use('/api/report-types', rtRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);

// If a built frontend exists (frontend/dist), serve it as static files so
// visiting the server root shows the new Vite frontend in production.
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
	app.use(express.static(frontendDist));
	// Serve index.html for any non-API route
	app.get('*', (req, res, next) => {
		if (req.path.startsWith('/api')) return next();
		res.sendFile(path.join(frontendDist, 'index.html'));
	});
}

const { waitForDb } = require('./utils/dbWait');

const start = async () => {
	try {
			await waitForDb(sequelize, 8, 2000);
				// For sqlite we avoid sequelize.sync({ alter: true }) because it may attempt
				// to recreate/drop tables and hit FOREIGN KEY constraints. Instead, detect
				// missing columns on the `reports` table and add them with ALTER TABLE so
				// local dev upgrades are safe.
				if (process.env.DB_CLIENT === 'sqlite' || process.env.NODE_ENV !== 'production') {
					try {
						console.log('Running sqlite-safe schema adjustments (dev mode)');
						const [cols] = await sequelize.query("PRAGMA table_info('reports');");
						const existing = (cols || []).map(c => c.name);
						const addIfMissing = async (name, definition) => {
							if (!existing.includes(name)) {
								console.log(`Adding column ${name} to reports table`);
								await sequelize.query(`ALTER TABLE reports ADD COLUMN ${name} ${definition};`);
							}
						};
						// Desired additional columns
						await addIfMissing('title', 'TEXT');
						await addIfMissing('description', 'TEXT');
						await addIfMissing('reviewed_by', 'INTEGER');
						await addIfMissing('reviewed_at', 'DATETIME');
						await addIfMissing('review_comments', 'TEXT');
						await addIfMissing('approved_by', 'INTEGER');
						await addIfMissing('approved_at', 'DATETIME');
						await addIfMissing('approval_comments', 'TEXT');
					} catch (e) {
						console.error('Failed to apply sqlite schema adjustments', e);
					}

						// Also ensure departments table has description for local dev
						try {
							const [deptCols] = await sequelize.query("PRAGMA table_info('departments');");
							const deptExisting = (deptCols || []).map(c => c.name);
							if (!deptExisting.includes('description')) {
								console.log('Adding column description to departments table');
								await sequelize.query(`ALTER TABLE departments ADD COLUMN description TEXT;`);
							}
						} catch (e) {
							console.error('Failed to adjust departments table', e);
						}
				}
				await sequelize.sync();
				console.log('DB synchronized');
		app.listen(port, () => console.log(`Server listening on port ${port}`));
	} catch (err) {
		console.error('Failed to start server', err);
		process.exit(1);
	}
};

start();
