function initScene(gl, programInfo) {
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
        Math.PI / 2, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 50);
    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );

}

function drawScene(gl, programInfo, buffer, vertexCount) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    setPositionAttribute(gl, buffer, programInfo);


    const modelViewMatrix = mat4.create();

    mat4.translate(
        modelViewMatrix,
        modelViewMatrix,
        [0.0, 0.0, -30.0]
    );
    mat4.multiply(modelViewMatrix, position.matrix, modelViewMatrix);

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    );
    gl.uniform4fv(programInfo.uniformLocations.centerCoords, calcPoint(0, 0, 0, 0));
    
    const offset = 0;
    gl.drawArrays(gl.LINES, offset, vertexCount);
}

function setPositionAttribute(gl, buffer, programInfo) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}
