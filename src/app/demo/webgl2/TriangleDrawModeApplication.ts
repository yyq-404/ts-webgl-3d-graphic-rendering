import {WebGL2Application} from '../../base/WebGL2Application';
import {Belt} from '../../../common/geometry/solid/Belt';
import {Fan} from '../../../common/geometry/solid/Fan';
import {Vector3} from '../../../common/math/vector/Vector3';
import {CanvasKeyboardEventManager} from '../../../event/keyboard/CanvasKeyboardEventManager';
import {ECanvasKeyboardEventType} from '../../../enum/ECanvasKeyboardEventType';
import {Geometry} from '../../../common/geometry/Geometry';

/**
 * 三角形绘制模式应用。
 */
export class TriangleDrawModeApplication extends WebGL2Application {
    /** 条形集合 */
    private _belts: Belt[] = [
        new Belt(0, 90, 3),
        new Belt(180, 270, 3)
    ];
    /** 扇形和条形 */
    private _solids: Geometry[] = [new Belt(), new Fan()];
    /** 挡墙绘制方式 */
    private _currentDrawMethod: () => void;
    
    /**
     * 构造。
     */
    public constructor() {
        super(true);
        this.createBuffers(...this._solids);
        this.createBuffers(...this._belts);
        CanvasKeyboardEventManager.instance.registers(this, [
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '1', callback: () => this._currentDrawMethod = this.drawSolids},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '2', callback: () => this._currentDrawMethod = this.drawBelts}
        ]);
        this._currentDrawMethod = this.drawSolids;
    }
    
    /**
     * 渲染。
     */
    public override render(): void {
        this._currentDrawMethod();
    }
    
    /**
     * 绘制条形和扇形
     * @private
     */
    private drawSolids(): void {
        this._solids.forEach((solid, index) => {
            this.begin();
            this.worldMatrixStack.translate(new Vector3([(solid instanceof Belt) ? -0.8 : 0.8, 0.0, 0.0]));
            this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
            this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
            this.drawArrays(solid, (solid instanceof Belt) ? this.webglContext.TRIANGLE_STRIP : this.webglContext.TRIANGLE_FAN);
            this.end();
        });
    }
    
    /**
     * 绘制条形集合。
     * @private
     */
    private drawBelts(): void {
        this._belts.forEach((belt, index) => {
            this.begin();
            this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
            this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
            //将总变换矩阵送入渲染管线
            this.drawArrays(belt, this.webglContext.TRIANGLE_STRIP);
            this.end();
        });
    }
}