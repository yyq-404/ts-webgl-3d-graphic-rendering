/**
 * GL常量定义。
 */
export class CLConstants {
    /** 模型视图矩阵 */
    public static readonly MVMatrix: string = 'uMVMatrix';
    /** 模型矩阵 */
    public static readonly ModelMatrix: string = 'uModelMatrix';
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
}