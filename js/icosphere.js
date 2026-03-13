export function createIcosphereData(subdivisions) {
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;
    let vertices = [
        [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
        [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
        [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ].map(v => normalize(v));

    let faces = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];

    const cache = {};
    function getMiddlePoint(p1, p2) {
        const key = p1 < p2 ? `${p1}_${p2}` : `${p2}_${p1}`;
        if (cache[key]) return cache[key];
        const v1 = vertices[p1], v2 = vertices[p2];
        const middle = normalize([(v1[0] + v2[0]) / 2, (v1[1] + v2[1]) / 2, (v1[2] + v2[2]) / 2]);
        vertices.push(middle);
        return cache[key] = vertices.length - 1;
    }

    // División de la malla parametrizada 
    for (let i = 0; i < subdivisions; i++) {
        const facesRender = [];
        faces.forEach(([a, b, c]) => {
            const ab = getMiddlePoint(a, b);
            const bc = getMiddlePoint(b, c);
            const ca = getMiddlePoint(c, a);
            facesRender.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
        });
        faces = facesRender;
    }

    function normalize(v) {
        const d = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return [v[0] / d, v[1] / d, v[2] / d];
    }

    return {
        position: { numComponents: 3, data: vertices.flat() },
        normal: { numComponents: 3, data: vertices.flat() }, // En esferas la normal = posición normalizada
        indices: { numComponents: 3, data: faces.flat() },
    };
}