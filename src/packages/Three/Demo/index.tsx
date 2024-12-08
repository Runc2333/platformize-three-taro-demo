import { useCallback, useEffect, useRef } from "react";

import Taro, { useRouter, type Canvas as TCanvas } from "@tarojs/taro";
import { Canvas, View } from "@tarojs/components";

import { isWeapp } from "@/constants/env";

import { getNode, withLoadingToast } from "@/utils/tools";

import type { WechatPlatform } from "platformize-three";

// rollup 会将 *.rollup.{ts,js} 文件编译为 *-rollup-generated.{ts,js}
import MainScript from "./scripts/main-rollup-generated";

definePageConfig({
  navigationBarTitleText: "GLTFLoader",
});
export default function Demo () {
  const { params: { demo = "GLTFLoader" } } = useRouter();

  const scriptRef = useRef<MainScript>();
  const platformRef = useRef<WechatPlatform | null>(null);

  useEffect(() => {
    if (isWeapp) {
      Taro.setNavigationBarTitle({
        title: demo,
      });
    } else {
      document.title = demo;
    }
  }, [demo]);

  const loadDemo = useCallback(
    async () => {
      if (scriptRef.current) {
        scriptRef.current.dispose();
      }
      scriptRef.current = new MainScript();
      if (isWeapp) {
        const canvas = await getNode(".webgl-canvas") as TCanvas;
        platformRef.current = await scriptRef.current.init(canvas, demo as any);
      } else {
        // h5
        while (!document.querySelector("#webgl-canvas")) {
          console.log("waiting for #webgl-canvas");
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        scriptRef.current.init(
          document.querySelector("#webgl-canvas") as HTMLCanvasElement,
          demo as any,
        );
      }
    },
    [demo],
  );

  useEffect(
    () => {
      withLoadingToast(loadDemo)();
    },
    [loadDemo],
  );

  return (
    <View className="w-screen h-screen">
      <Canvas
        disableScroll
        type="webgl"
        className="w-full h-full webgl-canvas"
        nativeProps={{
          id: "webgl-canvas",
        }}
        onTouchStart={e => platformRef.current?.dispatchTouchEvent?.(e as any)}
        onTouchMove={e => platformRef.current?.dispatchTouchEvent?.(e as any)}
        onTouchEnd={e => platformRef.current?.dispatchTouchEvent?.(e as any)}
      />
    </View>
  );
};