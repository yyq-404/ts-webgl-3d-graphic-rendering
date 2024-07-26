#version 300 es
//总变换矩阵
uniform mat4 uMVPMatrix;
//从渲染管线接收的顶点位置
in vec3 aPosition;
//用于传递给片元着色器的顶点位置
out vec3 vPosition;

void main() {
    //根据总变换矩阵计算此次绘制此顶点的位置
    gl_Position = uMVPMatrix * vec4(aPosition, 1);
    //将顶点位置传递给片元着色器
    vPosition = aPosition;
}