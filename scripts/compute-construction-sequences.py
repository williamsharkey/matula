#!/usr/bin/env python3
import itertools
from collections import defaultdict


def edge_list(n):
    return [(i, j) for i in range(n) for j in range(i + 1, n)]


def build_edge_index(n):
    edges = edge_list(n)
    return edges, {e: idx for idx, e in enumerate(edges)}


def perm_maps(n, edges, edge_index):
    maps = []
    for perm in itertools.permutations(range(n)):
        mapping = [0] * len(edges)
        for idx, (i, j) in enumerate(edges):
            a = perm[i]
            b = perm[j]
            if a > b:
                a, b = b, a
            mapping[idx] = edge_index[(a, b)]
        maps.append((perm, mapping))
    return maps


def permute_bits(bits, mapping):
    new_bits = 0
    while bits:
        lsb = bits & -bits
        pos = lsb.bit_length() - 1
        new_bits |= 1 << mapping[pos]
        bits &= bits - 1
    return new_bits


def canonical_adjacency(bits, maps):
    min_bits = None
    for _, mapping in maps:
        b = permute_bits(bits, mapping)
        if min_bits is None or b < min_bits:
            min_bits = b
    return min_bits


def has_edge(bits, edge_index, u, v):
    if u > v:
        u, v = v, u
    pos = edge_index[(u, v)]
    return (bits >> pos) & 1


def construction_integer(bits, n, edge_index, perms):
    best = None
    for perm in perms:
        seq = []
        for k in range(1, n):
            mask = 0
            v = perm[k]
            for j in range(k):
                u = perm[j]
                if has_edge(bits, edge_index, u, v):
                    mask |= 1 << j
            seq.append(mask)
        mult = 1
        value = 0
        for k, c in enumerate(seq, start=1):
            value += mult * c
            mult *= 2 ** k
        if best is None or value < best:
            best = value
    return best


def enumerate_unlabeled_graphs(n):
    edges, edge_index = build_edge_index(n)
    maps = perm_maps(n, edges, edge_index)
    seen = {}
    total_edges = len(edges)
    for bits in range(1 << total_edges):
        canon = canonical_adjacency(bits, maps)
        if canon not in seen:
            seen[canon] = bits
    # return list of (canonical adjacency, representative bits)
    items = list(seen.items())
    items.sort(key=lambda x: x[0])
    return items, edge_index


def main(max_n=6):
    all_sequence = []
    per_n = {}
    for n in range(1, max_n + 1):
        items, edge_index = enumerate_unlabeled_graphs(n)
        perms = list(itertools.permutations(range(n)))
        values = []
        for canon, bits in items:
            val = construction_integer(bits, n, edge_index, perms)
            values.append(val)
        per_n[n] = values
        all_sequence.extend(values)
    print("# Construction integers ordered by (n, canonical adjacency)\n")
    for n in range(1, max_n + 1):
        print(f"n={n}: {per_n[n]}")
    print("\n# Concatenated sequence")
    print(all_sequence)

if __name__ == "__main__":
    main(6)
