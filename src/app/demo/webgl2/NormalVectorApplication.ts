import {WebGL2Application} from '../../base/WebGL2Application';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {AppConstants} from '../../AppConstants';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {CanvasKeyboardEventManager} from '../../../event/keyboard/CanvasKeyboardEventManager';
import {ECanvasKeyboardEventType} from '../../../enum/ECanvasKeyboardEventType';
import {CanvasKeyboardEvent} from '../../../event/keyboard/CanvasKeyboardEvent';
import {ColorCube} from '../../../common/geometry/solid/ColorCube';

/**
 * 法向量应用。
 */
export class NormalVectorApplication extends WebGL2Application {
    /** 球体 */
    private _cubes: ColorCube[] = [new ColorCube(), new ColorCube()];
    /** 光源X轴位置 */
    private _locationX: number = 0;
    /** 光源Y轴位置 */
    private _locationY: number = 0;
    
    /**
     * 构造。
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT;
        GLRenderHelper.setDefaultState(this.webglContext);
        CanvasKeyboardEventManager.instance.registers(this, [
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowLeft', callback: this.changeLocationX},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowRight', callback: this.changeLocationX},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowUp', callback: this.changeLocationY},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowDown', callback: this.changeLocationY},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: '1', callback: this.changeNormalMode},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: '2', callback: this.changeNormalMode}
        ]);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        const shaderUrls: Map<string, string> = new Map<string, string>();
        shaderUrls.set('bns.vert', `${AppConstants.webgl2ShaderRoot}/light/point.vert`);
        shaderUrls.set('bns.frag', `${AppConstants.webgl2ShaderRoot}/light/point.frag`);
        return shaderUrls;
    }
    
    /**
     * 运行
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        this.createBuffers(...this._cubes);
        await super.runAsync();
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this._cubes.forEach((cube, index) => this.drawCube(cube, index));
    }
    
    /**
     * 绘制球体。
     * @private
     */
    private drawCube(cube: ColorCube, index: number): void {
        const buffers = this.vertexBuffers.get(cube);
        if (!buffers) return;
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(new Vector3([index % 2 ? -1.0 : 1.0, 0.0, 0.0]));
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.bind();
        this.program.loadSampler();
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
        this.program.setVector3('uLightLocation', new Vector3([this._locationX, this._locationY, 4]));
        this.program.setVector3('uCamera', this.camera.position);
        for (const entity of buffers.entries()) {
            this.program.setVertexAttribute(entity[0].NAME, entity[1], entity[0].COMPONENT);
        }
        this.program.setFloat('uR', 0.5);
        this.webglContext.drawArrays(this.webglContext.TRIANGLES, 0, cube.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 改变光源X轴位置
     * @param {CanvasKeyboardEvent} event
     * @private
     */
    private changeLocationX(event: CanvasKeyboardEvent): void {
        if (this._locationX > -10 && this._locationX < 10) {
            const incX: number = event.key === 'ArrowLeft' ? -1 : 1;
            this._locationX += incX;
        } else {
            this._locationX = 0;
        }
    }
    
    /**
     * 改变光源X轴位置
     * @param {CanvasKeyboardEvent} event
     * @private
     */
    private changeLocationY(event: CanvasKeyboardEvent): void {
        if (this._locationY > -10 && this._locationY < 10) {
            const incY: number = event.key === 'ArrowDown' ? -1 : 1;
            this._locationY += incY;
        } else {
            this._locationY = 0;
        }
    }
    
    /**
     * 改变法向量模式
     * @param {CanvasKeyboardEvent} event
     * @private
     */
    private changeNormalMode(event: CanvasKeyboardEvent): void {
        this.stop();
        this._cubes.forEach(cube => cube.normals = event.key === '1' ? cube.createSurfaceNormals() : cube.vertex.positions);
        this.runAsync.call(this);
    }
}