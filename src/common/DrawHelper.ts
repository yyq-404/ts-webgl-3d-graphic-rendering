import {GLMeshBuilder} from '../webgl/mesh/GLMeshBuilder';
import {Matrix4} from './math/matrix/Matrix4';
import {Vector3} from './math/vector/Vector3';
import {Vector4} from './math/vector/Vector4';
import {Vector4Adapter} from './math/MathAdapter';
import {EAxisType} from '../enum/EAxisType';
import {MathHelper} from './math/MathHelper';

/**
 *绘制助手
 */
export class DrawHelper {
    /** 默认颜色 */
    public static defaultHitColor: Vector4 = new Vector4([1, 1, 0, 0]);

    /**
     * 绘制立方体
     * @param builder
     * @param mat
     * @param halfLen
     * @param color
     */
    public static drawWireFrameCubeBox(builder: GLMeshBuilder, mat: Matrix4, halfLen: number = 0.2, color: Vector4 = Vector4Adapter.red): void {
        const mins: Vector3 = new Vector3([-halfLen, -halfLen, -halfLen]);
        const maxs: Vector3 = new Vector3([halfLen, halfLen, halfLen]);
        DrawHelper.drawBoundBox(builder, mat, mins, maxs, color);
    }

    /**
     * 根据 `mins` 点（下图中的顶点2，左下后）和 `maxs`（下图中的顶点5，右上前）点的坐标，
     * 使用参数指定的颜色绘制线框绑定盒，它是一个立方体
     * `GLMeshBuilder`的`begin()` / `end()`被调用了三次
     * ```plaintext
     *    /3--------/7
     *   / |       / |
     *  /  |      /  |
     * 1---|-----5   |
     * |  /2- - -|- -6
     * | /       |  /
     * |/        | /
     * 0---------4/
     * ```
     */
    public static drawBoundBox(builder: GLMeshBuilder, mat: Matrix4, mins: Vector3, maxs: Vector3, color: Vector4 = Vector4Adapter.red): void {
        // 使用LINE_LOOP绘制底面，注意顶点顺序，逆时针方向，根据右手螺旋定则可知，法线朝外
        builder.begin(builder.webglContext.LINE_LOOP); // 使用的是LINE_LOOP图元绘制模式
        {
            builder.color(color.r, color.g, color.b).vertex(mins.x, mins.y, mins.z); // 2   - - -
            builder.color(color.r, color.g, color.b).vertex(mins.x, mins.y, maxs.z); // 0   - - +
            builder.color(color.r, color.g, color.b).vertex(maxs.x, mins.y, maxs.z); // 4   + - +
            builder.color(color.r, color.g, color.b).vertex(maxs.x, mins.y, mins.z); // 6   + - -
            builder.end(mat);
        }
        // 使用LINE_LOOP绘制顶面，注意顶点顺序，逆时针方向，根据右手螺旋定则可知，法线朝外
        builder.begin(builder.webglContext.LINE_LOOP); // 使用的是LINE_LOOP图元绘制模式
        {
            builder.color(color.r, color.g, color.b).vertex(mins.x, maxs.y, mins.z); // 3   - + -
            builder.color(color.r, color.g, color.b).vertex(maxs.x, maxs.y, mins.z); // 7   + + -
            builder.color(color.r, color.g, color.b).vertex(maxs.x, maxs.y, maxs.z); // 5   + + +
            builder.color(color.r, color.g, color.b).vertex(mins.x, maxs.y, maxs.z); // 1   - + +
            builder.end(mat);
        }
        // 使用LINES绘制
        builder.begin(builder.webglContext.LINES); // 使用的是LINES图元绘制模式
        {
            builder.color(color.r, color.g, color.b).vertex(mins.x, mins.y, mins.z); // 2   - - -
            builder.color(color.r, color.g, color.b).vertex(mins.x, maxs.y, mins.z); // 3   - + -
            builder.color(color.r, color.g, color.b).vertex(mins.x, mins.y, maxs.z); // 0   - - +
            builder.color(color.r, color.g, color.b).vertex(mins.x, maxs.y, maxs.z); // 1   - + +
            builder.color(color.r, color.g, color.b).vertex(maxs.x, mins.y, maxs.z); // 4   + - +
            builder.color(color.r, color.g, color.b).vertex(maxs.x, maxs.y, maxs.z); // 5   + + +
            builder.color(color.r, color.g, color.b).vertex(maxs.x, mins.y, mins.z); // 6   + - -
            builder.color(color.r, color.g, color.b).vertex(maxs.x, maxs.y, mins.z); // 7   + + -
            builder.end(mat);
        }
    }

    /**
     * 绘制纹理立方体
     * ```plaintext
     *    /3--------/7
     *   / |       / |
     *  /  |      /  |
     * 1---|-----5   |
     * |  /2- - -|- -6
     * | /       |  /
     * |/        | /
     * 0---------4/
     * ```
     * @param builder
     * @param mat
     * @param halfLen
     * @param tc 纹理坐标数组，该数组保存48个number类型，共6组纹理坐标，
     * 每组8个纹理坐标值，可以映射到立方体的某个面上，其顺序是前、右、后、左、上、下。
     */
    public static drawTextureCubeBox(builder: GLMeshBuilder, mat: Matrix4, halfLen: number = 0.2, tc: number[] = [
                                         ...[0, 0, 1, 0, 1, 1, 0, 1], // 前面
                                         ...[0, 0, 1, 0, 1, 1, 0, 1], // 右面
                                         ...[0, 0, 1, 0, 1, 1, 0, 1], // 后面
                                         ...[0, 0, 1, 0, 1, 1, 0, 1], // 左面
                                         ...[0, 0, 1, 0, 1, 1, 0, 1], // 上面
                                         ...[0, 0, 1, 0, 1, 1, 0, 1] // 下面
                                     ]
    ): void {
        // 前面
        builder.begin(builder.webglContext.TRIANGLE_FAN);
        builder.texCoordinate(tc[0], tc[1]).vertex(-halfLen, -halfLen, halfLen); // 0   - - +
        builder.texCoordinate(tc[2], tc[3]).vertex(halfLen, -halfLen, halfLen); // 4   + - +
        builder.texCoordinate(tc[4], tc[5]).vertex(halfLen, halfLen, halfLen); // 5   + + +
        builder.texCoordinate(tc[6], tc[7]).vertex(-halfLen, halfLen, halfLen); // 1   - + +
        builder.end(mat);
        // 右面
        builder.begin(builder.webglContext.TRIANGLE_FAN);
        builder.texCoordinate(tc[8], tc[9]).vertex(halfLen, -halfLen, halfLen); // 4   + - +
        builder.texCoordinate(tc[10], tc[11]).vertex(halfLen, -halfLen, -halfLen); // 6   + - -
        builder.texCoordinate(tc[12], tc[13]).vertex(halfLen, halfLen, -halfLen); // 7   + + -
        builder.texCoordinate(tc[14], tc[15]).vertex(halfLen, halfLen, halfLen); // 5   + + +
        builder.end(mat);
        // 后面
        builder.begin(builder.webglContext.TRIANGLE_FAN);
        builder.texCoordinate(tc[16], tc[17]).vertex(halfLen, -halfLen, -halfLen); // 6   + - -
        builder.texCoordinate(tc[18], tc[19]).vertex(-halfLen, -halfLen, -halfLen); // 2   - - -
        builder.texCoordinate(tc[20], tc[21]).vertex(-halfLen, halfLen, -halfLen); // 3   - + -
        builder.texCoordinate(tc[22], tc[23]).vertex(halfLen, halfLen, -halfLen); // 7   + + -
        builder.end(mat);
        // 左面
        builder.begin(builder.webglContext.TRIANGLE_FAN);
        builder.texCoordinate(tc[24], tc[25]).vertex(-halfLen, -halfLen, -halfLen); // 2   - - -
        builder.texCoordinate(tc[26], tc[27]).vertex(-halfLen, -halfLen, halfLen); // 0   - - +
        builder.texCoordinate(tc[28], tc[29]).vertex(-halfLen, halfLen, halfLen); // 1   - + +
        builder.texCoordinate(tc[30], tc[31]).vertex(-halfLen, halfLen, -halfLen); // 3   - + -
        builder.end(mat);
        // 上面
        builder.begin(builder.webglContext.TRIANGLE_FAN);
        builder.texCoordinate(tc[32], tc[33]).vertex(-halfLen, halfLen, halfLen); // 1   - + +
        builder.texCoordinate(tc[34], tc[35]).vertex(halfLen, halfLen, halfLen); // 5   + + +
        builder.texCoordinate(tc[36], tc[37]).vertex(halfLen, halfLen, -halfLen); // 7   + + -
        builder.texCoordinate(tc[38], tc[39]).vertex(-halfLen, halfLen, -halfLen); // 3   - + -
        builder.end(mat);
        // 下面
        builder.begin(builder.webglContext.TRIANGLE_FAN);
        builder.texCoordinate(tc[40], tc[41]).vertex(-halfLen, -halfLen, halfLen); // 0   - - +
        builder.texCoordinate(tc[42], tc[43]).vertex(-halfLen, -halfLen, -halfLen); // 2   - - -
        builder.texCoordinate(tc[44], tc[45]).vertex(halfLen, -halfLen, -halfLen); // 6   + - -
        builder.texCoordinate(tc[46], tc[47]).vertex(halfLen, -halfLen, halfLen); // 4   + - +
        builder.end(mat);
    }

    /**
     * 绘制完全坐标系
     * @param builder
     * @param mvp
     * @param length
     * @param rotateAxis
     * @param isLeftHardness
     */
    public static drawFullCoordinateSystem(builder: GLMeshBuilder, mvp: Matrix4, length: number = 1, rotateAxis: Vector3 | null = null, inverse: boolean = false,isLeftHardness: boolean = false): void {
        // 用5个像素大小的直径绘制线段，但目前仅Safari浏览器实现
        builder.webglContext.lineWidth(5);
        // 关闭帧缓存深度测试
        builder.webglContext.disable(builder.webglContext.DEPTH_TEST);
        builder.begin(builder.webglContext.LINES);
        // 正x轴
        {
            builder.color(1.0, 0.0, 0.0).vertex(0.0, 0.0, 0.0);
            builder.color(1.0, 0.0, 0.0).vertex(length, 0, 0);
        }
        // 负x轴
        {
            builder.color(1.0, 0.0, 0.0).vertex(0.0, 0.0, 0.0);
            builder.color(1.0, 0.0, 0.0).vertex(-length, 0, 0);
        }
        // 正y轴
        {
            builder.color(0.0, 1.0, 0.0).vertex(0.0, 0.0, 0.0);
            builder.color(0.0, 1.0, 0.0).vertex(0.0, length, 0.0);
        }
        // 负y轴
        {
            builder.color(0.0, 1.0, 0.0).vertex(0.0, 0.0, 0.0);
            builder.color(0.0, 1.0, 0.0).vertex(0.0, -length, 0.0);
        }
        // 正z轴
        {
            builder.color(0.0, 0.0, 1.0).vertex(0.0, 0.0, 0.0);
            builder.color(0.0, 0.0, 1.0).vertex(0.0, 0.0, length);
        }
        // 负z轴
        {
            builder.color(0.0, 0.0, 1.0).vertex(0.0, 0.0, 0.0);
            builder.color(0.0, 0.0, 1.0).vertex(0.0, 0.0, -length);
        }
        if (rotateAxis) {
            // 如果要绘制旋转轴，则绘制出来
            const scale: Vector3 = rotateAxis.scale(length);
            builder.color(0.0, 0.0, 0.0).vertex(0, 0, 0);
            builder.color(0.0, 0.0, 0.0).vertex(scale.x, scale.y, isLeftHardness ? -scale.z : scale.z);
        }
        // 将渲染数据提交给GPU进行渲染
        builder.end(mvp);
        // 恢复线宽为1个像素
        builder.webglContext.lineWidth(1);
        // 恢复开始帧缓存深度测试
        builder.webglContext.enable(builder.webglContext.DEPTH_TEST);
    }

    /**
     * 绘制坐标系。
     * @param builder
     * @param mvp
     * @param hitAxis
     * @param length
     * @param rotateAxis
     * @param isLeftHardness
     */
    public static drawCoordinateSystem(builder: GLMeshBuilder, mvp: Matrix4, hitAxis: EAxisType, length: number = 1, rotateAxis: Vector3 | null = null, inverse: boolean = false, isLeftHardness: boolean = false): void {
        builder.webglContext.lineWidth(5);
        builder.webglContext.disable(builder.webglContext.DEPTH_TEST);
        builder.begin(builder.webglContext.LINES);
        if(hitAxis===EAxisType.X_AXIS){
            builder.color(DrawHelper.defaultHitColor.r, DrawHelper.defaultHitColor.g, DrawHelper.defaultHitColor.b).vertex(0.0, 0.0, 0.0);
            builder.color(DrawHelper.defaultHitColor.r, DrawHelper.defaultHitColor.g, DrawHelper.defaultHitColor.b).vertex(length, 0, 0);
        }else {
            builder.color(1.0, 0.0, 0.0).vertex(0.0, 0.0, 0.0);
            builder.color(1.0, 0.0, 0.0).vertex(length, 0, 0);
        }
        if(hitAxis===EAxisType.Y_AXIS){
            builder.color(DrawHelper.defaultHitColor.r, DrawHelper.defaultHitColor.g, DrawHelper.defaultHitColor.b).vertex(0.0, 0.0, 0.0);
            builder.color(DrawHelper.defaultHitColor.r, DrawHelper.defaultHitColor.g, DrawHelper.defaultHitColor.b).vertex(0, length, 0);
        }else {
            builder.color(0.0, 1.0, 0.0).vertex(0.0, 0.0, 0.0);
            builder.color(0.0, 1.0, 0.0).vertex(0.0, length, 0.0);
        }
        if(hitAxis===EAxisType.Z_AXIS){
            builder.color(DrawHelper.defaultHitColor.r, DrawHelper.defaultHitColor.g, DrawHelper.defaultHitColor.b).vertex(0.0, 0.0, 0.0);
            builder.color(DrawHelper.defaultHitColor.r, DrawHelper.defaultHitColor.g, DrawHelper.defaultHitColor.b).vertex(0, 0, isLeftHardness ? -length : length);
        }else{
            builder.color(0.0, 0.0, 1.0).vertex(0.0, 0.0, 0.0);
            builder.color(0.0, 0.0, 1.0).vertex(0.0, 0.0, isLeftHardness ? -length : length);
        }
        if (rotateAxis) {
            const scale: Vector3 = rotateAxis.scale(length);
            builder.color(0.0, 0.0, 0).vertex(0, 0, 0);
            builder.color(0.0, 0.0, 0.0).vertex(scale.x, scale.y, isLeftHardness ? -scale.z : scale.z);
        }
        builder.end(mvp);
        builder.webglContext.lineWidth(1);
        builder.webglContext.enable(builder.webglContext.DEPTH_TEST);
    }

    /**
     * 绘制坐标轴文字
     * @param {CanvasRenderingContext2D} context
     * @param {Matrix4} mvp
     * @param {Int32Array} viewport
     * @param {number} canvasHeight
     * @param {boolean} inverse
     * @param {boolean} isLeftHardness
     * @private
     */
    public static drawCoordinateSystemText(context: CanvasRenderingContext2D, mvp: Matrix4, viewport: Int32Array, canvasHeight: number, inverse: boolean = false, isLeftHardness: boolean = false): void {
        DrawHelper.drawAxisText(context, Vector3.right, EAxisType.X_AXIS, mvp, viewport, canvasHeight);
        DrawHelper.drawAxisText(context, Vector3.up, EAxisType.Y_AXIS, mvp, viewport, canvasHeight);
        if (!isLeftHardness) {
            DrawHelper.drawAxisText(context, Vector3.forward, EAxisType.Z_AXIS, mvp, viewport, canvasHeight);
        }
        if (!inverse) return;
        DrawHelper.drawAxisText(context, Vector3.right.negate(new Vector3()), EAxisType.X_AXIS, mvp, viewport, canvasHeight, inverse);
        DrawHelper.drawAxisText(context, Vector3.up.negate(new Vector3()), EAxisType.Y_AXIS, mvp, viewport, canvasHeight, inverse);
        if (!isLeftHardness) {
            DrawHelper.drawAxisText(context, Vector3.forward.negate(new Vector3()), EAxisType.Z_AXIS, mvp, viewport, canvasHeight, inverse);
        }
    }

    /**
     * 设置坐标轴颜色。
     * @param {GLMeshBuilder} builder
     * @param {Vector4} color
     * @param {number} len
     * @private
     */
    private static setAxisColor(builder: GLMeshBuilder, color: Vector4, len: number): void {
    }

    /**
     * 绘制坐标轴文字。
     * @param {CanvasRenderingContext2D} context
     * @param {Vector3} direction
     * @param {EAxisType} axis
     * @param {Matrix4} mvp
     * @param {Int32Array} viewport
     * @param {number} canvasHeight
     * @param {boolean} inverse
     * @private
     */
    private static drawAxisText(context: CanvasRenderingContext2D, direction: Vector3, axis: EAxisType, mvp: Matrix4, viewport: Int32Array, canvasHeight: number, inverse: boolean = false): void {
        // 调用 MathHelper.obj2ScreenSpace这个核心函数，将局部坐标系标示的一个点变换到屏幕坐标系上
        let pos: Vector3 | null = MathHelper.obj2GLViewportSpace(direction, mvp, viewport);
        if (!pos) return;
        // 变换到屏幕坐标系，左手系，原点在左上角，x向右，y向下
        pos.y = canvasHeight - pos.y;
        // 渲染状态进栈
        context.save();
        // 使用大一点的Arial字体对象
        context.font = '14px Arial';
        switch (axis) {
            case EAxisType.X_AXIS:
                DrawHelper.drawXAxisText(context, pos, inverse);
                break;
            case EAxisType.Y_AXIS:
                DrawHelper.drawYAxisText(context, pos, inverse);
                break;
            case EAxisType.Z_AXIS:
                DrawHelper.drawZAxisText(context, pos, inverse);
                break;
            case EAxisType.NONE:
            default:
                break;
        }
        // 恢复原来的渲染状态
        context.restore();
    }

    /**
     * 绘制X轴文字。
     * @param {CanvasRenderingContext2D} context
     * @param {Vector3} pos
     * @param {boolean} inverse
     * @private
     */
    private static drawXAxisText(context: CanvasRenderingContext2D, pos: Vector3, inverse: boolean): void {
        // Y轴为top对齐
        context.textBaseline = 'top';
        // 红色
        context.fillStyle = 'red';
        if (inverse) {
            context.textAlign = 'right';
            // 进行文字绘制
            context.fillText('-X', pos.x, pos.y);
        } else {
            // X轴居中对齐
            context.textAlign = 'left';
            // 进行文字绘制
            context.fillText('X', pos.x, pos.y);
        }
    }

    /**
     * 绘制Y轴文字。
     * @param {CanvasRenderingContext2D} context
     * @param {Vector3} pos
     * @param {boolean} inverse
     * @private
     */
    private static drawYAxisText(context: CanvasRenderingContext2D, pos: Vector3, inverse: boolean): void {
        // X轴居中对齐
        context.textAlign = 'center';
        // 绿色
        context.fillStyle = 'green';
        if (inverse) {
            // -Y轴为top对齐
            context.textBaseline = 'top';
            // 行文字绘制
            context.fillText('-Y', pos.x, pos.y);
        } else {
            // Y轴为bottom对齐
            context.textBaseline = 'bottom';
            // 进行文字绘制
            context.fillText('Y', pos.x, pos.y);
        }
    }

    /**
     *绘制Z轴文字。
     * @param {CanvasRenderingContext2D} context
     * @param {Vector3} pos
     * @param {boolean} inverse
     * @private
     */
    private static drawZAxisText(context: CanvasRenderingContext2D, pos: Vector3, inverse: boolean): void {
        // 绿色
        context.fillStyle = 'blue';
        // Y轴为top对齐
        context.textBaseline = 'top';
        if (inverse) {
            // X轴居中对齐
            context.textAlign = 'right';
            // 进行文字绘制
            context.fillText('-Z', pos.x, pos.y);
        } else {
            // X轴居中对齐
            context.textAlign = 'left';
            // 进行文字绘制
            context.fillText('Z', pos.x, pos.y);
        }
    }
}