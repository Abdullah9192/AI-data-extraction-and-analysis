'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, create the status enum type if it doesn't exist
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Documents_status" AS ENUM ('uploaded', 'processing', 'extracting', 'preparing', 'ready', 'error');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add all required columns (excluding id since it already exists)
    const columns = [
      {
        name: 'filename',
        type: Sequelize.STRING,
        allowNull: false
      },
      {
        name: 'originalName',
        type: Sequelize.STRING,
        allowNull: false
      },
      {
        name: 'fileSize',
        type: Sequelize.INTEGER,
        allowNull: false
      },
      {
        name: 'uploadTime',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      {
        name: 'status',
        type: Sequelize.ENUM('uploaded', 'processing', 'extracting', 'preparing', 'ready', 'error'),
        defaultValue: 'uploaded'
      },
      {
        name: 'currentStage',
        type: Sequelize.STRING,
        defaultValue: 'upload'
      },
      {
        name: 'progress',
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      {
        name: 'extractedText',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'textLength',
        type: Sequelize.INTEGER,
        allowNull: true
      },
      {
        name: 'language',
        type: Sequelize.STRING(10),
        defaultValue: 'en'
      },
      {
        name: 'insights',
        type: Sequelize.TEXT,
        allowNull: true
      },
      {
        name: 'metadata',
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      {
        name: 'error',
        type: Sequelize.TEXT,
        allowNull: true
      }
    ];

    // Check if table exists
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('Documents'));

    if (!tableExists) {
      // Create table with all columns including id
      await queryInterface.createTable('Documents', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        ...columns.reduce((acc, col) => {
          acc[col.name] = col;
          return acc;
        }, {}),
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      });
    } else {
      // Add missing columns
      for (const column of columns) {
        try {
          await queryInterface.addColumn('Documents', column.name, column);
          console.log(`Added column ${column.name}`);
        } catch (error) {
          if (error.name === 'SequelizeUniqueConstraintError' || 
              error.message.includes('already exists')) {
            console.log(`Column ${column.name} already exists`);
          } else {
            console.error(`Error adding column ${column.name}:`, error);
            throw error;
          }
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all columns except id
    const columns = [
      'filename',
      'originalName',
      'fileSize',
      'uploadTime',
      'status',
      'currentStage',
      'progress',
      'extractedText',
      'textLength',
      'language',
      'insights',
      'metadata',
      'error'
    ];

    for (const column of columns) {
      try {
        await queryInterface.removeColumn('Documents', column);
        console.log(`Removed column ${column}`);
      } catch (error) {
        console.log(`Column ${column} does not exist`);
      }
    }

    // Drop the enum type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Documents_status";');
  }
}; 