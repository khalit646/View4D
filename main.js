let keys = {}

window.addEventListener("keydown", ev=>{
    let key = ev.code[3];
    if("WSDA".includes(key)){
        ev.preventDefault();
        keys[key] = true;
    }
})
window.addEventListener("keyup", ev=>{
    let key = ev.code[3];
    if("WSDA".includes(key)){
        ev.preventDefault();
        keys[key] = false;
    }
})

function main() {
    const canvas = document.getElementById("canvas")
    const gl = canvas.getContext("webgl");

    if (gl === null) {
        alert("Cant get access to WebGL.");
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vertexSource = `
    precision lowp float;
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform vec4 uCenter;
    varying float color;
    const float size = 2.;

    void main(void) {
        gl_PointSize = 3.0;
        vec4 vertex = uModelViewMatrix * aVertexPosition;
        vec4 center = uModelViewMatrix * uCenter;
        color = (vertex.z - center.z + size / 2.) * 0.5 / size + 0.5;
        gl_Position = uProjectionMatrix * vertex;
    }
    `;

    const fragmentSource = `
    precision lowp float;
    varying float color;
    void main(void) {
        gl_FragColor = vec4(color, color, color, 1.0);
    }
  `;

    const shaderProgram = initShaderProgram(gl, vertexSource, fragmentSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(
                shaderProgram,
                "uProjectionMatrix"
            ),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            centerCoords: gl.getUniformLocation(shaderProgram, "uCenter")
        },
    };
    initScene(gl, programInfo);

    let tes = createMeshCube4D();
    let projMatr = projection4D(0.1, 10, Math.PI / 2.5);
    let cam = camera4D(0, 1, 0, 0, 0, 0, 0);
    let projCam = MultiplyMatr5(projMatr, cam);

    setMatrix(projCam);
    const buffer = initBuffer(gl, tes);

    let matrixType = 1;
    let matrixList = document.querySelectorAll(".matrix__item>button");
    for(let i = 0; i < matrixList.length; i++){
        matrixList[i].addEventListener("click", ev=>{
            matrixType = +ev.target.id;
        })
    }

    let pause = false;

    document.querySelector(".matrix__pause").addEventListener("click", ev=>{
        pause = !pause
        ev.target.innerText = (pause) ? "resume" : "pause";
    })

    let n = 0;
    let prev = Date.now();
    function render(now) {
        let s = now;
        let delta = now-prev;
        prev = s;
        updateCamera(delta);
        let modelMat;
        if(pause){
            if(n == 0){
                n = now;
            }
            now = n;
        }else if(n != 0){
            n = 0;
        }
        let tm = now / 2500 * Math.PI;
        switch(matrixType){
            case 1:
                modelMat = MultiplyMatr5(
                    MultiplyMatr5(rotate4D(2, 1, tm), rotate4D(0, 3, tm)), translate4D(0, 0, 0, 2)
                );
                break;
            case 2:
                modelMat = MultiplyMatr5(
                    MultiplyMatr5(rotate4D(2, 1, tm), rotate4D(0, 3, tm)), translate4D(0, 3, 0, 2)
                );
                break;
            case 3:
                modelMat = translate4D(0, 3 * Math.sin(tm), 0, 2);
                break;
            case 4:
                modelMat = MultiplyMatr5(
                    MultiplyMatr5(translate4D(0, 3, 0, 0), rotate4D(0, 3, tm)), translate4D(0, 0, 0, 2)
                );
        }
        
        setMatrix(MultiplyMatr5(modelMat, projCam));
        let bufferData = calcVertices(tes);
        let vertexCount = bufferData.length / 3;
        bufferData = new Float32Array(bufferData);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, bufferData);
        drawScene(gl, programInfo, buffer, vertexCount);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Error link program: ${gl.getProgramInfoLog(
                shaderProgram
            )}`
        );
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            `Error compile shader: ${gl.getShaderInfoLog(shader)}`
        );
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
main();
