import {WebGL2Application} from '../../base/WebGL2Application';
import {Triangle} from '../../../common/geometry/solid/Triangle';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {Matrix4} from '../../../common/math/matrix/Matrix4';
import {GLProgramCache} from '../../../webgl/program/GLProgramCache';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';

/**
 * 立方体旋转应用
 */
export class RotationTriangleApplication extends WebGL2Application {
    private _triangle: Triangle;
    private _vertexBuffer: WebGLBuffer;
    private _colorBuffer: WebGLBuffer;
    private _colorData = [
        1.0, 1.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 0.0, 1.0
    ];

    /** 旋转角度 */
    private _currentAngle = 0;
    /** 旋转角度步进值 */
    private _incAngle = 100;

    /**
     * 构造
     */
    public constructor() {
        super({antialias: true});
        this._triangle = new Triangle(new Vector3([3.0, 0.0, 0.0]), new Vector3([0.0, 0.0, 0.0]), new Vector3([0.0, 3.0, 0.0]));
        this.bindBuffer();
        this.camera.z = 8;
        this.camera.viewProjectionMatrix = Matrix4.frustum(-1.5, 1.5, -1, 1, 1, 100);
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
        GLRenderHelper.clearBuffer(this.webglContext);
        this.draw();
    }

    private draw(): void {
        let program = GLProgramCache.instance.getMust('color');
        program.bind();
        program.loadSampler();
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.rotate(this._currentAngle, Vector3.up);
        // this.webglContext.useProgram(program);//指定使用某套着色器程序
        //获取总变换矩阵引用id
        // let uMVPMatrixHandle = this.webglContext.getUniformLocation(program.program, 'uMVPMatrix');
        let mvp = Matrix4.product(this.camera.viewProjectionMatrix, this.worldMatrixStack.modelViewMatrix);
        //将总变换矩阵送入渲染管线
        program.setMatrix4(GLShaderConstants.MVPMatrix, mvp);
        // this.webglContext.uniformMatrix4fv(uMVPMatrixHandle, false, new Float32Array(mvp.values));
        let posLoc = program.getAttributeLocation('aPosition');
        this.webglContext.enableVertexAttribArray(posLoc);//启用顶点坐标数据数组
        this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, this._vertexBuffer);	//绑定顶点坐标数据缓冲
        //给管线指定顶点坐标数据
        this.webglContext.vertexAttribPointer(posLoc, 3, this.webglContext.FLOAT, false, 0, 0);
        let colorLoc = program.getAttributeLocation('aColor');
        this.webglContext.enableVertexAttribArray(colorLoc);//启用颜色坐标数据数组
        this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, this._colorBuffer);	//绑定颜色坐标数据缓冲
        //给管线指定颜色坐标数据
        this.webglContext.vertexAttribPointer(colorLoc, 4, this.webglContext.FLOAT, false, 0, 0);
        this.webglContext.drawArrays(this.webglContext.TRIANGLES, 0, this._triangle.vertexCount());
        this.worldMatrixStack.popMatrix();
        program.unbind();
    }

    /**
     * 绑定buffer
     * @private
     */
    private bindBuffer(): void {
        this._vertexBuffer = this.webglContext.createBuffer();
        this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, this._vertexBuffer);
        this.webglContext.bufferData(this.webglContext.ARRAY_BUFFER, new Float32Array(this._triangle.vertexData()), this.webglContext.STATIC_DRAW);
        this._colorBuffer = this.webglContext.createBuffer();
        this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, this._colorBuffer);
        this.webglContext.bufferData(this.webglContext.ARRAY_BUFFER, new Float32Array(this._colorData), this.webglContext.STATIC_DRAW);
    }
}