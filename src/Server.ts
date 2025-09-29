import express, { Application } from "express";
import Routes from "#Routes.js";
import { migrate, seed } from "#postgres/knex.js";

require("console-stamp")(console, {
    format: ":date(dd.mm.yyyy HH:MM:ss.l) :label(10)",
});

class Server {
    constructor(app: Application) {
        this.config(app);
        this.syncDatabase().then(() => {
            new Routes(app);
        })
    }

    private config(app: Application): void {
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
    }

    private async syncDatabase() {
        await migrate.latest();
        // await seed.run();

        console.log("Database sync complete");
    }
}

export default Server;
