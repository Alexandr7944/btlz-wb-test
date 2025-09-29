import 'dotenv/config';
import { migrate, seed } from "#postgres/knex.js";
import BoxTariff from "#boxTariffs/BoxTariffs.service.js";
import GoogleSheetsService from "#googleSheets/GoogleSheets.service.js";

require('console-stamp')(console, {
    format: ':date(dd.mm.yyyy HH:MM:ss.l) :label(10)'
} );

(async () => {
    try {
        await migrate.latest();
        // await seed.run();

        console.log("All migrations and seeds have been run");

        const boxTariff = new BoxTariff(process.env.CLIENT_KEY as string);
        await boxTariff.collectTariffs();
        const tariffs = await boxTariff.getTariffs();
        await new GoogleSheetsService().refreshData(tariffs);
    } catch (error) {
        console.error("Error:", error);
    }
})();
