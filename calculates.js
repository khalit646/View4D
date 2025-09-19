let _ = (i, j) => i * 5 + j;
let $ = (i, j) => i * 3 + j;

function initMatrix4D() {
    return [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0,
        0, 0, 0, 0, 1
    ];
}

function translate4D(x, y, z, w) {
    return [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0,
        x, y, z, w, 1
    ];
}

function scale4D(x, y, z, w) {
    return [
        x, 0, 0, 0, 0,
        0, y, 0, 0, 0,
        0, 0, z, 0, 0,
        0, 0, 0, w, 0,
        0, 0, 0, 0, 1
    ];
}

function rotate4D(r1, r2, angle) {
    let m = initMatrix4D();
    m[_(r1, r1)] = m[_(r2, r2)] = Math.cos(angle);
    m[_(r1, r2)] = -(m[_(r2, r1)] = Math.sin(angle));
    return m;
}

function projection4D(near, far, fovy) {
    let c = 1 / Math.tan(fovy / 2);
    let a = (far + near) / (far - near);
    let b = -2 * near * far / (far - near);
    return [
        c, 0, 0, 0, 0,
        0, c, 0, 0, 0,
        0, 0, c, 0, 0,
        0, 0, 0, a, 1,
        0, 0, 0, b, 0
    ]
}

function detMatrix3(m) {
    return m[$(0, 0)] * m[$(1, 1)] * m[$(2, 2)] + m[$(0, 1)] * m[$(1, 2)] * m[$(2, 0)] +
        m[$(0, 2)] * m[$(1, 0)] * m[$(2, 1)] - m[$(2, 0)] * m[$(1, 1)] * m[$(0, 2)] -
        m[$(0, 1)] * m[$(1, 0)] * m[$(2, 2)] - m[$(1, 2)] * m[$(2, 1)] * m[$(0, 0)];
}

function detMatrixN(m) {
    let len = Math.sqrt(m.length);
    let nlen = len - 1;
    let arr = new Array(nlen * nlen);
    let res = 0;
    for (let i = 0; i < len; i++) {
        for (let k = 1; k < len; k++) {
            for (let t = 0; t < len - 1; t++) {
                let idx = (t >= i) ? t + 1 : t;
                arr[(k - 1) * nlen + t] = m[k * len + idx];
            }
        }
        let sign = (i % 2 == 1) ? -1 : 1;
        if (nlen == 3) {
            res += sign * m[i] * detMatrix3(arr);
        } else {
            res += sign * m[i] * detMatrixN(arr);
        }
    }
    return res;
}

function invMatrixN(m) {
    let det = detMatrixN(m);
    if (det == 0) {
        throw "det is equal to zero";
    }
    let nm = new Array(m.length);
    let len = Math.sqrt(m.length);
    let nlen = len - 1;
    let arr = new Array(nlen * nlen);
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
            for (let t = 0; t < nlen; t++) {
                for (let k = 0; k < nlen; k++) {
                    let t2 = (t >= i) ? t + 1 : t;
                    let k2 = (k >= j) ? k + 1 : k;
                    arr[t * nlen + k] = m[t2 * len + k2];
                }
            }
            let sign = ((i + j) % 2 == 1) ? -1 : 1;
            let a;
            if (nlen == 3) {
                a = detMatrix3(arr);
            } else {
                a = detMatrixN(arr);
            }
            nm[j * len + i] = (sign * a) / det;
        }
    }
    return nm;
}

function MultiplyMatr5(m1, m2) {
    let res = new Array(25);
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            res[i * 5 + j] = m1[i * 5] * m2[j] + m1[i * 5 + 1] * m2[j + 5] + m1[i * 5 + 2] * m2[j + 10] +
                m1[i * 5 + 3] * m2[j + 15] + m1[i * 5 + 4] * m2[j + 20];
        }
    }
    return res;
}

function MultiplyVecMatr5(v, m) {
    res = new Array(5);
    for (let i = 0; i < 5; i++) {
        res[i] = v[0] * m[i] + v[1] * m[i + 5] + v[2] * m[i + 10] +
            v[3] * m[i + 15] + v[4] * m[i + 20];
    }
    return res;
}

function camera4D(r1, r2, angle, x, y, z, w) {
    return invMatrixN(MultiplyMatr5(rotate4D(r1, r2, angle),
        translate4D(x, y, z, w)));
}

let points = [];
let relations = [];

function createRelations(n, arr) {
    if (n == 1) {
        let a = [-1, ...arr, 1]; //last 1 is w in 3D
        let b = [1, ...arr, 1];
        points.push(a, b);
        let rel = [points.length - 1, points.length - 2]
        relations.push(rel);
        return rel;
    }
    n--;
    let a = createRelations(n, [-1, ...arr]);
    let b = createRelations(n, [1, ...arr]);
    for (let i = 0; i < a.length; i++) {
        relations.push([a[i], b[i]]);
    }
    return [...a, ...b];
}

function createMeshCube4D() {
    points = [];
    relations = [];
    createRelations(4, []);
    return {
        points,
        relations
    }
}

function createCub4D() {
    let plos = [];
    function insert(pos, val, arr) {
        for (let i = 0; i < pos; i++) {
            arr[i] = arr[i + 1];
        }
        arr[pos] = val;
        return arr;
    }
    for (let i = 0; i < 6; i++) {
        let f = 1 - i % 2 * 2;
        let n = Math.trunc(i / 2);
        plos.push(insert(n, f, [-1, -1, -1]));
        plos.push(insert(n, f, [-1, 1, -1]));
        plos.push(insert(n, f, [-1, 1, 1]));
        plos.push(insert(n, f, [-1, -1, 1]));
    }
    let tes = []
    for (let i = 0; i < 8; i++) {
        let f = 1 - i % 2 * 2;
        let n = Math.trunc(i / 2);
        for (let j = 0; j < 6 * 4; j++) {
            tes.push(insert(n, f, [-1, ...plos[j], 1]));
        }
    }
    return tes;
}

let curMatrix;
function setMatrix(matr) {
    curMatrix = matr;
}

function calcPoint(x, y, z, w) {
    point = MultiplyVecMatr5([x, y, z, w, 1], curMatrix);
    point[0] /= point[4];
    point[1] /= point[4];
    point[2] /= point[4];
    point = point.slice(0, 4);
    point[3] = 1;
    return point;
}


function calcVertices({ points, relations }) {
    let res = new Array(points.length);
    for (let i = 0; i < points.length; i++) {
        let point = MultiplyVecMatr5(points[i], curMatrix);
        point[0] /= point[4];
        point[1] /= point[4];
        point[2] /= point[4];
        //point[3] depth ignore for now
        res[i] = point.slice(0, 3);
    }
    let buff = [];
    for (let i = 0; i < relations.length; i++) {
        buff.push(...res[relations[i][0]], ...res[relations[i][1]]);
    }
    return buff;
}

let position = { x: 0, y: 0, angle: Math.PI };

function calcCamera() {
    let m = mat4.create();
    let s = Math.sin(position.angle);
    let c = Math.cos(position.angle);

    mat4.lookAt(m, [position.x, 0, position.y], [position.x + s, 0, position.y + c], [0, 1, 0]);
    return m;
}

function moveCamera(dir) {
    let s = Math.sin(position.angle);
    let c = Math.cos(position.angle);
    position.x += dir * s;
    position.y += dir * c;
    position.matrix = calcCamera();
}

function updateCamera(deltaTm) {
    if (keys.W || keys.S) {
        moveCamera(deltaTm / 100 * (keys.W ? 1 : -1));
    }
    if (keys.A || keys.D) {
        position.angle += deltaTm / 500 * (keys.A ? 1 : -1);
        position.matrix = calcCamera();
    }
    if (position.matrix == undefined) {
        position.matrix = calcCamera();
    }
}
