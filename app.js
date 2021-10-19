import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

/** @type {WebGLRenderingContext} */
let gl;
const table_width = 3.0;
const MAX = 25;
let table_height;
let grid_spacing = 0.05;
let vertices = [];
let cargatingz = [];
var program;
var uTheta = 0.0;

function animate(time)
{
    window.requestAnimationFrame(animate);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    const uTable_dim_height = gl.getUniformLocation(program, "table_dim_height");
    gl.uniform1f(uTable_dim_height,  table_height/2.0);

    const utable_dim_width = gl.getUniformLocation(program, "table_dim_width");
    gl.uniform1f(utable_dim_width,  table_width/2.0);

    const colorloc = gl.getUniformLocation(program, "color");
    const uThetaX = gl.getUniformLocation(program, "uTheta");
    
    gl.uniform1f(uThetaX, uTheta);
    uTheta += 0.02;

    gl.uniform4fv(colorloc, [0.3, 0.4, 0.2, 1.0]);
    gl.drawArrays(gl.POINTS, vertices.length, Math.min(cargatingz.length), MAX);

    gl.uniform1f(uThetaX, 0);

    gl.uniform4fv(colorloc, [0.7, 0.0, 0.0, 0.3]);
    gl.drawArrays(gl.POINTS, 0, vertices.length);

    
}

function setup(shaders)
{
    const canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    //table height
    table_height = (table_width * canvas.height / canvas.width);

    vertices = [];
    for(let x = (-(table_width/2) + grid_spacing); x <= (table_width/2); x += grid_spacing) {
        for(let y = -(table_height/2); y <= (table_height/2); y += grid_spacing) {
            vertices.push(MV.vec2(x, y));
        }
    }

    /**
     * Create buffer
     */
    const aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices.length * MV.sizeof["vec2"] + 
                                   MAX * MV.sizeof["vec2"], gl.STATIC_DRAW);

    /**
     * Place vertice array in buffer
     */
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(vertices));

    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);


    // FUNCTIONS

    window.addEventListener("resize", function (event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        
        //table height
        table_height = (table_width * canvas.height / canvas.width);
    });

    var upOrDawn = true;

    window.addEventListener("keydown", function(event) {
        switch (event.keyCode) {
            case 32:
                break;
            case 16:
                upOrDawn = false;
                break;
        }
    });

    window.addEventListener("keyup", function(event) {
        switch (event.keyCode) {
            case 16:
                upOrDawn = true;
                break;
        }
    });

    canvas.addEventListener("click", function(event) {
        
        // Start by getting x and y coordinates inside the canvas element
        const x = (((event.offsetX / canvas.width) * 2) - 1) * table_width/2.0;
        const y = (- (((event.offsetY / canvas.height) * 2) - 1)) * table_height/2.0;
        
        /**
        * Place cargatingz array in buffer
        */

        gl.bufferSubData(gl.ARRAY_BUFFER, vertices.length * MV.sizeof["vec2"] + (cargatingz.length % MAX) * 
                        MV.sizeof["vec2"], MV.flatten(MV.vec2(x,y)));

        cargatingz.push(MV.vec2(x, y));

        const vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

    });
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(s => setup(s));
