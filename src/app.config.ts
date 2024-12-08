export default defineAppConfig({
  pages: [
    "pages/index/index",
  ],
  subPackages: [
    {
      root: "packages/Three",
      pages: [
        "Demo/index",
      ],
    },
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
});