import z from "zod";

const transformFloat = (value: string) => {
    if (value === "-") return null;

    value = value.replace(",", ".");
    return parseFloat(value);
};

const transformDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        console.log("Invalid date string", dateStr);
        return null;
    }
    return date;
};

export const BoxTariffWarehouseItemSchema = z.object({
    boxDeliveryBase: z.string().transform(transformFloat),
    boxDeliveryCoefExpr: z.string().transform(transformFloat),
    boxDeliveryLiter: z.string().transform(transformFloat),
    boxDeliveryMarketplaceBase: z.string().transform(transformFloat),
    boxDeliveryMarketplaceCoefExpr: z.string().transform(transformFloat),
    boxDeliveryMarketplaceLiter: z.string().transform(transformFloat),
    boxStorageBase: z.string().transform(transformFloat),
    boxStorageCoefExpr: z.string().transform(transformFloat),
    boxStorageLiter: z.string().transform(transformFloat),
    warehouseName: z.string().min(1),
    geoName: z.string().min(1),
});

export type BoxTariffWarehouseItem = z.infer<typeof BoxTariffWarehouseItemSchema>;

export const BoxTariffDateValueSchema = {
    dtNextBox: z.string().transform(transformDate).nullable(),
    dtTillMax: z.string().transform(transformDate).nullable(),
};

export const BoxTariffSchema = z.object({
    ...BoxTariffDateValueSchema,
    warehouseList: z.array(BoxTariffWarehouseItemSchema),
});

export type BoxTariffWarehouseItems = z.infer<typeof BoxTariffSchema>;

export type BoxTariffRawInfo = BoxTariffWarehouseItem & {
    dtNextBox: Date | null;
    dtTillMax: Date | null;
};
