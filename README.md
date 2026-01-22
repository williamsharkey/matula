# Matula

Notes, paper draft, and interactive for the construction-bijection project.

## Private OEIS Tool

A private OEIS CLI lives at `~/Desktop/integer-search`.
Use the thin wrappers here:

```bash
scripts/oeis-search.sh "Matula number" "graph encoding"
scripts/oeis-fetch.sh A382757 A076184
```

## Build the paper PDF

```bash
cd paper
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

Note: Claude Code will compile the paper and can install `pdflatex` if needed.
