import "dotenv/config";
import { migrate } from "#postgres/knex.js";
import BoxTariff from "#boxTariffs/BoxTariffs.service.js";
import GoogleSheetsService from "#googleSheets/GoogleSheets.service.js";
import * as assert from "node:assert";

require("console-stamp")(console, {
    format: ":date(dd.mm.yyyy HH:MM:ss.l) :label(10)",
});

async function initializeDatabase() {
    try {
        await migrate.latest();
        console.log("All migrations and seeds have been run");
    } catch (error) {
        console.error("Database initialization error:", error);
        process.exit(1);
    }
}

async function collectAndRefreshTariffs() {
    try {
        const clientKey = process.env.CLIENT_KEY;
        assert.ok(typeof clientKey === "string", "CLIENT_KEY is not defined or is not a string");

        const boxTariff = new BoxTariff(clientKey);
        await boxTariff.collectTariffs();
        const tariffs = await boxTariff.getTariffs();
        await new GoogleSheetsService().refreshData(tariffs);
    } catch (error) {
        console.error("Tariff collection and refresh error:", error);
        process.exit(1);
    }
}

(async () => {
    await initializeDatabase();
    await collectAndRefreshTariffs();
})();
