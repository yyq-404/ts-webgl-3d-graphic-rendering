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
 * 光反射应用。
 */
export class LightReflectionApplication extends WebGL2Application {
    /** 球体 */
    private _ball: Ball = new Ball();
    /** 反射类型 */
    private _reflectionType: string = 'ambient';
    /** UI配置 */
    private _lightControls: Map<string, HtmlRangeProps[]>;
    /** 光照参数 */
    private readonly _lightArgs: Map<string, number> = new Map<string, number>([
        ['ambient_color', 0.8],
        ['diffuse_color', 0.8],
        ['specular_color', 0.7]
    ]);
    
    /**
     * 构造。
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT;
        this._lightControls = new Map<string, HtmlRangeProps[]>([
                ['ambient', [{id: 'ambient_color', name: '颜色', value: '80', onChange: this.onColorChange, min: '0', max: '100'}]],
                ['diffuse', [{id: 'diffuse_color', name: '颜色', value: '80', onChange: this.onColorChange, min: '0', max: '100'}]],
                ['specular', [{id: 'specular_color', name: '颜色', value: '80', onChange: this.onColorChange, min: '0', max: '100'}]]
            ]
        );
        this.createBuffers(this._ball);
        GLRenderHelper.setDefaultState(this.gl);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${AppConstants.webgl2ShaderRoot}/light/${this._reflectionType}.vert`],
            ['bns.frag', `${AppConstants.webgl2ShaderRoot}/light/${this._reflectionType}.frag`]
        ]);
    }
    
    /**
     * 运行
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        HtmlHelper.createSelect('光照类型', {
            options: [
                {name: '环境光', value: 'ambient'},
                {name: '散射光', value: 'diffuse'},
                {name: '镜面光', value: 'specular'}
            ],
            onChange: this.onReflectionTypeChange, value: this._reflectionType
        });
        this.createLightControlByType();
        await this.initAsync();
        this.start();
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this.drawBall();
    }
    
    /**
     * 绘制球体。
     * @private
     */
    private drawBall(): void {
        const buffers = this.vertexBuffers.get(this._ball);
        if (!buffers) return;
        this.program.bind();
        this.program.loadSampler();
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(Vector3.zero);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        //将总变换矩阵送入渲染管线
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setFloat('uR', this._ball.r);
        this.setLightColor();
        buffers.forEach((value, attribute) => {
            this.program.setVertexAttribute(attribute.NAME, value, attribute.COMPONENT);
        })
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._ball.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 设置灯光参数。
     * @private
     */
    private setLightColor(): void {
        let color: number = this._lightArgs.get(`${this._reflectionType}_color`);
        switch (this._reflectionType) {
            case 'ambient':
                this.program.setVector4(GLShaderConstants.ambient, new Vector4([color, color, color, 1.0]));
                break;
            case 'diffuse':
                this.program.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
                this.program.setVector4(GLShaderConstants.diffuse, new Vector4([color, color, color, 1.0]));
                this.program.setVector3(GLShaderConstants.lightLocation, new Vector3([0, 0, this.camera.z]));
                break;
            case 'specular':
                this.program.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
                this.program.setVector4(GLShaderConstants.specular, new Vector4([color, color, color, 1.0]));
                this.program.setVector3(GLShaderConstants.lightLocation, new Vector3([0, 0, this.camera.z]));
                this.program.setVector3(GLShaderConstants.cameraPosition, this.camera.position);
                break;
            default:
                break;
        }
    }
    
    /**
     * 根据类型创建光照控制控件。
     * @private
     */
    private createLightControlByType(): void {
        const props = this._lightControls.get(this._reflectionType);
        if (props) {
            const parent = document.getElementById('controls');
            HtmlHelper.createRanges(parent, props);
        }
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
     * 反射类型更改。
     * @param {Event} event
     */
    private onReflectionTypeChange = (event: Event): void => {
        const element = event.target as HTMLSelectElement;
        if (element) {
            this._reflectionType = element.value;
        }
        this.clearControls();
        this.stop();
        this.runAsync.apply(this);
    };
}