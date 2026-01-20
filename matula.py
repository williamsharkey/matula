"""
Matula Numbers: Bijection between positive integers and rooted trees.

The encoding:
- 1 ↔ single node (leaf)
- n ↔ tree where children are trees for indices of prime factors
- Prime p_i at position i means child is tree for integer i

Example: 6 = 2 * 3 = p_1 * p_2, so tree(6) has children tree(1), tree(2)
"""

from functools import lru_cache
from typing import List, Tuple, Set
from collections import defaultdict


# Prime utilities
@lru_cache(maxsize=10000)
def is_prime(n: int) -> bool:
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, int(n**0.5) + 1, 2):
        if n % i == 0:
            return False
    return True


@lru_cache(maxsize=10000)
def nth_prime(n: int) -> int:
    """Return the n-th prime (1-indexed: nth_prime(1) = 2)."""
    if n < 1:
        raise ValueError("n must be >= 1")
    count = 0
    candidate = 1
    while count < n:
        candidate += 1
        if is_prime(candidate):
            count += 1
    return candidate


@lru_cache(maxsize=10000)
def prime_index(p: int) -> int:
    """Return the index of prime p (prime_index(2) = 1)."""
    if not is_prime(p):
        raise ValueError(f"{p} is not prime")
    count = 0
    for i in range(2, p + 1):
        if is_prime(i):
            count += 1
    return count


def prime_factorization(n: int) -> List[int]:
    """Return list of prime factors (with repetition)."""
    if n < 1:
        raise ValueError("n must be >= 1")
    if n == 1:
        return []
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)
    return factors


# Tree representation
class RootedTree:
    """A rooted tree, represented by its children (which are also RootedTrees)."""

    def __init__(self, children: List['RootedTree'] = None):
        self._children = list(children or [])
        self._matula = None  # Cache

    @property
    def children(self):
        return self._children

    def matula(self) -> int:
        """Compute the Matula number of this tree."""
        if self._matula is not None:
            return self._matula
        if not self._children:
            self._matula = 1
        else:
            result = 1
            for child in self._children:
                child_matula = child.matula()
                result *= nth_prime(child_matula)
            self._matula = result
        return self._matula

    def size(self) -> int:
        """Number of nodes in the tree."""
        return 1 + sum(child.size() for child in self.children)

    def depth(self) -> int:
        """Maximum depth (root has depth 0)."""
        if not self.children:
            return 0
        return 1 + max(child.depth() for child in self.children)

    def leaves(self) -> int:
        """Number of leaf nodes."""
        if not self.children:
            return 1
        return sum(child.leaves() for child in self.children)

    def is_leaf(self) -> bool:
        return len(self.children) == 0

    def __repr__(self):
        if not self.children:
            return "o"
        child_strs = [repr(c) for c in self.children]
        return f"({' '.join(child_strs)})"

    def __eq__(self, other):
        if not isinstance(other, RootedTree):
            return False
        return self.matula() == other.matula()

    def __hash__(self):
        # Use a tuple of children matulas for hashing
        if not self._children:
            return hash(1)
        return hash(tuple(c.matula() for c in self._children))


_tree_cache = {}

def integer_to_tree(n: int) -> RootedTree:
    """Convert a positive integer to its Matula tree."""
    if n in _tree_cache:
        return _tree_cache[n]

    if n < 1:
        raise ValueError("n must be >= 1")
    if n == 1:
        tree = RootedTree([])
    else:
        factors = prime_factorization(n)
        children = [integer_to_tree(prime_index(p)) for p in factors]
        tree = RootedTree(children)

    _tree_cache[n] = tree
    return tree


def tree_to_integer(tree: RootedTree) -> int:
    """Convert a rooted tree to its Matula number."""
    return tree.matula()


# Graph representation (adjacency list)
class Graph:
    """Simple undirected graph."""

    def __init__(self, n_vertices: int):
        self.n = n_vertices
        self.edges: Set[Tuple[int, int]] = set()

    def add_edge(self, u: int, v: int):
        if u != v:
            self.edges.add((min(u, v), max(u, v)))

    def has_edge(self, u: int, v: int) -> bool:
        return (min(u, v), max(u, v)) in self.edges

    def degree(self, v: int) -> int:
        return sum(1 for (a, b) in self.edges if a == v or b == v)

    def neighbors(self, v: int) -> Set[int]:
        result = set()
        for (a, b) in self.edges:
            if a == v:
                result.add(b)
            elif b == v:
                result.add(a)
        return result

    def n_edges(self) -> int:
        return len(self.edges)

    def adjacency_matrix(self) -> List[List[int]]:
        """Return the adjacency matrix."""
        mat = [[0] * self.n for _ in range(self.n)]
        for (u, v) in self.edges:
            mat[u][v] = 1
            mat[v][u] = 1
        return mat

    def upper_triangle_bits(self) -> int:
        """Encode upper triangle as an integer (binary string of bits)."""
        bits = 0
        pos = 0
        for i in range(self.n):
            for j in range(i + 1, self.n):
                if self.has_edge(i, j):
                    bits |= (1 << pos)
                pos += 1
        return bits

    def __repr__(self):
        return f"Graph(n={self.n}, edges={sorted(self.edges)})"


# Tree to Graph operations

class TreeNode:
    """A node in a tree with a unique identity (for graph construction)."""
    _counter = 0

    def __init__(self, tree: RootedTree, depth: int, parent: 'TreeNode' = None):
        self.tree = tree  # The RootedTree structure
        self.depth = depth
        self.parent = parent
        self.children: List['TreeNode'] = []
        self.idx = TreeNode._counter
        TreeNode._counter += 1

    def is_leaf(self) -> bool:
        return len(self.children) == 0

    def degree(self) -> int:
        """Degree in the tree (children + parent if not root)."""
        return len(self.children) + (1 if self.parent else 0)


def tree_to_nodes(tree: RootedTree) -> Tuple[List[TreeNode], TreeNode]:
    """
    Expand a RootedTree into a list of TreeNodes with unique identities.
    Returns (all_nodes, root_node).
    """
    TreeNode._counter = 0  # Reset counter
    all_nodes = []

    def expand(t: RootedTree, depth: int, parent: TreeNode) -> TreeNode:
        node = TreeNode(t, depth, parent)
        all_nodes.append(node)
        for child_tree in t.children:
            child_node = expand(child_tree, depth + 1, node)
            node.children.append(child_node)
        return node

    root = expand(tree, 0, None)
    return all_nodes, root


def tree_to_graph_base(tree: RootedTree) -> Tuple[Graph, List[TreeNode]]:
    """
    Convert tree to graph (just the tree edges).
    Returns graph and list of TreeNodes.
    """
    nodes, root = tree_to_nodes(tree)
    g = Graph(len(nodes))

    for node in nodes:
        for child in node.children:
            g.add_edge(node.idx, child.idx)

    return g, nodes


def operation_L(tree: RootedTree) -> Graph:
    """
    Operation L: Connect all leaves.
    The tree skeleton + edges between every pair of leaf nodes.
    """
    g, nodes = tree_to_graph_base(tree)
    leaves = [n.idx for n in nodes if n.is_leaf()]

    for i in range(len(leaves)):
        for j in range(i + 1, len(leaves)):
            g.add_edge(leaves[i], leaves[j])

    return g


def operation_S(tree: RootedTree) -> Graph:
    """
    Operation S: Sibling connection.
    Connect all children of each node to each other (siblings become cliques).
    """
    g, nodes = tree_to_graph_base(tree)

    for node in nodes:
        # Connect all children of this node
        child_indices = [c.idx for c in node.children]
        for i in range(len(child_indices)):
            for j in range(i + 1, len(child_indices)):
                g.add_edge(child_indices[i], child_indices[j])

    return g


def operation_D(tree: RootedTree) -> Graph:
    """
    Operation D: Connect nodes of same degree.
    Nodes with equal degree in the tree become connected.
    """
    g, nodes = tree_to_graph_base(tree)

    degree_groups = defaultdict(list)
    for node in nodes:
        degree_groups[node.degree()].append(node.idx)

    for deg, indices in degree_groups.items():
        for i in range(len(indices)):
            for j in range(i + 1, len(indices)):
                g.add_edge(indices[i], indices[j])

    return g


def operation_depth(tree: RootedTree) -> Graph:
    """
    Connect nodes at the same depth.
    """
    g, nodes = tree_to_graph_base(tree)

    depth_groups = defaultdict(list)
    for node in nodes:
        depth_groups[node.depth].append(node.idx)

    for d, indices in depth_groups.items():
        for i in range(len(indices)):
            for j in range(i + 1, len(indices)):
                g.add_edge(indices[i], indices[j])

    return g


# Analysis and exploration

def analyze_tree(n: int):
    """Print analysis of Matula tree for integer n."""
    tree = integer_to_tree(n)
    print(f"Matula number: {n}")
    print(f"Tree structure: {tree}")
    print(f"Size: {tree.size()} nodes")
    print(f"Depth: {tree.depth()}")
    print(f"Leaves: {tree.leaves()}")
    print(f"Prime factorization: {prime_factorization(n)}")
    print()


def analyze_operations(n: int):
    """Analyze graphs produced by various operations on tree n."""
    tree = integer_to_tree(n)
    print(f"=== Matula {n}: {tree} ===")
    print(f"Tree: {tree.size()} nodes, {tree.size() - 1} edges")

    ops = [
        ("Base (tree only)", lambda t: tree_to_graph_base(t)[0]),
        ("L (connect leaves)", operation_L),
        ("S (connect siblings)", operation_S),
        ("D (connect same degree)", operation_D),
        ("Depth (connect same depth)", operation_depth),
    ]

    for name, op in ops:
        g = op(tree)
        print(f"  {name}: {g.n_edges()} edges, upper_tri={g.upper_triangle_bits():b}")
    print()


if __name__ == "__main__":
    print("=== Matula Numbers: Integer-Tree Bijection ===\n")

    # Show first several trees
    print("Trees for integers 1-20:")
    for n in range(1, 21):
        tree = integer_to_tree(n)
        print(f"  {n:2d}: {tree}  (size={tree.size()}, depth={tree.depth()})")

    print("\n" + "="*50 + "\n")

    # Analyze some specific trees with operations
    for n in [4, 6, 8, 12, 30]:
        analyze_operations(n)
