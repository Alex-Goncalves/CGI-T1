uniform float table_dim_height;
uniform float table_dim_width;
attribute vec4 vPosition;
uniform float uTheta;
uniform float size;

void main()
{
    float s = sin( uTheta );
    float c = cos( uTheta );
    gl_PointSize = size;
    gl_Position.x = -s * vPosition.y/table_dim_height + c * vPosition.x/table_dim_width;
    gl_Position.y = s * vPosition.x/table_dim_width + c * vPosition.y/table_dim_height;
    gl_Position.z = 0.0;
    gl_Position.w = 1.0;
}
