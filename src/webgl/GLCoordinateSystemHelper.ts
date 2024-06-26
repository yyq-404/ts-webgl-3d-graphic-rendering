import {EAxisType} from "../enum/EAxisType";
import {GLMeshBuilder} from "./mesh/GLMeshBuilder";
import {Matrix4} from "../common/math/matrix/Matrix4";
import {Vector3} from "../common/math/vector/Vector3";
import {Vector4} from "../common/math/vector/Vector4";
import {MathHelper} from "../common/math/MathHelper";


/**
 * 坐标系统工具类
 */
export class GLCoordinateSystemHelper {
    /** 默认颜色 */
    public static defaultHitColor: Vector4 = new Vector4([1, 1, 1, 0]);

    /**
     * 绘制完全坐标系
     * @param builder
     * @param mvp
     * @param length
     * @param rotateAxis
     * @param isLeftHardness
     */
    public static drawFullAxis(builder: GLMeshBuilder, mvp: Matrix4, length: number = 1, rotateAxis: Vector3 | null = null, isLeftHardness: boolean = false): void {
        GLCoordinateSystemHelper.drawAxis(builder, mvp, EAxisType.NONE, length, rotateAxis, true, isLeftHardness)
    }

    /**
     * 绘制轴向。
     * @param builder
     * @param mvp
     * @param hitAxis
     * @param length
     * @param rotateAxis
     * @param inverse
     * @param isLeftHardness
     */
    public static drawAxis(builder: GLMeshBuilder, mvp: Matrix4, hitAxis: EAxisType, length: number = 1, rotateAxis: Vector3 | null = null, inverse: boolean = false, isLeftHardness: boolean = false): void {
        // 用5个像素大小的直径绘制线段，但目前仅Safari浏览器实现
        builder.webglContext.lineWidth(5);
        // 关闭帧缓存深度测试
        builder.webglContext.disable(builder.webglContext.DEPTH_TEST);
        builder.begin(builder.webglContext.LINES);
        // X轴
        let xAxisColor: Vector4 = hitAxis === EAxisType.X_AXIS ? GLCoordinateSystemHelper.defaultHitColor : new Vector4([1.0, 0.0, 0.0, 1.0]);
        this.setAxisColor(builder, xAxisColor, new Vector3([length, 0.0, 0.0]), inverse)
        // Y轴
        let yAxisColor: Vector4 = hitAxis === EAxisType.Y_AXIS ? GLCoordinateSystemHelper.defaultHitColor : new Vector4([0.0, 1.0, 0.0, 1.0]);
        this.setAxisColor(builder, yAxisColor, new Vector3([0.0, length, 0.0]), inverse)
        // Z轴
        let zAxisColor: Vector4 = hitAxis === EAxisType.Z_AXIS ? GLCoordinateSystemHelper.defaultHitColor : new Vector4([0.0, 0.0, 1.0, 1.0]);
        this.setAxisColor(builder, zAxisColor, new Vector3([0.0, 0.0, length]), inverse)
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
     * 绘制坐标轴文字
     * @param {CanvasRenderingContext2D} context
     * @param {Matrix4} mvp
     * @param {Int32Array} viewport
     * @param {number} canvasHeight
     * @param {boolean} inverse
     * @param {boolean} isLeftHardness
     * @private
     */
    public static drawText(context: CanvasRenderingContext2D, mvp: Matrix4, viewport: Int32Array, canvasHeight: number, inverse: boolean = false, isLeftHardness: boolean = false): void {
        GLCoordinateSystemHelper.drawAxisText(context, Vector3.right, EAxisType.X_AXIS, mvp, viewport, canvasHeight);
        GLCoordinateSystemHelper.drawAxisText(context, Vector3.up, EAxisType.Y_AXIS, mvp, viewport, canvasHeight);
        if (!isLeftHardness) {
            GLCoordinateSystemHelper.drawAxisText(context, Vector3.forward, EAxisType.Z_AXIS, mvp, viewport, canvasHeight);
        }
        if (!inverse) return;
        GLCoordinateSystemHelper.drawAxisText(context, Vector3.right.negate(new Vector3()), EAxisType.X_AXIS, mvp, viewport, canvasHeight, inverse);
        GLCoordinateSystemHelper.drawAxisText(context, Vector3.up.negate(new Vector3()), EAxisType.Y_AXIS, mvp, viewport, canvasHeight, inverse);
        if (!isLeftHardness) {
            GLCoordinateSystemHelper.drawAxisText(context, Vector3.forward.negate(new Vector3()), EAxisType.Z_AXIS, mvp, viewport, canvasHeight, inverse);
        }
    }

    /**
     * 设置坐标轴颜色。
     * @param {GLMeshBuilder} builder
     * @param {Vector4} color
     * @param {number} pos
     * @param {boolean} inverse
     * @private
     */
    private static setAxisColor(builder: GLMeshBuilder, color: Vector4, pos: Vector3, inverse: boolean = false): void {
        builder.color(color.r, color.g, color.b).vertex(Vector3.zero.x, Vector3.zero.y, Vector3.zero.z);
        builder.color(color.r, color.g, color.b).vertex(pos.x, pos.y, pos.z)
        if (inverse) {
            builder.color(color.r, color.g, color.b).vertex(Vector3.zero.x, Vector3.zero.y, Vector3.zero.z);
            let negatePos = pos.negate(new Vector3())
            builder.color(color.r, color.g, color.b).vertex(negatePos.x, negatePos.y, negatePos.z)
        }
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
                GLCoordinateSystemHelper.drawXAxisText(context, pos, inverse);
                break;
            case EAxisType.Y_AXIS:
                GLCoordinateSystemHelper.drawYAxisText(context, pos, inverse);
                break;
            case EAxisType.Z_AXIS:
                GLCoordinateSystemHelper.drawZAxisText(context, pos, inverse);
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