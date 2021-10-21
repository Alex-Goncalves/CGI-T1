precision highp float;
uniform vec4 color;

void main()
{
    gl_FragColor = color;
    vec2 fragmentPosition = 2.0*gl_PointCoord - 1.0;
    float distance = length(fragmentPosition);
    if(distance > 0.99) discard;
    float distanceSqrd = distance * distance;
 
    if(color == vec4(0.0, 1.0, 0.0, 1.0)) {
        if(fragmentPosition.y > -0.2 && fragmentPosition.y < 0.2 && fragmentPosition.x < 0.8 && fragmentPosition.x > -0.8) discard;
        if(fragmentPosition.y > -0.8 && fragmentPosition.y < 0.8 && fragmentPosition.x < 0.2 && fragmentPosition.x > -0.2) discard;
    } else if(fragmentPosition.y > -0.2 && fragmentPosition.y < 0.2 && fragmentPosition.x < 0.8 && fragmentPosition.x > -0.8) discard;
}