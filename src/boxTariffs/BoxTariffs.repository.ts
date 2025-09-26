import { BoxTariffRawInfo } from "./schema.js";
import knex from "#postgres/knex.js";
export default class BoxTariffsRepository {
    async refreshData(data: BoxTariffRawInfo[], date: Date): Promise<void> {
        await knex("box_tariffs").where("parseDate", date).del();
        await knex("box_tariffs").insert(data);
    }

    async getBoxTariffs(): Promise<BoxTariffRawInfo[]> {
        return await knex("box_tariffs")
            .select("*")
            .orderBy("parseDate", "desc")
            .orderBy("boxDeliveryCoefExpr", "asc")
    }
}
