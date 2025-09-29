import { Request, Response, NextFunction } from "express";
import { Knex } from "knex";
import knex from "#postgres/knex.js";
import SpreadsheetsRepository from "#spreadsheets/spreadsheets.repository.js";

export default class SpreadsheetsController {
    private model: Knex.QueryBuilder;
    private repository: SpreadsheetsRepository;

    constructor() {
        this.model = knex("spreadsheets");
        this.repository = new SpreadsheetsRepository(this.model);
        this.saveId = this.saveId.bind(this);
    }
    async saveId(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.body;
            if (!id) {
                return res.status(404).send({ message: "Id not found" });
            }
            await this.repository.saveId(id.toString());
            res.status(200).json({ message: "Id saved successfully " + id });
        } catch (error) {
            next(error);
        }
    }
}
