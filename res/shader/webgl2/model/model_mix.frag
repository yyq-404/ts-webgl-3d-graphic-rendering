#version 300 es

precision mediump float;
//接受从顶点着色器传来的最终光强度
in vec4 finalLight;
//输出到的片元颜色
out vec4 fragColor;

void main() {
    //物体颜色
    vec4 finalColor = vec4(1.0, 1.0, 1.0, 1.0);
    //给此片元颜色值
    fragColor = finalColor * finalLight;
}