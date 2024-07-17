#version 300 es

//总变换矩阵
uniform mat4 uMVPMatrix;
//环境光系数
uniform vec4 aAmbient;
//顶点位置
in vec3 aPosition;
//用于传递给片元着色器的顶点位置
out vec3 vPosition;
//用于传递给片元着色器的环境光分量
out vec4 vAmbient;

void main() {
    //根据总变换矩阵计算此次绘制此顶点位置
    gl_Position = uMVPMatrix * vec4(aPosition, 1);
    //将原始顶点位置传递给片元着色器
    vPosition = aPosition;
    //将环境光强度传给片元着色器
    vAmbient = aAmbient;
}