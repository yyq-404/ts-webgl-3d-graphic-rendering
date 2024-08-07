import {WebGL2Scene} from '../../base/WebGL2Scene';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {SixPointedStar} from '../../../common/geometry/solid/SixPointedStar';
import {Geometry} from '../../../common/geometry/Geometry';
import {IGLAttribute} from '../../../webgl/attribute/IGLAttribute';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';

/**
 * 六角形场景。
 */
export class SixPointStarScene extends WebGL2Scene {
    /** 六角星数量 */
    private _starCount = 6;
    /** 每个六角星z轴间距 */
    private readonly _depth: number = 0.3;

    /**
     * 构造
     */
    public constructor() {
        super(true);
        this.camera.z = 4;
        this.createStars();
        GLRenderHelper.setDefaultState(this.gl);
    }

    /**
     * 渲染。
     */
    public override render(): void {
        GLRenderHelper.clearBuffer(this.gl);
        this.renderStars();
    }

    /**
     * 渲染六角星列表。
     * @private
     */
    private renderStars() {
        this.matrixStack.pushMatrix();
        //执行旋转,即按哪个轴旋转
        this.matrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.matrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.vertexBuffers.forEach((buffers, star) => this.renderStar(star, buffers));
        this.matrixStack.popMatrix();
    }

    /**
     * 创建六角星渲染参数。
     * @private
     */
    private createStars() {
        for (let i = 0; i < this._starCount; i++) {
            let star = SixPointedStar.create(i * this._depth);
            this.createBuffers(star);
        }
    }

    /**
     * 渲染六角星
     * @private
     * @param star
     * @param buffers
     */
    private renderStar(star: Geometry, buffers: Map<IGLAttribute, WebGLBuffer>): void {
        this.program.bind();
        this.program.loadSampler();
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        for (const entity of buffers.entries()) {
            this.program.setVertexAttribute(entity[0].NAME, entity[1], entity[0].COMPONENT);
        }
        this.gl.drawArrays(this.gl.TRIANGLES, 0, star.vertex.count);
        this.program.unbind();
    }
}