import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js'

/** @type {WebGLRenderingContext} */
let gl;
const table_width = 3.0;
let cont = 0;
const MAX = 26;
let table_height;
let grid_spacing = 0.05;

let vertices = [];
let protatingz = [];
let eletratingz = [];

var program;
var program2;

var uTheta = 0.02;
var spaceUpOrDawn = true;

function animate(time) {
    window.requestAnimationFrame(animate);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program2);
    
    drawCharges();

    gl.useProgram(program);

    drawLines();
}

function drawLines() {
    var position = protatingz.concat(eletratingz);
    for(let i=0; i<position.length; i++) {
        const uPosition = gl.getUniformLocation(program, "uPosition[" + i + "]");
        gl.uniform3fv(uPosition, MV.flatten(position[i]));
    }

    const uTable_dim_height = gl.getUniformLocation(program, "table_dim_height");
    gl.uniform1f(uTable_dim_height,  table_height/2.0);

    const utable_dim_width = gl.getUniformLocation(program, "table_dim_width");
    gl.uniform1f(utable_dim_width,  table_width/2.0);

    gl.drawArrays(gl.LINES, 0, vertices.length);
}

function drawCharges() {    
    const colorloc = gl.getUniformLocation(program2, "color");

    const uTable_dim_height = gl.getUniformLocation(program2, "table_dim_height");
    gl.uniform1f(uTable_dim_height,  table_height/2.0);

    const utable_dim_width = gl.getUniformLocation(program2, "table_dim_width");
    gl.uniform1f(utable_dim_width,  table_width/2.0);

    var s = Math.sin( -uTheta );
    var c = Math.cos( -uTheta );

    for(let i = 0; i < protatingz.length; i++) {
        var x = (-s * protatingz[i][1] + c * protatingz[i][0]);
        var y = (s * protatingz[i][0] + c * protatingz[i][1]);
        protatingz.splice(i, 1, MV.vec3(x, y, 1));
    }

    var s = Math.sin( uTheta );
    var c = Math.cos( uTheta );

    for(let i = 0; i < eletratingz.length; i++) {
        var x = (-s * eletratingz[i][1] + c * eletratingz[i][0]);
        var y = (s * eletratingz[i][0] + c * eletratingz[i][1]);
        eletratingz.splice(i, 1, MV.vec3(x, y, -1));
    }

    gl.bufferSubData(gl.ARRAY_BUFFER, vertices.length * MV.sizeof["vec3"], MV.flatten(protatingz));
    gl.bufferSubData(gl.ARRAY_BUFFER, vertices.length * MV.sizeof["vec3"] + MAX * MV.sizeof["vec3"], MV.flatten(eletratingz));

    const vPosition = gl.getAttribLocation(program2, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
 
    if(spaceUpOrDawn) {
        gl.uniform4fv(colorloc, [0.0, 1.0, 0.0, 1.0]);
        gl.drawArrays(gl.POINTS, vertices.length, protatingz.length);
 
        gl.uniform4fv(colorloc, [1.0, 0.0, 0.0, 1.0]);
        gl.drawArrays(gl.POINTS, vertices.length + MAX, eletratingz.length);
    }
}

function setup(shaders) {
    const canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);
    program2 = UTILS.buildProgramFromSources(gl, shaders["shader2.vert"], shaders["shader2.frag"]);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    table_height = (table_width * canvas.height / canvas.width);

    for(let x = (-(table_width/2) + grid_spacing); x <= (table_width/2); x += grid_spacing) {
        for(let y = -(table_height/2); y <= (table_height/2); y += grid_spacing) {
            vertices.push(MV.vec3(x + Math.random() * 0.004, y + Math.random() * 0.004, 0));
            vertices.push(MV.vec3(x, y, 1));
        }
    }

    const aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices.length * MV.sizeof["vec3"] + 
                                   MAX * MV.sizeof["vec3"] + MAX * MV.sizeof["vec3"], gl.STATIC_DRAW);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(vertices));

    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    window.requestAnimationFrame(animate);

    window.addEventListener("resize", function (event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        
        table_height = (table_width * canvas.height / canvas.width);
    });

    var upOrDawn = true;

    window.addEventListener("keydown", function(event) {
        switch (event.keyCode) {
            case 16:
                upOrDawn = false;
                break;
        }
    });

    window.addEventListener("keyup", function(event) {
        switch (event.keyCode) {
            case 32:
                if(spaceUpOrDawn) spaceUpOrDawn = false;
                else spaceUpOrDawn = true;
                break;
            case 16:
                upOrDawn = true;
                break;
        }
    });

    canvas.addEventListener("click", function(event) {
        const x = (((event.offsetX / canvas.width) * 2) - 1) * table_width/2.0;
        const y = (- (((event.offsetY / canvas.height) * 2) - 1)) * table_height/2.0;

        if(cont < MAX-1) {
            if(upOrDawn) {
                gl.bufferSubData(gl.ARRAY_BUFFER, vertices.length * MV.sizeof["vec3"] + (protatingz.length % MAX) * MV.sizeof["vec3"], MV.flatten(MV.vec3(x,y, 1)));
                protatingz.push(MV.vec3(x, y, 1));
                console.log("pos");
            } else {
                gl.bufferSubData(gl.ARRAY_BUFFER, vertices.length * MV.sizeof["vec3"] + MAX * MV.sizeof["vec3"] + (eletratingz.length % MAX) * MV.sizeof["vec3"], MV.flatten(MV.vec3(x,y, -1)));
                eletratingz.push(MV.vec3(x, y, -1));
                console.log("neg");
            }
            cont ++;
        }

        const vPosition = gl.getAttribLocation(program2, "vPosition");
        gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

    });
}

UTILS.loadShadersFromURLS(["shader1.vert", "shader2.vert", "shader1.frag", "shader2.frag"]).then(s => setup(s));