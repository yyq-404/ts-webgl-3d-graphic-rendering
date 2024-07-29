import {BaseScene} from './base/BaseScene';
import {RotatingCubeScene} from './webgl/RotationCubeScene';
import {CoordinateSystemScene} from './webgl/CoordinateSystemScene';
import {BasicWebGLScene} from './webgl/BasicWebGLScene';
import {MeshBuilderScene} from './webgl/MeshBuilderScene';
import {RotatingTriangleScene} from './webgl2/transform/RotatingTriangleScene';
import {SixPointStarScene} from './webgl2/projection/SixPointedStarScene';
import {TransformCubeScene} from './webgl2/transform/TransformCubeScene';
import {LineDrawModeScene} from './webgl2/draw/LineDrawModeScene';
import {TriangleDrawModeScene} from './webgl2/draw/TriangleDrawModeScene';
import {CameraViewScene} from './webgl2/camera/CameraViewScene';
import {FrontFaceCullScene} from './webgl2/camera/FrontFaceCullScene';
import {LightReflectionScene} from './webgl2/light/LightReflectionScene';
import {LightSourceScene} from './webgl2/light/LightSourceScene';
import {LightNormalScene} from './webgl2/light/LightNormalScene';
import {LightComputeScene} from './webgl2/light/LightComputeScene';
import {TextureCompressScene} from './webgl2/texture/TextureCompressScene';
import {TextureWrapScene} from './webgl2/texture/TextureWrapScene';
import {TextureSampleScene} from './webgl2/texture/TextureSampleScene';
import {TextureMipmapScene} from './webgl2/texture/TextureMipmapScene';
import {TextureMultiScene} from './webgl2/texture/TextureMultiScene';
import {ModelOBJScene} from './webgl2/model/ModelOBJScene';

/**
 * 场景管理器。
 */
export class SceneManager {
    /** 实例 */
    private static _instance: SceneManager;
    /** 当前场景 */
    private _currentScene: BaseScene;
    /** 场景集合 */
    private readonly _scenes: Map<string, typeof BaseScene> = new Map<string, typeof BaseScene>();
    
    /**
     * 构造
     * @private
     */
    private constructor() {
        this._scenes = new Map<string, typeof BaseScene>([
            ['RotatingCube', RotatingCubeScene],
            ['BasicWebGL', BasicWebGLScene],
            ['CoordinateSystem', CoordinateSystemScene],
            ['MeshBuilder', MeshBuilderScene],
            ['RotatingTriangle', RotatingTriangleScene],
            ['SixPointStar', SixPointStarScene],
            ['TransformCube', TransformCubeScene],
            ['LineDrawMode', LineDrawModeScene],
            ['TriangleDrawMode', TriangleDrawModeScene],
            ['CameraView', CameraViewScene],
            ['CullFace', FrontFaceCullScene],
            ['LightReflection', LightReflectionScene],
            ['LightSource', LightSourceScene],
            ['LightNormal', LightNormalScene],
            ['LightCompute', LightComputeScene],
            ['TextureCompress', TextureCompressScene],
            ['TextureWrap', TextureWrapScene],
            ['TextureSample', TextureSampleScene],
            ['TextureMipmap', TextureMipmapScene],
            ['TextureMulti', TextureMultiScene],
            ['ModelOBJ', ModelOBJScene]
        ]);
        this.changeScene('RotatingCube');
    }
    
    /**
     * 获取单例。
     * @return {TimerManager}
     */
    public static get instance(): SceneManager {
        if (!SceneManager._instance) {
            SceneManager._instance = new SceneManager();
        }
        return SceneManager._instance;
    }
    
    /**
     * 获取场景集合。
     * @return {Map<string, BaseScene>}
     */
    public get scenes(): Map<string, typeof BaseScene> {
        return this._scenes;
    }
    
    /**
     * 切换场景。
     * @param {string} sceneName
     */
    public changeScene(sceneName: string): void {
        this.dispose();
        let scene: typeof BaseScene = this._scenes.get(sceneName);
        this._currentScene = new scene();
    }
    
    /**
     * 运行。
     * @return {Promise<void>}
     */
    public async runAsync(): Promise<void> {
        if (this._currentScene) {
            await this._currentScene.runAsync();
        }
    }
    
    /**
     * 更新。
     * @param elapsedMsec
     * @param intervalSec
     */
    public update(elapsedMsec: number, intervalSec: number): void {
        if (this._currentScene) {
            this._currentScene.update(elapsedMsec, intervalSec);
            this._currentScene.render();
        }
    }
    
    /*
    释放。
     */
    public dispose(): void {
        if (this._currentScene) {
            this._currentScene.dispose();
        }
    }
}