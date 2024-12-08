export const isProduction = process.env.NODE_ENV === "production";
export const isH5 = process.env.TARO_ENV === "h5";
export const isWeapp = process.env.TARO_ENV === "weapp";