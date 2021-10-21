uniform float table_dim_height;
uniform float table_dim_width;
attribute vec4 vPosition;

void main()
{
    gl_PointSize = 6.0;
    gl_Position.x = vPosition.x/table_dim_width;
    gl_Position.y = vPosition.y/table_dim_height;
    gl_Position.z = 0.0;
    gl_Position.w = 1.0;
}