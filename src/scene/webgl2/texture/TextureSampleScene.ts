import {WebGL2Scene} from '../../base/WebGL2Scene';
import {Rect} from '../../../common/geometry/solid/Rect';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {SceneConstants} from '../../SceneConstants';
import {HttpHelper} from '../../../net/HttpHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {HtmlHelper} from '../../HtmlHelper';

/**
 * 纹理采样器应用。
 */
export class TextureSampleScene extends WebGL2Scene {
    /** 矩形 */
    private _rects: Rect[] = Array.from({length: 2}, () => new Rect(2, 2));
    /** 纹理贴图，尺寸32*32 */
    private _texture32: WebGLTexture;
    /** 纹理贴图，尺寸256*256 */
    private _texture256: WebGLTexture;
    /** MIN采样方式 */
    private _minSample: GLint;
    /** MAG采样方式 */
    private _magSample: GLint;
    /** 采样组合 */
    private _samples: Map<string, GLint>;
    
    /**
     * 构造
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.TEX_COORDINATE_0.BIT;
        this.createBuffers(...this._rects);
        this.createControls();
        this._samples = new Map<string, GLint>([
            ['LINEAR', this.gl.LINEAR],
            ['NEAREST', this.gl.NEAREST]
        ]);
        this._magSample = this._minSample = this.gl.NEAREST;
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${SceneConstants.webgl2ShaderRoot}/texture/texture.vert`],
            ['bns.frag', `${SceneConstants.webgl2ShaderRoot}/texture/texture.frag`]
        ]);
    }
    
    /**
     * 运行
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        this._texture32 = await this.loadTextureAsync('res/image/bw32.png');
        this._texture256 = await this.loadTextureAsync('res/image/bw256.png');
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this.drawRect(this._rects[0], this._texture256, new Vector3([1.0, 0, 0]), new Vector3([0.1, 0.1, 0.1]));
        this.drawRect(this._rects[1], this._texture32, new Vector3([-1.0, 0, 0]), new Vector3([0.3, 0.3, 0.3]));
    }
    
    /**
     * 释放对象。
     */
    public override dispose(): void {
        this.unbind();
        super.dispose();
    }
    
    /**
     * 绘制矩形。
     * @private
     */
    private drawRect(rect: Rect, texture: WebGLTexture, translate: Vector3, scale: Vector3): void {
        const buffers = this.vertexBuffers.get(rect);
        if (!buffers) return;
        this.program.bind();
        this.program.loadSampler();
        this.matrixStack.pushMatrix();
        this.matrixStack.translate(translate);
        this.matrixStack.scale(scale);
        this.matrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.matrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        for (const entity of buffers.entries()) {
            this.program.setVertexAttribute(entity[0].NAME, entity[1], entity[0].COMPONENT);
        }
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.program.setInt('sTexture', 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, rect.vertex.count);
        this.matrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 加载纹理。
     * @return {Promise<WebGLTexture>}
     * @private
     */
    private async loadTextureAsync(uri: string): Promise<WebGLTexture> {
        const image = await HttpHelper.loadImageAsync(uri);
        const texture = this.gl.createTexture();
        // 上传数据。
        this.upload(image, texture);
        // 采样方式
        this.filter();
        // 拉伸方式
        this.wrap();
        return texture;
    }
    
    /**
     * 上传纹理数据。
     * @param {HTMLImageElement} image
     * @param {WebGLTexture} texture
     * @private
     */
    private upload(image: HTMLImageElement, texture: WebGLTexture): void {
        //绑定纹理ID
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        //加载纹理进缓存
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
    }
    
    /**
     * 采样器。
     * @private
     */
    private filter(): void {
        //设置MIN采样方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this._minSample);
        //设置MAG采样方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this._magSample);
    }
    
    /**
     * 拉伸方式。
     * @private
     */
    private wrap(): void {
        //设置S轴拉伸方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        //设置T轴拉伸方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    }
    
    /**
     * 解绑纹理。
     * @private
     */
    private unbind(): void {
        if (this._texture32) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
        if (this._texture256) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
    }
    
    /**
     * 创建控制控件。
     * @private
     */
    private createControls(): void {
        const sampleModes = ['NEAREST', 'LINEAR'];
        HtmlHelper.createRadioGroup('min_sample', 'MIN: ', sampleModes, this.onMinSampleChange);
        HtmlHelper.createRadioGroup('mag_sample', 'MAG: ', sampleModes, this.onMagSampleChange);
    }
    
    /**
     * MIN采样方式更改。
     */
    private onMinSampleChange = (event: Event): void => {
        let element = event.target as HTMLInputElement;
        if (element.checked) {
            this._minSample = this._samples.get(element.value);
        }
        this.runAsync.apply(this);
    };
    
    /**
     * MAG采样方式更改
     */
    private onMagSampleChange = (event: Event): void => {
        let element = event.target as HTMLInputElement;
        if (element.checked) {
            this._magSample = this._samples.get(element.value);
        }
        this.runAsync.apply(this);
    };
}