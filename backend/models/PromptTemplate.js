const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PromptTemplate = sequelize.define('PromptTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  promptText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('summary', 'analysis', 'extraction', 'custom'),
    allowNull: false
  },
  variables: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  exampleOutput: {
    type: DataTypes.TEXT
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = PromptTemplate; 