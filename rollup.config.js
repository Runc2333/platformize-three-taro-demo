import alias from "@rollup/plugin-alias";
import glob from "fast-glob";
import path from "path";
import { mergeRollupOptions } from "platformize-three/dist-plugin";
import copy from "rollup-plugin-copy";

// 需要rollup打包的分包
const packages = ["Three"];

// 分包根目录
const packageRoot = "src/packages";

const banner = `/* eslint-disable */
// @ts-nocheck
/*******************************************************************************************************
****                                           !!!WARN!!!                                           ****
****               THIS FILE IS GENERATED AUTOMATICALLY BY ROLLUP, DO NOT MODIFY IT!                ****
**** IF YOU WANT TO MODIFY IT, PLEASE MODIFY THE ORIGINAL FILE ENDING WITH .rollup.ts OR .rollup.js ****
*******************************************************************************************************/
`;

const external = (id, parentId) => {
  // 实际开发中可去除 tests-three
  // 这个模块只用来加载示例
  const modulesToInclude = ["three", "platformize-three", "platformize", "tests-three"];

  if (modulesToInclude.some(mod =>
    id === mod ||
    id.startsWith(`${mod}/`) ||
    parentId === mod ||
    parentId.startsWith(`${mod}/`) ||
    id.includes("node_modules") ||
    parentId.includes("node_modules"),
  )) {
    return false;
  }

  return true;
};

const getPlugins = input => [
  alias({
    entries: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
    ],
  }),
  copy({
    targets: [
      ...input.map(file => {
        const originalPath = file.replace(".rollup", "-rollup-generated.h5");
        return {
          src: file,
          dest: path.dirname(originalPath),
          rename: path.basename(originalPath),
          transform: contents => `${banner}\n${contents}`,
        };
      }),
      ...input.map(file => {
        const originalPath = file.replace(".rollup", "-rollup-generated");
        return {
          src: file,
          dest: path.dirname(originalPath),
          rename: path.basename(originalPath),
          transform: contents => `${banner}\n${contents}`,
        };
      }),
    ],
    hook: "buildStart",
  }),
];

const entryFileNames = chunkInfo => {
  // 获取相对路径
  const originalPath = path.relative(process.cwd(), chunkInfo.facadeModuleId);
  // 原始扩展名
  const ext = path.extname(originalPath);
  // 基础文件名，去除 .rollup
  const baseName = path.basename(originalPath, `.rollup${ext}`);
  // 原始文件的目录
  const dirName = path.dirname(originalPath);
  // 拼接输出路径
  // 保留原始后缀且不能添加额外的后缀
  // 否则Taro会找不到多端文件
  return path.join(dirName, `${baseName}-rollup-generated.weapp${ext}`);
};

// 生成多个配置
// 每个分包一个配置
module.exports = packages.map(packageName => {
  const input = glob.sync(`${packageRoot}/${packageName}/**/*.rollup.{ts,js}`);

  return mergeRollupOptions(
    {
      input,
      treeshake: true,
      output: {
        format: "cjs",
        dir: ".",
        entryFileNames,
        chunkFileNames: `${packageRoot}/${packageName}/rollup-chunks/[name]-[hash]-rollup-generated.js`,
        banner,
      },
      plugins: getPlugins(input),
      external,
    },
    {
      minify: false,
    },
  );
});