import {WebGL2Application} from '../../base/WebGL2Application';
import {Ball} from '../../../common/geometry/solid/Ball';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {AppConstants} from '../../AppConstants';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {Vector4} from '../../../common/math/vector/Vector4';

/**
 * 环境光应用。
 */
export class AmbientLightApplication extends WebGL2Application {
    /** 球体 */
    private _ball: Ball = new Ball();
    /** 光照类型 */
    private _lightType: string = 'ambient';
    /** 光照参数 */
    private _lightArgs: Map<string, number> = new Map<string, number>([
        ['ambient_color', 0.8],
        ['ambient_strength', 1.0],
        ['diffuse_color', 0.8],
        ['specular_color', 0.7]
    ]);
    /** UI配置 */
    private _lightControls: Map<string, { id: string, name: string, value: string }[]> = new Map<string, { id: string, name: string, value: string }[]>([
        ['ambient', [{id: 'ambient_color', name: '颜色', value: '80'}, {id: 'ambient_strength', name: '强度', value: '100'}]],
        ['diffuse', [{id: 'diffuse_color', name: '颜色', value: '80'}]],
        ['specular', [{id: 'specular_color', name: '颜色', value: '80'}]]
    ]);
    
    /**
     * 构造。
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT;
        this.createBuffers(this._ball);
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
        this.createLightTypeControl('光照类型', [
            {name: '环境光', value: 'ambient'},
            {name: '散射光', value: 'diffuse'},
            {name: '镜面光', value: 'specular'}
        ]);
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
        this.setLightColor();
        this.program.setFloat('uR', this._ball.r);
        for (const entity of buffers.entries()) {
            this.program.setVertexAttribute(entity[0].NAME, entity[1], entity[0].COMPONENT);
        }
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._ball.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 设置灯光参数。
     * @private
     */
    private setLightColor(): void {
        let color: number = this._lightArgs.get(`${this._lightType}_color`);
        let strength: number = this._lightType === 'ambient' ? this._lightArgs.get(`${this._lightType}_strength`) : 1;
        switch (this._lightType) {
            case 'ambient':
                this.program.setVector4(GLShaderConstants.ambient, new Vector4([color, color, color, strength]));
                break;
            case 'diffuse':
                this.program.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
                this.program.setVector4(GLShaderConstants.diffuse, new Vector4([color, color, color, strength]));
                this.program.setVector3(GLShaderConstants.lightLocation, new Vector3([0, 0, this.camera.z]));
                break;
            case 'specular':
                this.program.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
                this.program.setVector4(GLShaderConstants.specular, new Vector4([color, color, color, strength]));
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
        const configs = this._lightControls.get(this._lightType);
        if (configs) {
            this.createLightControl(configs);
        }
    }
    
    /**
     * 创建光源控制控件。
     * @param {{id: string, name: string, value: string}[]} configs
     * @private
     */
    private createLightControl(configs: { id: string, name: string, value: string }[]): void {
        const parent = document.getElementById('controls');
        configs.forEach((arg) => {
            const colorRange = this.createInputRange(arg.id, arg.value);
            parent.append(arg.name + ' ');
            parent.appendChild(colorRange);
            const b1 = document.createElement('br');
            parent.appendChild(b1);
        });
    }
    
    /**
     * 创建滑动条。
     * @param {string} id
     * @param {string} value
     * @param {string} min
     * @param {string} max
     * @return {HTMLInputElement}
     * @private
     */
    private createInputRange(id: string, value: string, min: string = '0', max: string = '100'): HTMLInputElement {
        const range: HTMLInputElement = document.createElement('input');
        range.type = 'range';
        range.id = id;
        range.value = value;
        range.onchange = this.onRangeChange;
        range.min = min;
        range.max = max;
        return range;
    }
    
    /**
     * 更改
     * @param {Event} event
     */
    private onRangeChange = (event: Event) => {
        const element = event.target as HTMLInputElement;
        if (element) {
            const value: number = parseFloat(element.value) / 100;
            this._lightArgs.set(element.id, isNaN(value) ? 1 : value);
        }
    };
    
    /**
     * 床架光照类型选择菜单。
     * @param {string} textContent
     * @param {{name: string, value: string}[]} args
     * @private
     */
    private createLightTypeControl(textContent: string, args: { name: string, value: string }[]) {
        const parent = document.getElementById('controls');
        const label = document.createElement('label');
        label.textContent = textContent + ' ';
        label.style.position = 'relative';
        label.style.float = 'left';
        const select = document.createElement('select');
        args.forEach(arg => select.options.add(new Option(arg.name, arg.value)));
        select.onchange = this.onLightTypeChange;
        select.value = this._lightType;
        label.appendChild(select);
        parent.appendChild(label);
        const br = document.createElement('br');
        parent.appendChild(br);
    }
    
    /**
     * 光照类型更改。
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