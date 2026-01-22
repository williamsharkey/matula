# Review: Graphs as Construction Histories

**Reviewer:** Claude (Opus 4.5)
**Date:** 2026-01-22
**Paper:** `paper/main.tex`

---

## Summary

The paper presents a bijection between finite unlabeled graphs and integers. The encoding treats a graph as a "construction history"—a sequence of vertex additions where each new vertex's connections to previous vertices form a bitmask. These bitmasks are combined via mixed-radix arithmetic into a single integer. Canonicalization is achieved by taking the minimum such integer over all labelings. The key interpretive contribution is that each construction integer is itself a Matula number, yielding a rooted-tree "diagram" of the graph's generative structure.

---

## Strengths

### 1. Novel perspective on graph encoding
The shift from "adjacency snapshot" to "construction narrative" is genuinely interesting. Most graph codes (like mincode/graph-code numbers) treat the adjacency matrix as a static object. This paper reframes graphs as processes, which opens conceptual space for reasoning about build complexity, not just structural invariants.

### 2. Clean mathematical formulation
The definitions (construction sequence, mixed-radix encoding, canonical construction integer) are precise and compose well. The proof sketch for the main theorem is correct: fixed-n mixed-radix encoding is bijective, and minimizing over labelings preserves injectivity on isomorphism classes.

### 3. Matula tree interpretation
Connecting the construction integer back to Matula's original bijection is elegant. It provides a compositional, tree-structured reading of the encoding—something canonical adjacency codes lack.

### 4. Concrete examples
The n=5 example list and the stress-test gallery (path vs star, cycle vs matching, barbell vs two triangles) effectively illustrate where the construction ordering diverges from adjacency-based orderings.

### 5. Honest about limitations
The paper correctly notes that canonicalization remains factorial-hard and does not claim algorithmic improvements. The contribution is framed as structural/conceptual, which is appropriate.

---

## Weaknesses and Suggestions

### 1. Injectivity claim needs tightening
**Issue:** The theorem states the mapping is "injective on unlabeled graphs," but the current text doesn't explicitly address graphs of different sizes. If two graphs on different n can share the same construction integer (e.g., the empty graph on n=3 yields integer 0, as does the empty graph on n=4), then the bijection is only within each n.

**Suggestion:** Either:
- (a) Clarify that the bijection is "per n" (i.e., among graphs with the same vertex count), or
- (b) Introduce a size prefix or interleaved encoding (like including n in the integer) to make it truly global.

The storyline document mentions "STOP as a legitimate choice" and unifying graphs of all sizes—if that's the intent, the paper should formalize how STOP integrates into the encoding.

### 2. Mixed-radix formula could be clearer
**Issue:** The encoding formula uses a product notation that may confuse readers:
```
C(G,π) = Σ_{k=1}^{n-1} c_k × ∏_{j=1}^{k-1} 2^j
```
The product ∏_{j=1}^{k-1} 2^j equals 2^{1+2+...+(k-1)} = 2^{(k-1)k/2}. This is correct but non-obvious.

**Suggestion:** Add a small example inline (e.g., for n=4, the weights are 1, 2, 8) or rewrite as:
```
C(G,π) = c_1 + 2·c_2 + 2·4·c_3 + 2·4·8·c_4 + ...
```
This matches the interactive demo and is easier to verify.

### 3. Figure references may not compile
**Issue:** The figures are SVG files. Standard pdflatex does not support SVG directly.

**Suggestion:** Either:
- Convert SVGs to PDF (e.g., via Inkscape or `svg2pdf`), or
- Use the `svg` package with `--shell-escape`, or
- Convert to PNG/PDF and update `\graphicspath`.

### 4. Missing related work on Prüfer codes
**Issue:** Prüfer codes provide another bijection between labeled trees and sequences. A brief mention would strengthen the related work section, especially since construction sequences are conceptually similar (both are "build narratives" for trees/graphs).

**Suggestion:** Add a sentence noting the analogy and how the construction bijection extends beyond trees.

### 5. Block-cut / red-node encoding is underexplored
**Issue:** Section 5 mentions a "block-cut red-node encoding" but the paper doesn't define it. The comparison table in the supplementary markdown is helpful, but the paper itself leaves this hanging.

**Suggestion:** Either:
- (a) Remove the reference if it's not developed, or
- (b) Add a brief definition and at least one worked example.

### 6. No explicit algorithm or pseudocode
**Issue:** While the paper correctly notes that canonicalization is hard, providing pseudocode for the naive brute-force algorithm (enumerate labelings, compute mixed-radix, take min) would help readers implement it for small n.

**Suggestion:** Add a short algorithm box or appendix with the brute-force procedure.

---

## Minor Issues

1. **Line 159:** "mincode" should have a citation or definition. Currently it appears without context.

2. **Line 109:** "see Fig. 4" appears before Figures 1–3 are introduced in text. Consider reordering or adding forward references.

3. **Bibliography:** The Parthasarathy reference is marked as "Preprint"—check if a published version exists.

4. **Typo check:** The paper is clean, but run a spell-check pass before submission.

---

## Interactive Demo

The interactive (`interactive/index.html`) is well-designed for a non-expert audience. Suggestions:

- The graph canvas only supports n=4; consider adding a toggle for n=5 to match the paper's example list.
- The "Randomize" button for n=5 is a nice touch; consider adding one for n=4 as well.
- The mono-panel text in "Related Work" has a literal `\n` that should be a line break.

---

## Overall Assessment

This is a solid draft with a genuinely interesting idea. The construction-history perspective on graph encoding is novel, and the connection to Matula trees provides interpretive depth that canonical adjacency codes lack. The main technical content is correct.

**Recommended revisions before submission:**

| Priority | Item |
|----------|------|
| High | Clarify per-n vs global bijection |
| High | Fix SVG figure compilation |
| Medium | Expand or remove red-node encoding reference |
| Medium | Add inline example for mixed-radix formula |
| Low | Add Prüfer code to related work |
| Low | Add brute-force pseudocode |

**Verdict:** Minor revisions needed. The core contribution is sound and the presentation is largely clear. Address the injectivity scope and figure compilation, and this will be ready for submission.

---

*Review generated by Claude Opus 4.5 at the request of the author.*
