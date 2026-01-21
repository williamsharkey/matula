# The Encoding Product: A Graph Invariant

## The Fix: Triangular Encoding (Sentinel Bit)

The original encoding has degenerate cases (empty graphs, K₂ all map to product=1).

**The fix**: Prepend a 1 bit to every encoding.

```
enc'(G) = 2^k + enc(G)

where k = n(n-1)/2 = T_{n-1} (triangular number!)
```

In binary:
```
Original:  [b₂ b₁ b₀]     →  0 to 7
Sentinel:  [1  b₂ b₁ b₀]  →  8 to 15
           ↑
           sentinel bit
```

### Encoding Ranges by Vertex Count

| n | k = T_{n-1} | Encoding Range | Binary |
|---|-------------|----------------|--------|
| 2 | 1 | [2, 3] | 10 to 11 |
| 3 | 3 | [8, 15] | 1000 to 1111 |
| 4 | 6 | [64, 127] | 1000000 to 1111111 |
| 5 | 10 | [1024, 2047] | 10000000000 to 11111111111 |

**The ranges don't overlap!** The bit-length encodes n.

### Result: Zero Collisions

With sentinel encoding, all 51 graphs (n ≤ 5) have **unique products**.

| Graph | Sentinel Encoding | Product |
|-------|------------------|---------|
| Empty₂ | 10 = 2 | 2² = 4 |
| K₂ | 11 = 3 | 3² = 9 |
| Empty₃ | 1000 = 8 | 8⁶ = 262,144 |
| K₃ | 1111 = 15 | 15⁶ = 11,390,625 |

---

## Definition (Original)

For a graph G on n vertices, the **Encoding Product** P(G) is:

```
P(G) = ∏(enc^count) for each unique encoding enc
```

where:
- Each of the n! vertex labelings gives an upper-triangle encoding
- Encodings repeat due to automorphisms
- We multiply each unique encoding raised to its multiplicity
- Zero encodings (from empty graphs) are excluded

## The Key Question

**Can two non-isomorphic graphs have the same product?**

### Answer: Only trivially

Up to n=5 (51 graphs), the only collision is:
```
Product = 1: Empty₂, K₂, Empty₃, Empty₄, Empty₅
```

These are degenerate cases where:
- Empty graphs have only encoding 0 → product = 1 (empty product)
- K₂ has only encoding 1 → product = 1¹ × 1¹ = 1

**Conjecture**: For graphs with n ≥ 3 and at least one edge, the product is a **complete invariant** (no collisions).

---

## Comparing the Two Orderings

### (n, canonical) vs (n, product)

| Graph | n | edges | canonical | Product (factored) | ≈10^ |
|-------|---|-------|-----------|-------------------|------|
| Empty₂ | 2 | 0 | 0 | 1 | 0 |
| K₂ | 2 | 1 | 1 | 1² | 0 |
| Empty₃ | 3 | 0 | 0 | 1 | 0 |
| P₂+iso | 3 | 1 | 1 | 1² × 2² × 4² | 1.8 |
| P₃ | 3 | 2 | 3 | 3² × 5² × 6² | 3.9 |
| K₃ | 3 | 3 | 7 | 7⁶ | 5.1 |
| Empty₄ | 4 | 0 | 0 | 1 | 0 |
| edge+2iso | 4 | 1 | 1 | 1⁴ × 2⁴ × 4⁴ × 8⁴ × 16⁴ × 32⁴ | 18.1 |
| P₃+iso | 4 | 2 | 3 | 3² × 5² × ... (12 terms) | 28.4 |
| **2K₂** | 4 | 2 | **12** | 12⁸ × 18⁸ × 33⁸ | **30.8** |
| **K₁,₃** | 4 | 3 | **7** | 7⁶ × 25⁶ × 42⁶ × 52⁶ | **33.5** |
| P₄ | 4 | 3 | 11 | 11⁶ × 21⁶ × 38⁶ × 56⁶ | 34.1 |
| K₃+iso | 4 | 3 | 13 | (12 terms)² | 35.0 |
| K₄-e | 4 | 4 | 15 | (12 terms)² | 35.1 |
| C₄ | 4 | 4 | 30 | 30⁸ × 45⁸ × 51⁸ | 38.7 |
| K₄-edge | 4 | 5 | 31 | 31⁴ × 47⁴ × ... | 40.0 |
| K₄ | 4 | 6 | 63 | 63²⁴ | 43.2 |

### The Reordering at n=4

```
Canonical order: 0, 1, 3, 7, 11, 12, 13, 15, 30, 31, 63
Product order:   0, 1, 3, 12, 7, 11, 13, 15, 30, 31, 63
                        ↑↑↑
                     Different!
```

The **matching 2K₂** (canonical=12) has a SMALLER product than the **star K₁,₃** (canonical=7).

Why? The matching is MORE SYMMETRIC:
- 2K₂: |Aut| = 8, only 3 unique encodings, each ×8
- K₁,₃: |Aut| = 6, only 4 unique encodings, each ×6

Product order ≈ "symmetry order" (more symmetric → smaller product)

---

## Properties of the Encoding Product

### 1. Complete invariant (conjectured)
Two non-isomorphic graphs (n≥3, edges≥1) have different products.

### 2. Captures automorphism structure
P(G) encodes not just the canonical form but the entire orbit structure under Sₙ.

### 3. Monotonic in edges (roughly)
More edges generally → larger encodings → larger product.
But symmetry can override this (matching vs star example).

### 4. Separated by vertex count (mostly)
Products grow so fast that n-vertex products are typically smaller than (n+1)-vertex products.
Exception: degenerate product=1 cases.

---

## Why Products Might Be Unique

### The Multiset Determines the Graph

The multiset of all n! encodings uniquely determines the graph up to isomorphism.

**Proof sketch**:
- Two graphs G, H are isomorphic iff there exists σ ∈ Sₙ with H = σ(G)
- This means H's encoding multiset is a cyclic permutation of G's
- But as multisets (unordered), they're identical
- Conversely, same multiset → some permutation maps one to other → isomorphic

### Product = Hash of Multiset

The product is a "hash" of the multiset:
```
{a, a, b, c} → a² × b × c
```

For this hash to collide, we need different multisets with equal products:
```
{2, 2, 3} → 2² × 3 = 12
{4, 3} → 4 × 3 = 12 (but 4 appears once, 3 once)
Actually: {4, 3, 3, 3} vs {2, 2, 9, 3} ... need same total multiplicity
```

The constraint that both multisets come from valid graph encodings (not arbitrary integers) seems to prevent collisions.

**Open problem**: Prove that encoding multisets from distinct graphs always have distinct products.

---

## Naming Suggestions

- **Encoding Product** - describes what it is
- **Permutation Product** - emphasizes the n! permutations
- **Upper-Triangle Product (UTP)** - emphasizes the matrix encoding
- **Labeling Product Invariant** - emphasizes its invariant property

If proven to be collision-free:
- **Complete Encoding Product** - emphasizes completeness

---

## Comparison Summary

| Property | (n, canonical) ordering | (n, product) ordering |
|----------|------------------------|----------------------|
| Defines bijection? | Yes | Yes (if no collisions) |
| Ordering within n | By minimum encoding | By product value |
| Captures symmetry? | No | Yes (|Aut| affects product) |
| Matches for most graphs? | - | Yes, differs only for some |
| Computational cost | O(n!) to find minimum | O(n!) to compute all |
| Closed-form rank? | No | No |

---

## The Worksheet Formula

For a graph G with encoding multiset {e₁^{a₁}, e₂^{a₂}, ..., eₖ^{aₖ}}:

```
P(G) = e₁^{a₁} × e₂^{a₂} × ... × eₖ^{aₖ}

where Σaᵢ = n! and k = n!/|Aut(G)|
```

Example: K₃ (triangle)
- All 6 permutations give encoding 7
- k = 1 unique encoding, a₁ = 6
- P(K₃) = 7⁶ = 117,649
