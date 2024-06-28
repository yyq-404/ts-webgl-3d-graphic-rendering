import {GLTexture} from '../../webgl/texture/GLTexture';
import {GLMeshBuilder} from '../../webgl/mesh/GLMeshBuilder';
import {GLCoordinateSystem} from '../../webgl/common/GLCoordinateSystem';
import {GLTextureCache} from '../../webgl/texture/GLTextureCache';
import {GLProgramCache} from '../../webgl/program/GLProgramCache';
import {GLAttributeHelper} from '../../webgl/GLAttributeHelper';
import {EGLVertexLayoutType} from '../../webgl/enum/EGLVertexLayoutType';
import {WebGLApplication} from '../base/WebGLApplication';
import {Matrix4} from '../../common/math/matrix/Matrix4';
import {Matrix4Adapter} from '../../common/math/MathAdapter';
import {Vector3} from '../../common/math/vector/Vector3';
import {GLCoordinateSystemHelper} from '../../webgl/GLCoordinateSystemHelper';
import {EAxisType} from '../../enum/EAxisType';
import {DrawHelper} from '../../common/DrawHelper';
import {CanvasKeyboardEvent} from '../../event/CanvasKeyboardEvent';

/**
 * 网格构建器应用
 */
export class MeshBuilderApplication extends WebGLApplication {
    /** 使用`EGLVertexLayoutType.INTERLEAVED`存储顶点数据的基于颜色着色器的`GLMeshBuilder`对象 */
    private readonly _colorBuilder0: GLMeshBuilder;
    /** 使用`EGLVertexLayoutType.SEQUENCED`存储顶点数据的基于颜色着色器的`GLMeshBuilder`对象 */
    private readonly _colorBuilder1: GLMeshBuilder;
    /** 使用EGLVertexLayoutType.SEPARATED存储顶点数据的基于颜色着色器的`GLMeshBuilder`对象 */
    private readonly _colorBuilder2: GLMeshBuilder;
    /** 使用`EGLVertexLayoutType.INTERLEAVED`存储顶点数据的基于纹理着色器的`GLMeshBuilder`对象 */
    private readonly _texBuilder0: GLMeshBuilder;
    /** 使用`EGLVertexLayoutType.SEQUENCED`存储顶点数据的基于纹理着色器的`GLMeshBuilder`对象 */
    private readonly _texBuilder1: GLMeshBuilder;
    /** 使用`EGLVertexLayoutType.SEPARATED`存储顶点数据的基于纹理着色器的`GLMeshBuilder`对象 */
    private readonly _texBuilder2: GLMeshBuilder;
    /** 用来更新旋转角度 */
    private _angle: number = 0;
    /** 用于多视口渲染使用的`GLCoordinateSystem`对象 */
    private readonly _coords: GLCoordinateSystem[];
    /** 用于切换页面1和页面2的绘制函数，类型是一个函数 */
    private _currentDrawMethod: () => void;
    /** 纹理着色器所使用的纹理对象 */
    private readonly _texture: GLTexture;
    /** 立方体坐标 */
    private cubeTexCoords: number[] = [
        ...[0, 0.5, 0.5, 0.5, 0.5, 1, 0, 1], // 0区映射到立方体的前面
        ...[0.5, 0.5, 1, 0.5, 1, 1, 0.5, 1], // 1区映射到立方体的右面
        ...[0, 0, 0.5, 0, 0.5, 0.5, 0, 0.5], // 2区映射到立方体的后面
        ...[0.5, 0, 1, 0, 1, 0.5, 0.5, 0.5], // 3区映射到立方体的左面
        ...[0.25, 0.25, 0.75, 0.25, 0.75, 0.75, 0.25, 0.75], // 4区映射到立方体的上面
        ...[0, 0, 1, 0, 1, 1, 0, 1] // 整个贴图映射到立方体的下面
    ];
    
    /**
     * 构造
     * @param {HTMLCanvasElement} canvas
     */
    public constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        if (!this.webglContext) throw new Error('this.webglContext is undefined.');
        // 使用default纹理和着色器
        this._texture = GLTextureCache.instance.getMust('default');
        // 创建不同EGLVertexLayoutType的颜色着色器
        this._colorBuilder0 = new GLMeshBuilder(this.webglContext, GLAttributeHelper.POSITION.BIT | GLAttributeHelper.COLOR.BIT, null, null, EGLVertexLayoutType.INTERLEAVED);
        this._colorBuilder1 = new GLMeshBuilder(this.webglContext, GLAttributeHelper.POSITION.BIT | GLAttributeHelper.COLOR.BIT, null, null, EGLVertexLayoutType.SEQUENCED);
        this._colorBuilder2 = new GLMeshBuilder(this.webglContext, GLAttributeHelper.POSITION.BIT | GLAttributeHelper.COLOR.BIT, null, null, EGLVertexLayoutType.SEPARATED);
        // 创建不同EGLVertexLayoutType的纹理着色器
        this._texBuilder0 = new GLMeshBuilder(this.webglContext, GLAttributeHelper.POSITION.BIT | GLAttributeHelper.TEX_COORDINATE_0.BIT, null, this._texture.texture, EGLVertexLayoutType.INTERLEAVED);
        this._texBuilder1 = new GLMeshBuilder(this.webglContext, GLAttributeHelper.POSITION.BIT | GLAttributeHelper.TEX_COORDINATE_0.BIT, null, this._texture.texture, EGLVertexLayoutType.SEQUENCED);
        this._texBuilder2 = new GLMeshBuilder(this.webglContext, GLAttributeHelper.POSITION.BIT | GLAttributeHelper.TEX_COORDINATE_0.BIT, null, this._texture.texture, EGLVertexLayoutType.SEPARATED);
        // 可以随便该行列数量，用于多视口渲染使用
        this._coords = GLCoordinateSystem.makeViewportCoordinateSystems(this.canvas.width, this.canvas.height, 2, 3);
        // 调整摄像机位置
        this.camera.z = 4;
        // 初始化时指向页面1的绘图函数
        this._currentDrawMethod = this.drawByMatrixWithColorShader;
        // BUG
        // this.currentDrawMethod = this.drawByMultiViewportsWithTextureShader;
    }
    
    
    /**
     * 运行
     * @return {Promise<void>}
     */
    public override async runAsync(): Promise<void> {
        await this.initAsync();
        let colorShaderProgram = GLProgramCache.instance.getMust('color');
        this._colorBuilder0.program = colorShaderProgram;
        this._colorBuilder1.program = colorShaderProgram;
        this._colorBuilder2.program = colorShaderProgram;
        let textureShaderProgram = GLProgramCache.instance.getMust('texture');
        this._texBuilder0.program = textureShaderProgram;
        this._texBuilder1.program = textureShaderProgram;
        this._texBuilder2.program = textureShaderProgram;
        this.start();
    }
    
    /**
     * 按键按下。
     * @param {CanvasKeyboardEvent} evt
     */
    public override onKeyPress(evt: CanvasKeyboardEvent): void {
        super.onKeyPress(evt); // 调用基类方法，这样摄像机键盘事件全部有效了
        if (evt.key === '1') {
            // 将currentDrawMethod函数指针指向drawByMatrixWithColorShader方法
            this._currentDrawMethod = this.drawByMatrixWithColorShader;
        } else if (evt.key === '2') {
            // 将currentDrawMethod函数指针指向drawByMultiViewportsWithTextureShader方法
            this._currentDrawMethod = this.drawByMultiViewportsWithTextureShader;
        }
    }
    
    /**
     * 更细
     * @param {number} elapsedMsec
     * @param {number} intervalSec
     */
    public override update(elapsedMsec: number, intervalSec: number): void {
        // 每帧旋转1度
        this._angle += 1;
        // 调用基类方法，这样就能让摄像机进行更新
        super.update(elapsedMsec, intervalSec);
    }
    
    /**
     * 渲染
     */
    public override render(): void {
        // 调用的的currentDrawMethod这个回调函数，该函数指向当前要渲染的页面方法
        this._currentDrawMethod();
    }
    
    /**
     * 使用纹理着色器渲染
     * @private
     */
    private drawByMultiViewportsWithTextureShader(): void {
        if (!this.webglContext) return;
        // 第一步，设置viewport
        this.setViewport(this._coords[0]);
        // 第二步，设置viewport的背景色（可选，如果你不想使用default深灰色的背景色）
        this.webglContext.clearColor(0.0, 0, 0, 1);
        // 第三步，将viewport设置为第二步设置的背景色（可选，如果你不想使用default深灰色的背景色）
        this.webglContext.clear(this.webglContext.COLOR_BUFFER_BIT | this.webglContext.DEPTH_BUFFER_BIT);
        this.matStack.pushMatrix();
        {
            this.matStack.rotate(this._angle, Vector3.forward);
            Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, Matrix4Adapter.m0);
            this._texBuilder0.begin(this.webglContext.TRIANGLES);
            this._texBuilder0.texCoordinate(0, 0).vertex(-1, 0, 0);
            this._texBuilder0.texCoordinate(1, 0).vertex(1, 0, 0);
            this._texBuilder0.texCoordinate(0.5, 0.5).vertex(0, 1, 0);
            this._texBuilder0.end(Matrix4Adapter.m0);
            this.matStack.popMatrix();
            GLCoordinateSystemHelper.drawAxis(this._colorBuilder0, Matrix4Adapter.m0, EAxisType.NONE, 1.5);
        }
        this.setViewport(this._coords[1]);
        this.matStack.pushMatrix();
        {
            this._texBuilder1.begin(this.webglContext.TRIANGLE_FAN);
            this.matStack.rotate(-this._angle, Vector3.forward);
            Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, Matrix4Adapter.m0);
            this._texBuilder1.texCoordinate(0, 0).vertex(-1, -0.5, 0);
            this._texBuilder1.texCoordinate(1, 0).vertex(1, -0.5, 0);
            this._texBuilder1.texCoordinate(1, 1).vertex(1, 0.5, 0);
            this._texBuilder1.texCoordinate(0, 1).vertex(-1, 0.5, 0);
            this._texBuilder1.end(Matrix4Adapter.m0);
            this.matStack.popMatrix();
            GLCoordinateSystemHelper.drawAxis(this._colorBuilder0, Matrix4Adapter.m0, EAxisType.NONE, 1.5);
        }

        // 在viewport2中绘制绕y轴旋转、使用cubeTexCoords的立方体
        this.setViewport(this._coords[2]);
        this.matStack.pushMatrix();
        {
            this.matStack.rotate(this._angle, Vector3.up);
            Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, Matrix4Adapter.m0);
            DrawHelper.drawTextureCubeBox(this._texBuilder0, Matrix4Adapter.m0, 0.5, this.cubeTexCoords);
            this.matStack.popMatrix();
            GLCoordinateSystemHelper.drawAxis(this._colorBuilder0, Matrix4Adapter.m0, EAxisType.NONE, 1.5);
        }

        // 在viewport3中绘制绕x轴旋转、使用cubeTexCoords的立方体
        this.setViewport(this._coords[3]);
        this.webglContext.clearColor(1.0, 1, 1, 1);
        this.webglContext.clear(this.webglContext.COLOR_BUFFER_BIT | this.webglContext.DEPTH_BUFFER_BIT);
        this.matStack.pushMatrix();
        {
            this.matStack.rotate(this._angle, Vector3.right);
            Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, Matrix4Adapter.m0);
            DrawHelper.drawTextureCubeBox(this._texBuilder1, Matrix4Adapter.m0, 0.5, this.cubeTexCoords);
            this.matStack.popMatrix();
            GLCoordinateSystemHelper.drawAxis(this._colorBuilder0, Matrix4Adapter.m0, EAxisType.NONE, 1.5);
        }

        // 在viewport4中绘制绕z轴旋转、使用cubeTexCoords的立方体
        this.setViewport(this._coords[4]);
        this.webglContext.clearColor(0.0, 0, 0, 1);
        this.webglContext.clear(this.webglContext.COLOR_BUFFER_BIT | this.webglContext.DEPTH_BUFFER_BIT);
        this.matStack.pushMatrix();
        {
            this.matStack.rotate(this._angle, Vector3.forward);
            Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, Matrix4Adapter.m0);
            DrawHelper.drawTextureCubeBox(this._texBuilder0, Matrix4Adapter.m0, 0.5, this.cubeTexCoords);
            this.matStack.popMatrix();
            GLCoordinateSystemHelper.drawAxis(this._colorBuilder0, Matrix4Adapter.m0, EAxisType.NONE, 1.5);
        }
        // 在viewport5中绘制绕[1, 1, 1]轴旋转、使用默认贴图坐标的立方体
        this.setViewport(this._coords[5]);
        this.matStack.pushMatrix();
        {
            this.matStack.rotate(this._angle, new Vector3([1, 1, 1]).normalize());
            Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, Matrix4Adapter.m0);
            DrawHelper.drawTextureCubeBox(this._texBuilder0, Matrix4Adapter.m0, 0.8);
            this.matStack.popMatrix();
            GLCoordinateSystemHelper.drawAxis(this._colorBuilder0, Matrix4Adapter.m0, EAxisType.NONE, 1.5);
        }
    }
    
    private drawByMatrixWithColorShader(): void {
        if (!this.webglContext) return;
        // 很重要，由于我们后续使用多视口渲染，因此必须要调用camera的setViewport方法
        this.camera.setViewport(0, 0, this.canvas.width, this.canvas.height);
        // 使用clearColor方法设置当前颜色缓冲区背景色是什么颜色
        this.webglContext.clearColor(0.8, 0.8, 0.8, 1);
        // 调用clear清屏操作
        this.webglContext.clear(this.webglContext.COLOR_BUFFER_BIT | this.webglContext.DEPTH_BUFFER_BIT);
        // 关闭三角形背面剔除功能，这是因为在初始化是，我们是开启了该功能
        // 但是由于我们下面会渲染三角形和四边形这两个2d形体，所以要关闭，否则不会显示三角形或四边形的背面部分
        this.webglContext.disable(this.webglContext.CULL_FACE);
        
        // EGLVertexLayoutType.INTERLEAVED 顶点存储格式绘制绕z轴旋转的三角形
        this.matStack.pushMatrix();
        this.matStack.translate(new Vector3([-1.5, 0, 0])); // 将坐标系左移1.5个单位（右移为正，左移为负)
        this.matStack.rotate(this._angle, Vector3.forward); // 绕着Z轴每帧旋转this.angle数量，单位为度而不是弧度
        // 合成model-view-projection矩阵，存储到Matrix4的静态变量中，减少内存的重新分配
        Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, Matrix4Adapter.m0);
        // 在使用GLMeshBuilder时，必须要调用beging方法
        this._colorBuilder0.begin(this.webglContext.TRIANGLES);
        // 顶点0为红色  左
        this._colorBuilder0.color(1, 0, 0).vertex(-0.5, 0, 0);
        // 顶点1为绿色  右
        this._colorBuilder0.color(0, 1, 0).vertex(0.5, 0, 0);
        // 顶点2为蓝色  上
        this._colorBuilder0.color(0, 0, 1).vertex(0, 0.5, 0);
        // 在使用GLMeshBuilder时，必须要调用end方法进行真正的绘制提交命令
        this._colorBuilder0.end(Matrix4Adapter.m0);
        // 矩阵出堆栈
        this.matStack.popMatrix();
        GLCoordinateSystemHelper.drawAxis(this._colorBuilder0, Matrix4Adapter.m0, EAxisType.NONE, 0.8);
        
        // EGLVertexLayoutType.SEQUENCED 顶点存储格式绘制绘制绕y轴旋转的四边形
        // 矩阵堆栈进栈
        this.matStack.pushMatrix();
        this.matStack.rotate(this._angle, Vector3.up); // 在窗口中心绘制，因此不需要平移，只需要旋转
        // 合成model-view-projection矩阵，存储到Matrix4的静态变量中，减少内存的重新分配
        Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, Matrix4Adapter.m0);
        // 注意这里我们使用TRIANGLE_FAN图元而不是TRIANGLES图元绘制
        this._colorBuilder1.begin(this.webglContext.TRIANGLE_FAN);
        // 顶点0为红色  左下
        this._colorBuilder1.color(1, 0, 0).vertex(-0.5, 0, 0);
        // 顶点1为绿色  右下
        this._colorBuilder1.color(0, 1, 0).vertex(0.5, 0, 0);
        // 顶点2为蓝色  右上
        this._colorBuilder1.color(0, 0, 1).vertex(0.5, 0.5, 0);
        // 顶点3为黄色 左上
        this._colorBuilder1.color(1, 1, 0).vertex(-0.5, 0.5, 0);
        // 向GPU提交绘制命令
        this._colorBuilder1.end(Matrix4Adapter.m0);
        // 矩阵出堆栈
        this.matStack.popMatrix();
        GLCoordinateSystemHelper.drawAxis(this._colorBuilder1, Matrix4Adapter.m0, EAxisType.NONE, 0.8);
        
        // EGLVertexLayoutType.SEPARATED 顶点存储格式绘制绘制绕[1, 1, 1]轴转转的立方体
        // 矩阵堆栈进栈
        this.matStack.pushMatrix();
        // 将坐标系右移1.5个单位（右移为正，左移为负)
        this.matStack.translate(new Vector3([1.5, 0, 0]));
        // 绕[1, 1, 1]轴旋转，主要轴调用normalize方法进行单位化
        this.matStack.rotate(-this._angle, new Vector3([1, 1, 1]).normalize());
        // 合成model-view-projection矩阵，存储到Matrix4的静态变量中，减少内存的重新分
        Matrix4.product(this.camera.viewProjectionMatrix, this.matStack.modelViewMatrix, Matrix4Adapter.m0);
        // 调用DrawHelper类的静态drawWireFrameCubeBox方法
        DrawHelper.drawWireFrameCubeBox(this._colorBuilder2, Matrix4Adapter.m0, 0.2);
        // 矩阵出堆栈
        this.matStack.popMatrix();
        GLCoordinateSystemHelper.drawAxis(this._colorBuilder2, Matrix4Adapter.m0, EAxisType.NONE, 0.8);
        // 恢复三角形背面剔除功能
        this.webglContext.enable(this.webglContext.CULL_FACE);
    }
    
    /**
     * 将`GLCoordinateSystem`中的`viewport`数据设置到`WebGL`上下文对象中
     * @param {GLCoordinateSystem} glCoordinateSystem
     * @private
     */
    private setViewport(glCoordinateSystem: GLCoordinateSystem): void {
        // camera的setViewport方法内部会调用:
        // 1、gl.viewport (x, y, width, height)方法
        // 2、gl.scissor (x, y, width, height)方法
        // 而在WebGLApplication的构造函数调用的GLHelper.setDefaultState方法已经开启了SCISSOR_TEST
        // 因此可以进行视口大小的裁剪操作了，超出视口部分的内容都被裁剪掉了!!
        this.camera.setViewport(glCoordinateSystem.viewport[0], glCoordinateSystem.viewport[1], glCoordinateSystem.viewport[2], glCoordinateSystem.viewport[3]
        );
    }
}
