import {WebGL2Application} from '../../base/WebGL2Application';
import {Triangle} from '../../../common/geometry/solid/Triangle';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLProgramCache} from '../../../webgl/program/GLProgramCache';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {IGLAttribute} from '../../../webgl/attribute/IGLAttribute';
import {Color4} from '../../../common/color/Color4';

/**
 * 立方体旋转应用
 */
export class RotationTriangleApplication extends WebGL2Application {
    /** 三角形 */
    private _triangle: Triangle = new Triangle([new Vector3([3.0, 0.0, 0.0]), new Vector3([0.0, 0.0, 0.0]), new Vector3([0.0, 3.0, 0.0])]);
    /** 颜色数据 */
    private _colorData: number[] = [
        ...new Color4([1.0, 1.0, 1.0, 1.0]).rgba,
        ...new Color4([0.0, 0.0, 1.0, 1.0]).rgba,
        ...new Color4([0.0, 1.0, 0.0, 1.0]).rgba
    ];
    /** 顶点缓冲数据 */
    private _bufferData: Map<IGLAttribute, number[]> = new Map<IGLAttribute, number[]>([
        [GLAttributeHelper.POSITION, this._triangle.vertexData()],
        [GLAttributeHelper.COLOR, this._colorData]
    ]);
    /** 旋转角度 */
    private _currentAngle = 0;
    /** 旋转角度步进值 */
    private _incAngle = 100;
    
    /**
     * 构造
     */
    public constructor() {
        super();
        this._bufferData.forEach((bufferData: number[], attribute: IGLAttribute) => {
            let buffer = this.bindBuffer(bufferData);
            this._buffers.set(attribute, buffer);
        });
        this.camera.z = 10;
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
        //将总变换矩阵送入渲染管线
        program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        program.setVertexAttribute('aPosition', this._buffers.get(GLAttributeHelper.POSITION), GLAttributeHelper.POSITION.COMPONENT);
        program.setVertexAttribute('aColor', this._buffers.get(GLAttributeHelper.COLOR), GLAttributeHelper.COLOR.COMPONENT);
        this.webglContext.drawArrays(this.webglContext.TRIANGLES, 0, this._triangle.vertexCount());
        this.worldMatrixStack.popMatrix();
        program.unbind();
    }
}