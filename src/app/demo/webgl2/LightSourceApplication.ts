import {WebGL2Application} from '../../base/WebGL2Application';
import {Ball} from '../../../common/geometry/solid/Ball';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {AppConstants} from '../../AppConstants';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {Vector4} from '../../../common/math/vector/Vector4';
import {HtmlHelper, HtmlRangeProps} from '../HtmlHelper';

/**
 * 光源类型应用。
 */
export class LightSourceApplication extends WebGL2Application {
    /** 球体 */
    private _balls: Ball[] = [new Ball(), new Ball()];
    private _lightType = 'point';
    /** UI配置 */
    private _lightControls: Map<string, HtmlRangeProps[]>;
    /** 光照参数 */
    private _lightArgs: Map<string, number> = new Map<string, number>([
        ['ambient_color', 0.15],
        ['diffuse_color', 0.8],
        ['specular_color', 0.7],
        ['location_x', 0],
        ['location_y', 0]
    ]);
    
    /**
     * 构造。
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT;
        this._lightControls = new Map<string, HtmlRangeProps[]>([
            ['环境光', [{id: 'ambient_color', name: '颜色', value: '80', onChange: this.onColorChange, min: '0', max: '100'}]],
            ['散射光', [{id: 'diffuse_color', name: '颜色', value: '80', onChange: this.onColorChange, min: '0', max: '100'}]],
            ['镜面光', [{id: 'specular_color', name: '颜色', value: '80', onChange: this.onColorChange, min: '0', max: '100'}]],
            ['光源位置', [{id: 'location_x', name: 'X轴', value: '0', onChange: this.onLocationChange, min: '-50', max: '50'},
                {id: 'location_y', name: 'Y轴', value: '0', onChange: this.onLocationChange, min: '-50', max: '50'}]]
        ]);
        this.createBuffers(...this._balls);
        GLRenderHelper.setDefaultState(this.gl);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${AppConstants.webgl2ShaderRoot}/light/${this._lightType}.vert`],
            ['bns.frag', `${AppConstants.webgl2ShaderRoot}/light/${this._lightType}.frag`]
        ]);
    }
    
    /**
     * 运行
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        HtmlHelper.createSelect('光照类型', {
            options: [
                {name: '点光源', value: 'point'},
                {name: '平行光', value: 'direction'}
            ], onChange: this.onLightTypeChange, value: this._lightType
        });
        for (const entity of this._lightControls.entries()) {
            this.createLightControl(entity[0], entity[1]);
        }
        await this.initAsync();
        this.start();
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this._balls.forEach((ball, index) => this.drawBall(ball, index));
    }
    
    /**
     * 绘制球体。
     * @private
     */
    private drawBall(ball: Ball, index: number): void {
        const buffers = this.vertexBuffers.get(ball);
        if (!buffers) return;
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(new Vector3([index % 2 ? -1.2 : 1.2, 0.0, 0.0]));
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.bind();
        this.program.loadSampler();
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
        this.program.setVector3(this._lightType === 'direction' ? GLShaderConstants.lightDirection : GLShaderConstants.lightLocation, new Vector3([this._lightArgs.get('location_x'), this._lightArgs.get('location_y'), this.camera.z]));
        const ambientColor = this._lightArgs.get('ambient_color');
        this.program.setVector4(GLShaderConstants.ambient, new Vector4([ambientColor, ambientColor, ambientColor, 1.0]));
        const diffuseColor = this._lightArgs.get('diffuse_color');
        this.program.setVector4(GLShaderConstants.diffuse, new Vector4([diffuseColor, diffuseColor, diffuseColor, 1.0]));
        const specularColor = this._lightArgs.get('specular_color');
        this.program.setVector4(GLShaderConstants.specular, new Vector4([specularColor, specularColor, specularColor, 1.0]));
        this.program.setVector3(GLShaderConstants.cameraPosition, this.camera.position);
        this.program.setFloat('uR', ball.r);
        for (const entity of buffers.entries()) {
            this.program.setVertexAttribute(entity[0].NAME, entity[1], entity[0].COMPONENT);
        }
        this.gl.drawArrays(this.gl.TRIANGLES, 0, ball.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 创建光源控制控件。
     * @param {string} textContent
     * @param {{id: string, name: string, value: string}[]} props
     * @private
     */
    private createLightControl(textContent: string, props: HtmlRangeProps[]): void {
        const parent = document.getElementById('controls');
        const label = HtmlHelper.createCenterLabel(textContent);
        parent.appendChild(label);
        const br = document.createElement('br');
        parent.appendChild(br);
        props.forEach((prop) => {
            const colorRange = HtmlHelper.createRange(prop);
            parent.append(prop.name + ' ');
            parent.appendChild(colorRange);
            const b1 = document.createElement('br');
            parent.appendChild(b1);
        });
    }
    
    /**
     * 颜色更改
     * @param {Event} event
     */
    private onColorChange = (event: Event) => {
        const element = event.target as HTMLInputElement;
        if (element) {
            const value: number = parseFloat(element.value) / 100;
            this._lightArgs.set(element.id, isNaN(value) ? 1 : value);
        }
    };
    
    /**
     * 位置更改
     * @param {Event} event
     */
    private onLocationChange = (event: Event) => {
        const element = event.target as HTMLInputElement;
        if (element) {
            const value: number = parseFloat(element.value);
            this._lightArgs.set(element.id, isNaN(value) ? 0 : value);
        }
    };
    
    /**
     * 光源类型更改。
     * @param {Event} event
     */
    private onLightTypeChange = (event: Event): void => {
        const element = event.target as HTMLSelectElement;
        if (element) {
            this._lightType = element.value;
        }
        const controls = document.getElementById('controls');
        controls.replaceChildren();
        this.stop();
        this.runAsync.apply(this);
    };
}
