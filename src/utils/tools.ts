import Taro from "@tarojs/taro";

export const getNode = (selector: string) => new Promise((resolve, reject) => {
  Taro.createSelectorQuery()
    .select(selector)
    .node(res => {
      if (res) {
        resolve(res.node);
      } else {
        reject();
      }
    })
    .exec();
});

export function withLoadingToast<T, Args extends any[]> (fn: (...args: Args) => (T | Promise<T>), message: string = "加载中...", mask = false) {
  return async (...args: Args) => {
    Taro.showLoading({
      title: message,
      mask,
    });
    try {
      return await fn(...args);
    } finally {
      Taro.hideLoading({ noConflict: true });
    }
  };
}