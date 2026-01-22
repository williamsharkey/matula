# Graph Enumeration: Bijection Between Graphs and Integers

## The Goal

Find a bijection between **unlabeled graphs** and **integers** (like Matula does for trees).

**Result**: We found it! The rank bijection gives a dense mapping 1, 2, 3, ...

## Key Insights from Exploration

### 1. The Upper Triangle Encoding

A graph on n vertices can be encoded as the upper triangle of its adjacency matrix:
- n(n-1)/2 possible edge positions
- Binary: position i = 1 if edge exists, 0 otherwise
- This gives an integer in [0, 2^(n(n-1)/2) - 1]

**Problem**: Same graph has n! different encodings (one per vertex labeling).

### 2. Canonical Encoding

The **canonical encoding** = minimum over all n! labelings.

For 4-vertex graphs, the canonical encodings are:
```
0, 1, 3, 7, 11, 12, 13, 15, 30, 31, 63
```

These are **sparse** - not all integers appear.

### 3. The Product Invariant

Your idea: multiply all n! encodings → permutation-invariant integer.

**Result**: Products explode (24! multiplications), but the idea is sound.
Any symmetric function over encodings gives an invariant.

### 4. The Matula Connection

Each canonical encoding c is an integer, which has a Matula tree!

```
c=1  → tree o
c=3  → tree ((o))
c=7  → tree ((o o))
c=63 → tree ((o)(o)(o o))
```

So: **Graph → Canonical encoding → Matula tree**

### 5. The Rank Bijection

The "magic reduction" to get 1, 2, 3, 4, ...:

**RANK the canonicals**: If c₁ < c₂ < c₃ < ..., then:
- Graph with canonical c₁ ↔ 1
- Graph with canonical c₂ ↔ 2
- etc.

This IS a bijection from graphs to integers!

### 6. The Open Problem

Is there a **closed-form formula** to compute:
```
rank(c) = |{canonical encodings < c}| + 1
```
without enumerating all smaller graphs?

This connects to:
- Graph isomorphism algorithms
- Orderly generation (nauty, etc.)
- Combinatorial ranking/unranking

---

## The Counting Comparison

| n vertices | # Graphs | # Rooted Trees | # Unrooted Trees |
|------------|----------|----------------|------------------|
| 1          | 1        | 1              | 1                |
| 2          | 2        | 1              | 1                |
| 3          | 4        | 2              | 1                |
| 4          | 11       | 4              | 2                |
| 5          | 34       | 9              | 3                |
| 6          | 156      | 20             | 6                |

Graphs grow faster than trees because:
- Trees are graphs with 0 cycles
- Graphs can have any number of cycles

---

## The Fibration View

Instead of bijection, think **fibration**:

```
         Graphs
            |
            | (canonical spanning tree)
            ↓
     Matula Trees
```

Each Matula tree has a **fiber** of graphs above it:
- All graphs whose minimum spanning tree gives that Matula number
- Fiber size = how many ways to add cycles to that tree skeleton

---

## The Complete Rank Bijection

Using ordering key `(vertex_count, product, canonical)`:

```
Rank | n | edges | canonical | description
-----|---|-------|-----------|------------
   1 | 1 |     0 |         0 | Empty_1
   2 | 2 |     0 |         0 | Empty_2
   3 | 2 |     1 |         1 | K_2
   4 | 3 |     0 |         0 | Empty_3
   5 | 3 |     1 |         1 | P_2 + isolated
   6 | 3 |     2 |         3 | P_3
   7 | 3 |     3 |         7 | K_3
   8 | 4 |     0 |         0 | Empty_4
   9 | 4 |     1 |         1 | edge + 2 isolated
  10 | 4 |     2 |         3 | P_3 + isolated
  11 | 4 |     2 |        12 | matching (2 edges)
  12 | 4 |     3 |         7 | star K_{1,3}
  13 | 4 |     3 |        11 | P_4
  14 | 4 |     3 |        13 | triangle + isolated
  15 | 4 |     4 |        15 | K_4 minus edge
  16 | 4 |     4 |        30 | C_4 (4-cycle)
  17 | 4 |     5 |        31 | K_4 minus one edge
  18 | 4 |     6 |        63 | K_4
```

**This IS a complete bijection!** Every graph gets a unique positive integer.

### Computing Rank

```
rank(G) = cumulative_count(n-1) + position_within_n_vertices
```

Where:
- `cumulative_count(k)` = sum of A000088 values for n=1 to k
- `position_within_n_vertices` = rank of G among n-vertex graphs by (product, canonical)

### Product Invariant Details

The **product invariant** P(G) = ∏(encoding^multiplicity) over all unique encodings.

Key observations:
- Empty graphs and K₂ all have product = 1 (degenerate case)
- Products grow astronomically: 4-vertex products reach 10^40
- Products roughly correlate with edge count
- Product ranking ≈ inverse automorphism group size (most symmetric first)

### The Separation Question

Products do NOT cleanly separate by vertex count:
- All empty graphs have product = 1
- K₂ also has product = 1

But using (n, product, canonical) as key DOES give a total order that:
1. Groups graphs by vertex count
2. Within n, orders by product (symmetry)
3. Breaks ties by canonical form

---

## Future Directions

1. **Formula for rank(c)**: Count canonical forms less than c
2. **Structure of canonical set**: Which integers can be canonical?
3. **Cycle encoding**: How to encode the "extra edges" beyond spanning tree
4. **Prime-product encoding**: Use product of primes for edge positions
5. **Direct graph→integer bijection**: Define new encoding avoiding upper triangle
6. **Efficient unranking**: Given integer k, compute the k-th graph without enumeration
