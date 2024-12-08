import { Button, View } from "@tarojs/components";
import Taro from "@tarojs/taro";

const DEMOS = [
  "GLTFLoader",
  "ThreeSpritePlayer",
  "DeviceOrientationControls",
  "RGBELoader",
  "SVGLoader",
  "OBJLoader",
  "MeshOpt",
  "EXRLoader",
  "HDRPrefilterTexture",
  "MTLLoader",
  "LWOLoader",
  "FBXLoader",
  "BVHLoader",
  "ColladaLoader",
  "MeshQuantization",
  "TTFLoader",
  "STLLoader",
  "PDBLoader",
  "TGALoader",
  "VTKLoader",
  "MemoryTest",
] as const;

definePageConfig({
  navigationBarTitleText: "首页",
});
export default function Index () {
  return (
    <View className="w-screen h-screen">
      {DEMOS.map(demo => (
        <Button
          key={demo}
          onClick={() => Taro.navigateTo({ url: `/packages/Three/Demo/index?demo=${demo}` })}
        >
          {demo}
        </Button>
      ))}
    </View>
  );
}