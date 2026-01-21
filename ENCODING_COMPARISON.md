# Encoding Comparison: Sentinel vs Plus-2

## The Two Approaches

### Sentinel Encoding
```
enc'(G) = 2^k + enc(G)    where k = n(n-1)/2
```
- Prepends a `1` bit
- Encoding ranges: [2^k, 2^(k+1)-1]
- **Ranges don't overlap** across different n

### Plus-2 Encoding
```
enc'(G) = enc(G) + 2
```
- Adds 2 to every encoding
- Encoding ranges: [2, 2^k + 1]
- **Ranges overlap** across different n

---

## Collision Status

| Encoding | Collisions (n ≤ 5) |
|----------|-------------------|
| Sentinel | None |
| Plus-2 | None |

Both are collision-free!

---

## The Key Difference: Interleaving

### Sentinel: Strict separation by vertex count

Products always separate by n because encoding ranges don't overlap:
```
n=2: encodings [2, 3]
n=3: encodings [8, 15]       (no overlap with n=2)
n=4: encodings [64, 127]     (no overlap with n=3)
n=5: encodings [1024, 2047]  (no overlap with n=4)
```

All 4-vertex graphs come before all 5-vertex graphs. Period.

### Plus-2: Interleaving occurs at n ≥ 4

Even though encoding ranges overlap, products usually separate by n because
factorial growth dominates... **except at the extremes!**

```
Max product for n=4:  K_4     → ≈ 10^43.5
Min product for n=5:  Empty_5 → ≈ 10^36.1
```

**K_4's product exceeds Empty_5's product!**

This means in the Plus-2 ordering:
```
... most 4-vertex graphs ...
Empty_5                        ← 5-vertex graph appears
... more 5-vertex graphs ...
K_4                            ← 4-vertex graph appears LATE!
... remaining 5-vertex graphs ...
```

---

## When Does Interleaving Occur?

Interleaving happens when: `Max(n) > Min(n+1)`

| n → n+1 | Max(n) | Min(n+1) | Interleaves? |
|---------|--------|----------|--------------|
| 2 → 3 | 10^1.0 | 10^1.8 | No |
| 3 → 4 | 10^5.7 | 10^7.2 | No |
| 4 → 5 | 10^43.5 | 10^36.1 | **Yes!** |
| 5 → 6 | 10^361.3 | 10^216.7 | **Yes!** |
| 6 → 7 | 10^3251.1 | 10^1517.2 | **Yes!** |

The interleaving grows more extreme at larger n.

---

## Mathematical Condition for Interleaving

Interleaving occurs when:
```
(2^k + 1)^(n!) > 2^((n+1)!)
```

Taking logs and simplifying:
```
n! × log(2^k + 1) > (n+1)! × log(2)
n! × k > (n+1) × n!     (approximately)
k > n + 1
n(n-1)/2 > n + 1
n² - 3n - 2 > 0
n > (3 + √17)/2 ≈ 3.56
```

**Interleaving occurs for n ≥ 4.**

---

## Interpretation: Two Notions of "Size"

### Sentinel ordering: Size = vertex count
- Clean separation by n
- All graphs on n vertices come before all graphs on n+1 vertices
- The "complexity" of a graph is bounded by its vertex count

### Plus-2 ordering: Size = "intrinsic complexity"
- K_4 is "more complex" than Empty_5
- The complete graph on 4 vertices has more structure than
  the empty graph on 5 vertices
- Interleaving reveals cross-size complexity relationships

---

## Which Is Better?

| Criterion | Sentinel | Plus-2 |
|-----------|----------|--------|
| Simplicity | ✓ Clean separation | Requires analysis |
| Self-describing | ✓ Bit count = n | No |
| Collision-free | ✓ Yes | ✓ Yes |
| Captures cross-n complexity | No | ✓ Yes |
| Predictable ordering | ✓ Yes | Partially |

**Sentinel** is better for:
- Enumeration algorithms (process by vertex count)
- Self-describing encodings
- Simple proofs

**Plus-2** is interesting for:
- Studying graph complexity
- Cross-size comparisons
- Revealing that K_n is "more complex" than sparse (n+1)-vertex graphs

---

## Conclusion

Both encodings are valid and collision-free.

**Sentinel** provides clean mathematical properties.
**Plus-2** reveals interesting complexity relationships.

The choice depends on what you want to study.
