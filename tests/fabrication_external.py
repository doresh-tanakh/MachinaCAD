"""Optional independent Gerbonara check. Run node tests/fabrication.cjs first.
Validation-only dependency: Gerbonara (Apache-2.0); not bundled into the app.
"""
from gerbonara import GerberFile, ExcellonFile
from pathlib import Path
import math, zipfile, warnings, tempfile
warnings.simplefilter('error', SyntaxWarning)
p=Path(tempfile.gettempdir())/'mcad-fabrication'
for side,expected in [('F',(10,10,30,10)),('B',(10,10,10,20))]:
    g=GerberFile.open(p/f'board-{side}_Cu.gbr')
    assert len(g.objects)==2
    pad,line=g.objects
    assert (line.x1,line.y1,line.x2,line.y2)==expected
    assert math.isclose(line.aperture.diameter,.4)
    assert (pad.x,pad.y,pad.aperture.diameter)==(10,10,2)
    g=GerberFile.open(p/f'board-{side}_Mask.gbr')
    assert len(g.objects)==1 and g.file_attrs['.FilePolarity']==('Negative',)
    assert math.isclose(g.objects[0].aperture.diameter,2.1)
g=GerberFile.open(p/'board-Edge_Cuts.gbr')
assert [(o.x1,o.y1,o.x2,o.y2) for o in g.objects]==[(0,0,50,0),(50,0,50,30),(50,30,0,30),(0,30,0,0)]
d=ExcellonFile.open(p/'board-PTH.drl')
assert len(d.objects)==1 and d.is_plated
assert (d.objects[0].x,d.objects[0].y,d.objects[0].tool.diameter)==(10,10,1)
with zipfile.ZipFile(str(p)+'.zip') as z:
    assert z.testzip() is None
    for name in z.namelist():
        assert z.read(name)==(p/name).read_bytes()
print('PASS: independent Gerbonara coordinates, aperture, mask polarity, plating, closed outline and ZIP CRC')
