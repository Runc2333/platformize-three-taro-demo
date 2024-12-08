# platformize-three Taro DEMO

在 Taro 中通过 [platformize]([platformize](https://github.com/deepkolos/platformize)) 使用 Three.js 的简易 DEMO

如果本仓库对您有所帮助，请给个 Star ⭐️ 鼓励一下作者吧！

## 现有 Taro 项目接入教程

### 1. 安装依赖

```bash
  yarn add three@0.133.0 platformize-three
  
  yarn add --dev nodemon rollup@2.60.1 rollup-plugin-copy fast-glob concurrently @types/three@0.133.0 @rollup/plugin-alias
```

### 2. 配置 `rollup.config.js`

```javascript
import alias from "@rollup/plugin-alias";
import glob from "fast-glob";
import path from "path";
import { mergeRollupOptions } from "platformize-three/dist-plugin";
import copy from "rollup-plugin-copy";

// 需要rollup打包的分包
// 建议将依赖了 Three.js 的页面单独放到一个或多个分包中
// 不建议放在主包中，主包已经不堪重负了，饶了他吧
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

// 只将与 three.js 相关的模块打包进来
// 其他模块交由 Taro 的 webpack 处理
const external = (id, parentId) => {
  const modulesToInclude = ["three", "platformize-three", "platformize"];

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
      // 请根据实际情况修改这里的路径别名，也可以不使用
      { find: "@", replacement: path.resolve(__dirname, "src") },
    ],
  }),
  copy({
    targets: [
      // 复制一份原始文件供 H5 使用
      ...input.map(file => {
        const originalPath = file.replace(".rollup", "-rollup-generated.h5");
        return {
          src: file,
          dest: path.dirname(originalPath),
          rename: path.basename(originalPath),
          transform: contents => `${banner}\n${contents}`,
        };
      }),
      // 供类型提示使用
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
```

### 3. 配置 nodemon

> rollup自身不支持监听新增文件，为了方便开发，使用 nodemon 监听 rollup 的输入文件，一旦有变动就重新编译。

`nodemon.json`

```json
{
  "watch": [
    "src",
    "rollup.config.js"
  ],
  "ext": "rollup.ts,rollup.js",
  "legacyWatch": true,
  "exec": "rollup -c"
}
```

### 4. 配置 `package.json`

将 rollup 的打包流程集成到 Taro 之前，这里只演示了 weapp 和 h5，其他端请自行配置。

```json
{
  "scripts": {
    "build:weapp": "yarn rollup:build && taro build --type weapp",
    "build:h5": "yarn rollup:build && taro build --type h5",
    "dev:weapp": "concurrently \"yarn rollup:watch:on-change-only\" \"yarn build:weapp -- --watch\"",
    "dev:h5": "concurrently \"yarn rollup:watch:on-change-only\" \"yarn build:h5 -- --watch\"",
    "rollup:build": "rollup -c",
    "rollup:watch": "nodemon",
    "rollup:watch:on-change-only": "nodemon --on-change-only",
  }
}
```

### 5. 最后，记得在 `.gitignore` 中添加以下内容

```gitignore
.rollup.cache
*-rollup-generated.*
```

经过以上配置，即可在 Taro 项目中使用 Three.js 了。
将需要经过 rollup 打包的文件，也就是依赖 Three.js 的文件，命名为 `*.rollup.ts` 或 `*.rollup.js`。
在引入文件时，使用 `*-rollup-generated` 即可。
```typescript
// rollup 会将 *.rollup.{ts,js} 文件编译为 *-rollup-generated.{weapp,h5}.{ts,js}
// 不将文件命名为 *.rollup-generated.{weapp,h5}.{ts,js} 是因为 Taro 无法将这种格式的命名识别为多端文件
import MainScript from "./scripts/main-rollup-generated";
```