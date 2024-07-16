import {WebGL2Application} from '../../base/WebGL2Application';
import {ColorSquare} from '../../../common/geometry/solid/ColorSquare';
import {Color4} from '../../../common/color/Color4';
import {Vector3} from '../../../common/math/vector/Vector3';
import {ECameraObservationType} from '../../../enum/ECameraObservationType';
import {CanvasKeyboardEventManager} from '../../../event/keyboard/CanvasKeyboardEventManager';
import {ECanvasKeyboardEventType} from '../../../enum/ECanvasKeyboardEventType';
import {AppConstants} from '../../AppConstants';

/**
 * 相机视角应用。
 */
export class CameraViewApplication extends WebGL2Application {
    /** 矩形 */
    private _rect: ColorSquare = new ColorSquare(0.25, [Color4.White, Color4.Blue, Color4.Blue, Color4.Blue, Color4.Blue, Color4.Blue]);
    
    /**
     * 构造
     */
    public constructor() {
        super(true);
        this.createBuffers(this._rect);
        this.camera.observationType = ECameraObservationType.ORTHOGRAPHIC;
        this.camera.near = 3;
        this.camera.aspectRatio = 2;
        CanvasKeyboardEventManager.instance.registers(this, [
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '1', callback: () => this.camera.aspectRatio = 2},
            {type: ECanvasKeyboardEventType.KEY_PRESS, key: '2', callback: () => this.camera.aspectRatio = this.canvas.width / this.canvas.height}
        ]);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${AppConstants.webgl2ShaderRoot}/effect/bns.vert`],
            ['bns.frag', `${AppConstants.webgl2ShaderRoot}/effect/bns.frag`]
        ]);
    }
    
    /**
     * 渲染。
     */
    public override render(): void {
        this.drawCubes();
    };
    
    /**
     * 绘制立方体集合。
     */
    public drawCubes(): void {
        for (let i = 0; i < 2; i++) {
            this.drawCube(i);
        }
    }
    
    /**
     * 绘制立方体
     * @private
     */
    private drawCube(index: number): void {
        //总绘制思想：通过把一个颜色矩形旋转移位到立方体每个面的位置
        //绘制立方体的每个面
        //保护现场
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(index % 2 ? new Vector3([-0.8, 0.5, 0]) : new Vector3([0.4, 0.5, 0]));
        //执行绕Y轴旋转
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        //执行绕X轴旋转
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        [
            // 绘制前小面
            {position: new Vector3([0.0, 0.0, 0.25]), rotations: null},
            // 绘制前小面
            {position: new Vector3([0.0, 0.0, -0.25]), rotations: [{angle: 180, axis: Vector3.up}]},
            // 绘制上大面
            {position: new Vector3([0.0, 0.25, 0.0]), rotations: [{angle: -90, axis: Vector3.right}]},
            // 绘制下大面
            {position: new Vector3([0.0, -0.25, 0.0]), rotations: [{angle: 90, axis: Vector3.right}]},
            // 绘制左大面
            {position: new Vector3([0.25, 0.0, 0.0]), rotations: [{angle: -90, axis: Vector3.right}, {angle: 90, axis: Vector3.up}]},
            // 绘制右大面
            {position: new Vector3([-0.25, 0.0, 0.0]), rotations: [{angle: 90, axis: Vector3.right}, {angle: -90, axis: Vector3.up}]}
        ].forEach((arg) => this.drawSurface(arg.position, arg.rotations));
        //恢复现场
        this.worldMatrixStack.popMatrix();
    }
    
    /**
     * 绘制表面。
     * @param {Vector3} position
     * @param {{angle: number, axis: Vector3}[]} rotations
     * @private
     */
    private drawSurface(position: Vector3, rotations?: { angle: number, axis: Vector3 }[]): void {
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(position);
        if (rotations instanceof Array) {
            rotations.forEach(rotation => this.worldMatrixStack.rotate(rotation.angle, rotation.axis));
        }
        this.drawRect();
        this.worldMatrixStack.popMatrix();
    }
    
    /**
     * 绘制矩形。
     * @private
     */
    private drawRect(): void {
        const buffers = this.vertexBuffers.get(this._rect);
        if (!buffers) return;
        this.program.bind();
        this.program.loadSampler();
        this.drawArrays(this._rect, this.webglContext.TRIANGLE_FAN);
        this.program.unbind();
    }
}