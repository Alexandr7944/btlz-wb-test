import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns";
import axios, { AxiosInstance } from "axios";
import * as assert from "node:assert";
import { BoxTariffSchema, BoxTariffWarehouseItems, BoxTariffRawInfo } from "./schema.js";
import BoxTariffsRepository from "./BoxTariffs.repository.js";

type ServiceConfig = {
    requestDelayMs?: number;
};

export default class BoxTariffService {
    repository: BoxTariffsRepository;
    private readonly apiClient: AxiosInstance;

    constructor(
        private readonly clientKey: string,
        private readonly config: ServiceConfig = {},
    ) {
        this.repository = new BoxTariffsRepository();
        this.apiClient = axios.create({
            headers: { "Authorization": this.credentials },
        });
    }

    public async collectTariffs(daysAgo: number = 0) {
        assert.ok(daysAgo >= 0 && daysAgo <= 90 && Number.isInteger(daysAgo), "Invalid daysAgo value");

        let startDate = daysAgo > 0 ? subDays(new Date(), daysAgo) : new Date();

        let days = eachDayOfInterval({
            start: startDate,
            end: new Date(),
        });

        for (let [index, day] of days.entries()) {
            await this.collectTariffsByDay(day);
            if (index < days.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, this.config.requestDelayMs ?? 1500));
            }
        }
    }

    private async collectTariffsByDay(date: Date) {
        const rawData : BoxTariffWarehouseItems = await this.fetchTariffsForPeriod(date);
        const parseDate = startOfDay(date);
        const items = this.transformResponse(rawData, parseDate);

        await this.repository.refreshData(items, parseDate);
        console.log(`Collected ${items.length} tariffs for ${format(parseDate, "yyyy-MM-dd")}`);
    }

    private async fetchTariffsForPeriod(date: Date) {
        const res = await this.apiClient.get(`https://common-api.wildberries.ru/api/v1/tariffs/box?date=${format(date, "yyyy-MM-dd")}`);
        assert.ok(res.status === 200, "Failed to fetch tariffs");
        return res.data.response.data;
    }

    private transformResponse(
        rawData: unknown,
        parseDate: Date
    ): BoxTariffRawInfo[] {
        const parsed = BoxTariffSchema.parse(rawData);
        return parsed.warehouseList.map((item) => ({
            ...item,
            dtNextBox: parsed.dtNextBox,
            dtTillMax: parsed.dtTillMax,
            parseDate
        }));
    }

    private get credentials(): string {
        assert.ok(this.clientKey, "Missing credentials");
        return this.clientKey;
    }

    public async getTariffs(): Promise<BoxTariffRawInfo[]> {
        return await this.repository.getBoxTariffs();
    }
}
