import {Dictionary} from '../../common/container/Dictionary';
import {GLProgram} from './GLProgram';

/**
 * 缓存或管理当前 `WebGL` 应用中正在运行的相关`GLProgram`对象
 */
export class GLProgramCache {
    /** 单例模式，只初始化一次，使用的是 static readonly声明方式 */
    static readonly instance: GLProgramCache = new GLProgramCache();
    /** 可编程管线字典 */
    private _dict: Dictionary<GLProgram>;
    
    /**
     * 构造
     * @private
     */
    private constructor() {
        this._dict = new Dictionary<GLProgram>();
        console.log('create new GLProgramCache! ! ');
    }
    
    /**
     * 设置
     * @param key
     * @param value
     */
    public set(key: string, value: GLProgram) {
        this._dict.insert(key, value);
    }
    
    /**
     * 获取缓存对象， 可能返回undefined类型
     * @param key
     */
    public getMaybe(key: string): GLProgram {
        return this._dict.find(key);
    }
    
    /**
     * 获取缓存对象，如果返回undefined，直接抛错
     * @param key
     */
    public getMust(key: string): GLProgram {
        const ret: GLProgram = this._dict.find(key);
        if (ret === undefined) {
            throw new Error(key + '对应的Program不存在!! ! ');
        }
        return ret;
    }
    
    /**
     * 移除缓存对象
     * @param key
     */
    public remove(key: string): boolean {
        return this._dict.remove(key);
    }
    
    /**
     * 清空
     */
    public clear(): void {
        this._dict.clear();
    }
}
