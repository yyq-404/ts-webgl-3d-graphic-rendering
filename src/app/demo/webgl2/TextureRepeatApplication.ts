import {WebGL2Application} from '../../base/WebGL2Application';
import {AppConstants} from '../../AppConstants';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {Rect} from '../../../common/geometry/solid/Rect';
import {HttpHelper} from '../../../net/HttpHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';

export class TextureRepeatApplication extends WebGL2Application {
    /** 矩形 */
    private _rect: Rect = new Rect(2, 2);
    /** 纹理贴图 */
    private _texture: WebGLTexture;
    
    private _currentSize: string = '1*1';
    
    private _currentStretchingMode: string = 'EDGE';
    
    /**
     * 构造
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.TEX_COORDINATE_0.BIT;
        this.createControls();
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${AppConstants.webgl2ShaderRoot}/texture/texture.vert`],
            ['bns.frag', `${AppConstants.webgl2ShaderRoot}/texture/texture.frag`]
        ]);
    }
    
    /**
     * 运行
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        this.stop();
        await this.initAsync();
        const sizes = this._currentSize.split('*');
        this._rect.uvs = this._rect.createUVs(parseInt(sizes[0]), parseInt(sizes[1]));
        this.createBuffers(this._rect);
        this._texture = await this.loadTextureAsync();
        this.start();
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this.drawRect();
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
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(Vector3.zero);
        this.worldMatrixStack.scale(new Vector3([0.5, 0.5, 0.5]));
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        for (const entity of buffers.entries()) {
            this.program.setVertexAttribute(entity[0].NAME, entity[1], entity[0].COMPONENT);
        }
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
        this.program.setInt('sTexture', 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._rect.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 加载纹理。
     * @return {Promise<WebGLTexture>}
     * @private
     */
    private async loadTextureAsync(): Promise<WebGLTexture> {
        const img = await HttpHelper.loadImageAsync('res/image/robot.png');
        const texture = this.gl.createTexture();
        //绑定纹理ID
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        //加载纹理进缓存
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        //设置MAG采样方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        //设置MIN采样方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        //设置S轴拉伸方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this._currentStretchingMode === 'EDGE' ? this.gl.CLAMP_TO_EDGE : this.gl.REPEAT);
        //设置T轴拉伸方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this._currentStretchingMode === 'EDGE' ? this.gl.CLAMP_TO_EDGE : this.gl.REPEAT);
        //纹理加载成功后释放纹理图
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return texture;
    }
    
    /**
     * 创建控制控件。
     * @private
     */
    private createControls(): void {
        const modes = ['EDGE', 'REPEAT'];
        this.createRadios('stretching', '拉伸方式: ', modes, this.onStretchingModeChange);
        const sizes = ['1*1', '4*2', '4*4'];
        this.createRadios('size', '纹理尺寸坐标: ', sizes, this.onTextureCoordinateSizeChange);
    }
    
    /**
     * 拉伸模式更改
     */
    private onStretchingModeChange = (): void => {
        const elements = document.getElementsByName('stretching') as NodeListOf<HTMLInputElement>;
        elements.forEach(element => {
            if (element.checked) {
                this._currentStretchingMode = element.value;
            }
        });
        this.runAsync.apply(this);
    };
    
    /**
     * 纹理坐标尺寸更改
     */
    private onTextureCoordinateSizeChange = (): void => {
        const elements = document.getElementsByName('size') as NodeListOf<HTMLInputElement>;
        elements.forEach(element => {
            if (element.checked) {
                this._currentSize = element.value;
            }
        });
        this.runAsync.apply(this);
    };
    
    /**
     * 创建单选框。
     * @param {string} name
     * @param {string} textContent
     * @param {string[]} args
     * @param {() => void} onClick
     * @private
     */
    private createRadios(name: string, textContent: string, args: string[], onClick: () => void): void {
        const parent = document.getElementById('controls');
        const label = document.createElement('label');
        label.textContent = textContent;
        label.style.position = 'relative';
        label.style.margin = '10px';
        args.forEach((value, index) => {
            const radio: HTMLInputElement = document.createElement('input');
            radio.type = 'radio';
            radio.name = name;
            radio.value = value;
            radio.onclick = onClick;
            radio.checked = index === 0;
            label.appendChild(radio);
            label.append(value + '  ');
        });
        parent.appendChild(label);
        const br = document.createElement('br');
        parent.appendChild(br);
    }
}