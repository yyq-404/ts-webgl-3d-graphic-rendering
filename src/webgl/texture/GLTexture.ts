import {GLRenderHelper} from '../GLRenderHelper';
import {EGLTextureWrapType} from '../enum/EGLTextureWrapType';
import {MathHelper} from '../../common/math/MathHelper';

/**
 * CSS标准颜色定义
 */
const CSSColors = <const>[
    /** 浅绿色 */
    'aqua',
    /** 黑色 */
    'black',
    /** 蓝色 */
    'blue',
    /** 紫红色 */
    'fuchsia',
    /** 灰色 */
    'gray',
    /** 绿色 */
    'green',
    /** 绿黄色 */
    'lime',
    /** 褐红色 */
    'maroon',
    /** 海军蓝 */
    'navy',
    /** 橄榄绿 */
    'olive',
    /** 橙色 */
    'orange',
    /** 紫色 */
    'purple',
    /** 红色 */
    'red',
    /** 银灰色 */
    'silver',
    /** 蓝绿色 */
    'teal',
    /** 黄色 */
    'yellow',
    /** 白色 */
    'white'
];

/**
 * CSS颜色类型
 */
type CSSColor = typeof CSSColors[number];

/**
 * `GLTexture` 类可以在 `GLStaticMesh` 或 `GLMeshBuilder` 生成的网格对象上进行纹理贴图操作。
 */
export class GLTexture {
    /** css标准色字符串 */
    private static readonly Colors: ReadonlyArray<CSSColor> = CSSColors;
    /** 渲染环境 */
    public gl: WebGLRenderingContext | WebGL2RenderingContext;
    /** 是否使用mipmap多级渐进纹理生成纹理对象 */
    public isMipmap: boolean;
    /** 当前纹理对象的像素宽度 */
    public width: number;
    /** 当前纹理对象的像素高度 */
    public height: number;
    /** 在内存或显存中像素的存储格式，默认为gl.RGBA */
    public format: number;
    /** 像素分量的数据类型，默认为 `gl.UNSIGNED_BYTE` */
    public type: number;
    /** WebGLTexture对象 */
    public texture: WebGLTexture;
    /** 为 `gl.TEXTURE_2D`（另外一个可以是TEXTURE_CUBE_MAP，本书不使用TEXTURE_CUBE_MAP相关内容） */
    public target: number;
    /** 纹理参数 */
    private texParameters: Map<EGLTextureWrapType, GLint>;
    
    /**
     * 构造
     * @param gl WebGLRenderingContext
     * @param name 纹理的名称
     */
    public constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, public name: string = '') {
        this.gl = gl;
        const glTexture: WebGLTexture = gl.createTexture();
        if (!glTexture) throw new Error('WebGLTexture创建不成功!');
        this.texture = glTexture;
        this.isMipmap = false;
        this.width = this.height = 0;
        this.format = gl.RGBA;
        this.type = gl.UNSIGNED_BYTE;
        this.target = gl.TEXTURE_2D;
        this.name = name;
        this.texParameters = new Map<EGLTextureWrapType, GLint>([
            [EGLTextureWrapType.GL_REPEAT, this.gl.REPEAT],
            [EGLTextureWrapType.GL_MIRRORED_REPEAT, this.gl.MIRRORED_REPEAT],
            [EGLTextureWrapType.GL_CLAMP_TO_EDGE, this.gl.CLAMP_TO_EDGE]
        ]);
        this.filter();
        this.wrap();
    }
    
    /**
     * 将非2的n次方的`srcImage`转换成`2`的`n`次方的`CanvasRenderingContext2D`对象，
     * 然后后续用来生成`mipmap`纹理
     * @param srcImage
     */
    public static createPowerOfTwoCanvas(srcImage: HTMLImageElement | HTMLCanvasElement): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = MathHelper.getNextPowerOfTwo(srcImage.width);
        canvas.height = MathHelper.getNextPowerOfTwo(srcImage.height as number);
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
        if (ctx === null) {
            throw new Error('未能成功创建CanvasRenderingContext2D对象');
        }
        ctx.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height, 0, 0, canvas.width, canvas.height);
        return canvas;
    }
    
    /**
     * 创建默认的2的n次方的纹理对象
     * @param gl
     */
    public static createDefaultTexture(gl: WebGLRenderingContext | WebGL2RenderingContext): GLTexture {
        const step: number = 4;
        const canvas: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
        canvas.width = 32 * step;
        canvas.height = 32 * step;
        const context: CanvasRenderingContext2D = canvas.getContext('2d');
        if (context === null) {
            alert('离屏Canvas获取渲染上下文失败!');
            throw new Error('离屏Canvas获取渲染上下文失败!');
        }
        for (let i: number = 0; i < step; i++) {
            for (let j: number = 0; j < step; j++) {
                const idx: number = step * i + j;
                context.save();
                context.fillStyle = GLTexture.Colors[idx];
                context.fillRect(i * 32, j * 32, 32, 32);
                context.restore();
            }
        }
        const texture: GLTexture = new GLTexture(gl);
        texture.upload(canvas);
        return texture;
    }
    
    /**
     * 载入相关图像数据
     * @param source
     * @param unit
     * @param mipmap
     */
    public upload(source: HTMLImageElement | HTMLCanvasElement, unit: number = 0, mipmap: boolean = false): void {
        // 先绑定当前要操作的WebGLTexture对象，默认为0
        this.bind(unit);
        // 否则贴图会倒过来
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
        if (mipmap) {
            // 使用mipmap生成纹理
            const isWidthPowerOfTwo: boolean = MathHelper.isPowerOfTwo(source.width);
            const isHeightPowerOfTwo: boolean = MathHelper.isPowerOfTwo(source.height);
            // 获取一个长宽都为2的n次方的画布对象
            const canvas = (isWidthPowerOfTwo && isHeightPowerOfTwo) ? source : GLTexture.createPowerOfTwoCanvas(source);
            this.width = canvas.width;
            this.height = canvas.height;
            this.gl.texImage2D(this.target, 0, this.format, this.format, this.type, canvas);
            GLRenderHelper.checkGLError(this.gl);
            this.gl.generateMipmap(this.target);
            GLRenderHelper.checkGLError(this.gl);
            this.isMipmap = true;
        } else {
            this.width = source.width;
            this.height = source.height;
            this.isMipmap = false;
            this.gl.texImage2D(this.target, 0, this.format, this.format, this.type, source);
        }
        console.log('当前纹理尺寸为： ', this.width, this.height);
        // 解绑当前要操作的WebGLTexture对象
        this.unbind();
    }
    
    /**
     * 绑定纹理
     * @param unit
     */
    public bind(unit: number = 0): void {
        if (this.texture) {
            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
            this.gl.bindTexture(this.target, this.texture);
        }
    }
    
    /**
     * 解绑纹理
     */
    public unbind(): void {
        if (this.texture) {
            this.gl.bindTexture(this.target, null);
        }
    }
    
    /**
     * 调用`WebGLRenderingContext.texParameteri()`方法设置纹理参数
     * @param minLinear
     * @param magLinear
     */
    public filter(minLinear: boolean = true, magLinear: boolean = true): void {
        // 在设置filter时先要绑定当前的纹理目标
        this.gl.bindTexture(this.target, this.texture);
        if (this.isMipmap) {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, minLinear ? this.gl.LINEAR_MIPMAP_LINEAR : this.gl.NEAREST_MIPMAP_NEAREST);
        } else {
            this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, minLinear ? this.gl.LINEAR : this.gl.NEAREST);
        }
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, magLinear ? this.gl.LINEAR : this.gl.NEAREST);
    }
    
    /**
     * 纹理包裹
     * @param {EGLTextureWrapType} mode
     */
    public wrap(mode: EGLTextureWrapType = EGLTextureWrapType.GL_REPEAT): void {
        this.gl.bindTexture(this.target, this.texture);
        let param: GLint = this.texParameters.get(mode) || this.gl.REPEAT;
        this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, param);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, param);
    }
}