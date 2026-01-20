# Graph Enumeration via Matula Trees

## The Goal

Find a bijection between **unlabeled graphs** and **integers** (like Matula does for trees).

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

## Future Directions

1. **Formula for rank(c)**: Count canonical forms less than c
2. **Structure of canonical set**: Which integers can be canonical?
3. **Cycle encoding**: How to encode the "extra edges" beyond spanning tree
4. **Prime-product encoding**: Use product of primes for edge positions
5. **Direct graph→integer bijection**: Define new encoding avoiding upper triangle
