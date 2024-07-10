import {WebGL2Application} from '../../base/WebGL2Application';
import {Matrix4} from '../../../common/math/matrix/Matrix4';
import {GLProgramCache} from '../../../webgl/program/GLProgramCache';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {IGLAttribute} from '../../../webgl/attribute/IGLAttribute';
import {ColorCube} from '../../../common/geometry/solid/ColorCube';
import {CanvasKeyboardEventManager} from '../../../event/keyboard/CanvasKeyboardEventManager';
import {ECanvasKeyboardEventType} from '../../../enum/ECanvasKeyboardEventType';
import {CanvasMouseMoveEvent} from '../../../event/mouse/CanvasMouseMoveEvent';
import {CanvasMouseEventManager} from '../../../event/mouse/CanvasEventEventManager';

/**
 * 变换盒子应用。。
 */
export class TransformCubeApplication extends WebGL2Application {
    /** 盒子对象 */
    private _cube: ColorCube = new ColorCube(0.3, 0.3, 0.3);
    /** 缓冲 */
    private _buffers: Map<IGLAttribute, WebGLBuffer> = new Map<IGLAttribute, WebGLBuffer>();
    /** 矩阵变换类型 */
    private _transformType: string = 'translation';
    /** 鼠标移动事件 */
    private readonly _mouseMoveEvent: CanvasMouseMoveEvent;
    
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
        this._mouseMoveEvent = new CanvasMouseMoveEvent(this.canvas);
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
     * 处理鼠标事件。
     * @param {MouseEvent} event
     * @protected
     */
    protected override onMouseEvent(event: MouseEvent): void {
        CanvasMouseEventManager.instance.dispatch(this._mouseMoveEvent, event);
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
        this.worldMatrixStack.pushMatrix();
        let pos = index % 2 == 0 ? new Vector3([-0.5 * (index % 2 + 1), 0.0, 0.0]) : new Vector3([0.5 * (index % 2 + 1), 0.0, 0.0]);
        this.worldMatrixStack.translate(pos);
        this.worldMatrixStack.rotate(this._mouseMoveEvent.currentXAngle, Vector3.right);
        this.worldMatrixStack.rotate(this._mouseMoveEvent.currentYAngle, Vector3.up);
        if (index % 2) {
            if (this._transformType == 'rotation') {
                this.worldMatrixStack.rotate(45, Vector3.forward);
            } else if (this._transformType == 'scale') {
                this.worldMatrixStack.rotate(30, Vector3.forward);
                this.worldMatrixStack.scale(new Vector3([0.4, 2, 0.6]));
            }
        }
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
   
}