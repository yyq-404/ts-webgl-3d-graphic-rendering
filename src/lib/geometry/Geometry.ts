import {Vector3} from "../../common/math/Vector3";
import {Vector2} from "../../common/math/Vector2";
import {GLAttribBits, GLAttribState} from "../../webgl/GLAttribState";
import {Vector4} from "../../common/math/Vector4";
import {GLStaticMesh} from "../../webgl/mesh/GLStaticMesh";
import {MathHelper} from "../../common/math/MathHelper";

export class Geometry {
    // 输入顶点属性数据
    public positions: Vector3[] = [];
    public uvs: Vector2[] = [];
    public normals: Vector3[] = [];
    public colors: Vector4[] = [];
    public tangents: Vector4[] = [];
    public indices: number[] = [];

    public makeStaticVAO(gl: WebGLRenderingContext, needNormals: boolean = false, needUV: boolean = true): GLStaticMesh {
        let bits: GLAttribBits = this.getAttribBits();
        if (!needNormals) {
            bits &= ~GLAttribState.NORMAL_BIT;
        }
        if (!needUV) {
            bits &= ~GLAttribState.TEXCOORD_BIT;
        }

        const stride: number = GLAttribState.getVertexByteStride(bits);
        const step: number = stride / Float32Array.BYTES_PER_ELEMENT;
        const arrayBuffer: ArrayBuffer = new ArrayBuffer(stride * this.positions.length);
        const buffer = new Float32Array(arrayBuffer);
        for (let i: number = 0; i < this.positions.length; i++) {
            // 位置
            const j: number = i * step;
            let idx: number = 0;
            buffer[j + idx++] = this.positions[i].x;
            buffer[j + idx++] = this.positions[i].y;
            buffer[j + idx++] = this.positions[i].z;
            //法线(用了bits后，不能用length来判断了!!!)
            if (bits & GLAttribState.NORMAL_BIT) {
                buffer[j + idx++] = this.normals[i].x;
                buffer[j + idx++] = this.normals[i].y;
                buffer[j + idx++] = this.normals[i].z;
            }
            //纹理
            if (bits & GLAttribState.TEXCOORD_BIT) {
                buffer[j + idx++] = this.uvs[i].x;
                buffer[j + idx++] = this.uvs[i].y;
            }
            //颜色
            if (bits & GLAttribState.COLOR_BIT) {
                buffer[j + idx++] = this.colors[i].x;
                buffer[j + idx++] = this.colors[i].y;
                buffer[j + idx++] = this.colors[i].z;
                buffer[j + idx++] = this.colors[i].w;
            }
            //切线
            if (bits & GLAttribState.TANGENT_BIT) {
                buffer[j + idx++] = this.tangents[i].x;
                buffer[j + idx++] = this.tangents[i].y;
                buffer[j + idx++] = this.tangents[i].z;
                buffer[j + idx++] = this.tangents[i].w;
            }
        }
        const mesh: GLStaticMesh = new GLStaticMesh(gl, bits, buffer, this.indices.length > 0 ? new Uint16Array(this.indices) : null,);
        this.buildBoundingBoxTo(mesh.mins, mesh.maxs);
        return mesh;
    }

    buildBoundingBoxTo(mins: Vector3, maxs: Vector3): void {
        for (let i: number = 0; i < this.positions.length; i++) {
            MathHelper.boundBoxAddPoint(this.positions[i], mins, maxs);
        }
    }

    getAttribBits(): GLAttribBits {
        if (this.positions.length === 0) {
            throw new Error('必须要有顶数据!!!');
        }

        let bits: GLAttribBits = GLAttribState.POSITION_BIT;
        if (this.uvs.length > 0) {
            bits |= GLAttribState.TEXCOORD_BIT;
        }
        if (this.normals.length > 0) {
            bits |= GLAttribState.NORMAL_BIT;
        }
        if (this.colors.length > 0) {
            bits |= GLAttribState.COLOR_BIT;
        }
        if (this.tangents.length > 0) {
            bits |= GLAttribState.TANGENT_BIT;
        }
        return bits;
    }
}