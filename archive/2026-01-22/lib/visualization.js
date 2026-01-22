/**
 * Visualization Library
 *
 * SVG-based rendering for trees and graphs.
 * Inspired by williamsharkey.com/MatulaExplorer with extensions for graph encoding.
 */

const Visualization = (function() {
    'use strict';

    // ============================================================
    // CONFIGURATION
    // ============================================================

    const DEFAULT_CONFIG = {
        nodeRadius: 12,
        levelHeight: 50,
        siblingSpacing: 35,
        fontSize: 11,
        colors: {
            node: '#4a90d9',
            nodeHover: '#66b3ff',
            nodeDrag: '#00ffff',
            nodeTarget: '#ff99cc',
            edge: '#666',
            text: '#fff',
            leaf: '#7cb342',
            root: '#333',
            redNode: '#e53935',      // For topology/construction boundary
            blueNode: '#1e88e5',     // For construction nodes
            background: '#fafafa'
        }
    };

    // ============================================================
    // TREE UTILITIES
    // ============================================================

    /**
     * Deep clone a tree (needed because Matula caches return same objects)
     */
    function cloneTree(tree) {
        return {
            children: tree.children.map(child => cloneTree(child))
        };
    }

    /**
     * Assign unique IDs to all nodes in a tree for layout tracking
     */
    let nodeIdCounter = 0;
    function assignIds(tree) {
        tree._id = nodeIdCounter++;
        for (const child of tree.children) {
            assignIds(child);
        }
        return tree;
    }

    // ============================================================
    // TREE LAYOUT
    // ============================================================

    /**
     * Compute layout positions for a tree
     * Uses Reingold-Tilford style algorithm
     */
    function layoutTree(tree, config = {}) {
        const cfg = { ...DEFAULT_CONFIG, ...config };
        const positions = new Map(); // keyed by node._id
        let nextX = 0;

        function layout(node, x, y, depth) {
            const isLeaf = node.children.length === 0;
            if (isLeaf) {
                positions.set(node._id, { x: x + cfg.siblingSpacing / 2, y, depth, node });
                return cfg.siblingSpacing;
            }

            let childX = x;
            const childWidths = [];

            for (const child of node.children) {
                const w = layout(child, childX, y + cfg.levelHeight, depth + 1);
                childWidths.push(w);
                childX += w;
            }

            // Center parent over children
            const totalWidth = childWidths.reduce((a, b) => a + b, 0);
            const firstChildPos = positions.get(node.children[0]._id);
            const lastChildPos = positions.get(node.children[node.children.length - 1]._id);
            const centerX = (firstChildPos.x + lastChildPos.x) / 2;

            positions.set(node._id, { x: centerX, y, depth, node });
            return totalWidth;
        }

        layout(tree, 0, cfg.nodeRadius + 10, 0);
        return positions;
    }

    /**
     * Get bounding box for laid out tree
     */
    function getBounds(positions, config = {}) {
        const cfg = { ...DEFAULT_CONFIG, ...config };
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (const pos of positions.values()) {
            minX = Math.min(minX, pos.x);
            maxX = Math.max(maxX, pos.x);
            minY = Math.min(minY, pos.y);
            maxY = Math.max(maxY, pos.y);
        }

        return {
            x: minX - cfg.nodeRadius - 10,
            y: minY - cfg.nodeRadius - 10,
            width: maxX - minX + 2 * cfg.nodeRadius + 20,
            height: maxY - minY + 2 * cfg.nodeRadius + 20
        };
    }

    // ============================================================
    // TREE RENDERING
    // ============================================================

    /**
     * Render tree to SVG element
     */
    function renderTree(tree, container, options = {}) {
        const config = { ...DEFAULT_CONFIG, ...options };

        // Clone tree and assign unique IDs (needed because Matula caches objects)
        const clonedTree = cloneTree(tree);
        assignIds(clonedTree);

        const positions = layoutTree(clonedTree, config);
        const bounds = getBounds(positions, config);

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', bounds.width);
        svg.setAttribute('height', bounds.height);
        svg.setAttribute('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
        svg.style.display = 'block';
        svg.style.margin = '0 auto';

        // Draw edges first
        const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        edgeGroup.setAttribute('class', 'edges');
        drawEdges(clonedTree, positions, edgeGroup, config);
        svg.appendChild(edgeGroup);

        // Draw nodes
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.setAttribute('class', 'nodes');
        drawNodes(clonedTree, positions, nodeGroup, config, options);
        svg.appendChild(nodeGroup);

        // Clear container and add SVG
        container.innerHTML = '';
        container.appendChild(svg);

        return { svg, positions, bounds };
    }

    function drawEdges(node, positions, group, config) {
        const parentPos = positions.get(node._id);

        for (const child of node.children) {
            const childPos = positions.get(child._id);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', parentPos.x);
            line.setAttribute('y1', parentPos.y);
            line.setAttribute('x2', childPos.x);
            line.setAttribute('y2', childPos.y);
            line.setAttribute('stroke', config.colors.edge);
            line.setAttribute('stroke-width', 2);
            group.appendChild(line);

            drawEdges(child, positions, group, config);
        }
    }

    function drawNodes(node, positions, group, config, options) {
        const pos = positions.get(node._id);
        const isLeaf = node.children.length === 0;
        const matula = Matula.treeToInteger(node);

        // Determine node color
        let fillColor = config.colors.node;
        if (options.colorByDepth && options.redLevel !== undefined) {
            if (pos.depth < options.redLevel) {
                fillColor = config.colors.root;
            } else if (pos.depth === options.redLevel) {
                fillColor = config.colors.redNode;
            } else {
                fillColor = config.colors.blueNode;
            }
        } else if (isLeaf) {
            fillColor = config.colors.leaf;
        }

        // Create group for node
        const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeG.setAttribute('class', 'node');
        nodeG.setAttribute('data-matula', matula);
        nodeG.style.cursor = 'pointer';

        // Circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pos.x);
        circle.setAttribute('cy', pos.y);
        circle.setAttribute('r', config.nodeRadius);
        circle.setAttribute('fill', fillColor);
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', 1.5);
        nodeG.appendChild(circle);

        // Label
        if (options.showLabels !== false) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', pos.x);
            text.setAttribute('y', pos.y + 4);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', config.fontSize);
            text.setAttribute('font-family', 'monospace');
            text.setAttribute('fill', config.colors.text);
            text.setAttribute('pointer-events', 'none');
            text.textContent = matula;
            nodeG.appendChild(text);
        }

        // Hover effects
        nodeG.addEventListener('mouseenter', () => {
            circle.setAttribute('fill', config.colors.nodeHover);
        });
        nodeG.addEventListener('mouseleave', () => {
            circle.setAttribute('fill', fillColor);
        });

        group.appendChild(nodeG);

        // Recurse for children
        for (const child of node.children) {
            drawNodes(child, positions, group, config, options);
        }
    }

    // ============================================================
    // GRAPH LAYOUT
    // ============================================================

    /**
     * Force-directed layout for graphs
     */
    function layoutGraph(g, config = {}) {
        const cfg = {
            width: 300,
            height: 300,
            iterations: 100,
            repulsion: 5000,
            attraction: 0.05,
            ...config
        };

        // Initialize positions randomly
        const positions = [];
        for (let i = 0; i < g.n; i++) {
            positions.push({
                x: cfg.width / 2 + (Math.random() - 0.5) * cfg.width * 0.5,
                y: cfg.height / 2 + (Math.random() - 0.5) * cfg.height * 0.5,
                vx: 0,
                vy: 0
            });
        }

        // Force simulation
        for (let iter = 0; iter < cfg.iterations; iter++) {
            // Repulsion between all pairs
            for (let i = 0; i < g.n; i++) {
                for (let j = i + 1; j < g.n; j++) {
                    const dx = positions[j].x - positions[i].x;
                    const dy = positions[j].y - positions[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;
                    const force = cfg.repulsion / (dist * dist);

                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;

                    positions[i].vx -= fx;
                    positions[i].vy -= fy;
                    positions[j].vx += fx;
                    positions[j].vy += fy;
                }
            }

            // Attraction along edges
            const edges = Graph.edges(g);
            for (const [u, v] of edges) {
                const dx = positions[v].x - positions[u].x;
                const dy = positions[v].y - positions[u].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const fx = dx * cfg.attraction;
                const fy = dy * cfg.attraction;

                positions[u].vx += fx;
                positions[u].vy += fy;
                positions[v].vx -= fx;
                positions[v].vy -= fy;
            }

            // Center gravity
            for (let i = 0; i < g.n; i++) {
                positions[i].vx += (cfg.width / 2 - positions[i].x) * 0.01;
                positions[i].vy += (cfg.height / 2 - positions[i].y) * 0.01;
            }

            // Apply velocities with damping
            const damping = 0.9 - iter * 0.005;
            for (let i = 0; i < g.n; i++) {
                positions[i].x += positions[i].vx * damping;
                positions[i].y += positions[i].vy * damping;
                positions[i].vx *= 0.8;
                positions[i].vy *= 0.8;

                // Keep in bounds
                positions[i].x = Math.max(30, Math.min(cfg.width - 30, positions[i].x));
                positions[i].y = Math.max(30, Math.min(cfg.height - 30, positions[i].y));
            }
        }

        return positions;
    }

    // ============================================================
    // GRAPH RENDERING
    // ============================================================

    /**
     * Render graph to SVG element
     */
    function renderGraph(g, container, options = {}) {
        const config = {
            width: options.width || 300,
            height: options.height || 300,
            nodeRadius: options.nodeRadius || 15,
            ...DEFAULT_CONFIG,
            ...options
        };

        const positions = options.positions || layoutGraph(g, config);

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', config.width);
        svg.setAttribute('height', config.height);
        svg.style.display = 'block';
        svg.style.margin = '0 auto';
        svg.style.background = config.colors.background;

        // Draw edges
        const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        for (const [u, v] of Graph.edges(g)) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', positions[u].x);
            line.setAttribute('y1', positions[u].y);
            line.setAttribute('x2', positions[v].x);
            line.setAttribute('y2', positions[v].y);
            line.setAttribute('stroke', config.colors.edge);
            line.setAttribute('stroke-width', 2);
            edgeGroup.appendChild(line);
        }
        svg.appendChild(edgeGroup);

        // Draw nodes
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        for (let i = 0; i < g.n; i++) {
            const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            nodeG.setAttribute('class', 'vertex');
            nodeG.setAttribute('data-vertex', i);

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', positions[i].x);
            circle.setAttribute('cy', positions[i].y);
            circle.setAttribute('r', config.nodeRadius);
            circle.setAttribute('fill', options.highlightVertices?.has(i) ?
                config.colors.redNode : config.colors.node);
            circle.setAttribute('stroke', '#333');
            circle.setAttribute('stroke-width', 1.5);
            nodeG.appendChild(circle);

            if (options.showLabels !== false) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', positions[i].x);
                text.setAttribute('y', positions[i].y + 4);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', config.fontSize);
                text.setAttribute('font-family', 'monospace');
                text.setAttribute('fill', config.colors.text);
                // Use custom label function if provided, otherwise use vertex index
                text.textContent = options.labelFn ? options.labelFn(i) : i;
                nodeG.appendChild(text);
            }

            nodeGroup.appendChild(nodeG);
        }
        svg.appendChild(nodeGroup);

        container.innerHTML = '';
        container.appendChild(svg);

        return { svg, positions };
    }

    // ============================================================
    // SIDE-BY-SIDE RENDERING
    // ============================================================

    /**
     * Render a graph alongside its Matula tree encoding
     */
    function renderGraphWithEncoding(g, container, options = {}) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '20px';
        wrapper.style.alignItems = 'flex-start';
        wrapper.style.justifyContent = 'center';
        wrapper.style.flexWrap = 'wrap';

        // Graph panel
        const graphPanel = document.createElement('div');
        graphPanel.innerHTML = '<div style="text-align:center;font-weight:bold;margin-bottom:8px">Graph</div>';
        const graphContainer = document.createElement('div');
        renderGraph(g, graphContainer, { width: 200, height: 200, ...options });
        graphPanel.appendChild(graphContainer);
        wrapper.appendChild(graphPanel);

        // Arrow
        const arrow = document.createElement('div');
        arrow.style.fontSize = '24px';
        arrow.style.alignSelf = 'center';
        arrow.style.padding = '20px';
        arrow.textContent = '→';
        wrapper.appendChild(arrow);

        // Tree panel
        const treePanel = document.createElement('div');
        const matula = Encoding.encode(g);
        const tree = Matula.integerToTree(matula);
        treePanel.innerHTML = `<div style="text-align:center;font-weight:bold;margin-bottom:8px">Matula ${matula}</div>`;
        const treeContainer = document.createElement('div');
        renderTree(tree, treeContainer, {
            colorByDepth: true,
            redLevel: 1,
            ...options
        });
        treePanel.appendChild(treeContainer);
        wrapper.appendChild(treePanel);

        // Info panel
        const infoPanel = document.createElement('div');
        infoPanel.style.padding = '10px';
        infoPanel.style.background = '#f5f5f5';
        infoPanel.style.borderRadius = '4px';
        infoPanel.style.fontSize = '12px';
        infoPanel.style.fontFamily = 'monospace';
        infoPanel.innerHTML = `
            <div><strong>Vertices:</strong> ${g.n}</div>
            <div><strong>Edges:</strong> ${Graph.numEdges(g)}</div>
            <div><strong>Connected:</strong> ${Graph.isConnected(g)}</div>
            <div><strong>Tree:</strong> ${Matula.treeToString(tree)}</div>
        `;
        wrapper.appendChild(infoPanel);

        container.innerHTML = '';
        container.appendChild(wrapper);
    }

    // ============================================================
    // INTERACTIVE TREE BUILDER
    // ============================================================

    /**
     * Create an interactive tree builder
     */
    function createTreeBuilder(container, onChange) {
        let currentTree = Matula.makeTree([]);
        let selectedNode = null;

        const wrapper = document.createElement('div');

        const toolbar = document.createElement('div');
        toolbar.style.marginBottom = '10px';
        toolbar.innerHTML = `
            <button id="addChild">Add Child</button>
            <button id="removeNode">Remove</button>
            <button id="wrapTree">Wrap (prime)</button>
            <button id="unwrapTree">Unwrap</button>
            <span id="matulaDisplay" style="margin-left:20px;font-family:monospace"></span>
        `;
        wrapper.appendChild(toolbar);

        const treeContainer = document.createElement('div');
        treeContainer.style.border = '1px solid #ccc';
        treeContainer.style.padding = '20px';
        treeContainer.style.minHeight = '200px';
        wrapper.appendChild(treeContainer);

        function render() {
            const matula = Matula.treeToInteger(currentTree);
            toolbar.querySelector('#matulaDisplay').textContent = `Matula: ${matula}`;

            const { svg, positions } = renderTree(currentTree, treeContainer, {
                showLabels: true
            });

            // Add click handlers to nodes
            svg.querySelectorAll('.node').forEach(nodeEl => {
                nodeEl.addEventListener('click', (e) => {
                    const m = parseInt(nodeEl.getAttribute('data-matula'));
                    // Find and select this node
                    selectedNode = findNodeByMatula(currentTree, m);
                    render();
                });
            });

            if (onChange) onChange(currentTree, matula);
        }

        function findNodeByMatula(tree, targetMatula) {
            if (Matula.treeToInteger(tree) === targetMatula) return tree;
            for (const child of tree.children) {
                const found = findNodeByMatula(child, targetMatula);
                if (found) return found;
            }
            return null;
        }

        // Button handlers
        toolbar.querySelector('#addChild').onclick = () => {
            if (selectedNode) {
                selectedNode.children.push(Matula.makeTree([]));
            } else {
                currentTree.children.push(Matula.makeTree([]));
            }
            render();
        };

        toolbar.querySelector('#wrapTree').onclick = () => {
            currentTree = Matula.makeTree([currentTree]);
            selectedNode = null;
            render();
        };

        toolbar.querySelector('#unwrapTree').onclick = () => {
            if (currentTree.children.length === 1) {
                currentTree = currentTree.children[0];
                selectedNode = null;
                render();
            }
        };

        container.appendChild(wrapper);
        render();

        return {
            setTree: (tree) => { currentTree = tree; selectedNode = null; render(); },
            getTree: () => currentTree,
            getMatula: () => Matula.treeToInteger(currentTree)
        };
    }

    // ============================================================
    // EXPORT
    // ============================================================

    return {
        // Configuration
        DEFAULT_CONFIG,

        // Tree
        layoutTree,
        renderTree,

        // Graph
        layoutGraph,
        renderGraph,

        // Combined
        renderGraphWithEncoding,

        // Interactive
        createTreeBuilder
    };
})();

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Visualization;
}
