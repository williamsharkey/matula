# Main Storyline: Graphs as Construction Histories

Goal: present a clean, compelling narrative that culminates in the construction bijection
as the central result, with Matula trees as the interpretive layer.

Note for future agents:
- After this outline, consider adding (2) a comparison table across encodings and
  (3) a stress-test gallery (star vs path, cycle vs matching, barbell) to sharpen the story.

## 1. The Beauty of Trees as Integers
- Matula's bijection: every integer is a rooted tree, and every rooted tree is an integer.
- Emphasize compositional meaning: multiplication = unordered branching.
- Set the aesthetic benchmark: structure should be visible in the number.

## 2. The Dream: An Ordering for All Graphs
- Graphs are harder because labeling symmetry explodes.
- Naive adjacency encodings are many-to-one under relabeling.
- The question: can we get a *structural* numbering, not just a canonical label?

## 3. Canonical Labeling as the Baseline (and Its Limits)
- Define canonical adjacency encoding (e.g., minimum over all labelings).
- Note the factorial barrier: canonicalization is hard in the worst case.
- Important pivot: we're not trying to beat canonical labeling; we're trying to reframe the object.

## 4. Construction Histories: A New Perspective
- Build a graph vertex-by-vertex; each step is a bitmask of connections.
- The sequence of choices is a path in a choice tree.
- This turns every graph into a construction history rather than a static adjacency pattern.

## 5. The Construction Bijection (Main Result)
- Mixed-radix encoding of construction choices gives a single integer.
- With canonical choice of ordering (minimum construction integer over all labelings), we get a bijection.
- This unifies graphs of all sizes in one ordered space.
- Key qualitative shift: build complexity, not adjacency sparsity, drives the ordering.
- Human-reader view: treating STOP as a legitimate choice makes the ordering feel like a story of decisions.
- Footnote: some archived notes used “lexicographically smallest construction sequence”; here the canonical choice is the minimum mixed-radix integer.

## 6. Comparisons and Stress Tests
- Use the comparison table to show the tradeoffs clearly.
- Use the stress-test gallery to reveal qualitative differences on small graphs.
- See `01-encoding-comparison-table.md` and `02-stress-test-gallery.md`.

## 7. Matula Trees as the Decoder
- The construction integer is itself a Matula number.
- Therefore: Graph → Construction Integer → Matula Tree.
- The tree provides an interpretive diagram for the graph's construction grammar.

## 8. Topology vs Construction (Red-Node Split)
- Every graph decomposes into block-cut topology + block constructions.
- The red-node boundary separates *how pieces connect* from *what the pieces are*.
- This gives a visual, hierarchical reading of graph structure inside a single tree.

## 9. What This Adds Beyond Canonical Labeling
- Canonical labels give a unique name but no compositional semantics.
- Construction bijection + Matula tree gives a name that *means* something.
- The story is about generative structure, not just recognition.
- Aesthetic note: arithmetic prefix tricks (e.g., sentinel bits) can preserve uniqueness but may loosen the direct “integer as tree” feel.

## 10. Research Questions (Near-Term)
- Can we characterize which graph properties correlate with construction complexity?
- How do different bijections reorder the same small graphs, and why?
- Can block-cut + construction be made collision-free while preserving semantics?

## 11. The Article Shape (Interactive Vision)
- Start with Matula trees as a visual grammar.
- Show construction as a branching choice tree (interactive widget).
- Reveal how different graph families trace different paths.
- End with the red-node split as the unifying lens.
