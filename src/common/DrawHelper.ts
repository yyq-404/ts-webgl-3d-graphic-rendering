import {GLMeshBuilder} from '../webgl/mesh/GLMeshBuilder';
import {Matrix4} from './math/matrix/Matrix4';
import {Vector3} from './math/vector/Vector3';
import {Vector4} from './math/vector/Vector4';
import {Vector4Adapter} from './math/MathAdapter';

/**
 *绘制助手
 */
export class DrawHelper {

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
        // 使用的是LINE_LOOP图元绘制模式
        builder.begin(builder.webglContext.LINE_LOOP);
        {
            builder.color(color.r, color.g, color.b).vertex(mins.x, mins.y, mins.z); // 2   - - -
            builder.color(color.r, color.g, color.b).vertex(mins.x, mins.y, maxs.z); // 0   - - +
            builder.color(color.r, color.g, color.b).vertex(maxs.x, mins.y, maxs.z); // 4   + - +
            builder.color(color.r, color.g, color.b).vertex(maxs.x, mins.y, mins.z); // 6   + - -
        }
        builder.end(mat);
        // 使用LINE_LOOP绘制顶面，注意顶点顺序，逆时针方向，根据右手螺旋定则可知，法线朝外
        // 使用的是LINE_LOOP图元绘制模式
        builder.begin(builder.webglContext.LINE_LOOP);
        {
            builder.color(color.r, color.g, color.b).vertex(mins.x, maxs.y, mins.z); // 3   - + -
            builder.color(color.r, color.g, color.b).vertex(maxs.x, maxs.y, mins.z); // 7   + + -
            builder.color(color.r, color.g, color.b).vertex(maxs.x, maxs.y, maxs.z); // 5   + + +
            builder.color(color.r, color.g, color.b).vertex(mins.x, maxs.y, maxs.z); // 1   - + +
        }
        builder.end(mat);
        // 使用LINES绘制
        // 使用的是LINES图元绘制模式
        builder.begin(builder.webglContext.LINES);
        {
            builder.color(color.r, color.g, color.b).vertex(mins.x, mins.y, mins.z); // 2   - - -
            builder.color(color.r, color.g, color.b).vertex(mins.x, maxs.y, mins.z); // 3   - + -
            builder.color(color.r, color.g, color.b).vertex(mins.x, mins.y, maxs.z); // 0   - - +
            builder.color(color.r, color.g, color.b).vertex(mins.x, maxs.y, maxs.z); // 1   - + +
            builder.color(color.r, color.g, color.b).vertex(maxs.x, mins.y, maxs.z); // 4   + - +
            builder.color(color.r, color.g, color.b).vertex(maxs.x, maxs.y, maxs.z); // 5   + + +
            builder.color(color.r, color.g, color.b).vertex(maxs.x, mins.y, mins.z); // 6   + - -
            builder.color(color.r, color.g, color.b).vertex(maxs.x, maxs.y, mins.z); // 7   + + -
        }
        builder.end(mat);
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
     * @param textureCoordinate 纹理坐标数组，该数组保存48个number类型，共6组纹理坐标，
     * 每组8个纹理坐标值，可以映射到立方体的某个面上，其顺序是前、右、后、左、上、下。
     */
    public static drawTextureCubeBox(builder: GLMeshBuilder, mat: Matrix4, halfLen: number = 0.2, textureCoordinate: number[] = [
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
        builder.texCoordinate(textureCoordinate[0], textureCoordinate[1]).vertex(-halfLen, -halfLen, halfLen); // 0   - - +
        builder.texCoordinate(textureCoordinate[2], textureCoordinate[3]).vertex(halfLen, -halfLen, halfLen); // 4   + - +
        builder.texCoordinate(textureCoordinate[4], textureCoordinate[5]).vertex(halfLen, halfLen, halfLen); // 5   + + +
        builder.texCoordinate(textureCoordinate[6], textureCoordinate[7]).vertex(-halfLen, halfLen, halfLen); // 1   - + +
        builder.end(mat);
        // 右面
        builder.begin(builder.webglContext.TRIANGLE_FAN);
        builder.texCoordinate(textureCoordinate[8], textureCoordinate[9]).vertex(halfLen, -halfLen, halfLen); // 4   + - +
        builder.texCoordinate(textureCoordinate[10], textureCoordinate[11]).vertex(halfLen, -halfLen, -halfLen); // 6   + - -
        builder.texCoordinate(textureCoordinate[12], textureCoordinate[13]).vertex(halfLen, halfLen, -halfLen); // 7   + + -
        builder.texCoordinate(textureCoordinate[14], textureCoordinate[15]).vertex(halfLen, halfLen, halfLen); // 5   + + +
        builder.end(mat);
        // 后面
        builder.begin(builder.webglContext.TRIANGLE_FAN);
        builder.texCoordinate(textureCoordinate[16], textureCoordinate[17]).vertex(halfLen, -halfLen, -halfLen); // 6   + - -
        builder.texCoordinate(textureCoordinate[18], textureCoordinate[19]).vertex(-halfLen, -halfLen, -halfLen); // 2   - - -
        builder.texCoordinate(textureCoordinate[20], textureCoordinate[21]).vertex(-halfLen, halfLen, -halfLen); // 3   - + -
        builder.texCoordinate(textureCoordinate[22], textureCoordinate[23]).vertex(halfLen, halfLen, -halfLen); // 7   + + -
        builder.end(mat);
        // 左面
        builder.begin(builder.webglContext.TRIANGLE_FAN);
        builder.texCoordinate(textureCoordinate[24], textureCoordinate[25]).vertex(-halfLen, -halfLen, -halfLen); // 2   - - -
        builder.texCoordinate(textureCoordinate[26], textureCoordinate[27]).vertex(-halfLen, -halfLen, halfLen); // 0   - - +
        builder.texCoordinate(textureCoordinate[28], textureCoordinate[29]).vertex(-halfLen, halfLen, halfLen); // 1   - + +
        builder.texCoordinate(textureCoordinate[30], textureCoordinate[31]).vertex(-halfLen, halfLen, -halfLen); // 3   - + -
        builder.end(mat);
        // 上面
        builder.begin(builder.webglContext.TRIANGLE_FAN);
        builder.texCoordinate(textureCoordinate[32], textureCoordinate[33]).vertex(-halfLen, halfLen, halfLen); // 1   - + +
        builder.texCoordinate(textureCoordinate[34], textureCoordinate[35]).vertex(halfLen, halfLen, halfLen); // 5   + + +
        builder.texCoordinate(textureCoordinate[36], textureCoordinate[37]).vertex(halfLen, halfLen, -halfLen); // 7   + + -
        builder.texCoordinate(textureCoordinate[38], textureCoordinate[39]).vertex(-halfLen, halfLen, -halfLen); // 3   - + -
        builder.end(mat);
        // 下面
        builder.begin(builder.webglContext.TRIANGLE_FAN);
        builder.texCoordinate(textureCoordinate[40], textureCoordinate[41]).vertex(-halfLen, -halfLen, halfLen); // 0   - - +
        builder.texCoordinate(textureCoordinate[42], textureCoordinate[43]).vertex(-halfLen, -halfLen, -halfLen); // 2   - - -
        builder.texCoordinate(textureCoordinate[44], textureCoordinate[45]).vertex(halfLen, -halfLen, -halfLen); // 6   + - -
        builder.texCoordinate(textureCoordinate[46], textureCoordinate[47]).vertex(halfLen, -halfLen, halfLen); // 4   + - +
        builder.end(mat);
    }
}