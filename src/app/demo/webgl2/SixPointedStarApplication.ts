import {WebGL2Application} from '../../base/WebGL2Application';
import {SixPointedStar} from '../../../common/geometry/solid/SixPointedStar';
import {Matrix4} from '../../../common/math/matrix/Matrix4';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {GLProgramCache} from '../../../webgl/program/GLProgramCache';
import {IGLAttribute} from '../../../webgl/attribute/IGLAttribute';
import {Vector4} from '../../../common/math/vector/Vector4';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {Vector3} from '../../../common/math/vector/Vector3';


type SixPointedStarRenderParameters = {
    star: SixPointedStar,
    positionBuffer: WebGLBuffer,
    colorBuffer: WebGLBuffer
}

/**
 * 六角形应用。
 */
export class SixPointStarApplication extends WebGL2Application {
    
    private _sixStars: SixPointedStar[];
    //绕y轴旋转角度
    private currentYAngle = 0;
    //绕x轴旋转角度
    private currentXAngle = 0;
    private _starCount = 1;
    
    private _renderParameters: SixPointedStarRenderParameters[] = [];
    /** 顶点缓冲数据 */
    private _bufferData: Map<IGLAttribute, number[]> = new Map<IGLAttribute, number[]>();
    
    public constructor() {
        super();
        this._sixStars = [SixPointedStar.create()];
        this.camera.z = 50;
        this.camera.viewProjectionMatrix = Matrix4.frustum(-1.5, 1.5, -1, 1, 1, 100);
        GLRenderHelper.setDefaultState(this.webglContext);
        this.initStars();
    }
    
    private initStars() {
        const z = 0.3;
        for (let i = 0; i < this._starCount; i++) {
            let star = SixPointedStar.create(i * z);
            this._sixStars.push(star);
            let colorData = [];
            for (let j = 0; j < star.vertexData().length; j++) {
                if (j % 3 == 0) {
                    colorData.push(...new Vector4([1.0, 1.0, 1.0, 1.0]).rgba);
                } else {
                    colorData.push(...new Vector4([0.45, 0.75, 0.75, 1.0]).rgba);
                }
            }
            let positionBuffer = this.webglContext.createBuffer();
            this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, positionBuffer);
            this.webglContext.bufferData(this.webglContext.ARRAY_BUFFER, new Float32Array(star.vertexData()), this.webglContext.STATIC_DRAW);
            let colorBuffer = this.webglContext.createBuffer();
            this.webglContext.bindBuffer(this.webglContext.ARRAY_BUFFER, colorBuffer);
            this.webglContext.bufferData(this.webglContext.ARRAY_BUFFER, new Float32Array(colorData), this.webglContext.STATIC_DRAW);
            this._renderParameters.push({star, positionBuffer, colorBuffer});
        }
    }
    
    private initBufferData() {
    
    }
    
    // public override async runAsync(): Promise<void> {
    //     return super.runAsync();
    // }
    
    /**
     * 运行。
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        this.start();
    }
    
    public override update(elapsedMsec: number, intervalSec: number): void {
    
    }
    
    public override render(): void {
        GLRenderHelper.clearBuffer(this.webglContext);
        this.renderStars();
    }
    
    private renderStars() {
        this.worldMatrixStack.pushMatrix();
        //执行旋转,即按哪个轴旋转
        this.worldMatrixStack.rotate(this.currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this.currentXAngle, Vector3.right);
        //绘制物体
        // ooTri.drawSelf(ms);
        //恢复现场
        this._renderParameters.forEach(parameter => this.renderStar(parameter));
        this.worldMatrixStack.popMatrix();
        
    }
    
    private renderStar(parameter: SixPointedStarRenderParameters): void {
        const {star, positionBuffer, colorBuffer} = parameter;
        const program = GLProgramCache.instance.getMust('color');
        program.bind();
        program.loadSampler();
        let mvp = Matrix4.product(this.camera.viewProjectionMatrix, this.worldMatrixStack.modelViewMatrix);
        //将总变换矩阵送入渲染管线
        program.setMatrix4(GLShaderConstants.MVPMatrix, mvp);
        program.setVertexAttribute('aPosition', positionBuffer, GLAttributeHelper.POSITION.COMPONENT);
        program.setVertexAttribute('aColor', colorBuffer, GLAttributeHelper.COLOR.COMPONENT);
        this.webglContext.drawArrays(this.webglContext.TRIANGLES, 0, star.vertexCount());
        program.unbind();
    }
}