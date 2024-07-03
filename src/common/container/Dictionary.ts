/**
 * 字典
 */
export class Dictionary<T> {
    /** 项目集合 */
    private _items: { [key: string]: T } | Map<string, T>;
    /** 数量 */
    private _count: number;
    
    /**
     * 构造
     * @param useES6Map
     */
    public constructor(useES6Map: boolean = true) {
        if (useES6Map) {
            this._items = new Map<string, T>();
        } else {
            this._items = {};
        }
        this._count = 0;
    }
    
    /**
     * 长度
     */
    public get length(): number {
        return this._count;
    }
    
    /**
     * 键集合
     */
    public get keys(): string[] {
        let keys: string[] = [];
        if (this._items instanceof Map) {
            let itemKeys = this._items.keys();
            for (let key of itemKeys) {
                keys.push(key);
            }
        } else {
            for (let itemKey in this._items) {
                if (this._items.hasOwnProperty(itemKey)) {
                    keys.push(itemKey);
                }
            }
        }
        return keys;
    }
    
    /**
     * 值集合
     */
    public get values(): T[] {
        let values: T[] = [];
        if (this._items instanceof Map) {
            let itemValues = this._items.values();
            for (let itemValue of itemValues) {
                values.push(itemValue);
            }
        } else {
            for (let itemsKey in this._items) {
                if (this._items.hasOwnProperty(itemsKey)) {
                    values.push(this._items[itemsKey]);
                }
            }
        }
        return values;
    }
    
    /**
     * 包含。
     * @param key
     */
    public contains(key: string): boolean {
        if (this._items instanceof Map) {
            return this._items.has(key);
        } else {
            return this._items[key] !== undefined;
        }
    }
    
    /**
     * 查找
     * @param key
     */
    public find(key: string): T {
        if (this._items instanceof Map) {
            return this._items.get(key);
        } else {
            return this._items[key];
        }
    }
    
    /**
     * 插入
     * @param key
     * @param value
     */
    public insert(key: string, value: T): void {
        if (this._items instanceof Map) {
            this._items.set(key, value);
        } else {
            this._items[key] = value;
        }
        this._count++;
    }
    
    /**
     * 移除
     * @param key
     */
    public remove(key: string): boolean {
        let ret: T = this.find(key);
        if (ret == undefined) {
            return false;
        }
        if (this._items instanceof Map) {
            this._items.delete(key);
        } else {
            delete this._items[key];
        }
        this._count--;
        return true;
    }
    
    /**
     * 清空
     */
    public clear(): void {
        if (this._items instanceof Map) {
            this._items.clear();
        } else {
            this._items = {};
        }
        this._count = 0;
    }
    
    /**
     * 输出字符串
     */
    public toString() {
        return JSON.stringify(this._items as Map<string, T>);
    }
}