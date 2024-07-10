import {WebGL2Application} from '../../base/WebGL2Application';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLProgramCache} from '../../../webgl/program/GLProgramCache';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {Belt} from '../../../common/geometry/solid/Belt';
import {Circle} from '../../../common/geometry/solid/Circle';
import {GLAttribute} from '../../../webgl/attribute/GLAttribute';
import {Vector3} from '../../../common/math/vector/Vector3';
import {CanvasMouseMoveEvent} from '../../../event/mouse/CanvasMouseMoveEvent';
import {CanvasMouseEventManager} from '../../../event/mouse/CanvasEventEventManager';

/**
 * 三角形绘制模式应用。
 */
export class TriangleDrawModeApplication extends WebGL2Application {
    /** 条带 */
    private _belt = new Belt();
    /** 扇形 */
    private _circle: Circle = new Circle();
    /** 扇形缓冲 */
    private _circleBuffers: Map<GLAttribute, WebGLBuffer> = new Map<GLAttribute, WebGLBuffer>();
    /** 鼠标移动事件 */
    private readonly _mouseMoveEvent: CanvasMouseMoveEvent;
    
    /**
     * 构造。
     */
    public constructor() {
        super();
        let beltVertexBuffer = this.bindBuffer(this._belt.vertexData());
        this._buffers.set(GLAttributeHelper.POSITION, beltVertexBuffer);
        let beltColorBuffer = this.bindBuffer(this._belt.colorData());
        this._buffers.set(GLAttributeHelper.COLOR, beltColorBuffer);
        let circleVertexBuffer = this.bindBuffer(this._circle.vertexData());
        this._circleBuffers.set(GLAttributeHelper.POSITION, circleVertexBuffer);
        let circleColorBuffer = this.bindBuffer(this._circle.colorData());
        this._circleBuffers.set(GLAttributeHelper.COLOR, circleColorBuffer);
        this._mouseMoveEvent = new CanvasMouseMoveEvent(this.canvas);
    }
    
    /**
     * 渲染。
     */
    public override render(): void {
        this.drawBelt();
        this.drawCircle();
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
     * 绘制
     * @private
     */
    private drawBelt(): void {
        let program = GLProgramCache.instance.getMust('color');
        program.bind();
        program.loadSampler();
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(new Vector3([-0.8, 0.0, 0.0]));
        this.worldMatrixStack.rotate(this._mouseMoveEvent.currentXAngle, Vector3.right);
        this.worldMatrixStack.rotate(this._mouseMoveEvent.currentYAngle, Vector3.up);
        //将总变换矩阵送入渲染管线
        program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        program.setVertexAttribute('aPosition', this._buffers.get(GLAttributeHelper.POSITION), GLAttributeHelper.POSITION.COMPONENT);
        program.setVertexAttribute('aColor', this._buffers.get(GLAttributeHelper.COLOR), GLAttributeHelper.COLOR.COMPONENT);
        this.webglContext.drawArrays(this.webglContext.TRIANGLE_STRIP, 0, this._belt.vertexCount());
        this.worldMatrixStack.popMatrix();
        program.unbind();
    }
    
    /**
     * 绘制
     * @private
     */
    private drawCircle(): void {
        let program = GLProgramCache.instance.getMust('color');
        program.bind();
        program.loadSampler();
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(new Vector3([0.8, 0.0, 0.0]));
        this.worldMatrixStack.rotate(this._mouseMoveEvent.currentXAngle, Vector3.right);
        this.worldMatrixStack.rotate(this._mouseMoveEvent.currentYAngle, Vector3.up);
        //将总变换矩阵送入渲染管线
        program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        program.setVertexAttribute('aPosition', this._circleBuffers.get(GLAttributeHelper.POSITION), GLAttributeHelper.POSITION.COMPONENT);
        program.setVertexAttribute('aColor', this._circleBuffers.get(GLAttributeHelper.COLOR), GLAttributeHelper.COLOR.COMPONENT);
        this.webglContext.drawArrays(this.webglContext.TRIANGLE_FAN, 0, this._circle.vertexCount());
        this.worldMatrixStack.popMatrix();
        program.unbind();
    }
}