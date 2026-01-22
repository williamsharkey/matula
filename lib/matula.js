/**
 * Matula Numbers Library
 *
 * Core functions for the bijection between positive integers and rooted trees.
 * Named after David W. Matula who discovered this elegant correspondence.
 *
 * The bijection:
 *   - 1 ↔ single node (leaf)
 *   - n > 1 ↔ tree whose children are trees for prime factorization of n
 *   - prime(k) ↔ tree with single child that is tree for k
 */

const Matula = (function() {
    'use strict';

    // ============================================================
    // PRIME UTILITIES
    // ============================================================

    const primeCache = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const isPrimeCache = new Map();

    function isPrime(n) {
        if (n < 2) return false;
        if (n === 2) return true;
        if (n % 2 === 0) return false;
        if (isPrimeCache.has(n)) return isPrimeCache.get(n);

        const sqrt = Math.sqrt(n);
        for (let i = 3; i <= sqrt; i += 2) {
            if (n % i === 0) {
                isPrimeCache.set(n, false);
                return false;
            }
        }
        isPrimeCache.set(n, true);
        return true;
    }

    function nthPrime(n) {
        if (n <= 0) throw new Error('Prime index must be positive');

        while (primeCache.length < n) {
            let candidate = primeCache[primeCache.length - 1] + 2;
            while (!isPrime(candidate)) candidate += 2;
            primeCache.push(candidate);
        }
        return primeCache[n - 1];
    }

    function primeIndex(p) {
        if (!isPrime(p)) throw new Error(`${p} is not prime`);

        // Ensure cache has this prime
        while (primeCache[primeCache.length - 1] < p) {
            let candidate = primeCache[primeCache.length - 1] + 2;
            while (!isPrime(candidate)) candidate += 2;
            primeCache.push(candidate);
        }
        return primeCache.indexOf(p) + 1;
    }

    function factorize(n) {
        if (n < 1) throw new Error('Cannot factorize non-positive integer');
        if (n === 1) return [];

        const factors = [];
        let remaining = n;

        for (let p = 2; p * p <= remaining; p++) {
            while (remaining % p === 0) {
                factors.push(p);
                remaining /= p;
            }
        }
        if (remaining > 1) factors.push(remaining);

        return factors;
    }

    // ============================================================
    // TREE DATA STRUCTURE
    // ============================================================

    /**
     * Tree node: { children: [Tree] }
     * Leaf: { children: [] }
     */
    function makeTree(children = []) {
        return { children: children.slice() };
    }

    function isLeaf(tree) {
        return tree.children.length === 0;
    }

    function treeDepth(tree) {
        if (isLeaf(tree)) return 0;
        return 1 + Math.max(...tree.children.map(treeDepth));
    }

    function treeSize(tree) {
        return 1 + tree.children.reduce((sum, c) => sum + treeSize(c), 0);
    }

    function treesEqual(t1, t2) {
        if (t1.children.length !== t2.children.length) return false;
        const sorted1 = t1.children.slice().sort((a, b) => treeToInteger(a) - treeToInteger(b));
        const sorted2 = t2.children.slice().sort((a, b) => treeToInteger(a) - treeToInteger(b));
        return sorted1.every((c, i) => treesEqual(c, sorted2[i]));
    }

    // ============================================================
    // MATULA BIJECTION: Integer ↔ Tree
    // ============================================================

    const integerToTreeCache = new Map();
    const treeToIntegerCache = new Map();

    function integerToTree(n) {
        if (n < 1) throw new Error('Matula numbers are positive integers');
        if (integerToTreeCache.has(n)) return integerToTreeCache.get(n);

        let tree;
        if (n === 1) {
            tree = makeTree([]);
        } else {
            const factors = factorize(n);
            const children = factors.map(p => integerToTree(primeIndex(p)));
            tree = makeTree(children);
        }

        integerToTreeCache.set(n, tree);
        return tree;
    }

    function treeToInteger(tree) {
        const key = treeToString(tree);
        if (treeToIntegerCache.has(key)) return treeToIntegerCache.get(key);

        let n;
        if (isLeaf(tree)) {
            n = 1;
        } else {
            n = tree.children.reduce((product, child) => {
                return product * nthPrime(treeToInteger(child));
            }, 1);
        }

        treeToIntegerCache.set(key, n);
        return n;
    }

    // ============================================================
    // TREE STRING REPRESENTATIONS
    // ============================================================

    function treeToString(tree, style = 'parens') {
        if (style === 'parens') {
            if (isLeaf(tree)) return 'o';
            const childStrs = tree.children
                .map(c => treeToString(c, style))
                .sort()
                .join(' ');
            return `(${childStrs})`;
        } else if (style === 'nested') {
            if (isLeaf(tree)) return '[]';
            return '[' + tree.children.map(c => treeToString(c, 'nested')).sort().join(',') + ']';
        }
        throw new Error(`Unknown style: ${style}`);
    }

    function stringToTree(str) {
        str = str.trim();
        if (str === 'o' || str === '[]') return makeTree([]);

        if (str.startsWith('(') && str.endsWith(')')) {
            const inner = str.slice(1, -1).trim();
            if (inner === '') return makeTree([makeTree([])]);

            const children = parseChildren(inner, '(', ')');
            return makeTree(children.map(stringToTree));
        }

        if (str.startsWith('[') && str.endsWith(']')) {
            const inner = str.slice(1, -1);
            if (inner === '') return makeTree([]);

            const children = parseChildren(inner, '[', ']');
            return makeTree(children.map(stringToTree));
        }

        throw new Error(`Cannot parse tree string: ${str}`);
    }

    function parseChildren(str, open, close) {
        const children = [];
        let depth = 0;
        let current = '';

        for (const char of str) {
            if (char === open) {
                depth++;
                current += char;
            } else if (char === close) {
                depth--;
                current += char;
            } else if ((char === ' ' || char === ',') && depth === 0) {
                if (current.trim()) children.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        if (current.trim()) children.push(current.trim());

        return children;
    }

    // ============================================================
    // TREE OPERATIONS (with graph meaning)
    // ============================================================

    /**
     * Wrap: M → prime(M)
     * Graph meaning: Connect structures at a cut vertex
     */
    function wrap(n) {
        return nthPrime(n);
    }

    /**
     * Unwrap: prime(M) → M (only if M is prime)
     * Graph meaning: Disconnect at cut vertex
     */
    function unwrap(n) {
        if (!isPrime(n)) throw new Error(`Cannot unwrap composite ${n}`);
        return primeIndex(n);
    }

    /**
     * Multiply: disjoint union of structures
     */
    function disjointUnion(...numbers) {
        return numbers.reduce((a, b) => a * b, 1);
    }

    /**
     * Get components (prime factorization)
     */
    function components(n) {
        return factorize(n).map(primeIndex);
    }

    /**
     * Check if Matula represents a connected graph (in our encoding)
     * Connected graphs have prime Matula (single child at root)
     */
    function isConnectedEncoding(n) {
        return isPrime(n);
    }

    // ============================================================
    // SEQUENCE GENERATION
    // ============================================================

    function generateMatulaSequence(maxN) {
        const sequence = [];
        for (let n = 1; n <= maxN; n++) {
            const tree = integerToTree(n);
            sequence.push({
                n,
                tree: treeToString(tree),
                depth: treeDepth(tree),
                size: treeSize(tree),
                isPrime: isPrime(n)
            });
        }
        return sequence;
    }

    function findByTreeProperty(maxN, predicate) {
        const results = [];
        for (let n = 1; n <= maxN; n++) {
            const tree = integerToTree(n);
            if (predicate(tree, n)) {
                results.push(n);
            }
        }
        return results;
    }

    // ============================================================
    // INTERESTING SEQUENCES
    // ============================================================

    // Trees with exactly k nodes
    function treesWithSize(maxN, size) {
        return findByTreeProperty(maxN, tree => treeSize(tree) === size);
    }

    // Trees with depth exactly k
    function treesWithDepth(maxN, depth) {
        return findByTreeProperty(maxN, tree => treeDepth(tree) === depth);
    }

    // Path trees (linear chains)
    function pathTrees(maxN) {
        return findByTreeProperty(maxN, tree => {
            let current = tree;
            while (!isLeaf(current)) {
                if (current.children.length !== 1) return false;
                current = current.children[0];
            }
            return true;
        });
    }

    // Star trees (one node with many leaf children)
    function starTrees(maxN) {
        return findByTreeProperty(maxN, tree => {
            if (isLeaf(tree)) return true;
            return tree.children.every(isLeaf);
        });
    }

    // Binary trees (each node has 0 or 2 children)
    function binaryTrees(maxN) {
        return findByTreeProperty(maxN, tree => {
            function isBinary(t) {
                if (isLeaf(t)) return true;
                if (t.children.length !== 2) return false;
                return t.children.every(isBinary);
            }
            return isBinary(tree);
        });
    }

    // ============================================================
    // VISUALIZATION HELPERS
    // ============================================================

    function treeToAscii(tree, prefix = '', isLast = true) {
        const connector = isLast ? '└── ' : '├── ';
        const extension = isLast ? '    ' : '│   ';

        let result = prefix + (prefix ? connector : '') + '●\n';

        tree.children.forEach((child, i) => {
            const childIsLast = i === tree.children.length - 1;
            result += treeToAscii(child, prefix + (prefix ? extension : ''), childIsLast);
        });

        return result;
    }

    function treeToSVGData(tree, x = 0, y = 0, level = 0) {
        const nodeRadius = 8;
        const levelHeight = 40;
        const siblingSpacing = 30;

        const nodes = [];
        const edges = [];

        function layout(t, x, y, level) {
            nodes.push({ x, y, level });

            if (t.children.length === 0) return { width: siblingSpacing };

            let totalWidth = 0;
            const childLayouts = t.children.map(child => {
                const childLayout = layout(
                    child,
                    x + totalWidth,
                    y + levelHeight,
                    level + 1
                );
                totalWidth += childLayout.width;
                return childLayout;
            });

            // Center parent over children
            const parentX = x + totalWidth / 2 - siblingSpacing / 2;
            nodes[nodes.length - t.children.length - 1].x = parentX;

            // Add edges
            t.children.forEach((_, i) => {
                const childNode = nodes[nodes.length - t.children.length + i];
                edges.push({
                    x1: parentX,
                    y1: y,
                    x2: childNode.x,
                    y2: childNode.y
                });
            });

            return { width: Math.max(totalWidth, siblingSpacing) };
        }

        layout(tree, x, y, level);
        return { nodes, edges, nodeRadius };
    }

    // ============================================================
    // EXPORT
    // ============================================================

    return {
        // Prime utilities
        isPrime,
        nthPrime,
        primeIndex,
        factorize,

        // Tree operations
        makeTree,
        isLeaf,
        treeDepth,
        treeSize,
        treesEqual,

        // Bijection
        integerToTree,
        treeToInteger,

        // String conversion
        treeToString,
        stringToTree,

        // Operations with graph meaning
        wrap,
        unwrap,
        disjointUnion,
        components,
        isConnectedEncoding,

        // Sequences
        generateMatulaSequence,
        findByTreeProperty,
        treesWithSize,
        treesWithDepth,
        pathTrees,
        starTrees,
        binaryTrees,

        // Visualization
        treeToAscii,
        treeToSVGData
    };
})();

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Matula;
}
