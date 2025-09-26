import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns";
import axios from "axios";
import * as assert from "node:assert";
import { BoxTariffWarehouseItem, BoxTariffSchema, BoxTariffWarehouseItems, BoxTariffRawInfo } from "./schema.js";
import BoxTariffsRepository from "./BoxTariffs.repository.js";

export default class BoxTariffService {
    repository: BoxTariffsRepository;

    constructor(private readonly clientKey: string) {
        this.repository = new BoxTariffsRepository();
    }

    public async collectTariffs() {
        let startDate = subDays(new Date(), 10);
        let days = eachDayOfInterval({ start: startDate, end: new Date() });
        for (let day of days) {
            await new Promise((resolve) => setTimeout(resolve, 1500))
            await this.collectTariffsByDay(day);
        }
    }

    private async collectTariffsByDay(date: Date) {
        const tariffs: BoxTariffWarehouseItems = await this.fetchTariffsForPeriod(date);
        const parseDate = startOfDay(date);
        const warehouseItems: BoxTariffRawInfo[] = tariffs.warehouseList.map((tariff: BoxTariffWarehouseItem) => ({
            ...tariff,
            dtNextBox: tariffs.dtNextBox,
            dtTillMax: tariffs.dtTillMax,
            parseDate,
        }));

        await this.repository.refreshData(warehouseItems, parseDate);
        console.log(`Collected ${warehouseItems.length} tariffs for ${format(parseDate, "yyyy-MM-dd")}`);
    }

    private async fetchTariffsForPeriod(date: Date) {
        const res = await axios({
            method: "get",
            url: `https://common-api.wildberries.ru/api/v1/tariffs/box?date=${format(date, "yyyy-MM-dd")}`,
            headers: { "Authorization": this.credentials },
        });
        assert.ok(res.status === 200, "Failed to fetch tariffs");
        return BoxTariffSchema.parse(res.data.response.data);
    }

    private get credentials(): string {
        if (!this.clientKey) throw new Error("Missing credentials");

        return this.clientKey;
    }

    public async getTariffs(): Promise<BoxTariffRawInfo[]> {
        return await this.repository.getBoxTariffs();
    }
}
