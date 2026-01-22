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

---

## The Product Invariant Idea

### The Observation

A graph on n vertices has n! possible adjacency matrix representations (one per
vertex labeling). Each matrix's upper triangle encodes as an integer.

**Insight**: If we take a symmetric function over all n! integers, we get a
graph invariant - same value for isomorphic graphs regardless of labeling.

### Product Approach

Let M_σ be the upper-triangle integer for permutation σ. Define:

    P(G) = ∏_{σ ∈ S_n} M_σ

This is permutation-invariant by construction. Issues:
- Astronomically large (n! factors)
- Collision risk (different graphs, same product)

### Alternatives

1. **Minimum (canonical form)**: min_{σ} M_σ
   - This is what nauty/bliss compute
   - Unique per isomorphism class
   - Hard to compute (related to GI problem)

2. **Sum**: ∑_{σ} M_σ
   - Easier to compute than min
   - Collision risk

3. **Multiset**: {M_σ : σ ∈ S_n}
   - Complete invariant (no collisions)
   - Expensive to store/compare

4. **GCD of all M_σ**: gcd{M_σ}
   - Much smaller than product
   - Might reveal structure

### Prime Factorization Connection

Each upper-triangle encoding M is an integer. What if we factor it?

    M = p_1^{a_1} · p_2^{a_2} · ... · p_k^{a_k}

The prime structure might reveal graph structure. Consider:
- Edge at position i contributes to the 2^i term
- Different edge patterns → different factorizations

Could there be a "Matula-like" meaning to the prime factors of graph encodings?

---

---

## DISCOVERY: The Cycle Theorem

### Super-Primes (Chain Numbers)

The sequence **1, 2, 3, 5, 11, 31, 127, 709, 5381, ...** (OEIS A007097) are the
"super-primes" - each is the prime indexed by the previous:

    1 (base)
    2 = p_1
    3 = p_2 = p_{p_1}
    5 = p_3 = p_{p_2}
    11 = p_5 = p_{p_3}
    ...

These correspond exactly to **chain trees** (pure paths from root to single leaf).

### The Cycle Theorem

**Theorem**: Matula number n produces a cycle C_k via operation L (connect leaves)
if and only if:

    n = p_a × p_b

where a and b are both **super-primes**.

The cycle length is: k = depth(tree(a)) + depth(tree(b)) + 1

### Proof Sketch

1. Operation L connects all leaves of a tree
2. Adding one edge to a tree creates exactly one cycle
3. This cycle includes all vertices iff every vertex lies on the path between the two leaves
4. That happens iff the tree has exactly 2 leaves
5. Tree(n) has 2 leaves iff each prime factor contributes a 1-leaf subtree
6. Tree(i) has 1 leaf iff i is a super-prime (chain tree)
7. Therefore: n = p_a × p_b with a, b super-primes ⟺ tree(n) + L = cycle

### Examples

| n | Factorization | Tree | Result |
|---|---------------|------|--------|
| 4 | 2×2 = p_1×p_1 | (o o) | C_3 |
| 6 | 2×3 = p_1×p_2 | (o (o)) | C_4 |
| 9 | 3×3 = p_2×p_2 | ((o)(o)) | C_5 |
| 15 | 3×5 = p_2×p_3 | ((o)((o))) | C_6 |
| 121 | 11×11 = p_5×p_5 | ((((o)))(((o)))) | C_9 |

### Cycle-Producing Matula Numbers

The sequence: 4, 6, 9, 10, 15, 22, 25, 33, 55, 62, 93, 121, 155, ...

---

## Next Steps

1. Implement Matula number computation (both directions)
2. Implement the tree→graph operations
3. Visualize the resulting graphs
4. Compute which graphs arise from which (tree, operation) pairs
5. Look for patterns in graph properties vs Matula number
6. Search for operations that give good coverage of graph space
7. Explore symmetric functions over all matrix representations
8. Investigate prime factorization of upper-triangle encodings
9. **Find analogous theorems for other graph families (paths, complete bipartite, etc.)**

---

## DISCOVERY: The Bipartite Theorem

**Theorem**: Tree(n) + Operation L is bipartite if and only if no two leaves
share the same depth parity.

**Corollary**: With k ≥ 3 leaves, +L always creates odd cycles (by pigeonhole,
at least two leaves share parity).

The bipartite +L graphs come from:
1. Single-leaf trees (super-primes: 1, 2, 3, 5, 11, 31, ...) → trivial
2. Two-leaf trees with opposite parities → these give the CYCLES (connection to Cycle Theorem!)

---

## DISCOVERY: Complete Graph Generators

**Theorem**: 2^k + L = K_{k+1}

Powers of 2 are star trees (root with k leaves all at depth 1). Connecting all
leaves creates a clique, so the result is the complete graph.

Other complete graph generators via operation D:
- 3+D = K_3 (chain wraps into triangle)
- 7+D = K_4
- 19+D = K_5
- 53+D = K_6

---

## Tree Size Distribution

For integers up to 1000:
- Tree sizes follow roughly bell-shaped distribution
- Peak at size 10-11
- Very few small trees (size 1-4)
- Tree size grows roughly like log(n) but with structure

This suggests a central limit theorem for tree sizes under the Matula encoding.
