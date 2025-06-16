const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  uploadTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('uploaded', 'processing', 'extracting', 'preparing', 'ready', 'error'),
    defaultValue: 'uploaded'
  },
  currentStage: {
    type: DataTypes.STRING,
    defaultValue: 'upload'
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  extractedText: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  textLength: {
    type: DataTypes.INTEGER
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'en'
  },
  insights: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Document; 