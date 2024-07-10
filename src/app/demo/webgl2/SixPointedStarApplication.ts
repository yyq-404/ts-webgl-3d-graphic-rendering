import {WebGL2Application} from '../../base/WebGL2Application';
import {SixPointedStar} from '../../../common/geometry/solid/SixPointedStar';
import {GLProgramCache} from '../../../webgl/program/GLProgramCache';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {CanvasMouseMoveEvent} from '../../../event/mouse/CanvasMouseMoveEvent';
import {CanvasMouseEventManager} from '../../../event/mouse/CanvasEventEventManager';
import {Color4} from '../../../common/color/Color4';


/**
 * 六角星渲染参数
 */
type SixPointedStarRenderParameters = {
    /** 顶点数量 */
    vertexCount: number,
    /** 位置缓冲数据 */
    positionBuffer: WebGLBuffer,
    /** 颜色缓冲数据 */
    colorBuffer: WebGLBuffer
}

/**
 * 六角形应用。
 */
export class SixPointStarApplication extends WebGL2Application {
    /** 六角星数量 */
    private _starCount = 6;
    /** 六角星渲染参数集合 */
    private _starRenderParameters: SixPointedStarRenderParameters[] = [];
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
        this._starRenderParameters.forEach(parameter => this.renderStar(parameter));
        this.worldMatrixStack.popMatrix();
    }
    
    /**
     * 创建六角星渲染参数。
     * @private
     */
    private createStars() {
        for (let i = 0; i < this._starCount; i++) {
            let star = SixPointedStar.create(i * this._depth);
            let positionBuffer = this.bindBuffer(star.vertexData());
            let colorBuffer = this.bindBuffer(this.createColorData(star));
            this._starRenderParameters.push({vertexCount: star.vertexCount(), positionBuffer, colorBuffer});
        }
    }
    
    /**
     * 创建顶点颜色数据。
     * @param {SixPointedStar} star
     * @return {number[]}
     * @private
     */
    private createColorData(star: SixPointedStar): number[] {
        let colorData: number[] = [];
        for (let i = 0; i < star.vertexCount(); i++) {
            colorData.push(...(i % 3 ? new Color4([0.45, 0.75, 0.75, 1.0]).rgba : Color4.White.rgba));
        }
        return colorData;
    }
    
    /**
     * 渲染六角星
     * @param {SixPointedStarRenderParameters} parameter
     * @private
     */
    private renderStar(parameter: SixPointedStarRenderParameters): void {
        const {vertexCount, positionBuffer, colorBuffer} = parameter;
        const program = GLProgramCache.instance.getMust('color');
        program.bind();
        program.loadSampler();
        //将总变换矩阵送入渲染管线
        program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        program.setVertexAttribute('aPosition', positionBuffer, GLAttributeHelper.POSITION.COMPONENT);
        program.setVertexAttribute('aColor', colorBuffer, GLAttributeHelper.COLOR.COMPONENT);
        this.webglContext.drawArrays(this.webglContext.TRIANGLES, 0, vertexCount);
        program.unbind();
    }
}