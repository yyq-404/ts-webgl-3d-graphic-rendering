import {HttpHelper} from '../../net/HttpHelper';

/**
 * webgl纹理工具类。
 */
export class GLTextureHelper {
    /**
     * 加载纹理。
     * @return {Promise<WebGLTexture>}
     * @private
     */
    public static async loadNormalTextureAsync(gl: WebGLRenderingContext | WebGL2RenderingContext, url: string): Promise<WebGLTexture> {
        const img = await HttpHelper.loadImageAsync(url);
        const texture = gl.createTexture();
        //绑定纹理ID
        gl.bindTexture(gl.TEXTURE_2D, texture);
        //加载纹理进缓存
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        GLTextureHelper.setTextureDefaultParameters(gl);
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
}