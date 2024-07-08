import {WebGL2Application} from '../../base/WebGL2Application';
import {Triangle} from '../../../common/geometry/solid/Triangle';
import {Vector3} from '../../../common/math/vector/Vector3';
import {Matrix4} from '../../../common/math/matrix/Matrix4';
import {GLProgramCache} from '../../../webgl/program/GLProgramCache';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {Vector4} from '../../../common/math/vector/Vector4';
import {IGLAttribute} from '../../../webgl/attribute/IGLAttribute';

/**
 * 立方体旋转应用
 */
export class RotationTriangleApplication extends WebGL2Application {
    /** 三角形 */
    private _triangle: Triangle = new Triangle([new Vector3([3.0, 0.0, 0.0]), new Vector3([0.0, 0.0, 0.0]), new Vector3([0.0, 3.0, 0.0])]);
    /** 颜色数据 */
    private _colorData: number[] = [
        ...new Vector4([1.0, 1.0, 1.0, 1.0]).rgba,
        ...new Vector4([0.0, 0.0, 1.0, 1.0]).rgba,
        ...new Vector4([0.0, 1.0, 0.0, 1.0]).rgba
    ];
    /** 顶点缓冲数据 */
    private _bufferData: Map<IGLAttribute, number[]> = new Map<IGLAttribute, number[]>([
        [GLAttributeHelper.POSITION, this._triangle.vertexData()],
        [GLAttributeHelper.COLOR, this._colorData]
    ]);
    /** 顶点缓冲 */
    private _buffers: Map<IGLAttribute, WebGLBuffer> = new Map<IGLAttribute, WebGLBuffer>();
    /** 旋转角度 */
    private _currentAngle = 0;
    /** 旋转角度步进值 */
    private _incAngle = 100;
    
    /**
     * 构造
     */
    public constructor() {
        super({antialias: true, premultipliedAlpha: false});
        this._bufferData.forEach((bufferData: number[], attribute: IGLAttribute) => {
            this.bindBuffer(attribute, bufferData);
        });
        this.camera.z = 10;
    }
    
    /**
     * 运行。
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        this.start();
    }
    
    /** 更新。
     * @param elapsedMsec
     * @param intervalSec
     */
    public override update(elapsedMsec: number, intervalSec: number): void {
        this._currentAngle += this._incAngle * intervalSec;
        if (this._currentAngle > 360) {
            this._currentAngle %= 360;
        }
        super.update(elapsedMsec, intervalSec);
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this.renderRotationTriangle();
    }
    
    /**
     * 渲染旋转三角形。
     * @private
     */
    private renderRotationTriangle(): void {
        let program = GLProgramCache.instance.getMust('color');
        program.bind();
        program.loadSampler();
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.rotate(this._currentAngle, Vector3.up);
        let mvp = Matrix4.product(this.camera.viewProjectionMatrix, this.worldMatrixStack.modelViewMatrix);
        //将总变换矩阵送入渲染管线
        program.setMatrix4(GLShaderConstants.MVPMatrix, mvp);
        program.setVertexAttribute('aPosition', this._buffers.get(GLAttributeHelper.POSITION), GLAttributeHelper.POSITION.COMPONENT);
        program.setVertexAttribute('aColor', this._buffers.get(GLAttributeHelper.COLOR), GLAttributeHelper.COLOR.COMPONENT);
        this.webglContext.drawArrays(this.webglContext.TRIANGLES, 0, this._triangle.vertexCount());
        this.worldMatrixStack.popMatrix();
        program.unbind();
    }
    
    /**
     * 绑定buffer
     * @private
     */
    private bindBuffer(attribute: IGLAttribute, bufferData: number[]): void {
        let buffer = this.webglContext.createBuffer();
        this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, buffer);
        this.webglContext.bufferData(this.webglContext.ARRAY_BUFFER, new Float32Array(bufferData), this.webglContext.STATIC_DRAW);
        this._buffers.set(attribute, buffer);
    }
}