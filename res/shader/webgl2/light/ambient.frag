#version 300 es

precision mediump float;
//半径
uniform float uR;
//接收从顶点着色器过来的顶点位置
in vec3 vPosition;
//接受从顶点位置传过来的环境光强度
in vec4 vAmbient;
//输出的片元颜色
out vec4 fragColor;

void main()
{
    vec3 color;
    //外接立方体每个坐标轴方向切分的份数
    float n = 8.0;
    //每一份的尺寸（小方块的边长）
    float span = 2.0 * uR / n;
    //当前片元位置小方块的行数
    int i = int((vPosition.x + uR) / span);
    //当前片元位置小方块的层数
    int j = int((vPosition.y + uR) / span);
    //当前片元位置小方块的列数
    int k = int((vPosition.z + uR) / span);
    //计算当前片元行数、层数、列数的和并对2取模
    int whichColor = int(mod(float(i + j + k), 2.0));
    if (whichColor == 1) {
        //奇数时为红色
        color = vec3(0.678, 0.231, 0.129);//红色
    } else {
        //偶数时为白色
        color = vec3(1.0, 1.0, 1.0);//白色
    }
    //计算最终颜色。
    vec4 finalColr = vec4(color, 1.0);
    //根据环境光强度计算最终片元颜色值
    fragColor = finalColr * vAmbient;
}