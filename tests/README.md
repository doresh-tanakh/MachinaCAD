# Validation

Run each Node test from the repository root:

```sh
for f in tests/*.cjs; do node "$f" || exit 1; done
```

Optional independent Gerber/Excellon validation uses Gerbonara (Apache-2.0), a test-only dependency that is not bundled into OlplotCAD. Install it into an isolated Python environment, then run `node tests/fabrication.cjs` followed by `python tests/fabrication_external.py` in the same environment. The fixture is written under the platform temporary directory. This verifies a sample, not every possible fabrication design.

The VM-based application tests do not replace actual browser and installed application testing.

Optional independent KiCad validation uses KiUtils in an isolated Python environment. Run `node tests/kicad.cjs`, then `python tests/kicad_external.py`. It checks the fixture's symbol/library pins and footprint/pad/trace records and writes normalized files under the platform temporary directory. The validator is not bundled into the application. Actual KiCad GUI opening remains a separate check.

Advanced geometry regression: run `node tests/advanced-pcb.cjs`, then `python tests/advanced_external.py` with KiUtils and Gerbonara available. This independently checks 16-pin IC records, shaped pads/zone records and Gerber cut-in region area so holes cannot silently become solid copper.
