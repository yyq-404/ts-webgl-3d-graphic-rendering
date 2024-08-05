#version 300 es

//总变换矩阵
uniform mat4 uMVPMatrix;
//顶点位置
in vec3 aPosition;
//顶点纹理坐标
in vec2 aTexCoord;
//用于传递给片元着色器的out变量
out vec2 vTextureCoord;
//用于传递给片元着色器的Y坐标
out float currentY;

void main() {
    //根据总变换矩阵计算此次绘制此顶点位置
    gl_Position = uMVPMatrix * vec4(aPosition, 1);
    //将接收的纹理坐标传递给片元着色器
    vTextureCoord = aTexCoord;
    //将顶点的Y坐标传递给片元着色器
    currentY = aPosition.y;
}
