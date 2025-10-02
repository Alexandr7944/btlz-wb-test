import { google, sheets_v4 } from "googleapis";
import { format } from "date-fns";
import { BoxTariffRawInfo } from "#boxTariffs/schema.js";
import GoogleSheetsRepository from "#googleSheets/GoogleSheets.repository.js";
import { GoogleSheetsCredentials } from "#googleSheets/type.js";

const DATE_FIELDS = new Set(["dtNextBox", "dtTillMax", "parseDate"]);
const STRING_FIELDS = new Set(["warehouseName", "geoName"]);
const COLUMN_START = "A";
const SHEET_NAME = "Лист1";

export default class GoogleSheetsService {
    private repository!: GoogleSheetsRepository;

    private async init() {
        const credentials: GoogleSheetsCredentials = (await import("./credentials.json", { with: { type: "json" } })).default;
        const sheets: sheets_v4.Sheets = google.sheets({ version: "v4", auth: this.authorize(credentials) });
        this.repository = new GoogleSheetsRepository(sheets);
    }

    private authorize(credentials: GoogleSheetsCredentials) {
        return new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
    }

    async refreshData(data: BoxTariffRawInfo[]) {
        await this.init();

        const spreadsheetIds = await this.repository.getSpreadsheetIds();
        const columnEnd = this.getColumnLetter(Object.keys(this.dictionary).length - 1);
        const range = `${SHEET_NAME}!${COLUMN_START}1:${columnEnd}`;

        const errors: string[] = [];

        for (const spreadsheetId of spreadsheetIds) {
            try {
                await this.clearSheet(spreadsheetId, range);
                await this.appendData(spreadsheetId, range, data);

                console.log(`Sheets updated successfully https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit.`);
            } catch (err) {
                errors.push(`Spreadsheet ${spreadsheetId}: ${(err as Error).message}`);
            }
        }

        if (errors.length > 0) {
            throw new Error("Partial failure:\n" + errors.join("\n"));
        }
    }

    async appendData(spreadsheetId: string, range: string, data: BoxTariffRawInfo[]) {
        const values = this.transformData(data);
        const response = await this.repository.appendData(spreadsheetId, range, values);
        if (response.status !== 200) throw new Error("Error appending data to sheet.");
    }

    private transformData(data: BoxTariffRawInfo[]): (string | number | Date)[][] {
        const titleRow = Object.values(this.dictionary);
        const dataRows = data.map((item) => {
            return Object.keys(this.dictionary).map((key) => {
                const value = item[key as keyof BoxTariffRawInfo];
                return this.formatValue(key, value);
            });
        });

        return [titleRow, ...dataRows];
    }

    private formatValue(key: string, value: unknown): string | number {
        if (DATE_FIELDS.has(key)) {
            return value ? format(new Date(value as string), "yyyy-MM-dd") : "";
        }
        if (STRING_FIELDS.has(key)) {
            return (value as string) || "";
        }
        return Number(value) || 0;
    }

    async clearSheet(spreadsheetId: string, range: string) {
        const response = await this.repository.clearSheet(spreadsheetId, range);
        if (response?.status !== 200) {
            throw new Error(`Error clearing sheet ${spreadsheetId}:`);
        }
    }

    private getColumnLetter(columnIndex: number): string {
        let letter = "";
        while (columnIndex >= 0) {
            letter = String.fromCharCode(65 + (columnIndex % 26)) + letter;
            columnIndex = Math.floor(columnIndex / 26) - 1;
        }
        return letter || "A";
    }

    get dictionary() {
        return {
            warehouseName: "Название склада",
            geoName: "Страна, для РФ — округ",

            boxDeliveryBase: "Логистика, первый литр, ₽",
            boxDeliveryCoefExpr: "Коэффициент Логистика, %",
            boxDeliveryLiter: "Логистика, дополнительный литр, ₽",
            boxDeliveryMarketplaceBase: "Логистика FBS, первый литр, ₽",
            boxDeliveryMarketplaceCoefExpr: "Коэффициент FBS, %",
            boxDeliveryMarketplaceLiter: "Логистика FBS, дополнительный литр, ₽",
            boxStorageBase: "Хранение в день, первый литр, ₽",
            boxStorageCoefExpr: "Коэффициент Хранение, %",
            boxStorageLiter: "Хранение в день, дополнительный литр, ₽",

            dtNextBox: "Дата начала следующего тарифа",
            dtTillMax: "Дата окончания последнего установленного тарифа",

            parseDate: "Дата парсинга",
        };
    }
}
