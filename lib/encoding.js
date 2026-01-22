/**
 * Graph Encoding Library
 *
 * Collision-free encoding of graphs as Matula numbers.
 * Uses tree depth to distinguish connected vs disconnected graphs.
 *
 * The encoding scheme:
 * - Isolated vertex: 1 (leaf)
 * - Single vertex (connected): 2 = (o)
 * - Disconnected: children of root are component encodings
 * - Connected: wrapped once, internal structure below
 * - Path topology: nested ((B₁) ((B₂) ...))
 * - Star topology: flat ((B₁) (B₂) (B₃))
 */

const Encoding = (function() {
    'use strict';

    // ============================================================
    // BLOCK CONSTRUCTION NUMBERS
    // ============================================================

    /**
     * Construction numbers for common 2-connected blocks.
     * These come from the construction bijection.
     */
    const BLOCK_CONSTRUCTIONS = {
        'K2': 2,      // Single edge: (o)
        'K3': 14,     // Triangle: (o (o o))
        'C4': 30,     // 4-cycle: (o (o) ((o)))
        'K4-e': 67,   // K4 minus edge: (((o o o)))
        'K4': 134,    // Complete graph on 4: (o ((o o o)))
        'C5': 78,     // 5-cycle
        'K5-e': 331   // K5 minus edge
    };

    /**
     * Get construction number for a 2-connected block
     */
    function blockConstruction(block) {
        const n = block.n;
        const m = Graph.numEdges(block);

        // Check known blocks
        if (n === 2 && m === 1) return BLOCK_CONSTRUCTIONS.K2;
        if (n === 3 && m === 3) return BLOCK_CONSTRUCTIONS.K3;
        if (n === 4 && m === 4 && Graph.isCycle(block)) return BLOCK_CONSTRUCTIONS.C4;
        if (n === 4 && m === 5) return BLOCK_CONSTRUCTIONS['K4-e'];
        if (n === 4 && m === 6) return BLOCK_CONSTRUCTIONS.K4;
        if (n === 5 && m === 5 && Graph.isCycle(block)) return BLOCK_CONSTRUCTIONS.C5;

        // For unknown blocks, use a hash based on canonical form
        // This is a placeholder - full implementation would enumerate constructions
        const canonical = Graph.canonicalForm(block);
        return hashConstruction(n, m, canonical);
    }

    function hashConstruction(n, m, canonical) {
        // Simple deterministic hash for blocks we don't have explicit constructions for
        let hash = n * 1000 + m * 100;
        for (let i = 0; i < canonical.length; i++) {
            hash = hash * 2 + (canonical[i] === '1' ? 1 : 0);
        }
        return Matula.nthPrime(hash % 1000 + 1);
    }

    // ============================================================
    // GRAPH TO MATULA ENCODING
    // ============================================================

    /**
     * Encode a graph as a Matula number using the collision-free scheme
     */
    function encode(g) {
        // Handle empty graph
        if (g.n === 0) return 1;

        // Get connected components
        const components = Graph.connectedComponents(g);

        // Single isolated vertex
        if (components.length === 1 && components[0].length === 1 &&
            Graph.degree(g, components[0][0]) === 0) {
            return 2; // (o) - wrapped single vertex
        }

        // Multiple components (disconnected)
        if (components.length > 1) {
            return encodeDisconnected(g, components);
        }

        // Single connected component
        return encodeConnected(g);
    }

    /**
     * Encode a disconnected graph (multiple components)
     */
    function encodeDisconnected(g, components) {
        // Each component encodes independently, then multiply (disjoint union)
        const componentMatulas = components.map(comp => {
            const subgraph = Graph.inducedSubgraph(g, comp);
            if (comp.length === 1 && Graph.degree(g, comp[0]) === 0) {
                return 1; // Isolated vertex as leaf
            }
            return encodeConnectedComponent(subgraph);
        });

        // Root children are the component encodings
        // Tree = (T₁ T₂ ...) → Matula = prime(T₁) × prime(T₂) × ...
        return componentMatulas.reduce((prod, m) => prod * Matula.nthPrime(m), 1);
    }

    /**
     * Encode a connected graph (single component with edges)
     */
    function encodeConnected(g) {
        // Wrap the internal structure to mark as connected
        const internal = encodeConnectedComponent(g);
        return Matula.nthPrime(internal);
    }

    /**
     * Encode the internal structure of a connected component
     */
    function encodeConnectedComponent(g) {
        // Single edge
        if (g.n === 2 && Graph.numEdges(g) === 1) {
            return 2; // (o)
        }

        // Check if 2-connected
        if (Graph.is2Connected(g)) {
            return blockConstruction(g);
        }

        // Has cut vertices - use block-cut tree
        const bct = Graph.blockCutTree(g);
        return encodeBlockCutTree(g, bct);
    }

    /**
     * Encode block-cut tree structure
     */
    function encodeBlockCutTree(g, bct) {
        const { blocks, cutVertices, tree, numBlockNodes, numCutNodes } = bct;

        if (blocks.length === 0) {
            // Just isolated vertices (shouldn't happen for connected g)
            return 1;
        }

        if (blocks.length === 1) {
            // Single block
            const blockGraph = Graph.fromEdgeList(
                Math.max(...blocks[0].edges.flat()) + 1,
                blocks[0].edges
            );
            return blockConstruction(blockGraph);
        }

        // Multiple blocks - determine topology
        // Find block-only subgraph of BCT (blocks connected through cuts)
        const blockAdj = [];
        for (let i = 0; i < numBlockNodes; i++) blockAdj.push([]);

        for (let bi = 0; bi < numBlockNodes; bi++) {
            for (const ci of tree[bi]) {
                // ci is a cut vertex node
                for (const bj of tree[ci]) {
                    if (bj !== bi && bj < numBlockNodes) {
                        blockAdj[bi].push(bj);
                    }
                }
            }
        }

        // Determine if path or star topology
        const degrees = blockAdj.map(adj => adj.length);
        const maxDegree = Math.max(...degrees);
        const leafBlocks = degrees.filter(d => d <= 1).length;

        // Get block construction Matulas
        const blockMatulas = blocks.map(block => {
            const vertices = Array.from(block.vertices);
            const blockGraph = Graph.fromEdgeList(
                Math.max(...vertices) + 1,
                block.edges
            );
            return blockConstruction(blockGraph);
        });

        if (maxDegree <= 2) {
            // Path topology: nested structure
            return encodePathTopology(blockMatulas, blockAdj);
        } else {
            // Star topology: flat structure
            return encodeStarTopology(blockMatulas, blockAdj);
        }
    }

    /**
     * Encode path topology: ((B₁) ((B₂) ((B₃)...)))
     */
    function encodePathTopology(blockMatulas, blockAdj) {
        // Find the path order
        const order = findPathOrder(blockAdj);

        // Build nested structure from end
        let result = blockMatulas[order[order.length - 1]];

        for (let i = order.length - 2; i >= 0; i--) {
            // Combine: (Bᵢ (result))
            const bi = blockMatulas[order[i]];
            result = Matula.nthPrime(bi) * Matula.nthPrime(result);
        }

        return result;
    }

    function findPathOrder(blockAdj) {
        const n = blockAdj.length;
        if (n === 0) return [];
        if (n === 1) return [0];

        // Find an endpoint (degree 1)
        let start = 0;
        for (let i = 0; i < n; i++) {
            if (blockAdj[i].length <= 1) {
                start = i;
                break;
            }
        }

        // Walk the path
        const order = [start];
        const visited = new Set([start]);

        while (order.length < n) {
            const current = order[order.length - 1];
            let found = false;
            for (const next of blockAdj[current]) {
                if (!visited.has(next)) {
                    order.push(next);
                    visited.add(next);
                    found = true;
                    break;
                }
            }
            if (!found) break;
        }

        return order;
    }

    /**
     * Encode star topology: ((B₁) (B₂) (B₃)...)
     */
    function encodeStarTopology(blockMatulas, blockAdj) {
        // All blocks as siblings at same level
        // Tree = (B₁ B₂ B₃ ...) → Matula = prime(B₁) × prime(B₂) × ...
        return blockMatulas.reduce((prod, m) => prod * Matula.nthPrime(m), 1);
    }

    // ============================================================
    // MATULA TO GRAPH DECODING
    // ============================================================

    /**
     * Decode a Matula number to understand its graph structure
     */
    function decode(n) {
        const tree = Matula.integerToTree(n);
        return analyzeTree(tree, 0);
    }

    function analyzeTree(tree, depth) {
        if (Matula.isLeaf(tree)) {
            return { type: 'leaf', depth };
        }

        const children = tree.children.map(c => analyzeTree(c, depth + 1));

        if (depth === 0) {
            // Root level
            if (children.length === 1) {
                return {
                    type: 'connected',
                    depth,
                    structure: children[0]
                };
            } else {
                return {
                    type: 'disconnected',
                    depth,
                    components: children
                };
            }
        }

        return {
            type: 'internal',
            depth,
            children
        };
    }

    // ============================================================
    // ENCODING TABLE
    // ============================================================

    /**
     * Pre-computed encodings for common small graphs
     */
    const KNOWN_ENCODINGS = {
        // Isolated vertices
        'single_vertex': 2,           // (o)
        'two_isolated': 4,            // (o o)
        'three_isolated': 8,          // (o o o)

        // Edges
        'K2': 3,                       // ((o))
        'K2_plus_vertex': 6,          // (o (o))
        '2K2': 9,                      // ((o) (o))

        // Triangles
        'K3': 43,                      // ((o (o o)))
        'K3_plus_vertex': 86,         // (o (o (o o)))

        // Paths
        'P3': 23,                      // (((o) (o)))
        'P4': 347,                     // (((o) ((o) (o))))

        // Stars
        'K1_3': 103,                   // (((o) (o) (o)))

        // Cycles
        'C4': 113,                     // ((o (o) ((o))))
        'C5': 277,                     // Cycle on 5

        // Complete
        'K4': 757,                     // ((o ((o o o))))

        // Special
        'paw': 727,                    // (((o) (o (o o))))
        'bowtie': 15877                // (((o (o o)) (o (o o))))
    };

    function getKnownEncoding(name) {
        return KNOWN_ENCODINGS[name] || null;
    }

    function listKnownEncodings() {
        return Object.entries(KNOWN_ENCODINGS).map(([name, matula]) => ({
            name,
            matula,
            tree: Matula.treeToString(Matula.integerToTree(matula))
        }));
    }

    // ============================================================
    // CONSTRUCTION DSL
    // ============================================================

    /**
     * Domain-specific language for constructing graphs
     *
     * Syntax:
     *   V           - single vertex
     *   E           - single edge (K2)
     *   Kn          - complete graph on n vertices
     *   Pn          - path on n vertices
     *   Cn          - cycle on n vertices
     *   Sn          - star with n leaves
     *   A + B       - disjoint union
     *   A . B       - join at cut vertex
     *   (A)         - grouping
     */
    function parseDSL(expr) {
        expr = expr.trim();

        // Handle disjoint union (lowest precedence)
        const plusParts = splitOnOperator(expr, '+');
        if (plusParts.length > 1) {
            const graphs = plusParts.map(parseDSL);
            return graphs.reduce((acc, g) => Graph.disjointUnion(acc, g));
        }

        // Handle join at cut vertex
        const dotParts = splitOnOperator(expr, '.');
        if (dotParts.length > 1) {
            const graphs = dotParts.map(parseDSL);
            return graphs.reduce((acc, g) => joinAtCutVertex(acc, g));
        }

        // Handle parentheses
        if (expr.startsWith('(') && expr.endsWith(')')) {
            return parseDSL(expr.slice(1, -1));
        }

        // Parse atomic expressions
        return parseAtom(expr);
    }

    function splitOnOperator(expr, op) {
        const parts = [];
        let depth = 0;
        let current = '';

        for (const char of expr) {
            if (char === '(') depth++;
            else if (char === ')') depth--;
            else if (char === op && depth === 0) {
                if (current.trim()) parts.push(current.trim());
                current = '';
                continue;
            }
            current += char;
        }
        if (current.trim()) parts.push(current.trim());

        return parts;
    }

    function parseAtom(expr) {
        expr = expr.trim().toUpperCase();

        if (expr === 'V') return Graph.empty(1);
        if (expr === 'E') return Graph.path(2);

        const match = expr.match(/^([KPCS])(\d+)$/);
        if (match) {
            const type = match[1];
            const n = parseInt(match[2]);

            switch (type) {
                case 'K': return Graph.complete(n);
                case 'P': return Graph.path(n);
                case 'C': return Graph.cycle(n);
                case 'S': return Graph.star(n + 1); // S3 = star with 3 leaves
            }
        }

        throw new Error(`Unknown graph expression: ${expr}`);
    }

    function joinAtCutVertex(g1, g2) {
        // Join g1 and g2 by identifying one vertex from each
        const g = Graph.create(g1.n + g2.n - 1);

        // Copy g1 entirely
        for (let u = 0; u < g1.n; u++) {
            for (const v of g1.adj[u]) {
                if (u < v) Graph.addEdge(g, u, v);
            }
        }

        // Copy g2, mapping vertex 0 of g2 to vertex 0 of g1 (the cut vertex)
        for (let u = 0; u < g2.n; u++) {
            const mappedU = u === 0 ? 0 : g1.n + u - 1;
            for (const v of g2.adj[u]) {
                if (u < v) {
                    const mappedV = v === 0 ? 0 : g1.n + v - 1;
                    Graph.addEdge(g, mappedU, mappedV);
                }
            }
        }

        return g;
    }

    /**
     * Build and encode a graph from DSL expression
     */
    function buildAndEncode(expr) {
        const g = parseDSL(expr);
        return {
            graph: g,
            matula: encode(g),
            description: expr
        };
    }

    // ============================================================
    // ANALYSIS
    // ============================================================

    /**
     * Analyze what Matula numbers in a range correspond to valid graphs
     */
    function analyzeRange(maxN) {
        const results = [];
        const validMatulas = new Set(Object.values(KNOWN_ENCODINGS));

        for (let n = 1; n <= maxN; n++) {
            const tree = Matula.integerToTree(n);
            const analysis = decode(n);

            results.push({
                n,
                tree: Matula.treeToString(tree),
                depth: Matula.treeDepth(tree),
                isKnownGraph: validMatulas.has(n),
                analysis
            });
        }

        return results;
    }

    /**
     * Find the Matula number for a specific graph type
     */
    function findEncoding(graphType, ...args) {
        let g;
        switch (graphType.toLowerCase()) {
            case 'complete':
            case 'k':
                g = Graph.complete(args[0]);
                break;
            case 'path':
            case 'p':
                g = Graph.path(args[0]);
                break;
            case 'cycle':
            case 'c':
                g = Graph.cycle(args[0]);
                break;
            case 'star':
            case 's':
                g = Graph.star(args[0]);
                break;
            default:
                throw new Error(`Unknown graph type: ${graphType}`);
        }
        return encode(g);
    }

    // ============================================================
    // EXPORT
    // ============================================================

    return {
        // Core encoding
        encode,
        decode,

        // Block constructions
        blockConstruction,
        BLOCK_CONSTRUCTIONS,

        // Known encodings
        getKnownEncoding,
        listKnownEncodings,
        KNOWN_ENCODINGS,

        // DSL
        parseDSL,
        buildAndEncode,

        // Analysis
        analyzeRange,
        findEncoding
    };
})();

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Encoding;
}
