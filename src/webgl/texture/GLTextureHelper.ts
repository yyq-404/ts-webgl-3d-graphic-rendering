import {HttpHelper} from '../../net/HttpHelper';

/**
 * 纹理参数
 */
export type GLTextureParameters = {
    /** min采样方式 */
    minFilter?: GLint;
    /** mag采样方式 */
    magFilter?: GLint;
    /** S轴拉伸方式 */
    sWrap?: GLint;
    /** T轴拉伸方式 */
    tWrap?: GLint;
}

/**
 * webgl纹理工具类。
 */
export class GLTextureHelper {
    /**
     * 加载纹理。
     * @return {Promise<WebGLTexture>}
     * @private
     */
    public static async loadNormalTextureAsync(gl: WebGLRenderingContext | WebGL2RenderingContext, url: string, optionMipmap = false): Promise<WebGLTexture> {
        const img = await HttpHelper.loadImageAsync(url);
        const texture = gl.createTexture();
        //绑定纹理ID
        gl.bindTexture(gl.TEXTURE_2D, texture);
        //加载纹理进缓存
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        //设置参数
        if (optionMipmap) {
            GLTextureHelper.setMipmapParameters(gl);
        } else {
            GLTextureHelper.setTextureDefaultParameters(gl);
        }
        return texture;
    }
    
    /**
     * 设置纹理参数。
     * @private
     */
    public static setTextureDefaultParameters(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
        //设置MAG采样方式
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        //设置MIN采样方式
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        //设置S轴拉伸方式
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        //设置T轴拉伸方式
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }
    
    /**
     * 设置mipmap纹理参数。
     * @private
     */
    public static setMipmapParameters(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
        //设置MAG采样方式
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        //设置MIN采样方式
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        //设置S轴拉伸方式
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        //设置T轴拉伸方式
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        //生成mipmap纹理。
        gl.generateMipmap(gl.TEXTURE_2D);
    }
}