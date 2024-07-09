import {GLMeshBuilder} from '../webgl/mesh/GLMeshBuilder';
import {Matrix4} from './math/matrix/Matrix4';
import {Vector3} from './math/vector/Vector3';
import {Vector4} from './math/vector/Vector4';
import {Cube} from './geometry/solid/Cube';

/**
 *绘制助手
 */
export class DrawHelper {
    /**  默认盒子纹理坐标 */
    private static readonly _defaultTextureCoordinates: number[] = [
        ...[0, 0, 1, 0, 1, 1, 0, 1], // 前面
        ...[0, 0, 1, 0, 1, 1, 0, 1], // 右面
        ...[0, 0, 1, 0, 1, 1, 0, 1], // 后面
        ...[0, 0, 1, 0, 1, 1, 0, 1], // 左面
        ...[0, 0, 1, 0, 1, 1, 0, 1], // 上面
        ...[0, 0, 1, 0, 1, 1, 0, 1]  // 下面
    ];
    
    /**
     * 绘制立方体
     * @param builder
     * @param mvp
     * @param halfLen
     * @param color
     */
    public static drawWireFrameCubeBox(builder: GLMeshBuilder, mvp: Matrix4, halfLen: number = 0.2, color: Vector4 = Vector4.red): void {
        const min: Vector3 = new Vector3([-halfLen, -halfLen, -halfLen]);
        const max: Vector3 = new Vector3([halfLen, halfLen, halfLen]);
        DrawHelper.drawBoundBox(builder, mvp, min, max, color);
    }
    
    /**
     * 根据 `min` 点（下图中的顶点2，左下后）和 `max`（下图中的顶点5，右上前）点的坐标，
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
    public static drawBoundBox(builder: GLMeshBuilder, mvp: Matrix4, min: Vector3, max: Vector3, color: Vector4 = Vector4.red): void {
        let vertexes = [
            new Vector3([min.x, min.y, max.z]), // 0  - - +
            new Vector3([min.x, max.y, max.z]), // 1  - + +
            new Vector3([min.x, min.y, min.z]), // 2  - - -
            new Vector3([min.x, max.y, min.z]), // 3  - + -
            new Vector3([max.x, min.y, max.z]), // 4  + - +
            new Vector3([max.x, max.y, max.z]), // 5  + + +
            new Vector3([max.x, min.y, min.z]), // 6  + - -
            new Vector3([max.x, max.y, min.z])  // 7  + + -
        ];
        // 使用LINE_LOOP绘制底面，注意顶点顺序，逆时针方向，根据右手螺旋定则可知，法线朝外
        // 使用的是LINE_LOOP图元绘制模式
        builder.begin(builder.webglContext.LINE_LOOP);
        [vertexes[2], vertexes[0], vertexes[4], vertexes[6]].forEach((vertex: Vector3) => builder.color(color.r, color.g, color.b).vertex(vertex.x, vertex.y, vertex.z));
        builder.end(mvp);
        // 使用LINE_LOOP绘制顶面，注意顶点顺序，逆时针方向，根据右手螺旋定则可知，法线朝外
        // 使用的是LINE_LOOP图元绘制模式
        builder.begin(builder.webglContext.LINE_LOOP);
        [vertexes[3], vertexes[7], vertexes[5], vertexes[1]].forEach((vertex: Vector3) => builder.color(color.r, color.g, color.b).vertex(vertex.x, vertex.y, vertex.z));
        builder.end(mvp);
        // 使用LINES绘制
        // 使用的是LINES图元绘制模式
        builder.begin(builder.webglContext.LINES);
        [vertexes[2], vertexes[3], vertexes[0], vertexes[1], vertexes[4], vertexes[5], vertexes[6], vertexes[7]].forEach((vertex: Vector3) => builder.color(color.r, color.g, color.b).vertex(vertex.x, vertex.y, vertex.z));
        builder.end(mvp);
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
     * @param mvp
     * @param halfLen
     * @param textureCoordinate 纹理坐标数组，该数组保存48个number类型，共6组纹理坐标，
     * 每组8个纹理坐标值，可以映射到立方体的某个面上，其顺序是前、右、后、左、上、下。
     */
    public static drawTextureCubeBox(builder: GLMeshBuilder, mvp: Matrix4, halfLen: number = 0.2, textureCoordinate: number[] = DrawHelper._defaultTextureCoordinates): void {
        let cube = new Cube(halfLen, halfLen,halfLen);
        for (let i = 0; i < cube.surfaces.length; i++) {
            let positions: Vector3[] = cube.surfaces[i];
            builder.begin(builder.webglContext.TRIANGLE_FAN);
            for (let j = 0; j < positions.length; j++) {
                let vertex = positions[j];
                let uIndex = j * 2 + i * 8;
                let vIndex = uIndex + 1;
                builder.texCoordinate(textureCoordinate[uIndex], textureCoordinate[vIndex]).vertex(vertex.x, vertex.y, vertex.z);
            }
            builder.end(mvp);
        }
    }
}