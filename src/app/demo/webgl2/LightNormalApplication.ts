import {WebGL2Application} from '../../base/WebGL2Application';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {AppConstants} from '../../AppConstants';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {ColorCube} from '../../../common/geometry/solid/ColorCube';
import {HtmlHelper} from '../HtmlHelper';
import {LightController} from '../LightController';

/**
 * 光法向量应用。
 */
export class LightNormalApplication extends WebGL2Application {
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
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(new Vector3([index % 2 ? -1.0 : 1.0, 0.0, 0.0]));
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.bind();
        this.program.loadSampler();
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
        this.program.setVector3(GLShaderConstants.lightLocation, this._lightController.location);
        this.program.setVector3(GLShaderConstants.cameraPosition, this.camera.position);
        this.program.setFloat('uR', cube.halfSize);
        this._lightController.setColor(this.program);
        buffers.forEach((value, attribute) => {
            this.program.setVertexAttribute(attribute.NAME, value, attribute.COMPONENT);
        });
        this.gl.drawArrays(this.gl.TRIANGLES, 0, cube.vertex.count);
        this.worldMatrixStack.popMatrix();
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
        this.stop();
        this.runAsync.call(this);
    };
}