import {WebGL2Scene} from '../../base/WebGL2Scene';
import {SceneConstants} from '../../SceneConstants';
import {GLProgram} from '../../../webgl/program/GLProgram';
import {Ball} from '../../../common/geometry/solid/Ball';
import {GLRenderHelper} from '../../../webgl/GLRenderHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {GLTextureHelper} from '../../../webgl/texture/GLTextureHelper';

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
    /** 余层 */
    private _cloud: Ball = new Ball(3.05, 1);
    /** 云层纹理 */
    private _cloudTexture: WebGLTexture;
    /** 云层链接程序 */
    private _cloudProgram: GLProgram;
    
    
    /**
     * 构造
     */
    public constructor() {
        super();
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.NORMAL.BIT | GLAttributeHelper.TEX_COORDINATE_0.BIT;
        this.createBuffers(this._earth, this._moon, this._cloud);
        this.camera.z = 20;
        // this.canvas.style.background = 'black';
        GLRenderHelper.setDefaultState(this.gl);
        //设置屏幕背景色RGBA
        this.gl.clearColor(0.0,0.0,0.0,1.0);
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
     * 创建云层链接程序。
     * @return {Promise<void>}
     * @private
     */
    protected async createCloudProgramAsync(): Promise<void> {
        const shaderUrls: Map<string, string> = new Map<string, string>([
            ['bns.vert', `${SceneConstants.webgl2ShaderRoot}/texture/cloud.vert`],
            ['bns.frag', `${SceneConstants.webgl2ShaderRoot}/texture/cloud.frag`]
        ]);
        // 加载颜色顶点着色器代码
        let vertexShaderSource = await this.loadShaderSourceAsync(shaderUrls, 'bns.vert');
        // 加载颜色片元着色器代码
        let fragShaderSource = await this.loadShaderSourceAsync(shaderUrls, 'bns.frag');
        this._cloudProgram = GLProgram.createDefaultProgram(this.gl, vertexShaderSource, fragShaderSource);
    }
    
    /**
     * 运行。
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        await this.createMoonProgramAsync();
        await this.createCloudProgramAsync();
        this._earthDayTexture = await GLTextureHelper.loadNormalTextureAsync(this.gl, 'res/image/earthDay.png');
        this._earthNightTexture = await GLTextureHelper.loadNormalTextureAsync(this.gl, 'res/image/earthNight.png');
        this._moonTexture = await GLTextureHelper.loadNormalTextureAsync(this.gl, 'res/image/moon.png');
        this._cloudTexture = await GLTextureHelper.loadNormalTextureAsync(this.gl, 'res/image/cloud.jpg');
    }
    
    /**
     * 更新
     * @param elapsedMsec
     * @param intervalSec
     */
    public override update(elapsedMsec: number, intervalSec: number): void {
        // s = vt，根据两帧间隔更新角速度和角位移
        this._currentAngle += 5 * intervalSec;
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
        this.matrixStack.rotate(1, Vector3.up);
        this.drawEarth();
        this.drawCloud();
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
        this.matrixStack.pushMatrix();
        this.matrixStack.rotate(this._currentAngle, Vector3.up);
        this.matrixStack.rotate(90, Vector3.right);
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setMatrix4(GLShaderConstants.MMatrix, this.matrixStack.worldMatrix());
        this.program.setVector3('uLightLocationSun', new Vector3([50, 5, 0]));
        this.program.setVector3(GLShaderConstants.Camera, this.camera.position);
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
        this.matrixStack.popMatrix();
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
        this.matrixStack.pushMatrix();
        this.matrixStack.translate(new Vector3([9, 0, 0]));
        this.matrixStack.rotate(this._currentAngle, Vector3.up);
        this.matrixStack.rotate(90, Vector3.right);
        this._moonProgram.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this._moonProgram.setMatrix4(GLShaderConstants.MMatrix, this.matrixStack.worldMatrix());
        this._moonProgram.setVector3('uLightLocationSun', new Vector3([50, 5, 0]));
        this._moonProgram.setVector3(GLShaderConstants.Camera, this.camera.position);
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
        this.matrixStack.popMatrix();
        this._moonProgram.unbind();
    }
    
    /**
     * 绘制云层
     * @private
     */
    private drawCloud(): void {
        const buffers = this.vertexBuffers.get(this._cloud);
        if (!buffers) return;
        this._cloudProgram.bind();
        this._cloudProgram.loadSampler();
        //开启混合
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);//设置混合因子
        this._cloudProgram.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this._cloudProgram.setMatrix4(GLShaderConstants.MMatrix, this.matrixStack.worldMatrix());
        this._moonProgram.setVector3('uLightLocationSun', new Vector3([50, 5, 0]));
        this._cloudProgram.setVector3(GLShaderConstants.Camera, this.camera.position);
        buffers.forEach((buffer, attribute) => {
                this._cloudProgram.setVertexAttribute(attribute.NAME, buffer, attribute.COMPONENT);
            }
        );
        //设置使用的纹理编号-0
        this.gl.activeTexture(this.gl.TEXTURE0);
        //绑定纹理
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._cloudTexture);
        this._cloudProgram.setInt('sTexture', 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._cloud.vertex.count);
        // this.matrixStack.popMatrix();
        this.gl.disable(this.gl.BLEND);
        this._cloudProgram.unbind();
    }
}