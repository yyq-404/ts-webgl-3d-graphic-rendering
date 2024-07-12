#version 300 es

precision mediump float;
//接收从顶点着色器过来的参数
in vec4 vColor;
//输出到的片元颜色
out vec4 fragColor;

void main()
{
    //给此片元颜色值
    fragColor = vColor;
}
