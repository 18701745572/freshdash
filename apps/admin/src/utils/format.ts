export const formatMoney = (cents: number) => `¥${(cents / 100).toFixed(2)}`;

export const yuanToCents = (yuan: number) => Math.round(yuan * 100);

export const centsToYuan = (cents: number) => cents / 100;
