import { Knex } from "knex";

export default class SpreadsheetsRepository {
    constructor(private readonly model: Knex.QueryBuilder) {}

    public async saveId(id: string): Promise<Knex.QueryBuilder<any, number[]>> {
        return await this.model.insert({ spreadsheet_id: id });
    }
}
