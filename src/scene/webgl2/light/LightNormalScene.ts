import {WebGL2Scene} from '../../base/WebGL2Scene';
import {ColorCube} from '../../../common/geometry/solid/ColorCube';
import {LightController} from '../../LightController';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {SceneConstants} from '../../SceneConstants';
import {HtmlHelper} from '../../HtmlHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';

/**
 * 光法向量场景。
 */
export class LightNormalScene extends WebGL2Scene {
    /** 立方体 */
    private _cubes: ColorCube[] = [new ColorCube(), new ColorCube()];
    /** 法线计算方式 */
    private _normalType: string = 'point';
    /** 光照控制器 */
    private _lightController = new LightController();
    
    /**
     * 构造。
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT;
        GLRenderHelper.setDefaultState(this.gl);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${SceneConstants.webgl2ShaderRoot}/light/point.vert`],
            ['bns.frag', `${SceneConstants.webgl2ShaderRoot}/light/point.frag`]
        ]);
    }
    
    /**
     * 运行
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        this.createBuffers(...this._cubes);
        HtmlHelper.createSelect('光照类型', {
            options: [
                {name: '点法向量', value: 'point'},
                {name: '面法向量', value: 'plane'}
            ], onChange: this.onNormalTypeChange, value: this._normalType
        });
        this._lightController.create();
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
        this.matrixStack.pushMatrix();
        this.matrixStack.translate(new Vector3([index % 2 ? -1.0 : 1.0, 0.0, 0.0]));
        this.matrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.matrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.bind();
        this.program.loadSampler();
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setMatrix4(GLShaderConstants.MMatrix, this.matrixStack.worldMatrix());
        this.program.setVector3(GLShaderConstants.LightLocation, this._lightController.location);
        this.program.setVector3(GLShaderConstants.Camera, this.camera.position);
        this.program.setFloat('uR', cube.halfSize);
        this._lightController.setColor(this.program);
        buffers.forEach((value, attribute) => {
            this.program.setVertexAttribute(attribute.NAME, value, attribute.COMPONENT);
        });
        this.gl.drawArrays(this.gl.TRIANGLES, 0, cube.vertex.count);
        this.matrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 改变法向量模式
     * @param {CanvasKeyboardEvent} event
     * @private
     */
    private onNormalTypeChange = (event: Event): void => {
        const element = event.target as HTMLSelectElement;
        if (element) {
            this._normalType = element.value;
            this._cubes.forEach(cube => cube.normals = element.value === 'point' ? cube.createSurfaceNormals() : cube.vertex.positions);
        }
        this.clearControls();
        this.runAsync.call(this);
    };
}