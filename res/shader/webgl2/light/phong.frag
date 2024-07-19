#version 300 es

//给出默认浮点精度
precision mediump float;
//光源位置
uniform vec3 uLightLocation;
//变换矩阵
uniform mat4 uMMatrix;
//摄像机位置
uniform vec3 uCamera;
//接收从顶点着色器过来的顶点位置
in vec3 vPosition;
//接收从顶点着色器传递过来的法向量
in vec3 vNormal;
//输出片元颜色
out vec4 fragColor;

/**
 * 定位光光照计算的方法
 * @param normal 法向量
 * @param lightLocation 光源位置
 * @param lightAmbient 环境光强度
 * @param lightDiffuse 散射光强度
 * @param lightSpecular 镜面光强度
 */
vec4 pointLight(in vec3 normal, in vec3 lightLocation, in vec4 lightAmbient, in vec4 lightDiffuse, in vec4 lightSpecular) {
    //环境光最终强度
    vec4 ambient;
    //散射光最终强度
    vec4 diffuse;
    //镜面光最终强度
    vec4 specular;
    //直接得出环境光的最终强度
    ambient = lightAmbient;
    //计算变换后的法向量
    vec3 normalTarget = vPosition + normal;
    vec3 newNormal = (uMMatrix * vec4(normalTarget, 1)).xyz - (uMMatrix * vec4(vPosition, 1)).xyz;
    //对法向量规格化
    newNormal = normalize(newNormal);
    //计算从表面点到摄像机的向量
    vec3 eye = normalize(uCamera - (uMMatrix * vec4(vPosition, 1)).xyz);
    //计算从表面点到光源位置的向量vp
    vec3 vp = normalize(lightLocation - (uMMatrix * vec4(vPosition, 1)).xyz);
    //格式化vp
    vp = normalize(vp);
    //求视线与光线的半向量
    vec3 halfVector = normalize(vp + eye);
    //粗糙度，越小越光滑
    float shininess = 50.0;
    //求法向量与vp的点积与0的最大值
    float nDotViewPosition = max(0.0, dot(newNormal, vp));
    //计算散射光的最终强度
    diffuse = lightDiffuse * nDotViewPosition;
    //法线与半向量的点积
    float nDotViewHalfVector = dot(newNormal, halfVector);
    //镜面反射光强度因子
    float powerFactor = max(0.0, pow(nDotViewHalfVector, shininess));
    //计算镜面光的最终强度
    specular = lightSpecular * powerFactor;
    return ambient + diffuse + specular;
}

void main() {
    vec4 finalLight;
    vec3 color;
    float n = 8.0;//一个坐标分量分的总份数
    float span = 2.0 * 2.0 / n;//每一份的长度
    //每一维在立方体内的行列数
    int i = int((vPosition.x + 3.0) / span);
    int j = int((vPosition.y + 2.0) / span);
    //计算当点应位于白色块还是黑色块中
    int whichColor = int(mod(float(i + j), 2.0));
    if (whichColor == 1) {
        //奇数时为红色
        color = vec3(0.678, 0.231, 0.129);
    } else {
        //偶数时为白色
        color = vec3(1.0, 1.0, 1.0);
    }
    //最终颜色
    vec4 finalColor = vec4(color, 1.0);
    //计算定位光各通道强度
    finalLight = pointLight(normalize(vNormal), uLightLocation, vec4(0.05, 0.05, 0.05, 1.0), vec4(0.8, 0.8, 0.8, 1.0), vec4(0.5, 0.5, 0.5, 1.0));
    vec4 lightColor = finalColor * finalLight;
    //综合三个通道光的最终强度及片元的颜色计算出最终片元的颜色并传递给管线
    fragColor = vec4(lightColor.xyz, 1.0);
}