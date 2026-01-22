# Tree Operations ↔ Graph Operations

## The Correspondence

Every operation on Matula trees has a corresponding operation on the encoded graphs.

```
┌─────────────────────────┬─────────────────────────────────────────────────┐
│ TREE OPERATION          │ GRAPH OPERATION                                 │
├─────────────────────────┼─────────────────────────────────────────────────┤
│ Cut at root             │ Separate disconnected components                │
│ Cut below wrapper       │ Expose block-cut structure                      │
│ Wrap: M → prime(M)      │ Connect blocks at a cut vertex                  │
│ Unwrap: prime(M) → M    │ Disconnect at cut vertex                        │
│ Multiply: M₁ × M₂       │ Disjoint union of structures                    │
│ Divide by prime factor  │ Remove one component/block                      │
│ Prime Matula            │ "Atomic" connected structure                    │
│ Composite Matula        │ Decomposable into parts                         │
└─────────────────────────┴─────────────────────────────────────────────────┘
```

---

## Wrap / Unwrap Duality

The most fundamental operation: wrapping a tree in a new root.

### Wrap: `M → prime(M)`

```
Tree:  (children...)  →  ((children...))
       multiple roots     single wrapped root
```

**Graph meaning**: Connect previously separate structures at a cut vertex.

### Unwrap: `prime(M) → M`

```
Tree:  ((children...))  →  (children...)
       single child         exposed children
```

**Graph meaning**: Disconnect at a cut vertex, exposing components.

### Example: 2K₂ ↔ P₃

```
2K₂ = ((o) (o))     Matula 9   (two disjoint edges)
                    ↓ wrap
P₃  = (((o) (o)))   Matula 23  (path of 3 vertices)
```

**Insight**: `prime(9) = 23` — wrapping two disjoint edges connects them!

```
Graph view:

2K₂:  •—•   •—•     (disconnected)
         ↓ wrap
P₃:   •—•—•         (connected at middle vertex)
```

---

## Multiplication / Division

### Multiply: `M₁ × M₂`

Creates a tree with both subtrees as children of a new root.

```
Tree:  T₁, T₂  →  (T₁ T₂)
```

**Graph meaning**: Disjoint union of the encoded structures.

### Divide by prime factor

Removes one child from the root.

```
Tree:  (T₁ T₂)  →  T₁  (returning T₂)
```

**Graph meaning**: Remove one component from a disconnected graph.

### Example: Components of 2K₂

```
2K₂ = ((o) (o)) = Matula 9 = 3 × 3

Factorization: 9 = 3 × 3
Each factor 3 = ((o)) = K₂

So 2K₂ = K₂ ⊔ K₂ (disjoint union)
```

---

## Prime vs Composite Matulas

### Prime Matula Numbers

A prime Matula corresponds to a tree with **exactly one child** at the root.

**Graph meaning**: An "atomic" connected structure that cannot be further decomposed at the root level.

```
Examples:
  2 = (o)           → K₂ (single edge)
  3 = ((o))         → wrapped single vertex
  23 = (((o)(o)))   → P₃ (connected path)
```

### Composite Matula Numbers

A composite Matula has multiple children at the root.

**Graph meaning**: Decomposable into parts via disjoint union.

```
Examples:
  4 = (o o)         → two isolated vertices
  9 = ((o)(o))      → 2K₂ (two disjoint edges)
  6 = (o (o))       → K₂ + isolated vertex
```

---

## Cutting Operations

### Cut at Root

Separating root's children gives disconnected components.

```
(o (o) (o o))  →  o, (o), (o o)
     ↓                ↓
Disconnected    Three separate
   graph         structures
```

### Cut Below Wrapper

For connected graphs, cutting below the connectivity wrapper exposes the block-cut structure.

```
P₃ = (((o)(o)))
         ↓ cut below outer wrapper
     ((o)(o))  = the two blocks (edges)
```

### Cut at Arbitrary Depth

Cutting deeper in the tree corresponds to:
- **In topology region**: Separating at a cut vertex
- **In construction region**: Decomposing a block's build sequence

---

## Depth and Meaning

In the collision-free encoding, depth has semantic meaning:

```
Depth 0: Root
Depth 1: Connectivity wrapper (if connected) or components (if disconnected)
Depth 2: Block-cut structure (for connected graphs)
Depth 3+: Block constructions
```

### Depth-Based Operations

| Cut Depth | What You Get |
|-----------|--------------|
| 0 (root) | Invalid (destroys graph) |
| 1 | Components of disconnected graph |
| 2 | Blocks of connected graph |
| 3+ | Sub-constructions within blocks |

---

## Arithmetic ↔ Graph Algebra

| Arithmetic | Tree | Graph |
|------------|------|-------|
| `n × m` | `(T_n T_m)` | `G_n ⊔ G_m` (disjoint union) |
| `prime(n)` | `(T_n)` | Connect at cut vertex |
| `n / p` (p prime factor) | Remove child `T_p` | Remove component |
| `gcd(n, m)` | Common subtrees | Shared substructures |
| `lcm(n, m)` | Union of children | ? |

---

## The Big Picture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MATULA TREE                                 │
│                              │                                      │
│    ┌─────────────────────────┼─────────────────────────┐           │
│    │                         │                         │           │
│  ARITHMETIC              STRUCTURE                  GRAPHS          │
│    │                         │                         │           │
│  prime(n)              single child              connect           │
│  n × m                 siblings                  disjoin           │
│  factor                cut edge                  decompose         │
│  composite             multiple children         disconnected      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

The Matula encoding creates a three-way correspondence:
1. **Integers** (arithmetic)
2. **Trees** (structure)
3. **Graphs** (topology)

Operations in any domain translate to the others.

---

## Open Questions

1. **What is `gcd` for graphs?** The greatest common divisor of two Matulas — what graph does it represent?

2. **Exponentiation?** What does `M^k` mean for graphs? Repeated disjoint union?

3. **Addition?** Is there a natural graph operation corresponding to `M₁ + M₂`?

4. **Primality testing via graphs?** Can graph properties help identify prime Matulas?

5. **Graph isomorphism via arithmetic?** Two graphs are isomorphic iff they have the same Matula number — can arithmetic properties help detect this?
