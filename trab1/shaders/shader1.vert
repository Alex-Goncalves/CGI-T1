uniform vec2 table_dim;
attribute vec4 vPosition;

void main()
{
    gl_PointSize = 4.0;
    gl_Position = vPosition / vec4(vec2(table_dim), 1.0, 1.0);
}
