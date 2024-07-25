import {WebGL2Scene} from '../../base/WebGL2Scene';
import {SceneConstants} from '../../SceneConstants';
import {GLProgram} from '../../../webgl/program/GLProgram';
import {Ball} from '../../../common/geometry/solid/Ball';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {HttpHelper} from '../../../net/HttpHelper';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';

/**
 * 多重和过渡材质场景。
 */
export class TextureMultiScene extends WebGL2Scene {
    /** 地球 */
    private _earth: Ball = new Ball(3, 1);
    /** 地球白天纹理 */
    private _earthDayTexture: WebGLTexture;
    /** 地球夜晚纹理 */
    private _earthNightTexture: WebGLTexture;
    /**地球自转角度 */
    private _currentAngle: number = 0;
    /** 月球 */
    private _moon: Ball = new Ball(1, 1);
    /** 月球纹理 */
    private _moonTexture: WebGLTexture;
    /** 月球链接程序 */
    private _moonProgram: GLProgram;
    
    /**
     * 构造
     */
    public constructor() {
        super();
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT | GLAttributeHelper.TEX_COORDINATE_0.BIT;
        this.createBuffers(this._earth, this._moon);
        this.camera.z = 20;
        this.canvas.style.background = 'black';
        GLRenderHelper.setDefaultState(this.gl);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${SceneConstants.webgl2ShaderRoot}/texture/earth.vert`],
            ['bns.frag', `${SceneConstants.webgl2ShaderRoot}/texture/earth.frag`]
        ]);
    }
    
    /**
     * 创建月球链接程序。
     * @return {Promise<void>}
     * @private
     */
    protected async createMoonProgramAsync(): Promise<void> {
        const shaderUrls: Map<string, string> = new Map<string, string>([
            ['bns.vert', `${SceneConstants.webgl2ShaderRoot}/texture/moon.vert`],
            ['bns.frag', `${SceneConstants.webgl2ShaderRoot}/texture/moon.frag`]
        ]);
        // 加载颜色顶点着色器代码
        let vertexShaderSource = await this.loadShaderSourceAsync(shaderUrls, 'bns.vert');
        // 加载颜色片元着色器代码
        let fragShaderSource = await this.loadShaderSourceAsync(shaderUrls, 'bns.frag');
        this._moonProgram = GLProgram.createDefaultProgram(this.gl, vertexShaderSource, fragShaderSource);
    }
    
    /**
     * 运行。
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        await this.createMoonProgramAsync();
        this._earthDayTexture = await this.loadTextureAsync('res/image/earthDay.png');
        this._earthNightTexture = await this.loadTextureAsync('res/image/earthNight.png');
        this._moonTexture = await this.loadTextureAsync('res/image/moon.png');
    }
    
    /**
     * 更新
     * @param elapsedMsec
     * @param intervalSec
     */
    public override update(elapsedMsec: number, intervalSec: number): void {
        // s = vt，根据两帧间隔更新角速度和角位移
        this._currentAngle += 10 * intervalSec;
        if (this._currentAngle >= 360) {
            this._currentAngle %= 360;
        }
        super.update(elapsedMsec, intervalSec);
    }
    
    /**
     * 渲染。
     */
    public override render(): void {
        GLRenderHelper.clearBuffer(this.gl);
        this.worldMatrixStack.rotate(2, Vector3.up);
        this.drawEarth();
        this.drawMoon();
    }
    
    /**
     * 绘制地球。
     * @private
     */
    private drawEarth(): void {
        const buffers = this.vertexBuffers.get(this._earth);
        if (!buffers) return;
        this.program.bind();
        this.program.loadSampler();
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.rotate(this._currentAngle, Vector3.up);
        this.worldMatrixStack.rotate(90, Vector3.right);
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
        this.program.setVector3('uLightLocationSun', new Vector3([50, 5, 0]));
        this.program.setVector3(GLShaderConstants.cameraPosition, this.camera.position);
        buffers.forEach((buffer, attribute) => {
                this.program.setVertexAttribute(attribute.NAME, buffer, attribute.COMPONENT);
            }
        );
        //设置使用的纹理编号-0
        this.gl.activeTexture(this.gl.TEXTURE0);
        //绑定白天纹理
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._earthDayTexture);
        this.program.setInt('sTexture', 0);
        //设置使用的纹理编号-1
        this.gl.activeTexture(this.gl.TEXTURE1);
        //绑定黑夜纹理
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._earthNightTexture);
        this.program.setInt('sTextureNight', 1);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._earth.vertex.count);
        this.worldMatrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 绘制月球
     * @private
     */
    private drawMoon(): void {
        const buffers = this.vertexBuffers.get(this._moon);
        if (!buffers) return;
        this._moonProgram.bind();
        this._moonProgram.loadSampler();
        this.worldMatrixStack.pushMatrix();
        this.worldMatrixStack.translate(new Vector3([9, 0, 0]));
        this.worldMatrixStack.rotate(this._currentAngle, Vector3.up);
        this.worldMatrixStack.rotate(90, Vector3.right);
        this._moonProgram.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this._moonProgram.setMatrix4(GLShaderConstants.MMatrix, this.worldMatrixStack.worldMatrix());
        this._moonProgram.setVector3('uLightLocationSun', new Vector3([50, 5, 0]));
        this._moonProgram.setVector3(GLShaderConstants.cameraPosition, this.camera.position);
        buffers.forEach((buffer, attribute) => {
                this._moonProgram.setVertexAttribute(attribute.NAME, buffer, attribute.COMPONENT);
            }
        );
        //设置使用的纹理编号-0
        this.gl.activeTexture(this.gl.TEXTURE0);
        //绑定纹理
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._moonTexture);
        this._moonProgram.setInt('sTexture', 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._moon.vertex.count);
        this.worldMatrixStack.popMatrix();
        this._moonProgram.unbind();
    }
    
    /**
     * 加载资源。
     * @param {string} url
     * @return {Promise<WebGLTexture>}
     * @private
     */
    private async loadTextureAsync(url: string): Promise<WebGLTexture> {
        const image = await HttpHelper.loadImageAsync(url);
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return texture;
    }
}