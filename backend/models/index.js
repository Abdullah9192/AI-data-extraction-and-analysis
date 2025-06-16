const sequelize = require('../config/database');
const Document = require('./Document');
const PromptTemplate = require('./PromptTemplate');
const Analysis = require('./Analysis');
const updateDocumentStatus = require('../migrations/20240616_update_document_status');

// Initialize database connection and sync models
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Run the migration to update the enum
    await updateDocumentStatus.up(sequelize.getQueryInterface(), sequelize);
    console.log('Document status enum updated successfully.');
    
    // Sync all models with the database
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  Document,
  PromptTemplate,
  Analysis,
  initDatabase
}; 