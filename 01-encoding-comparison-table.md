# Encoding Comparison Table

Purpose: clarify tradeoffs across the four main encodings and why the construction
bijection is the narrative center.

| Encoding | What it is | Dense? | Interpretable? | Canonicalization cost | Best for | Main weakness |
|---|---|---|---|---|---|---|
| Canonical adjacency (rank by min encoding) | Minimum upper-triangle encoding over all labelings | Yes (after ranking) | Low (number is opaque) | High (factorial worst-case) | Formal bijection; baseline ordering | Structural meaning is lost |
| Construction bijection (mixed radix) | Vertex-by-vertex build sequence, canonically ordered | Yes | Medium-High (sequence is a grammar) | High (canonical sequence) | Main narrative; generative structure | Still needs canonical choice |
| Product invariant (sentinel encoding product) | Multiply encodings over all labelings | No (sparse unless ranked) | Medium (captures symmetry) | High (enumerate labelings) | Symmetry-sensitive ordering | Computationally heavy; opaque integer |
| Red-node (block-cut + construction) | Tree with topology above red, construction below | No (sparse) | High (diagram reads structure) | Medium-High (block decomposition + construction) | Visualization; interpretive diagrams | Collisions without extra markers |

Notes:
- The comparison is about meaning vs density vs cost. Dense encodings are often opaque.
- The construction bijection is the only one that makes *build complexity* visible.
- The red-node encoding is best for explanation and visualization, not compactness.
- Arithmetic prefix tricks (e.g., sentinel bits or +2 offsets) are useful for uniqueness, but they can feel like encoding hacks rather than structural meaning.
