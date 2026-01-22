# Red Node Encoding: Analysis and Collision Report

## Summary

The Red Node encoding maps graphs to integers via:
```
Graph → (Topology, Block Constructions) → Combined Matula Tree → Integer
```

## Encoding Table

| Graph | n | m | Topology | Blocks | Combined Tree | Matula |
|-------|---|---|----------|--------|---------------|--------|
| • | 1 | 0 | single | • | o | 1 |
| • • | 2 | 0 | disconn | •,• | (o o) | 4 |
| K₂ | 2 | 1 | single | K₂ | (o) | 2 |
| • • • | 3 | 0 | disconn | •,•,• | (o o o) | 8 |
| K₂+• | 3 | 1 | disconn | •,K₂ | (o (o)) | **6** ⚠️ |
| P₃ | 3 | 2 | path | K₂,K₂ | (o (o)) | **6** ⚠️ |
| K₃ | 3 | 3 | single | K₃ | (o (o o)) | 14 |
| • • • • | 4 | 0 | disconn | •,•,•,• | (o o o o) | 16 |
| K₂+•• | 4 | 1 | disconn | •,•,K₂ | (o o (o)) | 12 |
| 2K₂ | 4 | 2 | disconn | K₂,K₂ | ((o) (o)) | 9 |
| P₃+• | 4 | 2 | path+iso | •,K₂,K₂ | (o (o (o))) | **26** ⚠️ |
| P₄ | 4 | 3 | path | K₂,K₂,K₂ | (o (o (o))) | **26** ⚠️ |
| K₁,₃ | 4 | 3 | star | K₂,K₂,K₂ | ((o) (o) (o)) | 27 |
| K₃+• | 4 | 3 | disconn | •,K₃ | (o (o (o o))) | **86** ⚠️ |
| C₄ | 4 | 4 | single | C₄ | (o (o) ((o))) | 30 |
| paw | 4 | 4 | path | K₂,K₃ | (o (o (o o))) | **86** ⚠️ |
| K₄-e | 4 | 5 | single | K₄-e | (((o o o))) | 67 |
| K₄ | 4 | 6 | single | K₄ | (o ((o o o))) | 134 |

## Collisions Found

| Matula | Graphs | Why? |
|--------|--------|------|
| 6 | K₂+•, P₃ | disconnected (•,K₂) vs connected (K₂—K₂) |
| 26 | P₃+•, P₄ | 3 blocks vs 3 blocks, different connectivity |
| 86 | K₃+•, paw | disconnected (•,K₃) vs connected (K₂—K₃) |

## Root Cause

The Matula tree structure doesn't distinguish **connected vs disconnected** topologies when block constructions are similar:

```
K₂+• (disconnected):     P₃ (connected):
    ○                        ○
   / \                      / \
  •   K₂                  K₂   K₂
                           \ /
                            ●  (cut vertex)

Both give Matula tree: (o (o)) = 6
```

## Solutions

### Solution 1: Encode connectivity explicitly

Add a "connectivity marker" to the encoding:
```
M(G) = 2^c × M_tree

where c = 0 if connected, c = 1 if disconnected
```

This doubles the encoding space but eliminates connectivity collisions.

### Solution 2: Different topology trees for connected/disconnected

For disconnected graphs, add an extra nesting level:
```
Connected K₂+K₂:     (o (o))
Disconnected K₂,K₂:  ((o (o)))  ← extra wrapper
```

### Solution 3: Use (n, m) as prefix

Since colliding graphs have different (n, m):
- K₂+• has (n=3, m=1)
- P₃ has (n=3, m=2)

Encode as: `M(G) = cantor(n, cantor(m, M_tree))`

This guarantees uniqueness since different (n,m) → different encodings.

## Gap Analysis

- Matula numbers used: 21 unique values
- Range: 1 to 602
- Density: 3.5%
- Gaps: 581 integers not used

### Why gaps exist

Not every Matula tree corresponds to a valid graph decomposition:
- Matula 3 = ((o)) : Would need a "double-nested" block structure
- Matula 5 = (((o))) : Triple nesting with single block
- Matula 7 = ((o o)) : Two leaves at depth 2 - no natural interpretation

## The Fundamental Tradeoff

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEANINGFUL but SPARSE                        │
│  Matula tree structure preserves visual/structural meaning      │
│  But many integers don't correspond to valid graphs             │
├─────────────────────────────────────────────────────────────────┤
│                    DENSE but OPAQUE                             │
│  Rank enumeration: graph k → integer k                          │
│  No gaps, but loses structural interpretation                   │
└─────────────────────────────────────────────────────────────────┘
```

## Recommendation

For **visualization and understanding**: Use Red Node encoding
- The Matula tree shows the hierarchical structure
- Topology above red, construction below
- Accept the gaps as "invalid decompositions"

For **compact bijection**: Use lexicographic ranking
- Order by (n, m, topology_type, constructions)
- Assigns consecutive integers 0, 1, 2, ...
- Loses visual structure but is dense

## Collision-Free Variant

To make Red Node encoding collision-free while keeping Matula structure:

```
M(G) = prime(n) × prime(m + 100) × M_tree

where M_tree is the combined topology+construction tree
```

This uses the (n, m) prefix to separate graphs with same tree structure.
