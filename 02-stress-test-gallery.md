# Stress-Test Gallery

Purpose: show how different encodings behave on a small set of graphs that
highlight symmetry, construction effort, and block structure.

Each example is framed qualitatively so it can be used in both the paper and
interactive article. Quantitative values can be filled in later if needed.

Construction values below use the minimum mixed-radix integer over all vertex
permutations (equivalently, the minimum over all construction sequences after
encoding).

## 1. Star vs Path (same n, same edges, different build complexity)
- **Star K_1,3**: one vertex connects to all previous.
- **Path P_4**: each new vertex connects to a single predecessor.

Why it matters:
- Canonical adjacency tends to prefer sparse adjacency patterns.
- Construction bijection prefers easy build sequences (path before star).
- Product ordering leans toward symmetry (star can come earlier due to automorphisms).

Concrete values (n=4):
- Canonical adjacency: star = 7, path = 11.
- Construction bijection: star = 11 (seq [1,1,1]), path = 13 (seq [1,2,1]).
- Product ordering (log10 of product): star ≈ 33.5, path ≈ 34.1.
- Collision-free red-node Matula: star = 103, path = 347.

Matula tree sketches:
- Construction: path `((o (o)))`, star `((((o))))`.
- Red-node: path `(((o) ((o) (o))))`, star `(((o) (o) (o)))`.

## 2. Cycle vs Matching (same n, same edges, different symmetry)
- **Cycle C_4**: high symmetry, multiple labelings collapse.
- **Matching 2K_2**: also symmetric but different orbit structure.

Why it matters:
- Product ordering is sensitive to automorphism counts and orbit sizes.
- Canonical adjacency sees two distinct bit patterns but doesn’t encode symmetry.
- Construction bijection highlights how “evenly distributed” the edges are.

Concrete values (n=4):
- Canonical adjacency: matching = 12, cycle = 30.
- Construction bijection: matching = 12 (seq [0,2,1]), cycle = 30 (seq [0,3,3]).
- Product ordering (log10 of product): matching ≈ 30.8, cycle ≈ 38.7.
- Collision-free red-node Matula: matching = 9, cycle = 113.

Matula tree sketches:
- Construction: matching `(o o (o))`, cycle `(o (o) ((o)))`.
- Red-node: matching `((o) (o))`, cycle `((o (o) ((o))))`.

## 3. Barbell vs Disconnected Components (block structure)
- **Barbell**: two triangles connected by a bridge.
- **Two triangles disconnected**: same blocks, different topology.

Why it matters:
- Red-node encoding makes the block-cut topology visually explicit.
- Construction bijection distinguishes via the STOP and build sequence.
- Canonical adjacency hides the block structure unless you inspect it directly.

Concrete values (n=6):
- Construction bijection: two triangles = 3873 (seq [1,0,4,12,3]).
- Construction bijection: barbell = 3875 (seq [1,1,4,12,3]).
Figure callout:
- Show the red-node tree to emphasize identical triangle constructions but different block-cut topology (bridge vs split).

## 4. Clique vs Empty Graph (extremes)
- **K_n**: maximal edges, extreme symmetry.
- **Empty_n**: no edges, extreme symmetry.

Why it matters:
- Product ordering needs a sentinel/prefix to avoid degeneracy.
- Construction bijection is clean if STOP is part of the grammar.
- These are anchor points for explaining ordering intuition.

Concrete values (n=4 anchors):
- Canonical adjacency: Empty_4 = 0, K_4 = 63.
- Construction bijection: Empty_4 = 0, K_4 = 63 (seq [1,3,7]).
- Product ordering (log10 of product): Empty_4 = 0, K_4 ≈ 43.2.

## 5. Triangle+Leaf vs Path (local motif vs uniform growth)
- **Paw graph**: triangle with a pendant vertex.
- **P_4**: uniform degree-2 path (except endpoints).

Why it matters:
- Red-node encoding shows a block (triangle) with a small attachment.
- Construction bijection reveals how motif insertion changes build complexity.
- Canonical adjacency has no built-in motif sensitivity.

Concrete values (n=4):
- Construction bijection: paw = 15 (seq [1,3,1]), path = 13 (seq [1,2,1]).
- Collision-free red-node Matula: paw = 727, path = 347.

Matula tree sketches:
- Construction: paw `((o) ((o)))`, path `((o (o)))`.
- Red-node: paw `(((o) (o (o o))))`, path `(((o) ((o) (o))))`.

---

Notes for future expansion:
- Add one labeled example per encoding with small n (n=4 or 5).
- Include side-by-side Matula trees for construction vs red-node for at least two cases.
