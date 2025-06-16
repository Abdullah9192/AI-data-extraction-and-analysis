'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the existing enum type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Documents_status" CASCADE;');
    
    // Create the new enum type with all values
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Documents_status" AS ENUM (
        'uploaded',
        'processing',
        'extracting',
        'preparing',
        'ready',
        'error'
      );
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to original enum values
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Documents_status" CASCADE;');
    
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Documents_status" AS ENUM (
        'uploaded',
        'extracting',
        'preparing',
        'ready',
        'error'
      );
    `);
  }
}; 