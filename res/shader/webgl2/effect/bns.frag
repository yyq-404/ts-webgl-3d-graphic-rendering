#version 300 es

precision mediump float;
//接收从顶点着色器过来的参数
in vec4 vColor;
//接收从顶点着色器过来的顶点位置
in vec3 vPosition;
//输出到的片元颜色
out vec4 fragColor;

void main() {
    vec4 finalColor = vColor;
    //绕z轴转20度的旋转变换矩阵
    mat4 mm = mat4(0.9396926, -0.34202012, 0.0, 0.0, 0.34202012, 0.9396926, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0);
    //将顶点坐标绕z轴转20度
    vec4 tPosition = mm * vec4(vPosition, 1);
    //计算X方向在不在红光色带范围内
    if (mod(tPosition.x + 100.0, 0.4) > 0.3) {
        //若在给最终颜色加上淡红色
        finalColor = vec4(0.4, 0.0, 0.0, 1.0) + finalColor;
    }
    //给此片元颜色值
    fragColor = finalColor;
}