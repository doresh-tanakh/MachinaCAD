"""Independent KiUtils + Gerbonara regression. Run advanced-pcb.cjs first."""
from pathlib import Path
import tempfile, json, math
from kiutils.schematic import Schematic
from kiutils.board import Board
from gerbonara import GerberFile, ExcellonFile
p=Path(tempfile.gettempdir())/'olplot-advanced'
s=Schematic.from_file(str(p/'ic.kicad_sch'))
assert len(s.schematicSymbols)==1
pins=[pin for lib in s.libSymbols for unit in lib.units for pin in unit.pins]
assert len(pins)==16 and {pin.number for pin in pins}==set(map(str,range(1,17)))
assert s.schematicSymbols[0].position.X>=20 and s.schematicSymbols[0].position.Y>=20
b=Board.from_file(str(p/'board.kicad_pcb'))
pads=[pad for fp in b.footprints for pad in fp.pads]
assert {pad.shape for pad in pads}=={'rect','oval','custom'}
assert len(b.zones)==1 and b.zones[0].filledPolygons
expected=json.loads((p/'geometry.json').read_text())
g=GerberFile.open(p/'board-F_Cu.gbr')
assert len(g.objects)==expected['regionCount']
assert all(type(o).__name__=='Region' and o.polarity_dark for o in g.objects)
def area(points):
    return abs(sum(x*y2-x2*y for (x,y),(x2,y2) in zip(points,points[1:]+points[:1]))/2)
actual=area(g.objects[-1].outline)
assert math.isclose(actual,expected['planeArea'],abs_tol=.003), (actual,expected['planeArea'])
assert len(ExcellonFile.open(p/'board-PTH.drl').objects)==2
print('PASS: KiUtils 16-pin IC, pad shapes/zone; Gerbonara cut-in regions preserve plane holes/area and drill count')
