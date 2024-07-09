import {WebGL2Application} from '../../base/WebGL2Application';
import {Matrix4} from '../../../common/math/matrix/Matrix4';
import {GLProgramCache} from '../../../webgl/program/GLProgramCache';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {CanvasMouseEvent} from '../../../event/mouse/CanvasMouseEvent';
import {CanvasMouseEventManager} from '../../../event/mouse/CanvasEventEventManager';
import {ECanvasMouseEventType} from '../../../enum/ECanvasMouseEventType';
import {Vector2} from '../../../common/math/vector/Vector2';
import {IGLAttribute} from '../../../webgl/attribute/IGLAttribute';
import {ColorCube} from '../../../common/geometry/solid/ColorCube';

/**
 * 六角形应用。
 */
export class TranslateCubeApplication extends WebGL2Application {
    //绕y轴旋转角度
    private _currentYAngle = 0;
    //绕x轴旋转角度
    private _currentXAngle = 0;
    /** 步进角度 */
    private _incAngle = 0.5;
    /** 是否移动 */
    private _isMoved = false;
    /** 上一次鼠标位置 */
    private _lastPosition: Vector2 = new Vector2();
    /** 立方体 */
    private _cube: ColorCube = new ColorCube(0.3, 0.3, 0.3);
    /** 缓冲 */
    private _buffers: Map<IGLAttribute, WebGLBuffer> = new Map<IGLAttribute, WebGLBuffer>();
    
    /**
     * 构造
     */
    public constructor() {
        super();
        this.camera.z = 4;
        let vertexBuffer = this.bindBuffer(this._cube.vertexData());
        this._buffers.set(GLAttributeHelper.POSITION, vertexBuffer);
        let colorBuffer = this.bindBuffer(this._cube.colorData());
        this._buffers.set(GLAttributeHelper.COLOR, colorBuffer);
        GLRenderHelper.setDefaultState(this.webglContext);
        CanvasMouseEventManager.instance.registers(this, [
            {type: ECanvasMouseEventType.MOUSE_DOWN, callback: this.onMouseDown},
            {type: ECanvasMouseEventType.MOUSE_UP, callback: this.onMouseUp},
            {type: ECanvasMouseEventType.MOUSE_MOVE, callback: this.onMouseMove}
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
            this.renderCube(i);
        }
    }
    
    /**
     * 绑定缓冲。
     * @param {number[]} bufferData
     * @return {WebGLBuffer}
     * @private
     */
    private bindBuffer(bufferData: number[]): WebGLBuffer {
        let buffer = this.webglContext.createBuffer();
        this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, buffer);
        this.webglContext.bufferData(this.webglContext.ARRAY_BUFFER, new Float32Array(bufferData), this.webglContext.STATIC_DRAW);
        return buffer;
    }
    
    /**
     * 渲染六角星
     * @param {number} index
     * @private
     */
    private renderCube(index: number): void {
        this.worldMatrixStack.pushMatrix();
        let pos = index % 2 == 0 ? new Vector3([(index + 1) * 0.5, 0.0, 0.0]) : new Vector3([-0.5 * (index + 1), 0.0, 0.0]);
        this.worldMatrixStack.translate(pos);
        this.worldMatrixStack.rotate(this._currentXAngle, Vector3.right);
        this.worldMatrixStack.rotate(this._currentYAngle, Vector3.up);
        const program = GLProgramCache.instance.getMust('color');
        program.bind();
        program.loadSampler();
        let mvp = Matrix4.product(this.camera.viewProjectionMatrix, this.worldMatrixStack.modelViewMatrix);
        //将总变换矩阵送入渲染管线
        program.setMatrix4(GLShaderConstants.MVPMatrix, mvp);
        program.setVertexAttribute('aPosition', this._buffers.get(GLAttributeHelper.POSITION), GLAttributeHelper.POSITION.COMPONENT);
        program.setVertexAttribute('aColor', this._buffers.get(GLAttributeHelper.COLOR), GLAttributeHelper.COLOR.COMPONENT);
        this.webglContext.drawArrays(this.webglContext.TRIANGLES, 0, this._cube.vertexData().length / 3);
        program.unbind();
        this.worldMatrixStack.popMatrix();
    }
    
    /**
     * 鼠标按下
     * @param {CanvasMouseEvent} event
     */
    public onMouseDown(event: CanvasMouseEvent): void {
        let x = event.position.x;
        let y = event.position.y;
        //如果鼠标在<canvas>内开始移动
        let rect = this.canvas.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            this._isMoved = true;
            this._lastPosition = new Vector2([x, y]);
        }
    }
    
    d;
    
    /**
     * 鼠标移动
     * @param {CanvasMouseEvent} event
     */
    public onMouseMove(event: CanvasMouseEvent): void {
        let x = event.position.x;
        let y = event.position.y;
        if (this._isMoved) {
            this._currentYAngle = this._currentYAngle + (x - this._lastPosition.x) * this._incAngle;
            this._currentXAngle = this._currentXAngle + (y - this._lastPosition.y) * this._incAngle;
        }
        this._lastPosition = new Vector2([x, y]);
    }
    
    /**
     * 鼠标抬起
     */
    public onMouseUp(): void {
        this._isMoved = false;
    }
}