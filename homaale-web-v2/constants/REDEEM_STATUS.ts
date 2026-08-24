export enum REDEEM_STATUS {
    Earned = "earned",
    Spent = "spent",
}

export const REDEEM_STATUS_ARRAY = [
    {
        id: REDEEM_STATUS.Earned,
        label: REDEEM_STATUS.Earned,
        value: REDEEM_STATUS.Earned,
    },
    {
        id: REDEEM_STATUS.Spent,
        label: REDEEM_STATUS.Spent,
        value: REDEEM_STATUS.Spent,
    },
];
