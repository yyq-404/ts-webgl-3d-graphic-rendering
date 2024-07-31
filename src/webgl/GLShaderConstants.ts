/**
 * GL着色器常量定义。
 */
export class GLShaderConstants {
    /** 模型视图矩阵 */
    public static readonly MVMatrix: string = 'uMVMatrix';
    /** 模型矩阵 */
    public static readonly MMatrix: string = 'uMMatrix';
    /** 视矩阵 */
    public static readonly ViewMatrix: string = 'uViewMatrix';
    /** 投影矩阵 */
    public static readonly ProjectMatrix: string = 'uProjectMatrix';
    /** 法线矩阵 */
    public static readonly NormalMatrix: string = 'uNormalMatrix';
    /** 模型_视图_投影矩阵 */
    public static readonly MVPMatrix: string = 'uMVPMatrix';
    /**  颜色值 */
    public static readonly Color: string = 'uColor';
    /** 纹理取样器 */
    public static readonly Sampler: string = 'uSampler';
    /** 漫反射取样器 */
    public static readonly DiffuseSampler: string = 'uDiffuseSampler';
    /** 法线取样器 */
    public static readonly NormalSampler: string = 'uNormalSampler';
    /** 高光取样器 */
    public static readonly SpecularSampler: string = 'uSpecularSampler';
    /** 深度取样器 */
    public static readonly DepthSampler: string = 'uDepthSampler';
    /** 光源位置 */
    public static readonly LightLocation: string = 'uLightLocation';
    /** 光源方向 */
    public static readonly LightDirection: string = 'uLightDirection';
    /** 相机位置 */
    public static readonly Camera: string = 'uCamera';
    /** 环境光 */
    public static readonly Ambient: string = 'uAmbient';
    /** 散射光 */
    public static readonly Diffuse: string = 'uDiffuse';
    /** 镜面光 */
    public static readonly Specular: string = 'uSpecular';
}