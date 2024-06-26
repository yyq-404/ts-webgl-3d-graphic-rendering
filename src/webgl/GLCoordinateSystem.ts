import {Vector3} from "../common/math/vector/Vector3";

/**
 *  `GLCoordinateSystem` 类用来描述和显示WebGL的坐标系结构，支持多视口的绘制
 */
export class GLCoordinateSystem {
    /** 当前坐标系被绘制在哪个视口中 */
    public viewport: number[] = [];
    /** 当前坐标系的位置，如果是多视口渲染的话，就为 `[0,0,0]` */
    public position: Vector3 = Vector3.zero;
    /** 当前坐标系绕哪个轴旋转 */
    public axis: Vector3 = Vector3.up;
    /** 当前坐标系的旋转角度（不是弧度） */
    public angle: number = 0;
    /** 是否绘制旋转轴 */
    public isDrawAxis: boolean = false;
    /** 是否绘制为 `Direct3D` 左手系 */
    public isLeftHardness: boolean = false;

    /**
     * 构造
     * @param viewport
     * @param position
     * @param axis
     * @param angle
     * @param isDrawAxis
     * @param isLeftHardness
     */
    public constructor(viewport: number[], position: Vector3 = Vector3.zero, axis: Vector3 = Vector3.up, angle: number = 0, isDrawAxis: boolean = false, isLeftHardness: boolean = false) {
        this.viewport = viewport;
        this.position = position;
        this.axis = axis;
        this.angle = angle;
        this.isDrawAxis = isDrawAxis;
        this.isLeftHardness = isLeftHardness;
    }

    /**
     * 构建视图坐标系统。
     * @param width
     * @param height
     * @param row
     * @param colum
     */
    public static makeViewportCoordinateSystems(width: number, height: number, row: number = 2, colum: number = 2): GLCoordinateSystem[] {
        const coords: GLCoordinateSystem[] = [];
        // 一行有多少个
        const w: number = width / colum;
        // 一列有多少个
        const h: number = height / row;
        // 循环生成GLCoordinateSystem对象，每个GLCoordinateSystem内置了表示viewport的数组
        for (let i: number = 0; i < colum; i++) {
            for (let j: number = 0; j < row; j++) {
                // viewport是[ x , y , width , height ]格式
                coords.push(new GLCoordinateSystem([i * w, j * h, w, h]));
            }
        }
        // 将生成的GLCoordinateSystem数组返回
        return coords;
    }
}