#version 300 es
//总变换矩阵
uniform mat4 uMVPMatrix;
//顶点位置
in vec3 aPosition;
//顶点颜色
in vec4 aColor;
//用于传递给片元着色器的变量
out vec4 aaColor;

void main()
{
    //根据总变换矩阵计算此次绘制此顶点位置
    gl_Position = uMVPMatrix * vec4(aPosition, 1);
    //将接收的颜色传递给片元着色器
    aaColor = aColor;
}