// 1．声明varying类型的变量vColor，该变量的数据类型和名称必须要和Vertex Shader中的数据类型和名称一致
varying lowp vec4 vColor;

// 2．同样需要一个main函数作为入口函数
void main(void){
    // 3．内置了特殊变量：gl_FragColor，其数据类型为float
    // 4．直接将vColor写入gl_FragColor变量中
    gl_FragColor = vColor;
}