/**
 * 动态数组。
 */
export class TypedArrayList<T extends Uint16Array | Float32Array | Uint8Array> {
    /** 内部类型数组 */
    private _array: T;
    /** 类型数组构造函数签名。 */
    private readonly _typedArrayConstructor: (new (length: number) => T);
    /** 数组实际长度 */
    private _length: number;
    /** 预先分配元素个数 */
    private _capacity: number;

    /**
     * 构造。
     * @param typedArrayConstructor
     * @param capacity
     */
    public constructor(typedArrayConstructor: (new (length: number) => T), capacity: number = 8) {
        this._typedArrayConstructor = typedArrayConstructor;
        this._capacity = capacity;
        if (this._capacity == 0) {
            this._capacity = 8;
        }
        this._array = new this._typedArrayConstructor(this._capacity);
        this._length = 0;
    }

    /**
     * 获取长度。
     */
    public get length(): number {
        return this._length;
    }

    /**
     * 获取预分配元素个数。
     */
    public get capacity(): number {
        return this._capacity;
    }

    /**
     * 获取数组对象。
     */
    public get typeArray(): T {
        return this._array;
    }
    /** 重新分配内存回调 */
    public capacityChangedCallback: ((arrayList: TypedArrayList<T>) => void) | null = null;

    /**
     * 压值
     * @param value
     */
    public push(value: number): number {
        if (this._length >= this._capacity) {
            if (this._capacity > 0) {
                this._capacity += this._capacity;
                console.log("current capacity: " + this._capacity);
            }
            this._array = new this._typedArrayConstructor(this._capacity);
            let oldArray: T = this._array;
            this._array.set(oldArray);
            if (this.capacityChangedCallback) {
                this.capacityChangedCallback(this);
            }
        }
        this._array[this._length++] = value;
        return this._length;
    }

    /**
     * 截取，返回原数据对象。
     * @param start
     * @param end
     */
    public subArray(start: number = 0, end: number = this.length): T {
        return this._array.subarray(start, end) as T;
    }

    /**
     * 截取，返回新数组对象。
     * @param start
     * @param end
     */
    public slice(start: number = 0, end: number = this.length): T {
        return this._array.slice(start, end) as T;
    }

    /**
     * 根据索引查找。
     * @param index
     */
    public at(index: number): number {
        if (index < 0 || index > this._length) {
            throw new RangeError("Index must be a positive integer");
        }
        return this._array[index];
    }

    /**
     * 清空
     */
    public clear(): void {
        this._length = 0;
    }
}
