import { WebGPUBackend } from "../backend/webgpu/backend.ts";
import { WebGPUData } from "../backend/webgpu/data.ts";
import { perlin } from "../backend/webgpu/operators/perlin.ts";
import { PlotWindow } from "https://deno.land/x/plotsaur@v0.2.1/mod.ts"

function shuffle(tab: number[]) {
    for (let e = tab.length - 1; e > 0; e--) {
        const index = Math.round(Math.random() * (e - 1)),
            temp = tab[e];

        tab[e] = tab[index];
        tab[index] = temp;
    }
}

function makePermutation() {
    const P = [];
    for (let i = 0; i < 256; i++) {
        P.push(i);
    }
    shuffle(P);
    for (let i = 0; i < 256; i++) {
        P.push(P[i]);
    }

    return P;
}

const perms = makePermutation();
const vecs: number[] = [];
const constants = [
    { x: 1, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 },
    { x: 1, y: -1 }
];
constants.map(v => vecs.push(v.x, v.y))
const meta = {
    m: 100,
    n: 100,
    k: 20
}

const backend = new WebGPUBackend();
await backend.initialize();

const a = await WebGPUData.from(backend, new Int32Array(perms), "i32");
const b = await WebGPUData.from(backend, new Float32Array(vecs), "vec2<f32>");
const c = new WebGPUData(backend, "f32", meta.m * meta.n);

await perlin(backend, a, b, c, meta);
const result = await c.get()
// console.log(result);

// CPU calculation

function calculate() {
    const vec = []
    for (let i = 0; i < meta.k; i++) {
        for (let j = 0; j < meta.k; j++) {
            vec.push(perlin2D(i, j))
        }
    }
    return vec
}

function perlin2D(posX: number, posY: number) {
    const batchX = Math.floor(posX / meta.k)
    const batchY = Math.floor(posY / meta.k)
    const trv = constants[perms[perms[batchX + 1] + batchY + 1] % 3];
    const tlv = constants[perms[perms[batchX] + batchY + 1] % 3];
    const brv = constants[perms[perms[batchX + 1] + batchY] % 3];
    const blv = constants[perms[perms[batchX] + batchY] % 3];

    const x = posX / meta.k - batchX;
    const y = posY / meta.k - batchY;
    const tr = { x: x - 1, y: y - 1 }
    const tl = { x: x, y: y - 1 }
    const br = { x: x - 1, y: y }
    const bl = { x: x, y: y }

    const trd = Dot(trv, tr)
    const tld = Dot(tlv, tl)
    const brd = Dot(brv, br)
    const bld = Dot(blv, bl)

    const u = Fade(x);
    const v = Fade(y);

    const left = Lerp(bld, tld, v)
    const right = Lerp(brd, trd, v)
    return Lerp(left, right, u)
};

type Vector = {
    x: number,
    y: number
}

function Dot(a: Vector, b: Vector) {
    return a.x * b.x + a.y * b.y
}

function Lerp(a: number, b: number, x: number) {
    return a + (b - a) * x
}

function Fade(t: number) {
    return ((6 * t - 15) * t + 10) * t * t * t;
}
// console.log(calculate())

const plot = new PlotWindow("Webgpu Perlin", 600, 600);
plot.addPlot({
    xLabelAreaSize: 0,
    yLabelAreaSize: 0,
    mesh: undefined,
    seriesLabel: undefined
})
plot.cartesian2D({
    type: "ranged",
    x_axis: { start: -1, end: 1 },
    y_axis: { start: -1, end: 1 },
})
for (let i = 0; i < meta.m; i++) {
    for (let j = 0; j < meta.m; j++) {
        const idx = i + j * meta.n
        plot.drawRect({
            style: { r: 0, g: 0, b: 0, a: result[idx] + 0.5 },
            points: [{ x: i * 5, y: j * 5 }, { x: (i + 1) * 5, y: (j + 1) * 5 }],
            filled: true
        })
    }
}
plot.show()