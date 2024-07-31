import {WebGL2Scene} from './base/WebGL2Scene';
import {ModelOBJ} from '../common/geometry/model/ModelOBJ';
import {ModelOBJHelper} from './ModelOBJHelper';
import {GLProgram} from '../webgl/program/GLProgram';
import {Rect} from '../common/geometry/solid/Rect';
import {GLAttributeHelper} from '../webgl/GLAttributeHelper';
import {GLTextureHelper} from '../webgl/texture/GLTextureHelper';
import {SceneConstants} from './SceneConstants';
import {Vector3} from '../common/math/vector/Vector3';
import {GLShaderConstants} from '../webgl/GLShaderConstants';
import {IGLAttribute} from '../webgl/attribute/IGLAttribute';
import {CanvasKeyboardEventManager} from '../event/keyboard/CanvasKeyboardEventManager';
import {ECanvasKeyboardEventType} from '../enum/ECanvasKeyboardEventType';
import {Vector2} from '../common/math/vector/Vector2';

/**
 * 颜色混合场景。
 */
export class ColorMixScene extends WebGL2Scene {
    /** 模型名称集合 */
    private _modelNames = ['ch', 'pm', 'qt', 'cft', 'yh'];
    /** 模型集合 */
    private _models: ModelOBJ[] = [];
    /** 正方形 */
    private _rect = new Rect(3, 3);
    /** 纹理材质链接程序 */
    private _textureProgram: GLProgram;
    /** 纹理材质 */
    private _texture: WebGLTexture;
    /** 纹理文职 */
    private _pos: Vector2 = Vector2.zero.copy();
    
    /**
     * 构造
     */
    constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.TEX_COORDINATE_0.BIT | GLAttributeHelper.NORMAL.BIT;
        this.gl.enable(this.gl.DEPTH_TEST);
        this.canvas.style.background = 'black';
        this.camera.z = 100;
        CanvasKeyboardEventManager.instance.registers(this, [
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowUp', callback: () => this.onYAxisMove(1)},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowDown', callback: () => this.onYAxisMove(-1)},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowRight', callback: () => this.onXAxisMove(1)},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowLeft', callback: () => this.onXAxisMove(-1)}
        ]);
    }
    
    /**
     * 获取shader路径集合。
     * @return {Map<string, string>}
     */
    public override get shaderUrls(): Map<string, string> {
        return new Map<string, string>([
            ['bns.vert', `${SceneConstants.webgl2ShaderRoot}/model/model_mix.vert`],
            ['bns.frag', `${SceneConstants.webgl2ShaderRoot}/model/model_mix.frag`]
        ]);
    }
    
    /**
     * 运行。
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        await this.createTextureProgramAsync();
        for (let i = 0; i < this._modelNames.length; i++) {
            const model = await ModelOBJHelper.loadAsync(`res/model/${this._modelNames[i]}.obj`);
            this._models.push(model);
        }
        this._texture = await GLTextureHelper.loadNormalTextureAsync(this.gl, `res/image/lgq.png`);
        this.createBuffers(...this._models, this._rect);
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this.drawModels();
        this.drawTexture();
    }
    
    /**
     * 创建纹理链接程序。
     * @return {Promise<void>}
     * @private
     */
    protected async createTextureProgramAsync(): Promise<void> {
        const shaderUrls: Map<string, string> = new Map<string, string>([
            ['bns.vert', `${SceneConstants.webgl2ShaderRoot}/model/texture_mix.vert`],
            ['bns.frag', `${SceneConstants.webgl2ShaderRoot}/model/texture_mix.frag`]
        ]);
        // 加载颜色顶点着色器代码
        let vertexShaderSource = await this.loadShaderSourceAsync(shaderUrls, 'bns.vert');
        // 加载颜色片元着色器代码
        let fragShaderSource = await this.loadShaderSourceAsync(shaderUrls, 'bns.frag');
        this._textureProgram = GLProgram.createDefaultProgram(this.gl, vertexShaderSource, fragShaderSource);
    }
    
    /**
     * 绘制模型集合
     * @private
     */
    private drawModels(): void {
        this.matrixStack.pushMatrix();
        //平面
        this.matrixStack.pushMatrix();
        this.matrixStack.rotate(25, Vector3.right);
        this.drawModel(this._models[0]);
        //缩放物体
        this.matrixStack.pushMatrix();
        this.matrixStack.scale(new Vector3([1.5, 1.5, 1.5]));
        //绘制长方体
        this.matrixStack.pushMatrix();
        this.matrixStack.translate(new Vector3([-10, 0, 0]));
        this.drawModel(this._models[1]);
        this.matrixStack.popMatrix();
        //绘制球体
        this.matrixStack.pushMatrix();
        this.matrixStack.translate(new Vector3([10, 0, 0]));
        this.matrixStack.rotate(30, Vector3.up);
        this.drawModel(this._models[2]);
        this.matrixStack.popMatrix();
        //绘制圆环
        this.matrixStack.pushMatrix();
        this.matrixStack.translate(new Vector3([0, 0, -10]));
        this.drawModel(this._models[3]);
        this.matrixStack.popMatrix();
        //绘制茶壶
        this.matrixStack.pushMatrix();
        this.matrixStack.translate(new Vector3([0, 0, 10]));
        this.drawModel(this._models[4]);
        this.matrixStack.popMatrix();
        this.matrixStack.popMatrix();
        this.matrixStack.popMatrix();
        this.matrixStack.popMatrix();
    }
    
    /**
     * 绘制模型。
     * @param {ModelOBJ} model
     * @private
     */
    private drawModel(model: ModelOBJ): void {
        const buffers = this.vertexBuffers.get(model);
        if (!buffers) return;
        this.program.bind();
        this.program.loadSampler();
        this.matrixStack.rotate(this.mouseMoveEvent.currentYAngle, Vector3.up);
        this.matrixStack.rotate(this.mouseMoveEvent.currentXAngle, Vector3.right);
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        this.program.setMatrix4(GLShaderConstants.MMatrix, this.matrixStack.worldMatrix());
        this.program.setVector3(GLShaderConstants.Camera, this.camera.position);
        this.program.setVector3(GLShaderConstants.LightLocation, new Vector3([0, 0, 50]));
        buffers.forEach((buffer: WebGLBuffer, attribute: IGLAttribute) => {
            this.program.setVertexAttribute(attribute.NAME, buffer, attribute.COMPONENT);
        });
        this.gl.drawArrays(this.gl.TRIANGLES, 0, model.vertex.count);
        this.program.unbind();
    }
    
    /**
     * 绘制纹理。
     * @private
     */
    private drawTexture(): void {
        const buffers = this.vertexBuffers.get(this._rect);
        if (!buffers) return;
        this._textureProgram.bind();
        this._textureProgram.loadSampler();
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_COLOR, this.gl.ONE_MINUS_SRC_COLOR);
        this.matrixStack.pushMatrix();
        this.matrixStack.scale(new Vector3([2.0, 2.0, 2.0]));
        this.matrixStack.translate(new Vector3([...this._pos.xy, 25]));
        this._textureProgram.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        buffers.forEach((buffer: WebGLBuffer, attribute: IGLAttribute) => {
            this._textureProgram.setVertexAttribute(attribute.NAME, buffer, attribute.COMPONENT);
        });
        if (this._texture) {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
            this._textureProgram.setInt('sTexture', 0);
        }
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._rect.vertex.count);
        this.matrixStack.popMatrix();
        this.gl.disable(this.gl.BLEND);
        this._textureProgram.unbind();
    }
    
    /**
     * X轴移动
     * @param {number} speed
     * @private
     */
    private onXAxisMove(speed: number): void {
        this._pos.x += speed;
    }
    
    /**
     * Y轴移动
     * @param {number} speed
     * @private
     */
    private onYAxisMove(speed: number): void {
        this._pos.y += speed;
    }
}