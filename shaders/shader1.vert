attribute vec4 vPosition;
uniform float table_dim_height;
uniform float table_dim_width;
const int MAX_CHARGES=26;
uniform vec3 uPosition[MAX_CHARGES];
varying vec4 color;
const float Coloumb = 8.988e9;

#define TWOPI 6.28318530718

// convert angle to hue; returns RGB
// colors corresponding to (angle mod TWOPI):
// 0=red, PI/2=yellow-green, PI=cyan, -PI/2=purple
vec3 angle_to_hue(float angle) {
  angle /= TWOPI;
  return clamp((abs(fract(angle+vec3(3.0, 2.0, 1.0)/3.0)*6.0-3.0)-1.0), 0.0, 1.0);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 colorize(vec2 f) {
    float a = atan(f.y, f.x);
    return vec4(angle_to_hue(a-TWOPI), 1.);
}


void main() {
    vec2 normalDirection;
    vec2 totalDirections;

        for(int i = 0; i < MAX_CHARGES; i++) {

            vec2 direction = vec2(vPosition.x - uPosition[i].x, vPosition.y - uPosition[i].y);

            normalDirection = normalize(direction);

            float campueEletric = (Coloumb * uPosition[i].z ) / 
                ((distance(vec2(vPosition.x, vPosition.y), vec2(uPosition[i].x, uPosition[i].y)) * 
                (distance(vec2(vPosition.x, vPosition.y), vec2(uPosition[i].x, uPosition[i].y)))));

            normalDirection = normalDirection * campueEletric;

            totalDirections = totalDirections +  normalDirection;
        }

    totalDirections = totalDirections *0.000000000001;
    if(sqrt((totalDirections.x * totalDirections.x) + (totalDirections.y * totalDirections.y)) > 0.25)
        totalDirections = normalize(totalDirections) * 0.25;

    if(vPosition.z == 0.0) {
        color = colorize(vec2(totalDirections.x, totalDirections.y)); 
        gl_Position.x = (vPosition.x + totalDirections.x)/table_dim_width;
        gl_Position.y = (vPosition.y + totalDirections.y)/table_dim_height;
    } else {
        color = vec4(0.0, 0.0, 0.0, 0.0); 
        gl_Position.x = vPosition.x/table_dim_width;
        gl_Position.y = vPosition.y/table_dim_height;
    }
    gl_Position.z = 0.0;
    gl_Position.w = 1.0; 
}