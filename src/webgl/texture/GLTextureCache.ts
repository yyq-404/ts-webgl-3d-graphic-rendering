import {GLTexture} from "./GLTexture";
import {Dictionary} from "../../common/container/Dictionary";

/**
 * 纹理缓存
 */
export class GLTextureCache {
    /** 单例 */
    static readonly instance: GLTextureCache = new GLTextureCache();
    /** 缓存 */
    private _dict: Dictionary<GLTexture>;

    /**
     * 私有构造函数
     * @private
     */
    private constructor() {
        this._dict = new Dictionary<GLTexture>();
    }

    /**
     * 设置
     * @param key
     * @param value
     */
    public set(key: string, value: GLTexture) {
        this._dict.insert(key, value);
    }

    /**
     * 获取缓存对象， 可能返回undefined类型
     * @param key
     * @protected
     */
    protected getMaybe(key: string): GLTexture | undefined {
        return this._dict.find(key);
    }

    /**
     * 获取缓存对象，如果返回undefined，直接抛错
     * @param key
     */
    public getMust(key: string): GLTexture {
        const ret: GLTexture | undefined = this._dict.find(key);
        if (ret === undefined) {
            throw new Error(key + '对应的Program不存在!!!');
        }
        return ret;
    }

    /**
     * 删除缓存对象。
     * @param key
     */
    public remove(key: string): boolean {
        return this._dict.remove(key);
    }
}