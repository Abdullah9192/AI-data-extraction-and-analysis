const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Document = require('./Document');
const PromptTemplate = require('./PromptTemplate');

const Analysis = sequelize.define('Analysis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  documentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Document,
      key: 'id'
    }
  },
  promptTemplateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: PromptTemplate,
      key: 'id'
    }
  },
  finalPrompt: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  geminiResponse: {
    type: DataTypes.TEXT
  },
  responseMetadata: {
    type: DataTypes.JSONB
  },
  executionTimeMs: {
    type: DataTypes.INTEGER
  },
  errorMessage: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true
});

// Define associations
Analysis.belongsTo(Document, { foreignKey: 'documentId' });
Analysis.belongsTo(PromptTemplate, { foreignKey: 'promptTemplateId' });

module.exports = Analysis; 