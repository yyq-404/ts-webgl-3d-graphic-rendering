import {WebGL2Application} from '../../base/WebGL2Application';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {ColorCube} from '../../../common/geometry/solid/ColorCube';
import {CanvasKeyboardEventManager} from '../../../event/keyboard/CanvasKeyboardEventManager';
import {ECanvasKeyboardEventType} from '../../../enum/ECanvasKeyboardEventType';
import {CanvasMouseEventManager} from '../../../event/mouse/CanvasMouseEventManager';

/**
 * 变换盒子应用。。
 */
export class TransformCubeApplication extends WebGL2Application {
    /** 盒子对象 */
    private _cube: ColorCube = new ColorCube(0.3, 0.3, 0.3);
    /** 矩阵变换类型 */
    private _transformType: string = '';
    
    /**
     * 构造
     */
    public constructor() {
        super(true);
        this.camera.z = 4;
        this.createBuffers(this._cube);
        GLRenderHelper.setDefaultState(this.webglContext);
        CanvasKeyboardEventManager.instance.registers(this, [
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '1', callback: () => this._transformType = 'translation'},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '2', callback: () => this._transformType = 'rotation'},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '3', callback: () => this._transformType = 'scale'}
        ]);
    }
    
    /**
     * 渲染。
     */
    public override render(): void {
        GLRenderHelper.clearBuffer(this.webglContext);
        this.renderCubes();
    }
    
    /**
     * 渲染六角星列表。
     * @private
     */
    private renderCubes(count: number = 2): void {
        for (let i = 0; i < count; i++) {
            this.renderTranslationCube(i);
        }
    }
    
    /**
     * 渲染六角星
     * @param {number} index
     * @private
     */
    private renderTranslationCube(index: number): void {
        this.begin();
        let pos = index % 2 == 0 ? new Vector3([-0.5 * (index % 2 + 1), 0.0, 0.0]) : new Vector3([0.5 * (index % 2 + 1), 0.0, 0.0]);
        this.worldMatrixStack.translate(pos);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        if (index % 2) {
            this.onTransform();
        }
        this.drawArrays(this._cube, this.webglContext.TRIANGLES);
        this.end();
    }
    
    /**
     * 执行变换。
     * @private
     */
    private onTransform(): void {
        switch (this._transformType) {
            case 'translation':
                this.worldMatrixStack.rotate(45, Vector3.forward);
                break;
            case 'scale':
                this.worldMatrixStack.rotate(30, Vector3.forward);
                this.worldMatrixStack.scale(new Vector3([0.4, 2, 0.6]));
                break;
            default:
                break;
        }
    }
}