import {EAxisType} from '../common/math/MathHelper';
import {GLMeshBuilder} from "../webgl/mesh/GLMeshBuilder";
import {Matrix4} from "../common/math/Matrix4";
import {Vector3} from "../common/math/Vector3";
import {Vector4} from "../common/math/Vector4";
import {Vector4Adapter} from "../common/math/MathAdapter";

export class DrawHelper {
    // FIXME static defaultHitCollor: Vector4 = new Vector4([1, 1, 0]);
    static defaultHitCollor: Vector4 = new Vector4([1, 1, 0, 0]);

    static drawWireFrameCubeBox(
        builder: GLMeshBuilder,
        mat: Matrix4,
        halfLen: number = 0.2,
        color: Vector4 = Vector4Adapter.red,
    ): void {
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
    static drawBoundBox(
        builder: GLMeshBuilder,
        mat: Matrix4,
        mins: Vector3,
        maxs: Vector3,
        color: Vector4 = Vector4Adapter.red,
    ): void {
        // 使用LINE_LOOP绘制底面，注意顶点顺序，逆时针方向，根据右手螺旋定则可知，法线朝外
        builder.begin(builder.gl.LINE_LOOP); // 使用的是LINE_LOOP图元绘制模式
        {
            builder.color(color.r, color.g, color.b).vertex(mins.x, mins.y, mins.z); // 2   - - -
            builder.color(color.r, color.g, color.b).vertex(mins.x, mins.y, maxs.z); // 0   - - +
            builder.color(color.r, color.g, color.b).vertex(maxs.x, mins.y, maxs.z); // 4   + - +
            builder.color(color.r, color.g, color.b).vertex(maxs.x, mins.y, mins.z); // 6   + - -
            builder.end(mat);
        }
        // 使用LINE_LOOP绘制顶面，注意顶点顺序，逆时针方向，根据右手螺旋定则可知，法线朝外
        builder.begin(builder.gl.LINE_LOOP); // 使用的是LINE_LOOP图元绘制模式
        {
            builder.color(color.r, color.g, color.b).vertex(mins.x, maxs.y, mins.z); // 3   - + -
            builder.color(color.r, color.g, color.b).vertex(maxs.x, maxs.y, mins.z); // 7   + + -
            builder.color(color.r, color.g, color.b).vertex(maxs.x, maxs.y, maxs.z); // 5   + + +
            builder.color(color.r, color.g, color.b).vertex(mins.x, maxs.y, maxs.z); // 1   - + +
            builder.end(mat);
        }
        // 使用LINES绘制
        builder.begin(builder.gl.LINES); // 使用的是LINES图元绘制模式
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
    static drawTextureCubeBox(
        builder: GLMeshBuilder,
        mat: Matrix4,
        halfLen: number = 0.2,
        tc: number[] = [
            ...[0, 0, 1, 0, 1, 1, 0, 1], // 前面
            ...[0, 0, 1, 0, 1, 1, 0, 1], // 右面
            ...[0, 0, 1, 0, 1, 1, 0, 1], // 后面
            ...[0, 0, 1, 0, 1, 1, 0, 1], // 左面
            ...[0, 0, 1, 0, 1, 1, 0, 1], // 上面
            ...[0, 0, 1, 0, 1, 1, 0, 1], // 下面
        ],
    ): void {
        // 前面
        builder.begin(builder.gl.TRIANGLE_FAN);
        builder.texcoord(tc[0], tc[1]).vertex(-halfLen, -halfLen, halfLen); // 0   - - +
        builder.texcoord(tc[2], tc[3]).vertex(halfLen, -halfLen, halfLen); // 4   + - +
        builder.texcoord(tc[4], tc[5]).vertex(halfLen, halfLen, halfLen); // 5   + + +
        builder.texcoord(tc[6], tc[7]).vertex(-halfLen, halfLen, halfLen); // 1   - + +
        builder.end(mat);
        // 右面
        builder.begin(builder.gl.TRIANGLE_FAN);
        builder.texcoord(tc[8], tc[9]).vertex(halfLen, -halfLen, halfLen); // 4   + - +
        builder.texcoord(tc[10], tc[11]).vertex(halfLen, -halfLen, -halfLen); // 6   + - -
        builder.texcoord(tc[12], tc[13]).vertex(halfLen, halfLen, -halfLen); // 7   + + -
        builder.texcoord(tc[14], tc[15]).vertex(halfLen, halfLen, halfLen); // 5   + + +
        builder.end(mat);
        // 后面
        builder.begin(builder.gl.TRIANGLE_FAN);
        builder.texcoord(tc[16], tc[17]).vertex(halfLen, -halfLen, -halfLen); // 6   + - -
        builder.texcoord(tc[18], tc[19]).vertex(-halfLen, -halfLen, -halfLen); // 2   - - -
        builder.texcoord(tc[20], tc[21]).vertex(-halfLen, halfLen, -halfLen); // 3   - + -
        builder.texcoord(tc[22], tc[23]).vertex(halfLen, halfLen, -halfLen); // 7   + + -
        builder.end(mat);
        // 左面
        builder.begin(builder.gl.TRIANGLE_FAN);
        builder.texcoord(tc[24], tc[25]).vertex(-halfLen, -halfLen, -halfLen); // 2   - - -
        builder.texcoord(tc[26], tc[27]).vertex(-halfLen, -halfLen, halfLen); // 0   - - +
        builder.texcoord(tc[28], tc[29]).vertex(-halfLen, halfLen, halfLen); // 1   - + +
        builder.texcoord(tc[30], tc[31]).vertex(-halfLen, halfLen, -halfLen); // 3   - + -
        builder.end(mat);
        // 上面
        builder.begin(builder.gl.TRIANGLE_FAN);
        builder.texcoord(tc[32], tc[33]).vertex(-halfLen, halfLen, halfLen); // 1   - + +
        builder.texcoord(tc[34], tc[35]).vertex(halfLen, halfLen, halfLen); // 5   + + +
        builder.texcoord(tc[36], tc[37]).vertex(halfLen, halfLen, -halfLen); // 7   + + -
        builder.texcoord(tc[38], tc[39]).vertex(-halfLen, halfLen, -halfLen); // 3   - + -
        builder.end(mat);
        // 下面
        builder.begin(builder.gl.TRIANGLE_FAN);
        builder.texcoord(tc[40], tc[41]).vertex(-halfLen, -halfLen, halfLen); // 0   - - +
        builder.texcoord(tc[42], tc[43]).vertex(-halfLen, -halfLen, -halfLen); // 2   - - -
        builder.texcoord(tc[44], tc[45]).vertex(halfLen, -halfLen, -halfLen); // 6   + - -
        builder.texcoord(tc[46], tc[47]).vertex(halfLen, -halfLen, halfLen); // 4   + - +
        builder.end(mat);
    }

    static drawFullCoordSystem(
        builder: GLMeshBuilder,
        mat: Matrix4,
        len: number = 1,
        rotateAxis: Vector3 | null = null,
    ): void {
        builder.gl.lineWidth(5); // 用5个像素大小的直径绘制线段，但目前仅Safari浏览器实现
        builder.gl.disable(builder.gl.DEPTH_TEST); // 关闭帧缓存深度测试
        builder.begin(builder.gl.LINES);
        // 正x轴
        {
            builder.color(1.0, 0.0, 0.0).vertex(0.0, 0.0, 0.0);
            builder.color(1.0, 0.0, 0.0).vertex(len, 0, 0);
        }
        // 负x轴
        {
            builder.color(1.0, 0.0, 0.0).vertex(0.0, 0.0, 0.0);
            builder.color(1.0, 0.0, 0.0).vertex(-len, 0, 0);
        }
        // 正y轴
        {
            builder.color(0.0, 1.0, 0.0).vertex(0.0, 0.0, 0.0);
            builder.color(0.0, 1.0, 0.0).vertex(0.0, len, 0.0);
        }
        // 负y轴
        {
            builder.color(0.0, 1.0, 0.0).vertex(0.0, 0.0, 0.0);
            builder.color(0.0, 1.0, 0.0).vertex(0.0, -len, 0.0);
        }
        // 正z轴
        {
            builder.color(0.0, 0.0, 1.0).vertex(0.0, 0.0, 0.0);
            builder.color(0.0, 0.0, 1.0).vertex(0.0, 0.0, len);
        }
        // 负z轴
        {
            builder.color(0.0, 0.0, 1.0).vertex(0.0, 0.0, 0.0);
            builder.color(0.0, 0.0, 1.0).vertex(0.0, 0.0, -len);
        }
        if (rotateAxis !== null) {
            // 如果要绘制旋转轴，则绘制出来
            const scale: Vector3 = rotateAxis.scale(len);
            builder.color(0.0, 0.0, 0.0).vertex(0, 0, 0);
            builder.color(0.0, 0.0, 0.0).vertex(scale.x, scale.y, scale.z);
        }
        builder.end(mat); // 将渲染数据提交给GPU进行渲染
        builder.gl.lineWidth(1); // 恢复线宽为1个像素
        builder.gl.enable(builder.gl.DEPTH_TEST); // 恢复开始帧缓存深度测试
    }

    /** 绘制坐标系 */
    static drawCoordSystem(
        builder: GLMeshBuilder,
        mat: Matrix4,
        hitAxis: EAxisType,
        len: number = 5,
        rotateAxis: Vector3 | null = null,
        isLeftHandness: boolean = false,
    ): void {
        builder.gl.lineWidth(5);
        builder.gl.disable(builder.gl.DEPTH_TEST);
        builder.begin(builder.gl.LINES);
        if (hitAxis === EAxisType.X_AXIS) {
            builder
                .color(
                    DrawHelper.defaultHitCollor.r,
                    DrawHelper.defaultHitCollor.g,
                    DrawHelper.defaultHitCollor.b,
                )
                .vertex(0.0, 0.0, 0.0);
            builder
                .color(
                    DrawHelper.defaultHitCollor.r,
                    DrawHelper.defaultHitCollor.g,
                    DrawHelper.defaultHitCollor.b,
                )
                .vertex(len, 0, 0);
        } else {
            builder.color(1.0, 0.0, 0.0).vertex(0.0, 0.0, 0.0);
            builder.color(1.0, 0.0, 0.0).vertex(len, 0, 0);
        }

        if (hitAxis === EAxisType.Y_AXIS) {
            builder
                .color(
                    DrawHelper.defaultHitCollor.r,
                    DrawHelper.defaultHitCollor.g,
                    DrawHelper.defaultHitCollor.b,
                )
                .vertex(0.0, 0.0, 0.0);
            builder
                .color(
                    DrawHelper.defaultHitCollor.r,
                    DrawHelper.defaultHitCollor.g,
                    DrawHelper.defaultHitCollor.b,
                )
                .vertex(0, len, 0);
        } else {
            builder.color(0.0, 1.0, 0.0).vertex(0.0, 0.0, 0.0);
            builder.color(0.0, 1.0, 0.0).vertex(0.0, len, 0.0);
        }

        if (hitAxis === EAxisType.Z_AXIS) {
            builder
                .color(
                    DrawHelper.defaultHitCollor.r,
                    DrawHelper.defaultHitCollor.g,
                    DrawHelper.defaultHitCollor.b,
                )
                .vertex(0.0, 0.0, 0.0);
            if (isLeftHandness) {
                builder
                    .color(
                        DrawHelper.defaultHitCollor.r,
                        DrawHelper.defaultHitCollor.g,
                        DrawHelper.defaultHitCollor.b,
                    )
                    .vertex(0, 0, -len);
            } else {
                builder
                    .color(
                        DrawHelper.defaultHitCollor.r,
                        DrawHelper.defaultHitCollor.g,
                        DrawHelper.defaultHitCollor.b,
                    )
                    .vertex(0, 0, len);
            }
        } else {
            builder.color(0.0, 0.0, 1.0).vertex(0.0, 0.0, 0.0);
            if (isLeftHandness) {
                builder.color(0.0, 0.0, 1.0).vertex(0.0, 0.0, -len);
            } else {
                builder.color(0.0, 0.0, 1.0).vertex(0.0, 0.0, len);
            }
        }

        if (rotateAxis !== null) {
            const scale: Vector3 = rotateAxis.scale(len);
            builder.color(0.0, 0.0, 0).vertex(0, 0, 0);
            if (isLeftHandness) {
                builder.color(0.0, 0.0, 0.0).vertex(scale.x, scale.y, -scale.z);
            } else {
                builder.color(0.0, 0.0, 0.0).vertex(scale.x, scale.y, scale.z);
            }
        }

        builder.end(mat);
        builder.gl.lineWidth(1);
        builder.gl.enable(builder.gl.DEPTH_TEST);
    }
}