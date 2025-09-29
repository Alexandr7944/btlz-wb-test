import { google, sheets_v4 } from "googleapis";
import { format } from "date-fns";
import { BoxTariffRawInfo } from "#boxTariffs/schema.js";
import GoogleSheetsRepository from "./GoogleSheets.repository.js";
import { GoogleSheetsCredentials } from "./type.js";

class GoogleSheetsService {
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
        const range = `Лист1!A1:${String.fromCharCode(65 + Object.keys(this.dictionary).length - 1)}`;
        const spreadsheetIds = await this.repository.getSpreadsheetIds();

        for (const spreadsheetId of spreadsheetIds) {
            try {
                await this.clearSheet(spreadsheetId, range);
                await this.appendData(spreadsheetId, range, data);

                console.log(`Row ${data.length} updated successfully.`);
            } catch (err) {
                console.error(err);
            }
        }
    }

    async appendData(spreadsheetId: string, range: string, data: BoxTariffRawInfo[]) {
        const valuesFoSheet = this.transformData(data);
        const response = await this.repository.appendData(spreadsheetId, range, valuesFoSheet);
        if (response.status !== 200) {
            console.error(`Error appending data to sheet ${spreadsheetId}:`, response);
            throw new Error("Error appending data to sheet.");
        }

        console.log(`Data appended successfully to sheet ${spreadsheetId}.`);
    }

    private transformData(data: BoxTariffRawInfo[]): (string | number | Date)[][] {
        const title = Object.values(this.dictionary);
        const values = data.map((item) => {
            return Object.keys(this.dictionary).map((key) => {
                const value = item[key as keyof BoxTariffRawInfo];
                if (["dtNextBox", "dtTillMax", "parseDate"].includes(key)) {
                    return value ? format(new Date(value), "yyyy-MM-dd") : "";
                } else if (["warehouseName", "geoName"].includes(key)) {
                    return value || "";
                }
                return value || 0;
            });
        });

        return [title, ...values];
    }

    async clearSheet(spreadsheetId: string, range: string) {
        const response = await this.repository.clearSheet(spreadsheetId, range);

        if (response?.status !== 200) {
            console.error(`Error clearing sheet ${spreadsheetId}:`, response);
            throw new Error(`Error clearing sheet ${spreadsheetId}:`);
        }

        console.log(`Sheet ${spreadsheetId} cleared successfully.`);
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

export default GoogleSheetsService;
