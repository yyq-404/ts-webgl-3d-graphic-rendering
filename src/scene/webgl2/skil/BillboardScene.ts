import {WebGL2Scene} from '../../base/WebGL2Scene';
import {GLAttributeHelper} from '../../../webgl/GLAttributeHelper';
import {SceneConstants} from '../../SceneConstants';
import {Rect} from '../../../common/geometry/solid/Rect';
import {GLTextureHelper} from '../../../webgl/texture/GLTextureHelper';
import {Vector3} from '../../../common/math/vector/Vector3';
import {GLShaderConstants} from '../../../webgl/GLShaderConstants';
import {CanvasKeyboardEventManager} from '../../../event/keyboard/CanvasKeyboardEventManager';
import {ECanvasKeyboardEventType} from '../../../enum/ECanvasKeyboardEventType';
import {Vector2} from '../../../common/math/vector/Vector2';

/**
 * 广告牌
 */
export class BillboardScene extends WebGL2Scene {
    /** 沙漠 */
    private _desert = new Rect(180, 180);
    /** 树木 */
    private _tree = new Rect(3, 5);
    /** 树林 */
    private _trees: Tree[] = [
        new Tree(0, 0, 0),
        new Tree(8, 0, 0),
        new Tree(5.7, 5.7, 0),
        new Tree(0, -8, 0),
        new Tree(-5.7, 5.7, 0),
        new Tree(-8, 0, 0),
        new Tree(-5.7, -5.7, 0),
        new Tree(0, 8, 0),
        new Tree(5.7, -5.7, 0)
    ];
    /** 树木贴图 */
    private _treeTexture: WebGLTexture;
    /** 沙漠贴图 */
    private _desertTexture: WebGLTexture;
    /** 相机位置 */
    private _cameraPosition = new Vector3([0, 5, 25]);
    /** z轴偏移*/
    private _offsetZ: number = 50;
    /** 旋转弧度 */
    private _radian: number = 0;
    
    /**
     * 构造
     */
    public constructor() {
        super(true);
        this.attributeBits = GLAttributeHelper.POSITION.BIT | GLAttributeHelper.TEX_COORDINATE_0.BIT;
        this.camera.position = this._cameraPosition;
        this.gl.enable(this.gl.DEPTH_TEST);
        this._desert.uvs = this._desert.createUVs(6, 6);
        this.createBuffers(this._tree, this._desert);
        const radianSpan = (30.0 / 180.0 * Math.PI);
        CanvasKeyboardEventManager.instance.registers(this, [
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowUp', callback: () => this.onZAxisMove(5)},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowDown', callback: () => this.onZAxisMove(-5)},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowRight', callback: () => this.onXAxisRotate(radianSpan)},
            {type: ECanvasKeyboardEventType.KEY_DOWN, key: 'ArrowLeft', callback: () => this.onXAxisRotate(-radianSpan)}
        ]);
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
        this._desertTexture = await GLTextureHelper.loadNormalTextureAsync(this.gl, 'res/image/desert.bmp');
        this._treeTexture = await GLTextureHelper.loadNormalTextureAsync(this.gl, 'res/image/tree.png');
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        this._cameraPosition = new Vector3([Math.sin(this._radian) * this._offsetZ, 5, Math.cos(this._radian) * this._offsetZ]);
        this.computeBillboardDirection();
        this.camera.lookAt(this._cameraPosition, Vector3.zero, Vector3.up);
        this._trees.sort((a, b) => {
            const va = new Vector2([a.x - this._cameraPosition.x, a.z - this._cameraPosition.z]);
            const vb = new Vector2([b.x - this._cameraPosition.x, b.z - this._cameraPosition.z]);
            return vb.length()-va.length();
        });
        this.drawDesert();
        this.drawTrees();
    }
    
    /**
     * 计算公告板朝向
     * @private
     */
    private computeBillboardDirection(): void {
        this._trees.forEach(tree => tree.computeBillboardDirection(this._cameraPosition));
    }
    
    /**
     * 绘制沙漠
     * @private
     */
    private drawDesert(): void {
        const buffers = this.vertexBuffers.get(this._desert);
        if (!buffers) return;
        this.program.bind();
        this.program.loadSampler();
        this.matrixStack.pushMatrix();
        this.matrixStack.rotate(-90, Vector3.right);
        this.matrixStack.scale(new Vector3([0.5, 0.5, 0.5]));
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        buffers.forEach((buffer, attribute) => {
            this.program.setVertexAttribute(attribute.NAME, buffer, attribute.COMPONENT);
        });
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._desertTexture);
        this.program.setInt('sTexture', 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._desert.vertex.count);
        this.matrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * 绘制树林。
     * @private
     */
    private drawTrees(): void {
        this.matrixStack.pushMatrix();
        this.matrixStack.translate(new Vector3([0, -0.1, 0]));
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this._trees.forEach(tree => this.drawTree(tree));
        this.gl.disable(this.gl.BLEND);
        this.matrixStack.popMatrix();
    }
    
    /**
     * 绘制树木
     * @param {Tree} tree
     * @private
     */
    private drawTree(tree: Tree): void {
        const buffers = this.vertexBuffers.get(this._tree);
        if (!buffers) return;
        this.program.bind();
        this.program.loadSampler();
        this.matrixStack.pushMatrix();
        this.matrixStack.translate(new Vector3([tree.x, 5.0, tree.z]));
        this.matrixStack.rotate(tree.yAngle, Vector3.up);
        this.program.setMatrix4(GLShaderConstants.MVPMatrix, this.mvpMatrix());
        buffers.forEach((buffer, attribute) => {
            this.program.setVertexAttribute(attribute.NAME, buffer, attribute.COMPONENT);
        });
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this._treeTexture);
        this.program.setInt('sTexture', 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this._tree.vertex.count);
        this.matrixStack.popMatrix();
        this.program.unbind();
    }
    
    /**
     * x轴旋转
     * @param {number} degreeSpan
     * @private
     */
    private onXAxisRotate(degreeSpan: number): void {
        this._radian += degreeSpan;
    }
    
    /**
     * z轴移动
     * @param {number} offset
     * @private
     */
    private onZAxisMove(offset: number): void {
        this._offsetZ += offset;
    }
}

/**
 * 树木定义。
 */
export class Tree {
    /** x轴位置 */
    public x: number = 0;
    /** z轴位置 */
    public z: number = 0;
    /** y轴夹脚 */
    public yAngle: number = 0;
    
    /**
     * 构造
     * @param {number} x
     * @param {number} z
     * @param {number} yAngle
     */
    public constructor(x: number, z: number, yAngle: number) {
        this.x = x;
        this.z = z;
        this.yAngle = yAngle;
    }
    
    /**
     * 根据相机位置计算树木朝向。
     * @param cameraPosition
     */
    public computeBillboardDirection(cameraPosition: Vector3): void {
        const xSpan = this.x - cameraPosition.x;
        const zSpan = this.z - cameraPosition.z;
        this.yAngle = 180 / Math.PI * (Math.atan(xSpan / zSpan));
        if (zSpan > 0) {
            this.yAngle += 180;
        }
    }
}