import {WebGL2Scene} from '../../base/WebGL2Scene';
import {Rect} from '../../../common/geometry/solid/Rect';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {SceneConstants} from '../../SceneConstants';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {HttpHelper} from '../../../net/HttpHelper';
import {HtmlHelper} from '../../HtmlHelper';


/**
 * 材质拉伸模式场景。
 */
export class TextureWrapScene extends WebGL2Scene {
    /** 矩形 */
    private _rect: Rect = new Rect(2, 2);
    /** 纹理贴图 */
    private _texture: WebGLTexture;
    /** 当前选中尺寸 */
    private _currentSize: string = '1*1';
    /** 当前选中拉升方式 */
    private _currentWrapMode: string = 'EDGE';
    
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
        const sizes = this._currentSize.split('*');
        this._rect.uvs = this._rect.createUVs(parseInt(sizes[0]), parseInt(sizes[1]));
        this.createBuffers(this._rect);
        this._texture = await this.loadTextureAsync();
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this.drawRect();
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
    private drawRect(): void {
        const buffers = this.vertexBuffers.get(this._rect);
        if (!buffers) return;
        this.program.bind();
        this.program.loadSampler();
        this.matrixStack.pushMatrix();
        this.matrixStack.translate(Vector3.zero);
        this.matrixStack.scale(new Vector3([0.5, 0.5, 0.5]));
        this.matrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.matrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        for (const entity of buffers.entries()) {
            this.program.setVertexAttribute(entity[0].NAME, entity[1], entity[0].COMPONENT);
        }
        this.program.setInt('sTexture', 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._rect.vertex.count);
        this.matrixStack.popMatrix();
        // this.unbind();
        this.program.unbind();
    }
    
    /**
     * 加载纹理。
     * @return {Promise<WebGLTexture>}
     * @private
     */
    private async loadTextureAsync(): Promise<WebGLTexture> {
        const image = await HttpHelper.loadImageAsync('res/image/robot.png');
        const texture = this.gl.createTexture();
        // 上传数据。
        this.upload(image, texture);
        // 采样方式
        this.filter();
        // 拉伸方式
        this.wrap();
        // 激活纹理。
        this.active();
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
     * 激活纹理
     * @private
     */
    private active(): void {
        if (this._texture) {
            this.gl.activeTexture(this.gl.TEXTURE0);
        }
    }
    
    /**
     * 采样器。
     * @param {GLint} minFilter
     * @param {GLint} magFilter
     * @private
     */
    private filter(minFilter: GLint = this.gl.LINEAR, magFilter: GLint = this.gl.LINEAR): void {
        //设置MIN采样方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, minFilter);
        //设置MAG采样方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, magFilter);
    }
    
    /**
     * 拉伸方式。
     * @private
     */
    private wrap(): void {
        //设置S轴拉伸方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this._currentWrapMode === 'EDGE' ? this.gl.CLAMP_TO_EDGE : this.gl.REPEAT);
        //设置T轴拉伸方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this._currentWrapMode === 'EDGE' ? this.gl.CLAMP_TO_EDGE : this.gl.REPEAT);
    }
    
    /**
     * 解绑纹理。
     * @private
     */
    private unbind(): void {
        if (this._texture) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
    }
    
    /**
     * 创建控制控件。
     * @private
     */
    private createControls(): void {
        const modes = ['EDGE', 'REPEAT'];
        HtmlHelper.createRadioGroup('stretching', '拉伸方式: ', modes, this.onWarpModeChange);
        const sizes = ['1*1', '4*2', '4*4'];
        HtmlHelper.createRadioGroup('size', '纹理尺寸坐标: ', sizes, this.onTextureCoordinateSizeChange);
    }
    
    /**
     * 拉伸模式更改
     */
    private onWarpModeChange = (event: Event): void => {
        let element = event.target as HTMLInputElement;
        if (element.checked) {
            this._currentWrapMode = element.value;
        }
        this.runAsync.apply(this);
    };
    
    /**
     * 纹理坐标尺寸更改
     */
    private onTextureCoordinateSizeChange = (event: Event): void => {
        let element = event.target as HTMLInputElement;
        if (element.checked) {
            this._currentSize = element.value;
        }
        this.runAsync.apply(this);
    };
}