"""Optional independent KiUtils validation of fixtures produced by kicad.cjs."""
from kiutils.schematic import Schematic
from kiutils.board import Board
from pathlib import Path
import tempfile
p=Path(tempfile.gettempdir())/'mcad-kicad'
s=Schematic.from_file(str(p/'roundtrip.kicad_sch'))
assert len(s.schematicSymbols)==4 and len(s.libSymbols)==4
refs={next(prop.value for prop in sym.properties if prop.key=='Reference'):sym for sym in s.schematicSymbols}
assert set(refs)=={'R1','V1','C1','#PWR004'}
assert refs['R1'].position.X>=20 and refs['R1'].position.Y>=20
assert refs['R1'].position.X==refs['V1'].position.X
assert refs['R1'].position.Y==refs['V1'].position.Y
r=next(lib for lib in s.libSymbols if lib.entryName=='Symbol2')
assert len(r.units[1].pins)==2
assert r.units[1].pins[1].position.X==50
assert r.units[1].pins[1].position.Y==0
b=Board.from_file(str(p/'roundtrip.kicad_pcb'))
assert len(b.footprints)==1 and len(b.footprints[0].pads)==2
assert b.footprints[0].pads[1].position.X==10
assert b.footprints[0].pads[1].size.X==2
assert b.footprints[0].pads[1].drill.diameter==1
assert len(b.traceItems)==1 and b.traceItems[0].width==.4
s.to_file(str(p/'normalized.kicad_sch'))
b.to_file(str(p/'normalized.kicad_pcb'))
print('PASS: KiUtils independently parses symbols, library pins, footprints, pad size/drill and trace width; normalized files written')
