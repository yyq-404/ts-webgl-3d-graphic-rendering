#version 300 es

precision mediump float;
uniform float uR;
//接收从顶点着色器过来的顶点位置
in vec3 vPosition;
//接收从顶点着色器过来的散射光最终强度
in vec4 vDiffuse;
//输出的片元颜色
out vec4 fragColor;

void main() {
    vec3 color;
    //一个坐标分量分的总份数
    float n = 8.0;
    //每一份的长度
    float span = 2.0 * uR / n;
    //每一维在立方体内的行列数
    int i = int((vPosition.x + uR) / span);
    int j = int((vPosition.y + uR) / span);
    int k = int((vPosition.z + uR) / span);
    //计算当点应位于白色块还是黑色块中
    int whichColor = int(mod(float(i + j + k), 2.0));
    if (whichColor == 1) {
        //奇数时为红色
        color = vec3(0.678, 0.231, 0.129);
    } else {
        //偶数时为白色
        color = vec3(1.0, 1.0, 1.0);
    }
    //最终颜色
    vec4 finalColor = vec4(color, 1.0) * vDiffuse;
    //根据散射光最终强度计算片元的最终颜色值
    fragColor = vec4(finalColor.xyz, 1.0);
}