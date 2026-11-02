# Validation

Run each Node test from the repository root:

```sh
for f in tests/*.cjs; do node "$f" || exit 1; done
```

Optional independent Gerber/Excellon validation uses Gerbonara (Apache-2.0), a test-only dependency that is not bundled into MachinaCAD. Install it into an isolated Python environment, then run `node tests/fabrication.cjs` followed by `python tests/fabrication_external.py` in the same environment. The fixture is written under the platform temporary directory. This verifies a sample, not every possible fabrication design.

The VM-based application tests do not replace actual browser and installed application testing.
