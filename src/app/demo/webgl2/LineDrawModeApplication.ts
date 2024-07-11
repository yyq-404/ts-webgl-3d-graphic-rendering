import {WebGL2Application} from '../../base/WebGL2Application';
import {Vector3} from '../../../common/math/vector/Vector3';
import {Color4} from '../../../common/color/Color4';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {CanvasKeyboardEventManager} from '../../../event/keyboard/CanvasKeyboardEventManager';
import {ECanvasKeyboardEventType} from '../../../enum/ECanvasKeyboardEventType';

/**
 * 线段绘制模式应用。
 */
export class LineDrawModeApplication extends WebGL2Application {
    /** 绘制模式 */
    private _mode: GLint;
    /** 顶点位置数据 */
    private _vertexData = [
        ...new Vector3([0.0, 0.0, 0.0]).xyz,
        ...new Vector3([0.5, 0.5, 0.0]).xyz,
        ...new Vector3([-0.5, 0.5, 0.0]).xyz,
        ...new Vector3([-0.5, -0.5, 0.0]).xyz,
        ...new Vector3([0.5, -0.5, 0.0]).xyz
    ];
    /** 顶点颜色数据 */
    private _colorData: number[] = [
        ...Color4.Yellow.rgba,
        ...Color4.White.rgba,
        ...Color4.Green.rgba,
        ...Color4.White.rgba,
        ...Color4.Yellow.rgba
    ];
    
    /**
     * 构造。
     */
    public constructor() {
        super();
        this._mode = this.webglContext.LINE_LOOP;
        let vertexBuffer = this.bindBuffer(this._vertexData);
        this._buffers.set(GLAttributeHelper.POSITION, vertexBuffer);
        let colorBuffer = this.bindBuffer(this._colorData);
        this._buffers.set(GLAttributeHelper.COLOR, colorBuffer);
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
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setVertexAttribute('aPosition', this._buffers.get(GLAttributeHelper.POSITION), GLAttributeHelper.POSITION.COMPONENT);
        this.program.setVertexAttribute('aColor', this._buffers.get(GLAttributeHelper.COLOR), GLAttributeHelper.COLOR.COMPONENT);
        this.webglContext.drawArrays(this._mode, 0, this._vertexData.length / 3);
        this.end();
    }
}