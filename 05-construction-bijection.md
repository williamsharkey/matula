# Construction Bijection: Graphs ↔ Matula Trees

## Unified Construction: STOP as a Choice

The cleanest version makes STOP an explicit choice at each step:

```
At step k, choices are:
  0     = STOP (graph complete, has k vertices)
  1     = ADD vertex connected to nothing
  2     = ADD vertex connected to v₀
  3     = ADD vertex connected to v₁
  ...
  2^k   = ADD vertex connected to ALL previous

Number of choices at step k: 2^k + 1
```

### The Choice Tree

Every graph is a path through the choice tree:

```
         [v₀]
          │
    ┌─────┼─────┐
    │     │     │
  STOP  +v₁:∅  +v₁:{0}
   │      │      │
  n=1   ┌─┴─┐  ┌─┴─┐
 int=0  │...│  │...│
       STOP    STOP
       n=2     n=2
    Empty₂     K₂
     int=1    int=2
```

### Mixed-Radix Encoding

```
integer = c₁ + 3·c₂ + 15·c₃ + 135·c₄ + ...

where multiplier at step k = ∏_{j<k} (2^j + 1)
```

### Unified Ordering (All Graphs, All Sizes)

| Int | n | e | Graph |
|-----|---|---|-------|
| 0 | 1 | 0 | • single vertex |
| 1 | 2 | 0 | • • Empty₂ |
| 2 | 2 | 1 | •—• K₂ |
| 4 | 3 | 0 | • • • Empty₃ |
| 5 | 3 | 1 | •—• • P₂+iso |
| 8 | 3 | 2 | •—•—• P₃ |
| 14 | 3 | 3 | △ K₃ |
| 19 | 4 | 0 | Empty₄ |
| ... | | | |
| 134 | 4 | 6 | K₄ |

The integers are sparse (gaps where non-canonical sequences would be), but it's a bijection across ALL graph sizes in a single unified space.

---

## The Idea (Original Fixed-n Version)

Instead of encoding a graph's adjacency matrix, encode its **construction**:

1. Build the graph vertex-by-vertex
2. For each vertex, record which previous vertices it connects to
3. The sequence of choices forms a tree structure
4. Apply Matula encoding to get an integer

## The Construction Sequence

For a graph G on n vertices, define the **construction sequence**:

```
[c₁, c₂, ..., cₙ₋₁]

where cₖ ∈ {0, 1, ..., 2^k - 1}
```

- cₖ is a bitmask: bit j is set if vertex k connects to vertex j
- c₁ has 2 choices (connect to vertex 0 or not)
- c₂ has 4 choices (connect to vertices 0, 1, or neither, or both)
- cₖ has 2^k choices

## The Canonical Construction

Different vertex orderings give different sequences for the same graph.

The **canonical construction** = lexicographically smallest sequence over all orderings.

## Encoding as Integer (Mixed-Radix)

```
integer = c₁ + 2·c₂ + 2·4·c₃ + 2·4·8·c₄ + ...
        = Σ cₖ · ∏_{j<k} 2^j
```

This is a bijection: each integer uniquely decodes to a sequence.

## The Key Insight: Integer → Matula Tree

The construction integer **is** a Matula number!

So we get: **Graph → Integer → Matula Tree**

This gives a direct correspondence between graphs and rooted trees.

---

## Examples: 4-Vertex Graphs

| Graph | Canonical | Const.Seq | Const.Int | Matula Tree |
|-------|-----------|-----------|-----------|-------------|
| Empty₄ | 0 | [0,0,0] | 0 | o |
| edge+2iso | 1 | [1,0,0] | 1 | o |
| P₃+iso | 3 | [1,1,0] | 3 | ((o)) |
| **P₄ (path)** | 11 | [1,3,0] | **7** | **((o o))** |
| **star K₁,₃** | 7 | [1,1,1] | **11** | **((((o))))** |
| 2K₂ | 12 | [0,2,1] | 12 | (o o (o)) |
| K₃+iso | 13 | [1,2,1] | 13 | ((o (o))) |
| diamond | 15 | [1,3,1] | 15 | ((o) ((o))) |
| C₄ (cycle) | 30 | [0,3,3] | 30 | (o (o) ((o))) |
| K₄-edge | 31 | [1,3,3] | 31 | (((((o))))) |
| K₄ | 63 | [1,3,7] | 63 | ((o) (o) (o o)) |

## The Swap: Construction vs Canonical

The construction ordering **differs** from canonical ordering:

| Position | Canonical Order | Construction Order |
|----------|-----------------|-------------------|
| 4 | star (canon=7) | **path P₄** (const=7) |
| 5 | **path P₄** (canon=11) | star (const=11) |

**Why?**
- The PATH is simpler to construct: each vertex connects to just one previous
- The STAR requires one vertex to connect to ALL previous vertices

Construction measures "build complexity", not "matrix sparsity".

---

## The Three Bijections Compared

| Bijection | What it measures | Star vs Path |
|-----------|------------------|--------------|
| Canonical (upper-tri min) | Matrix sparsity | star < path |
| Product (encoding product) | Symmetry | star < path |
| **Construction** | Build complexity | **path < star** |

The construction bijection is the only one where the PATH comes before the STAR!

---

## Properties

### 1. Bijection
Different unlabeled graphs → different canonical construction sequences → different integers.

### 2. Meaningful Matula Trees
The Matula tree of the construction integer reflects the graph's structure:
- Deeper trees ↔ more complex constructions
- Wider trees ↔ vertices with many connections

### 3. Natural Ordering
Simpler-to-build graphs come first:
- Paths (chain connections)
- Before stars (hub connections)
- Before cliques (all connections)

---

## Future Work

1. **Direct tree interpretation**: Can we read graph properties from the Matula tree?

2. **Inverse operation**: Given a Matula tree, what graph does it represent?

3. **Operations on trees ↔ operations on graphs**: How do tree operations (like adding a child) translate to graph operations?

4. **Canonical vertex ordering**: Is there a more elegant way to find the canonical ordering than trying all n! permutations?
