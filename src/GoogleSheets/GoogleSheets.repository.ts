import knex from "#postgres/knex.js";

export default class GoogleSheetsRepository {
    constructor(private sheets: any) {}
    async getSpreadsheetIds(): Promise<string[]> {
        const ids: { spreadsheet_id: string }[] = await knex.select("spreadsheet_id").from("spreadsheets");
        return ids.map(({ spreadsheet_id }) => spreadsheet_id);
    }

    async appendData(spreadsheetId: string, range: string, data: (string | number | Date)[][]) {
        return await this.sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            resource: { values: data },
        });
    }

    async clearSheet(spreadsheetId: string, range: string) {
        return await this.sheets.spreadsheets.values.clear({
            spreadsheetId: spreadsheetId,
            range: range,
        });
    }
}
