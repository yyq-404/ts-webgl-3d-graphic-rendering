#version 300 es

//总变换矩阵
uniform mat4 uMVPMatrix;
//顶点位置
in vec3 aPosition;
//法向量
in vec3 aNormal;
//用于传递给片元着色器的顶点位置
out vec3 vPosition;
//用于传递给片元着色器的顶点法向量
out vec3 vNormal;

void main() {
    //根据总变换矩阵计算此次绘制此顶点位置
    gl_Position = uMVPMatrix * vec4(aPosition, 1);
    //将顶点的位置传给片元着色器
    vPosition = aPosition;
    //将顶点的法向量传给片元着色器
    vNormal = aNormal;
}