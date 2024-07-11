import {WebGL2Application} from '../../base/WebGL2Application';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLProgramCache} from '../../../webgl/program/GLProgramCache';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {Belt} from '../../../common/geometry/solid/Belt';
import {Fan} from '../../../common/geometry/solid/Fan';
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
    private _belts: Belt[] = [
        new Belt(0, 90, 3),
        new Belt(90, 270, 3)
    ];
    /** 扇形 */
    private _circle: Fan = new Fan();
    /** 扇形缓冲 */
    private _circleBuffers: Map<GLAttribute, WebGLBuffer> = new Map<GLAttribute, WebGLBuffer>();
    private _beltBuffers: Map<GLAttribute, WebGLBuffer> = new Map<GLAttribute, WebGLBuffer>();
    /** 鼠标移动事件 */
    private readonly _mouseMoveEvent: CanvasMouseMoveEvent;
    
    /**
     * 构造。
     */
    public constructor() {
        super();
        let beltPositionBuffer = this.bindBuffer(this._belt.vertex.positionArray);
        this._buffers.set(GLAttributeHelper.POSITION, beltPositionBuffer);
        let beltColorBuffer = this.bindBuffer(this._belt.vertex.colorArray);
        this._buffers.set(GLAttributeHelper.COLOR, beltColorBuffer);
        let circlePositionBuffer = this.bindBuffer(this._circle.vertex.positionArray);
        this._circleBuffers.set(GLAttributeHelper.POSITION, circlePositionBuffer);
        let circleColorBuffer = this.bindBuffer(this._circle.vertex.colorArray);
        this._circleBuffers.set(GLAttributeHelper.COLOR, circleColorBuffer);
        this._mouseMoveEvent = new CanvasMouseMoveEvent(this.canvas);
        this._belts.forEach(belt => {
            let positionBuffer = this.bindBuffer(belt.vertex.positionArray);
            this._beltBuffers.set(GLAttributeHelper.POSITION, positionBuffer);
            let colorBuffer = this.bindBuffer(belt.vertex.colorArray);
            this._beltBuffers.set(GLAttributeHelper.COLOR, colorBuffer);
        });
    }
    
    /**
     * 渲染。
     */
    public override render(): void {
        this.drawBelts();
        // this.drawBelt();
        // this.drawCircle();
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
        this.webglContext.drawArrays(this.webglContext.TRIANGLE_STRIP, 0, this._belt.vertex.count);
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
        this.webglContext.drawArrays(this.webglContext.TRIANGLE_FAN, 0, this._circle.vertex.count);
        this.worldMatrixStack.popMatrix();
        program.unbind();
    }
    
    private drawBelts(): void {
        for (let i = 0; i < this._belts.length; i++) {
            let belt = this._belts[i];
            let program = GLProgramCache.instance.getMust('color');
            program.bind();
            program.loadSampler();
            this.worldMatrixStack.pushMatrix();
            if (i % 2) {
                this.worldMatrixStack.rotate(90, Vector3.forward);
            } else {
                this.worldMatrixStack.rotate(-90, Vector3.forward);
            }
            this.worldMatrixStack.rotate(this._mouseMoveEvent.currentXAngle, Vector3.right);
            this.worldMatrixStack.rotate(this._mouseMoveEvent.currentYAngle, Vector3.up);
            //将总变换矩阵送入渲染管线
            program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
            program.setVertexAttribute('aPosition', this._buffers.get(GLAttributeHelper.POSITION), GLAttributeHelper.POSITION.COMPONENT);
            program.setVertexAttribute('aColor', this._buffers.get(GLAttributeHelper.COLOR), GLAttributeHelper.COLOR.COMPONENT);
            this.webglContext.drawArrays(this.webglContext.TRIANGLE_STRIP, 0, belt.vertex.count);
            this.worldMatrixStack.popMatrix();
            program.unbind();
        }
    }
}