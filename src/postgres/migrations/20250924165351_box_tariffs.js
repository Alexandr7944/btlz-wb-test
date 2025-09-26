/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema.createTable("box_tariffs", (table) => {
        table.increments('id');

        table.float("boxDeliveryBase");
        table.float("boxDeliveryCoefExpr");
        table.float("boxDeliveryLiter");
        table.float("boxDeliveryMarketplaceBase");
        table.float("boxDeliveryMarketplaceCoefExpr");
        table.float("boxDeliveryMarketplaceLiter");
        table.float("boxStorageBase");
        table.float("boxStorageCoefExpr");
        table.float("boxStorageLiter");

        table.string("warehouseName");
        table.string("geoName");

        table.date("dtNextBox");
        table.date("dtTillMax");
        table.date("parseDate");

        table.timestamps();
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema.dropTable("box_tariffs");
}
