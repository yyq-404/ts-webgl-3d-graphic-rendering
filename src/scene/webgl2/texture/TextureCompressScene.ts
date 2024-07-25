import {WebGL2Scene} from '../../base/WebGL2Scene';
import {Triangle} from '../../../common/geometry/solid/Triangle';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {SceneConstants} from '../../SceneConstants';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {HttpHelper} from '../../../net/HttpHelper';
import {HtmlHelper} from '../../HtmlHelper';

/**
 * 枪支贴图示例。
 */
export class TextureCompressScene extends WebGL2Scene {
    /** 三角形 */
    private _triangle = new Triangle([new Vector3([3.0, 0.0, 0.0]), new Vector3([-3.0, 0.0, 0.0]), new Vector3([0.0, 3.0, 0.0])]);
    /** 纹理贴图 */
    private _texture: WebGLTexture;
    /** 纹理类型 */
    private _textureType: string = 'NORMAL';
    
    /**
     * 构造
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.TEX_COORDINATE_0.BIT;
        this.createBuffers(this._triangle);
        this.createControls();
        //开启深度检测
        this.gl.enable(this.gl.DEPTH_TEST);
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
     * 初始化
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        if (this._textureType === 'ETC1') {
            let etr1Ext = GLRenderHelper.getExtension<WEBGL_compressed_texture_etc1>(this.gl, 'WEBGL_compressed_texture_etc1');
            if (!etr1Ext) {
                alert('Dont support etc1 texture type.');
                return;
            }
            this._texture = await this.loadEtc1TextureAsync(etr1Ext, 'res/pkm/bbt.pkm');
        } else if (this._textureType === 'DXT5') {
            //获取并加载WEBGL_compressed_texture_s3tc扩展，以支持s3tc类型的压缩纹理
            let s3tcExt = GLRenderHelper.getExtension<WEBGL_compressed_texture_s3tc>(this.gl, 'WEBGL_compressed_texture_s3tc');
            if (!s3tcExt) {
                alert('Dont support dxt5 texture type.');
                return;
            }
            this._texture = await this.LoadS3tcDxt5TextureAsync(s3tcExt, 'res/dds/wl_dxt5.dds');
        } else {
            this._texture = await this.loadNormalTextureAsync('res/image/wall.png');
        }
    }
    
    /**
     * 渲染。
     */
    public override render(): void {
        GLRenderHelper.clearBuffer(this.gl);
        this.drawTriangle();
    }
    
    /**
     * 绘制三角形。
     * @private
     */
    private drawTriangle(): void {
        const buffers = this.vertexBuffers.get(this._triangle);
        if (!buffers) return;
        this.program.bind();
        this.program.loadSampler();
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(Vector3.zero);
        this.worldMatrixStack.scale(new Vector3([0.5, 0.5, 0.5]));
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.worldMatrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        buffers.forEach((buffer, attribute) => {
            this.program.setVertexAttribute(attribute.NAME, buffer, attribute.COMPONENT);
        });
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
        this.program.setInt('sTexture', 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._triangle.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 加载纹理。
     * @return {Promise<WebGLTexture>}
     * @private
     */
    private async loadNormalTextureAsync(url: string): Promise<WebGLTexture> {
        const img = await HttpHelper.loadImageAsync(url);
        const texture = this.gl.createTexture();
        //绑定纹理ID
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        //加载纹理进缓存
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        this.setTextureParameters();
        //纹理加载成功后释放纹理图
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return texture;
    }
    
    /**
     * 加载ETC1材质。
     * @param {WEBGL_compressed_texture_etc1} ext
     * @param {string} url
     * @return {Promise<WebGLTexture>}
     * @private
     */
    private async loadEtc1TextureAsync(ext: WEBGL_compressed_texture_etc1, url: string): Promise<WebGLTexture> {
        const buffer: ArrayBuffer = await HttpHelper.loadArrayBufferAsync(url);
        const texture: WebGLTexture = this.gl.createTexture();
        const ETC_PKM_HEADER_SIZE: number = 16;
        let dataHeader: ArrayBuffer = buffer.slice(0, ETC_PKM_HEADER_SIZE);
        let width: number = this.fromBytesToShort(dataHeader.slice(12, 14));
        let height: number = this.fromBytesToShort(dataHeader.slice(14, 16));
        let texData: ArrayBuffer = buffer.slice(ETC_PKM_HEADER_SIZE);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.compressedTexImage2D(this.gl.TEXTURE_2D, 0, ext.COMPRESSED_RGB_ETC1_WEBGL, width, height, 0, new Uint8Array(texData));
        this.setTextureParameters();
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return texture;
    }
    
    
    /**将字节数组转四字节整数
     * @param {ArrayBuffer} buffer
     * @return {number}
     * @private
     */
    private fromBytesToShort(buffer: ArrayBuffer): number {
        try {
            let testArray = new Uint8Array(buffer);
            return testArray[0] * 256 + testArray[1];
        } catch (err) {
            alert(err.message);
            let testArray = new Uint8Array(buffer);
            alert('err to int=' + testArray[0] + ',' + testArray[1]);
        }
    }
    
    /**
     * 处理pkm文件数据的方法
     * @param ext
     * @param url
     */
    private async LoadS3tcDxt5TextureAsync(ext: WEBGL_compressed_texture_s3tc, url: string): Promise<WebGLTexture> {
        //dds文件头长度
        const DDS_HEADER_LENGTH: number = 31;
        //纹理宽度偏移量
        const DDS_HEADER_HEIGHT_OFFSET: number = 3;
        //纹理高度偏移量
        const DDS_HEADER_WIDTH_OFFSET: number = 4;
        //文件头长度偏移量
        const DDS_HEADER_SIZE_OFFSET: number = 1;
        //MIPMAP纹理数量标志掩码
        const DDS_MIPMAP_COUNT: number = 0x20000;
        //MIPMAP纹理数量偏移量
        const DDS_HEADER_MIPMAP_COUNT_OFFSET: number = 7;
        //dds文件头标记偏移量
        let DDS_HEADER_FLAGS_OFFSET = 2;
        const buffer: ArrayBuffer = await HttpHelper.loadArrayBufferAsync(url);
        const texture: WebGLTexture = this.gl.createTexture();
        //获取dds文件的文件头进入32比特整型数组
        let header: Int32Array = new Int32Array(buffer, 0, DDS_HEADER_LENGTH);
        //获取纹理宽度
        let width: number = header[DDS_HEADER_WIDTH_OFFSET];
        //获取纹理高度
        let height: number = header[DDS_HEADER_HEIGHT_OFFSET];
        //声明纹理层次辅助变量
        let levels: number = 1;
        if (header[DDS_HEADER_FLAGS_OFFSET] & DDS_MIPMAP_COUNT) {
            //计算出实际的MipMap纹理层次数量
            levels = Math.max(1, header[DDS_HEADER_MIPMAP_COUNT_OFFSET]);
        }
        //纹理数据的起始偏移量
        let dataOffset = header[DDS_HEADER_SIZE_OFFSET] + 4;
        //获取纹理数据
        let dxtData = new Uint8Array(buffer, dataOffset);
        //绑定纹理
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        //声明每层纹理的数据字节偏移量
        let offset: number = 0;
        //对每个mipmap纹理层进行循环
        for (let i: number = 0; i < levels; ++i) {
            //计算本层纹理的数据字节数
            let levelSize = this.textureLevelSizeS3tcDxt5(width, height);
            //获取本层纹理的数据字节序列
            let dxtLevel = new Uint8Array(dxtData.buffer, dxtData.byteOffset + offset, levelSize);
            //将纹理数据加载进显存
            this.gl.compressedTexImage2D(this.gl.TEXTURE_2D, i, ext.COMPRESSED_RGBA_S3TC_DXT5_EXT, width, height, 0, dxtLevel);
            //计算下一层纹理的宽度
            width = width >> 1;
            //计算下一层纹理的高度
            height = height >> 1;
            //计算新一层纹理的数据字节偏移量
            offset += levelSize;
        }
        this.setTextureParameters();
        //解除绑定特定纹理
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return texture;
    }
    
    /**
     * 根据dxt5纹理的宽度和高度计算纹理数据字节数的函数
     * @param width
     * @param height
     * @return {number}
     * @private
     */
    private textureLevelSizeS3tcDxt5(width: number, height: number): number {
        return ((width + 3) >> 2) * ((height + 3) >> 2) * 16;
    }
    
    /**
     * 设置纹理参数。
     * @private
     */
    private setTextureParameters(): void {
        //设置MAG采样方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        //设置MIN采样方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        //设置S轴拉伸方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        //设置T轴拉伸方式
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    }
    
    /**
     * 创建控制控件。
     * @private
     */
    private createControls(): void {
        const modes = ['NORMAL', 'ETC1', 'DXT5'];
        HtmlHelper.createRadioGroup('type', '材质类型: ', modes, this.onWarpModeChange);
    }
    
    /**
     * 拉伸模式更改
     */
    private onWarpModeChange = (event: Event): void => {
        let element = event.target as HTMLInputElement;
        if (element.checked) {
            this._textureType = element.value;
        }
        this.runAsync.apply(this);
    };
    
}