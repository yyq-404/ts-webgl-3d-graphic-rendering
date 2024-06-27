import {EAxisType} from '../enum/EAxisType';
import {GLMeshBuilder} from './mesh/GLMeshBuilder';
import {Matrix4} from '../common/math/matrix/Matrix4';
import {Vector3} from '../common/math/vector/Vector3';
import {Vector4} from '../common/math/vector/Vector4';
import {Vector2} from '../common/math/vector/Vector2';
import {MathHelper} from '../common/math/MathHelper';


/**
 * 坐标系统工具类
 */
export class GLCoordinateSystemHelper {
    /** 默认颜色 */
    public static defaultHitColor: Vector4 = new Vector4([1, 1, 1, 0]);
    
    /**
     * 三维向量从ID坐标转换为GL坐标
     * @param v
     * @param scale
     */
    public static convertVector3IDCoordinate2GLCoordinate(v: Vector3, scale: number = 10.0): void {
        // opengl right = doom3 x
        const f: number = v.y;
        //opengl up = doom3 z
        v.y = v.z;
        //opengl forward = doom3 -y
        v.z = -f;
        if (!MathHelper.numberEquals(scale, 0) && !MathHelper.numberEquals(scale, 1.0)) {
            v.x /= scale;
            v.y /= scale;
            v.z /= scale;
        }
    }
    
    /**
     * 二维向量从ID坐标转换为GL坐标
     * @param v
     */
    public static convertVector2IDCoordinate2GLCoordinate(v: Vector2): void {
        v.x = 1.0 - v.x;
        v.y = 1.0 - v.y;
    }
    
    /**
     * 本地坐标系转换到视图坐标系
     * @param localPt
     * @param mvp
     * @param viewport
     * @param viewportPt
     */
    public static local2GLViewportSpace(localPt: Vector3, mvp: Matrix4, viewport: Int32Array | Float32Array, viewportPt?: Vector3): Vector3 | null {
        const v: Vector4 = new Vector4([localPt.x, localPt.y, localPt.z, 1.0]);
        // 将顶点从local坐标系变换到投影坐标系，或裁剪坐标系
        mvp.multiplyVector4(v, v);
        if (v.w === 0.0) {
            // 如果变换后的w为0，则返回false
            return null;
        }
        if (!viewportPt) viewportPt = new Vector3();
        // 将裁剪坐标系的点的x / y / z分量除以w，得到normalized坐标值[ -1 , 1 ]之间
        v.x /= v.w;
        v.y /= v.w;
        v.z /= v.w;
        // [-1 , 1]标示的点变换到视口坐标系
        v.x = v.x * 0.5 + 0.5;
        v.y = v.y * 0.5 + 0.5;
        v.z = v.z * 0.5 + 0.5;
        // 视口坐标系再变换到屏幕坐标系
        viewportPt.x = v.x * viewport[2] + viewport[0];
        viewportPt.y = v.y * viewport[3] + viewport[1];
        viewportPt.z = v.z;
        return viewportPt;
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
        this.setAxisColor(builder, xAxisColor, new Vector3([length, 0.0, 0.0]), inverse);
        // Y轴
        let yAxisColor: Vector4 = hitAxis === EAxisType.Y_AXIS ? GLCoordinateSystemHelper.defaultHitColor : new Vector4([0.0, 1.0, 0.0, 1.0]);
        this.setAxisColor(builder, yAxisColor, new Vector3([0.0, length, 0.0]), inverse);
        // Z轴
        let zAxisColor: Vector4 = hitAxis === EAxisType.Z_AXIS ? GLCoordinateSystemHelper.defaultHitColor : new Vector4([0.0, 0.0, 1.0, 1.0]);
        this.setAxisColor(builder, zAxisColor, new Vector3([0.0, 0.0, length]), inverse);
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
        GLCoordinateSystemHelper.drawAxisText(context, isLeftHardness ? Vector3.forward.negate(new Vector3()) : Vector3.forward, EAxisType.Z_AXIS, mvp, viewport, canvasHeight);
        if (!inverse) return;
        GLCoordinateSystemHelper.drawAxisText(context, Vector3.right.negate(new Vector3()), EAxisType.X_AXIS, mvp, viewport, canvasHeight, true);
        GLCoordinateSystemHelper.drawAxisText(context, Vector3.up.negate(new Vector3()), EAxisType.Y_AXIS, mvp, viewport, canvasHeight, true);
        GLCoordinateSystemHelper.drawAxisText(context, isLeftHardness ? Vector3.forward : Vector3.forward.negate(new Vector3()), EAxisType.Z_AXIS, mvp, viewport, canvasHeight, true);
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
        builder.color(color.r, color.g, color.b).vertex(pos.x, pos.y, pos.z);
        if (!inverse) return;
        builder.color(color.r, color.g, color.b).vertex(Vector3.zero.x, Vector3.zero.y, Vector3.zero.z);
        let negatePos = pos.negate(new Vector3());
        builder.color(color.r, color.g, color.b).vertex(negatePos.x, negatePos.y, negatePos.z);
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
        let pos: Vector3 | null = GLCoordinateSystemHelper.local2GLViewportSpace(direction, mvp, viewport);
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
        context.textBaseline = 'top';
        context.fillStyle = 'red';
        context.textAlign = inverse ? 'right' : 'left';
        context.fillText(inverse ? '-X' : 'X', pos.x, pos.y);
    }
    
    /**
     * 绘制Y轴文字。
     * @param {CanvasRenderingContext2D} context
     * @param {Vector3} pos
     * @param {boolean} inverse
     * @private
     */
    private static drawYAxisText(context: CanvasRenderingContext2D, pos: Vector3, inverse: boolean): void {
        context.textAlign = 'center';
        context.fillStyle = 'green';
        context.textBaseline = inverse ? 'top' : 'bottom';
        context.fillText(inverse ? '-Y' : 'Y', pos.x, pos.y);
    }
    
    /**
     *绘制Z轴文字。
     * @param {CanvasRenderingContext2D} context
     * @param {Vector3} pos
     * @param {boolean} inverse
     * @private
     */
    private static drawZAxisText(context: CanvasRenderingContext2D, pos: Vector3, inverse: boolean): void {
        context.textBaseline = 'top';
        context.fillStyle = 'blue';
        context.textAlign = inverse ? 'right' : 'left';
        context.fillText(inverse ? '-Z' : 'Z', pos.x, pos.y);
    }
}