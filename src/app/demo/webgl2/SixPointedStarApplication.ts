import {WebGL2Application} from '../../base/WebGL2Application';
import {SixPointedStar} from '../../../common/geometry/solid/SixPointedStar';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {CanvasMouseMoveEvent} from '../../../event/mouse/CanvasMouseMoveEvent';
import {CanvasMouseEventManager} from '../../../event/mouse/CanvasEventEventManager';
import {IGLAttribute} from '../../../webgl/attribute/IGLAttribute';
import {IGeometry} from '../../../common/geometry/IGeometry';

/**
 * 六角形应用。
 */
export class SixPointStarApplication extends WebGL2Application {
    /** 六角星数量 */
    private _starCount = 6;
    /** 每个六角星z轴间距 */
    private readonly _depth: number = 0.3;
    /** 鼠标移动事件 */
    private readonly _mouseMoveEvent: CanvasMouseMoveEvent;
    
    /**
     * 构造
     */
    public constructor() {
        super();
        this.camera.z = 4;
        this.createStars();
        GLRenderHelper.setDefaultState(this.webglContext);
        this._mouseMoveEvent = new CanvasMouseMoveEvent(this.canvas);
    }
    
    /**
     * 渲染。
     */
    public override render(): void {
        GLRenderHelper.clearBuffer(this.webglContext);
        this.renderStars();
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
     * 渲染六角星列表。
     * @private
     */
    private renderStars() {
        this.worldMatrixStack.pushMatrix();
        //执行旋转,即按哪个轴旋转
        this.worldMatrixStack.rotate(this._mouseMoveEvent.currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this._mouseMoveEvent.currentXAngle, Vector3.right);
        this.vertexBuffers.forEach((buffers, star) => {
            this.renderStar(star, buffers);
        });
        this.worldMatrixStack.popMatrix();
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
    private renderStar(star: IGeometry, buffers: Map<IGLAttribute, WebGLBuffer>): void {
        this.program.bind();
        this.program.loadSampler();
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        for (const entity of buffers.entries()) {
            this.program.setVertexAttribute(entity[0].NAME, entity[1], entity[0].COMPONENT);
        }
        this.webglContext.drawArrays(this.webglContext.TRIANGLES, 0, star.vertex.count);
        this.program.unbind();
    }
}