import { Clock, Color, PerspectiveCamera, Scene, sRGBEncoding, TextureLoader, WebGL1Renderer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PlatformManager, WechatPlatform } from "platformize-three";
import {
  type Demo,
  DemoBVHLoader,
  DemoColladaLoader,
  DemoDeviceOrientationControls,
  DemoEXRLoader,
  DemoFBXLoader,
  DemoGLTFLoader,
  DemoHDRPrefilterTexture,
  DemoLWOLoader,
  DemoMemoryTest,
  DemoMeshOpt,
  DemoMeshQuantization,
  DemoMTLLoader,
  DemoOBJLoader,
  DemoPDBLoader,
  DemoRGBELoader,
  DemoSTLLoader,
  DemoSVGLoader,
  DemoTGALoader,
  DemoThreeSpritePlayer,
  DemoTTFLoader,
  DemoVTKLoader,
} from "tests-three";

import { isWeapp } from "@/constants/env";

import type { Canvas } from "@tarojs/taro";

const DEMO_MAP = {
  GLTFLoader: DemoGLTFLoader,
  ThreeSpritePlayer: DemoThreeSpritePlayer,
  DeviceOrientationControls: DemoDeviceOrientationControls,
  RGBELoader: DemoRGBELoader,
  SVGLoader: DemoSVGLoader,
  OBJLoader: DemoOBJLoader,
  MeshOpt: DemoMeshOpt,
  EXRLoader: DemoEXRLoader,
  HDRPrefilterTexture: DemoHDRPrefilterTexture,
  MTLLoader: DemoMTLLoader,
  LWOLoader: DemoLWOLoader,
  FBXLoader: DemoFBXLoader,
  BVHLoader: DemoBVHLoader,
  ColladaLoader: DemoColladaLoader,
  MeshQuantization: DemoMeshQuantization,
  TTFLoader: DemoTTFLoader,
  STLLoader: DemoSTLLoader,
  PDBLoader: DemoPDBLoader,
  TGALoader: DemoTGALoader,
  VTKLoader: DemoVTKLoader,
  MemoryTest: DemoMemoryTest,
} as const;

export default class MainScript {
  platform: WechatPlatform;
  disposing: boolean = false;
  demo: Demo;
  deps: {
    renderer: WebGL1Renderer;
    camera: PerspectiveCamera;
    scene: Scene;
    clock: Clock;
    gltfLoader: GLTFLoader;
    textureLoader: TextureLoader;
  };

  async init (
    canvas: HTMLCanvasElement | Canvas,
    demoName: keyof typeof DEMO_MAP,
  ) {
    if (isWeapp) {
      this.platform = new WechatPlatform(canvas);
      PlatformManager.set(this.platform);
    }

    const renderer = new WebGL1Renderer({
      canvas: canvas as HTMLCanvasElement,
      antialias: true,
      alpha: false,
    });
    const camera = new PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    const scene = new Scene();
    const clock = new Clock();
    const gltfLoader = new GLTFLoader();
    const textureLoader = new TextureLoader();

    this.deps = { renderer, camera, scene, clock, gltfLoader, textureLoader };

    this.demo = new DEMO_MAP[demoName](this.deps);
    await this.demo.init();

    scene.position.z = -3;
    scene.background = new Color(0xffffff);
    renderer.outputEncoding = sRGBEncoding;
    renderer.setPixelRatio(2);
    renderer.setSize(canvas.width, canvas.height);

    const render = () => {
      if (this.disposing) return;
      this.demo.update();
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };

    render();

    return this.platform;
  }

  dispose () {
    this.disposing = true;
    this.demo.dispose();
  }

  async switch (demoName: keyof typeof DEMO_MAP) {
    await this.demo.dispose();
    this.demo = new DEMO_MAP[demoName](this.deps);
    await this.demo.init();
  }
}