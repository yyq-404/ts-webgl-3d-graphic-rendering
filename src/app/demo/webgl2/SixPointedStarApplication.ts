import {WebGL2Application} from '../../base/WebGL2Application';
import {SixPointedStar} from '../../../common/geometry/solid/SixPointedStar';
import {Matrix4} from '../../../common/math/matrix/Matrix4';
import {GLProgramCache} from '../../../webgl/program/GLProgramCache';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {Vector4} from '../../../common/math/vector/Vector4';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {CanvasMouseEvent} from '../../../event/mouse/CanvasMouseEvent';
import {CanvasMouseEventManager} from '../../../event/mouse/CanvasEventEventManager';
import {ECanvasMouseEventType} from '../../../enum/ECanvasMouseEventType';
import {Vector2} from '../../../common/math/vector/Vector2';


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
    //绕y轴旋转角度
    private _currentYAngle = 0;
    //绕x轴旋转角度
    private _currentXAngle = 0;
    /** 六角星数量 */
    private _starCount = 6;
    /** 六角星渲染参数集合 */
    private _starRenderParameters: SixPointedStarRenderParameters[] = [];
    /** 每个六角星z轴间距 */
    private readonly _depth: number = 0.3;
    /** 步进角度 */
    private _incAngle = 0.5;
    /** 是否移动 */
    private _isMoved = false;
    /** 上一次鼠标位置 */
    private _lastPosition: Vector2 = new Vector2();
    
    /**
     * 构造
     */
    public constructor() {
        super();
        this.camera.z = 4;
        this.createStars();
        GLRenderHelper.setDefaultState(this.webglContext);
        CanvasMouseEventManager.instance.registers(this, [
            {type: ECanvasMouseEventType.MOUSE_DOWN, callback: this.onMouseDown},
            {type: ECanvasMouseEventType.MOUSE_UP, callback: this.onMouseUp},
            {type: ECanvasMouseEventType.MOUSE_MOVE, callback: this.onMouseMove}
        ]);
    }
    
    /**
     * 运行。
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        this.start();
    }
    
    /**
     * 渲染。
     */
    public override render(): void {
        GLRenderHelper.clearBuffer(this.webglContext);
        this.renderStars();
    }
    
    /**
     * 渲染六角星列表。
     * @private
     */
    private renderStars() {
        this.worldMatrixStack.pushMatrix();
        //执行旋转,即按哪个轴旋转
        this.worldMatrixStack.rotate(this._currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this._currentXAngle, Vector3.right);
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
            if (i % 3 == 0) {
                //中心点为白色
                colorData.push(...new Vector4([1.0, 1.0, 1.0, 1.0]).rgba);
            } else {
                colorData.push(...new Vector4([0.45, 0.75, 0.75, 1.0]).rgba);
            }
        }
        return colorData;
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
     * 渲染六角星
     * @param {SixPointedStarRenderParameters} parameter
     * @private
     */
    private renderStar(parameter: SixPointedStarRenderParameters): void {
        const {vertexCount, positionBuffer, colorBuffer} = parameter;
        const program = GLProgramCache.instance.getMust('color');
        program.bind();
        program.loadSampler();
        let mvp = Matrix4.product(this.camera.viewProjectionMatrix, this.worldMatrixStack.modelViewMatrix);
        //将总变换矩阵送入渲染管线
        program.setMatrix4(GLShaderConstants.MVPMatrix, mvp);
        program.setVertexAttribute('aPosition', positionBuffer, GLAttributeHelper.POSITION.COMPONENT);
        program.setVertexAttribute('aColor', colorBuffer, GLAttributeHelper.COLOR.COMPONENT);
        this.webglContext.drawArrays(this.webglContext.TRIANGLES, 0, vertexCount);
        program.unbind();
    }
    
    /**
     * 鼠标按下
     * @param {CanvasMouseEvent} event
     */
    public onMouseDown(event: CanvasMouseEvent): void {
        let x = event.position.x;
        let y = event.position.y;
        //如果鼠标在<canvas>内开始移动
        let rect = this.canvas.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            this._isMoved = true;
            this._lastPosition = new Vector2([x, y]);
        }
    }
    
    /**
     * 鼠标移动
     * @param {CanvasMouseEvent} event
     */
    public onMouseMove(event: CanvasMouseEvent): void {
        let x = event.position.x;
        let y = event.position.y;
        if (this._isMoved) {
            this._currentYAngle = this._currentYAngle + (x - this._lastPosition.x) * this._incAngle;
            this._currentXAngle = this._currentXAngle + (y - this._lastPosition.y) * this._incAngle;
        }
        this._lastPosition = new Vector2([x, y]);
    }
    
    /**
     * 鼠标抬起
     */
    public onMouseUp(): void {
        this._isMoved = false;
    }
}