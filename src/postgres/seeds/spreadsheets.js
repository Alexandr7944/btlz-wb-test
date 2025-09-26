/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
    await knex("spreadsheets")
        .insert([{ spreadsheet_id: "16FmJgGCoKW2V20jp4Q_avgdooPaiH6xgHt7ZHCUis_E" }])
        .onConflict(["spreadsheet_id"])
        .ignore();
}
