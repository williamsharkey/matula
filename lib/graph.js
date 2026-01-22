/**
 * Graph Library
 *
 * Data structures and algorithms for simple undirected graphs.
 * Includes block-cut decomposition for the collision-free encoding.
 */

const Graph = (function() {
    'use strict';

    // ============================================================
    // GRAPH DATA STRUCTURE
    // ============================================================

    /**
     * Create an empty graph
     * Internal representation: adjacency list
     */
    function create(n = 0) {
        const adj = [];
        for (let i = 0; i < n; i++) adj.push(new Set());
        return { adj, n };
    }

    function copy(g) {
        const newG = create(g.n);
        for (let v = 0; v < g.n; v++) {
            for (const u of g.adj[v]) {
                newG.adj[v].add(u);
            }
        }
        return newG;
    }

    function addVertex(g) {
        g.adj.push(new Set());
        g.n++;
        return g.n - 1;
    }

    function addEdge(g, u, v) {
        if (u === v) return; // No self-loops
        if (u >= g.n) throw new Error(`Vertex ${u} does not exist`);
        if (v >= g.n) throw new Error(`Vertex ${v} does not exist`);
        g.adj[u].add(v);
        g.adj[v].add(u);
    }

    function removeEdge(g, u, v) {
        g.adj[u].delete(v);
        g.adj[v].delete(u);
    }

    function hasEdge(g, u, v) {
        return g.adj[u].has(v);
    }

    function degree(g, v) {
        return g.adj[v].size;
    }

    function edges(g) {
        const result = [];
        for (let u = 0; u < g.n; u++) {
            for (const v of g.adj[u]) {
                if (u < v) result.push([u, v]);
            }
        }
        return result;
    }

    function numEdges(g) {
        return edges(g).length;
    }

    function neighbors(g, v) {
        return Array.from(g.adj[v]);
    }

    // ============================================================
    // COMMON GRAPHS
    // ============================================================

    function complete(n) {
        const g = create(n);
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                addEdge(g, i, j);
            }
        }
        return g;
    }

    function path(n) {
        const g = create(n);
        for (let i = 0; i < n - 1; i++) {
            addEdge(g, i, i + 1);
        }
        return g;
    }

    function cycle(n) {
        if (n < 3) throw new Error('Cycle needs at least 3 vertices');
        const g = path(n);
        addEdge(g, 0, n - 1);
        return g;
    }

    function star(n) {
        const g = create(n);
        for (let i = 1; i < n; i++) {
            addEdge(g, 0, i);
        }
        return g;
    }

    function completeBipartite(m, n) {
        const g = create(m + n);
        for (let i = 0; i < m; i++) {
            for (let j = m; j < m + n; j++) {
                addEdge(g, i, j);
            }
        }
        return g;
    }

    function empty(n) {
        return create(n);
    }

    // ============================================================
    // CONNECTIVITY
    // ============================================================

    function bfs(g, start, visited = new Set()) {
        const component = [];
        const queue = [start];
        visited.add(start);

        while (queue.length > 0) {
            const v = queue.shift();
            component.push(v);
            for (const u of g.adj[v]) {
                if (!visited.has(u)) {
                    visited.add(u);
                    queue.push(u);
                }
            }
        }
        return component;
    }

    function connectedComponents(g) {
        const visited = new Set();
        const components = [];

        for (let v = 0; v < g.n; v++) {
            if (!visited.has(v)) {
                components.push(bfs(g, v, visited));
            }
        }
        return components;
    }

    function isConnected(g) {
        if (g.n === 0) return true;
        return bfs(g, 0).length === g.n;
    }

    // ============================================================
    // BLOCK-CUT DECOMPOSITION
    // ============================================================

    /**
     * Find articulation points (cut vertices) using Tarjan's algorithm
     */
    function findArticulationPoints(g) {
        const visited = new Set();
        const disc = new Array(g.n).fill(0);
        const low = new Array(g.n).fill(0);
        const parent = new Array(g.n).fill(-1);
        const ap = new Set();
        let time = 0;

        function dfs(u) {
            visited.add(u);
            disc[u] = low[u] = ++time;
            let children = 0;

            for (const v of g.adj[u]) {
                if (!visited.has(v)) {
                    children++;
                    parent[v] = u;
                    dfs(v);

                    low[u] = Math.min(low[u], low[v]);

                    // u is an articulation point if:
                    // 1. u is root and has 2+ children
                    // 2. u is not root and low[v] >= disc[u]
                    if (parent[u] === -1 && children > 1) {
                        ap.add(u);
                    }
                    if (parent[u] !== -1 && low[v] >= disc[u]) {
                        ap.add(u);
                    }
                } else if (v !== parent[u]) {
                    low[u] = Math.min(low[u], disc[v]);
                }
            }
        }

        for (let v = 0; v < g.n; v++) {
            if (!visited.has(v)) {
                dfs(v);
            }
        }

        return Array.from(ap);
    }

    /**
     * Find 2-connected components (blocks)
     * Returns array of edge sets, each representing a block
     */
    function findBlocks(g) {
        const visited = new Set();
        const disc = new Array(g.n).fill(0);
        const low = new Array(g.n).fill(0);
        const parent = new Array(g.n).fill(-1);
        const edgeStack = [];
        const blocks = [];
        let time = 0;

        function dfs(u) {
            visited.add(u);
            disc[u] = low[u] = ++time;

            for (const v of g.adj[u]) {
                if (!visited.has(v)) {
                    parent[v] = u;
                    edgeStack.push([u, v]);
                    dfs(v);

                    low[u] = Math.min(low[u], low[v]);

                    // If u is an articulation point, pop edges for this block
                    if ((parent[u] === -1 && g.adj[u].size > 1) ||
                        (parent[u] !== -1 && low[v] >= disc[u])) {
                        const block = [];
                        while (edgeStack.length > 0) {
                            const edge = edgeStack.pop();
                            block.push(edge);
                            if (edge[0] === u && edge[1] === v) break;
                        }
                        if (block.length > 0) blocks.push(block);
                    }
                } else if (v !== parent[u] && disc[v] < disc[u]) {
                    edgeStack.push([u, v]);
                    low[u] = Math.min(low[u], disc[v]);
                }
            }
        }

        for (let v = 0; v < g.n; v++) {
            if (!visited.has(v) && g.adj[v].size > 0) {
                dfs(v);
                // Remaining edges form last block
                if (edgeStack.length > 0) {
                    blocks.push([...edgeStack]);
                    edgeStack.length = 0;
                }
            }
        }

        return blocks;
    }

    /**
     * Build block-cut tree
     * Returns { blocks: [...], cutVertices: [...], tree: adjacency structure }
     */
    function blockCutTree(g) {
        const blocks = findBlocks(g);
        const cutVertices = new Set(findArticulationPoints(g));
        const isolatedVertices = [];

        // Find isolated vertices (no edges)
        for (let v = 0; v < g.n; v++) {
            if (g.adj[v].size === 0) {
                isolatedVertices.push(v);
            }
        }

        // Build block-cut tree
        // Nodes: blocks (indices 0 to blocks.length-1) and cut vertices (blocks.length + i)
        const blockNodes = blocks.map((edges, i) => ({
            type: 'block',
            index: i,
            edges: edges,
            vertices: new Set(edges.flat())
        }));

        const cutNodes = Array.from(cutVertices).map((v, i) => ({
            type: 'cut',
            index: blocks.length + i,
            vertex: v
        }));

        // Connect blocks to their cut vertices
        const treeAdj = [];
        const totalNodes = blocks.length + cutVertices.size;
        for (let i = 0; i < totalNodes; i++) treeAdj.push([]);

        cutNodes.forEach((cutNode, ci) => {
            blockNodes.forEach((blockNode, bi) => {
                if (blockNode.vertices.has(cutNode.vertex)) {
                    treeAdj[bi].push(cutNode.index);
                    treeAdj[cutNode.index].push(bi);
                }
            });
        });

        return {
            blocks: blockNodes,
            cutVertices: cutNodes,
            isolatedVertices,
            tree: treeAdj,
            numBlockNodes: blocks.length,
            numCutNodes: cutVertices.size
        };
    }

    // ============================================================
    // GRAPH CLASSIFICATION
    // ============================================================

    function is2Connected(g) {
        if (g.n < 2) return false;
        if (!isConnected(g)) return false;
        return findArticulationPoints(g).length === 0;
    }

    function isTree(g) {
        return isConnected(g) && numEdges(g) === g.n - 1;
    }

    function isCycle(g) {
        if (g.n < 3) return false;
        if (numEdges(g) !== g.n) return false;
        for (let v = 0; v < g.n; v++) {
            if (degree(g, v) !== 2) return false;
        }
        return isConnected(g);
    }

    function isComplete(g) {
        const expectedEdges = g.n * (g.n - 1) / 2;
        return numEdges(g) === expectedEdges;
    }

    function isBipartite(g) {
        const color = new Array(g.n).fill(-1);

        for (let start = 0; start < g.n; start++) {
            if (color[start] !== -1) continue;

            const queue = [start];
            color[start] = 0;

            while (queue.length > 0) {
                const v = queue.shift();
                for (const u of g.adj[v]) {
                    if (color[u] === -1) {
                        color[u] = 1 - color[v];
                        queue.push(u);
                    } else if (color[u] === color[v]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // ============================================================
    // GRAPH OPERATIONS
    // ============================================================

    function disjointUnion(g1, g2) {
        const g = create(g1.n + g2.n);

        // Copy g1
        for (let u = 0; u < g1.n; u++) {
            for (const v of g1.adj[u]) {
                if (u < v) addEdge(g, u, v);
            }
        }

        // Copy g2 with shifted indices
        for (let u = 0; u < g2.n; u++) {
            for (const v of g2.adj[u]) {
                if (u < v) addEdge(g, u + g1.n, v + g1.n);
            }
        }

        return g;
    }

    function join(g1, g2) {
        const g = disjointUnion(g1, g2);

        // Add all edges between g1 and g2 vertices
        for (let u = 0; u < g1.n; u++) {
            for (let v = g1.n; v < g.n; v++) {
                addEdge(g, u, v);
            }
        }

        return g;
    }

    function inducedSubgraph(g, vertices) {
        const vertexSet = new Set(vertices);
        const indexMap = new Map();
        vertices.forEach((v, i) => indexMap.set(v, i));

        const sub = create(vertices.length);
        for (const u of vertices) {
            for (const v of g.adj[u]) {
                if (vertexSet.has(v) && u < v) {
                    addEdge(sub, indexMap.get(u), indexMap.get(v));
                }
            }
        }
        return sub;
    }

    function complement(g) {
        const gc = create(g.n);
        for (let u = 0; u < g.n; u++) {
            for (let v = u + 1; v < g.n; v++) {
                if (!hasEdge(g, u, v)) {
                    addEdge(gc, u, v);
                }
            }
        }
        return gc;
    }

    // ============================================================
    // CANONICAL FORM
    // ============================================================

    /**
     * Get canonical adjacency matrix (upper triangular, as binary string)
     * This is a simple but slow canonicalization - just tries all permutations for small graphs
     */
    function canonicalForm(g) {
        if (g.n > 8) {
            // For larger graphs, just return the adjacency matrix as-is
            // (proper canonicalization requires nauty or similar)
            return adjacencyBits(g);
        }

        // Try all permutations and take lexicographically smallest
        const perms = permutations(g.n);
        let minBits = adjacencyBits(g);

        for (const perm of perms) {
            const bits = adjacencyBitsPermuted(g, perm);
            if (bits < minBits) minBits = bits;
        }

        return minBits;
    }

    function adjacencyBits(g) {
        let bits = '';
        for (let i = 0; i < g.n; i++) {
            for (let j = i + 1; j < g.n; j++) {
                bits += hasEdge(g, i, j) ? '1' : '0';
            }
        }
        return bits;
    }

    function adjacencyBitsPermuted(g, perm) {
        let bits = '';
        for (let i = 0; i < g.n; i++) {
            for (let j = i + 1; j < g.n; j++) {
                bits += hasEdge(g, perm[i], perm[j]) ? '1' : '0';
            }
        }
        return bits;
    }

    function permutations(n) {
        if (n === 0) return [[]];
        if (n === 1) return [[0]];

        const result = [];
        const arr = Array.from({ length: n }, (_, i) => i);

        function permute(arr, l, r) {
            if (l === r) {
                result.push([...arr]);
            } else {
                for (let i = l; i <= r; i++) {
                    [arr[l], arr[i]] = [arr[i], arr[l]];
                    permute(arr, l + 1, r);
                    [arr[l], arr[i]] = [arr[i], arr[l]];
                }
            }
        }

        permute(arr, 0, n - 1);
        return result;
    }

    // ============================================================
    // STRING REPRESENTATIONS
    // ============================================================

    function toString(g) {
        const edgeList = edges(g).map(([u, v]) => `${u}-${v}`).join(', ');
        return `Graph(n=${g.n}, edges=[${edgeList}])`;
    }

    function toAdjacencyMatrix(g) {
        const matrix = [];
        for (let i = 0; i < g.n; i++) {
            const row = [];
            for (let j = 0; j < g.n; j++) {
                row.push(hasEdge(g, i, j) ? 1 : 0);
            }
            matrix.push(row);
        }
        return matrix;
    }

    function fromEdgeList(n, edgeList) {
        const g = create(n);
        for (const [u, v] of edgeList) {
            addEdge(g, u, v);
        }
        return g;
    }

    // ============================================================
    // EXPORT
    // ============================================================

    return {
        // Creation
        create,
        copy,
        addVertex,
        addEdge,
        removeEdge,
        hasEdge,
        degree,
        edges,
        numEdges,
        neighbors,

        // Common graphs
        complete,
        path,
        cycle,
        star,
        completeBipartite,
        empty,

        // Connectivity
        bfs,
        connectedComponents,
        isConnected,

        // Block-cut decomposition
        findArticulationPoints,
        findBlocks,
        blockCutTree,

        // Classification
        is2Connected,
        isTree,
        isCycle,
        isComplete,
        isBipartite,

        // Operations
        disjointUnion,
        join,
        inducedSubgraph,
        complement,

        // Canonical form
        canonicalForm,

        // String representations
        toString,
        toAdjacencyMatrix,
        fromEdgeList
    };
})();

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Graph;
}
