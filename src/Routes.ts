import {Application, NextFunction, Request, Response} from "express";
import SpreadsheetsController from "#spreadsheets/spreadsheets.controller.js";

export default class Routes {
    constructor(private app: Application) {
        this.initRoutes();
    }

    initRoutes() {
        this.app.post("/spreadsheets", new SpreadsheetsController().saveId);

        this.app.use(function (_req: Request, _res: Response, next: NextFunction) {
            next(new Error("Rout not Found"));
        });

        this.initErrorRoute();
    }

    initErrorRoute() {
        this.app.use(function (err: Error | any, _req: Request, res: Response, _next: NextFunction) {
            if (err.status && err.status < 500) {
                console.warn(err.status, err.message);
                return res.status(err.status).send(err.message);
            }
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
    }
}
