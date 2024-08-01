#version 300 es

//总变换矩阵
uniform mat4 uMVPMatrix;
//变换矩阵
uniform mat4 uMMatrix;
//光源位置
uniform vec3 uLightLocation;
//摄像机位置
uniform vec3 uCamera;
//是否线性模式计算雾效
uniform int uFogLinear;
//顶点位置
in vec3 aPosition;
//顶点法向量
in vec3 aNormal;
//用于传递给片元着色器的最终光照强度
out vec4 finalLight;
//用于传递给片元着色器的雾化因子
out float vFogFactor;

/**定位光光照计算的方法
 * @param normal 法向量
 * @param lightLocation 光源位置
 * @param lightAmbient 环境光强度
 * @param lightDiffuse 散射光强度
 * @param lightSpecular 镜面光强度
 */
vec4 pointLight(in vec3 normal, in vec3 lightLocation, in vec4 lightAmbient, in vec4 lightDiffuse, in vec4 lightSpecular) {
    //环境光强度
    vec4 ambient;
    //散射光强度
    vec4 diffuse;
    //镜面光强度
    vec4 specular;
    //直接得出环境光的最终强度
    ambient = lightAmbient;
    //计算变换后的法向量
    vec3 normalTarget = aPosition + normal;
    vec3 newNormal = (uMMatrix * vec4(normalTarget, 1)).xyz - (uMMatrix * vec4(aPosition, 1)).xyz;
    //对法向量规格化
    newNormal = normalize(newNormal);
    //计算从表面点到摄像机的向量
    vec3 eye = normalize(uCamera - (uMMatrix * vec4(aPosition, 1)).xyz);
    //计算从表面点到光源位置的向量vp
    vec3 vp = normalize(lightLocation - (uMMatrix * vec4(aPosition, 1)).xyz);
    //格式化vp
    vp = normalize(vp);
    //求视线与光线的半向量
    vec3 halfVector = normalize(vp + eye);
    //粗糙度，越小越光滑
    float shininess = 5.0;
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

/**
 *计算雾因子的方法
 */
float computeFogFactor() {
    float tmpFactor;
    //顶点到摄像机的距离
    float fogDistance = length(uCamera - (uMMatrix * vec4(aPosition, 1)).xyz);
    //雾结束位置
    const float end = 150.0;
    //雾开始位置
    const float start = 50.0;
    if (uFogLinear == 1) {
        //            用雾公式计算雾因子，线性模式
        tmpFactor = max(min((end - fogDistance) / (end - start), 1.0), 0.0);
    } else {
        //            用雾公式计算雾因子，非线性模式
        tmpFactor = 1.0 - smoothstep(start, end, fogDistance);//计算雾因子
    }
    // tmpFactor = max(min((end - fogDistance) / (end - start), 1.0), 0.0);
    // tmpFactor = 1.0 - smoothstep(start, end, fogDistance);//计算雾因子
    return tmpFactor;
}

void main() {
    //根据总变换矩阵计算此次绘制此顶点位置
    gl_Position = uMVPMatrix * vec4(aPosition, 1);
    finalLight = pointLight(normalize(aNormal), uLightLocation, vec4(0.4, 0.4, 0.4, 1.0), vec4(0.7, 0.7, 0.7, 1.0), vec4(0.3, 0.3, 0.3, 1.0));
    //计算雾因子
    vFogFactor = computeFogFactor();
}