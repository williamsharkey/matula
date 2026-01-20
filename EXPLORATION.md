# Exploration: From Trees to Graphs

## The Canonization Problem (Why Graphs Are Hard)

### The Circle Thought Experiment

Imagine N vertices enclosed in a circle. To enumerate graphs, we might try:
1. Let one vertex out at a time
2. Record its connections to those still inside
3. Build up a canonical description

**The Problem**: Which vertex exits first?

For a path graph: endpoints are special → natural choice
For a star: center is special → natural choice
For K_n (complete graph): ALL vertices are identical → no way to choose

This is precisely the **graph isomorphism problem**. A canonical ordering algorithm
would solve GI. The circle is "a useless filter" for symmetric graphs.

### The Matrix View Has the Same Problem

A graph on n vertices = upper triangle of n×n adjacency matrix:

```
    1 2 3 4
1   . 1 0 1
2   . . 1 0
3   . . . 1
4   . . . .
```

But we can permute rows/columns together (relabel vertices) and get a
different matrix for the same graph. There are n! possible matrices per graph.

We want: "only one way to name a matrix"

This requires a **canonical form** - a unique representative from each
isomorphism class. Finding canonical forms is as hard as graph isomorphism.

---

## The Reverse Direction: Trees → Graphs

### The Key Insight

Instead of trying to encode arbitrary graphs:
1. START with trees (which we can enumerate perfectly via Matula)
2. DERIVE graphs from trees via well-defined operations
3. The tree provides the canonical backbone

**Every Matula tree is already canonically named by its integer.**

So if we define an operation O that turns a tree T into a graph G = O(T),
then G inherits a canonical name: **(n, O)** where n is the Matula number of T.

### Proposed Operations

#### Operation L: Connect All Leaves

Given tree T:
1. Find all leaf nodes (degree 1, except possibly root)
2. Add edges between every pair of leaves
3. Result: graph G_L(T)

```
Tree 6 (Y-shape):       After connecting leaves:
    *                        *
   /|\                      /|\
  * * *                    * * *
                            \_|_/
                           (triangle of leaves)
```

Properties:
- Tree remains a spanning subgraph
- Adds (k choose 2) edges where k = number of leaves
- Creates cycles through the original tree structure

#### Operation D_k: Connect Nodes of Same Degree

Given tree T:
1. Partition nodes by their degree in T
2. For degree class k, add edges between all nodes of degree k
3. Result: graph G_D(T)

Variant: Only connect nodes at same DEPTH from root.

#### Operation S: Sibling Connection

Given tree T:
1. For each internal node, connect all its children to each other
2. Result: graph G_S(T)

```
Tree:           After sibling connection:
    *                   *
   /|\                 /|\
  * * *               *-*-*
 /|                   |\
* *                   *-*
```

This turns each "family" into a clique.

#### Operation P: Path Closure

Given tree T:
1. For each pair of leaves, if their tree-distance is exactly k, add an edge
2. Result: graph G_P(T, k)

#### Operation A: Ancestor Connection

Given tree T:
1. Connect each node to its grandparent (if exists)
2. Or: connect each node to all ancestors within distance k
3. Result: various graph families

---

## What This Gives Us

### A Parameterized Graph Family

Each (Matula number, Operation) pair defines a specific graph:
- (6, L) = Y-tree with leaves connected
- (6, S) = Y-tree with siblings connected
- etc.

### Partial Enumeration of Graphs

Not all graphs arise this way, but we get:
- A canonical naming scheme for those that do
- A structured way to explore graph space
- Graphs organized by their "tree skeleton"

### Questions to Explore

1. **Coverage**: What fraction of n-vertex graphs can be represented as O(T)
   for some tree T and operation O?

2. **Uniqueness**: Can different (n, O) pairs produce isomorphic graphs?
   (Probably yes - this is interesting to characterize)

3. **Properties**: Do graph properties (chromatic number, clique number, etc.)
   relate nicely to tree properties (depth, width, Matula number)?

4. **Composition**: Can we compose operations? O1(O2(T))?

5. **Inverse**: Given a graph G, can we find a tree T and operation O such that
   G = O(T)? (Partial inverse to the encoding)

---

## The Deeper Structure

### Why Trees Are Special

Trees are the "prime" connected graphs:
- Minimal edges to connect n vertices (n-1 edges)
- No cycles = no redundancy
- Unique path between any two vertices

Every connected graph is a tree + extra edges (creating cycles).

### Matula Numbers as Canonical Tree Coordinates

The Matula bijection gives us:
- A total ordering on all rooted trees
- A "coordinate system" for tree space
- Compositional structure (prime factorization ↔ subtrees)

### Graphs as "Decorated Trees"

Our operations decorate the tree skeleton with additional edges.
The decoration is deterministic, so the tree's Matula number determines everything.

This suggests viewing graph space as:
- Base space: Trees (parameterized by integers via Matula)
- Fiber over each tree: Graphs obtainable by operations on that tree
- Total space: Union of all fibers

---

## Next Steps

1. Implement Matula number computation (both directions)
2. Implement the tree→graph operations
3. Visualize the resulting graphs
4. Compute which graphs arise from which (tree, operation) pairs
5. Look for patterns in graph properties vs Matula number
6. Search for operations that give good coverage of graph space
