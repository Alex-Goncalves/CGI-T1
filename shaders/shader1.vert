attribute vec4 vPosition;
const int MAX_CHARGES=25;
uniform vec2 uPosition[MAX_CHARGES];
uniform float utheta;

void main()
{
    float s = sin (utheta);
    float c = cos (utheta);

    gl_PointSize = 10.0;
    gl_Position.x = -s * vPosition.y + c * vPosition.x; 
    gl_Position.y = s * vPosition.x + c * vPosition.y; 
    gl_Position.z = 0.0;
    gl_Position.w = 1.0;

}
