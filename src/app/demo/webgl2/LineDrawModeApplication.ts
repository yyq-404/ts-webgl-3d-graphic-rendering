import {WebGL2Application} from '../../base/WebGL2Application';
import {Vector3} from '../../../common/math/vector/Vector3';
import {Color4} from '../../../common/color/Color4';
import {CanvasKeyboardEventManager} from '../../../event/keyboard/CanvasKeyboardEventManager';
import {ECanvasKeyboardEventType} from '../../../enum/ECanvasKeyboardEventType';
import {Point3s} from '../../../common/geometry/solid/Point3s';

/**
 * 线段绘制模式应用。
 */
export class LineDrawModeApplication extends WebGL2Application {
    /** 绘制模式 */
    private _mode: GLint;
    /** 点集 */
    private _points: Point3s = new Point3s(
        [Vector3.zero.copy(), new Vector3([0.5, 0.5, 0.0]), new Vector3([-0.5, 0.5, 0.0]), new Vector3([-0.5, -0.5, 0.0]), new Vector3([0.5, -0.5, 0.0])],
        [Color4.Yellow, Color4.White, Color4.Green, Color4.White, Color4.Yellow]);
    
    /**
     * 构造。
     */
    public constructor() {
        super();
        this._mode = this.webglContext.POINTS;
        this.createBuffers(this._points);
        CanvasKeyboardEventManager.instance.registers(this, [
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '1', callback: () => this._mode = this.webglContext.POINTS},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '2', callback: () => this._mode = this.webglContext.LINES},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '3', callback: () => this._mode = this.webglContext.LINE_STRIP},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '4', callback: () => this._mode = this.webglContext.LINE_LOOP}
        ]);
    }
    
    /**
     * 渲染。
     */
    public override render(): void {
        this.draw();
    }
    
    /**
     * 绘制
     * @private
     */
    private draw(): void {
        this.begin();
        this.drawArrays(this._points, this._mode);
        this.end();
    }
}