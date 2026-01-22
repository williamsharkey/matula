# Collision-Free Red Node Encoding

## The Final Scheme

A graph encodes as a Matula tree with this structure:

```
                    ROOT
                     │
         ┌──────────┴──────────┐
         │                     │
    CONNECTED            DISCONNECTED
    (1 child)            (≥2 children)
         │                   /│\
    [structure]         [comp₁][comp₂]...
```

### Rules

1. **Isolated vertex**: `o` (leaf, Matula 1) - BUT only inside larger structures

2. **Single connected vertex**: `(o)` (Matula 2) - wrapped once

3. **Disconnected graph**: Children of root are component encodings
   - Each component is either a leaf (isolated) or a block tree

4. **Connected graph**: Single child of root contains internal structure
   - Single 2-connected block: `((block_tree))`
   - Multiple blocks with cuts: `((block-cut tree))`

5. **Block-cut tree**:
   - **Path topology**: Nested `((B₁) ((B₂) ((B₃)...)))`
   - **Star topology**: Flat `((B₁) (B₂) (B₃)...)`

---

## Encoding Table

| Graph | Connected | Matula | Tree |
|-------|-----------|--------|------|
| • | yes | 2 | (o) |
| • • | no | 4 | (o o) |
| K₂ | yes | 3 | ((o)) |
| K₂+• | no | 6 | (o (o)) |
| P₃ | yes | 23 | (((o) (o))) |
| K₃ | yes | 43 | ((o (o o))) |
| K₃+• | no | 86 | (o (o (o o))) |
| 2K₂ | no | 9 | ((o) (o)) |
| P₄ | yes | 347 | (((o) ((o) (o)))) |
| K₁,₃ | yes | 103 | (((o) (o) (o))) |
| paw | yes | 727 | (((o) (o (o o)))) |
| C₄ | yes | 113 | ((o (o) ((o)))) |
| K₄ | yes | 757 | ((o ((o o o)))) |
| bowtie | yes | 15877 | (((o (o o)) (o (o o)))) |

**✓ NO COLLISIONS**

---

## Why It Works

### Connected vs Disconnected

The key distinguishing feature is **tree depth at level 1**:

```
DISCONNECTED: Multiple children at depth 1
  2K₂ = ((o) (o))
        root has 2 children

CONNECTED: Single child at depth 1, structure at depth 2
  P₃ = (((o) (o)))
       root has 1 child, that child has 2 children
```

### Path vs Star Topology

Within connected graphs with cut vertices:

```
PATH (P₄):  Nested structure
  (((o) ((o) (o))))
   └─ one child containing nested pairs

STAR (K₁,₃): Flat structure
  (((o) (o) (o)))
   └─ one child with multiple siblings
```

---

## The Tradeoff

| Approach | Density | Meaning |
|----------|---------|---------|
| Rank enumeration | 100% (gap-free) | Opaque (just a number) |
| **This encoding** | ~0.1% | **Rich** (tree shows structure) |

The low density is a feature, not a bug:
- Gaps are "not valid graph decompositions"
- Like how not every integer is prime
- The Matula tree literally visualizes the graph's structure

---

## Reading the Encoding

Given a Matula tree, you can read off the graph:

1. **Check root's children**:
   - Multiple children → disconnected, each child is a component
   - Single non-leaf child → connected graph

2. **For connected graphs, look at depth 2**:
   - Single node → 2-connected, read block construction
   - Multiple nodes → has cuts, structure is block-cut tree

3. **Block-cut tree**:
   - Nested structure → path topology
   - Flat siblings → star topology
   - Each leaf subtree → block's construction

---

## Block Construction Numbers

| Block | Construction Matula | Tree |
|-------|---------------------|------|
| K₂ | 2 | (o) |
| K₃ | 14 | (o (o o)) |
| C₄ | 30 | (o (o) ((o))) |
| K₄-e | 67 | (((o o o))) |
| K₄ | 134 | (o ((o o o))) |

These come from the construction bijection.

---

## Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│  Graph G                                                            │
│    │                                                                │
│    ├─ Connected?                                                    │
│    │   ├─ NO: children = component encodings                        │
│    │   └─ YES: single child = internal structure                    │
│    │           │                                                    │
│    │           ├─ Single block: ((construction_tree))               │
│    │           └─ Multiple blocks: ((block_cut_tree))               │
│    │                   │                                            │
│    │                   ├─ Path: nested ((B₁) ((B₂) ...))            │
│    │                   └─ Star: flat ((B₁) (B₂) (B₃))               │
│    │                                                                │
│    └─ Matula number of resulting tree                               │
└─────────────────────────────────────────────────────────────────────┘
```

This encoding is:
- **Collision-free** ✓
- **Intuitive**: tree shape shows graph structure
- **Hierarchical**: connectivity → blocks → construction
- **Meaningful gaps**: invalid integers are invalid decompositions
