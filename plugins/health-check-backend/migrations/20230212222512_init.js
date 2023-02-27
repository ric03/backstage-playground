// @ts-check

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('health-checks', table => {
    table.comment('This table contains the health checks');
    table
      .increments('id')
      .primary()
      .comment('Automatically generated unique ID');
    table.text('entityRef').notNullable().comment('The ref of the entity');
    table.text('url').notNullable().comment('The url of the health-check');
    table
      .boolean('isHealthy')
      .notNullable()
      .comment('The result of the health-check');
    table
      .text('errorMessage')
      .comment('The optional error message of the health-check');
    table
      .timestamp('timestamp')
      .notNullable()
      .comment('Timestamp when health was checked');
    table.smallint('responseTime').comment('The responseTime in milliseconds');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('health-checks');
};
