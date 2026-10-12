"""Non-destructive NAVA refinement. Run with Blender --background --factory-startup --python.
Original GLBs stay untouched. glTF Y-up is converted to Blender Z-up by the importer.
"""
import bpy, math, re
import xml.etree.ElementTree as ET
from pathlib import Path
from mathutils import Matrix
ROOT = Path(__file__).resolve().parents[1]

def logo_paths():
    """Sample the supplied SVG's relative cubic outlines into closed mesh contours."""
    tree = ET.parse(ROOT/'public'/'nabz-logo.svg')
    contours=[]
    for path in tree.getroot().findall('{http://www.w3.org/2000/svg}path'):
        tokens=re.findall(r'[A-Za-z]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?',path.attrib['d'])
        i=0; command=None; current=(0,0); points=[]
        while i<len(tokens):
            if tokens[i].isalpha(): command=tokens[i]; i+=1
            if command in ('Z','z'): break
            if command=='M':
                current=(float(tokens[i]),float(tokens[i+1])); i+=2; points.append(current)
            elif command=='c':
                values=list(map(float,tokens[i:i+6])); i+=6
                a=current; b=(a[0]+values[0],a[1]+values[1]); c=(a[0]+values[2],a[1]+values[3]); d=(a[0]+values[4],a[1]+values[5])
                for step in range(1,17):
                    t=step/16; u=1-t
                    points.append(tuple(u**3*a[k]+3*u*u*t*b[k]+3*u*t*t*c[k]+t**3*d[k] for k in range(2)))
                current=d
            else: raise ValueError('Unsupported SVG command: '+str(command))
        contours.append(points)
    xs=[p[0] for points in contours for p in points]; ys=[p[1] for points in contours for p in points]
    bounds=(min(xs),min(ys),max(xs),max(ys))
    # Same supplied paths, tightly framed and light-colored for the website.
    tree.getroot().set('viewBox',f'{bounds[0]-4} {bounds[1]-4} {bounds[2]-bounds[0]+8} {bounds[3]-bounds[1]+8}')
    tree.getroot().set('fill','#e7f3fa')
    ET.register_namespace('','http://www.w3.org/2000/svg')
    tree.write(ROOT/'public'/'nabz-mark.svg',encoding='utf-8',xml_declaration=True)
    return contours,bounds

def add_logo(device, ink):
    contours,b=logo_paths(); scale=.0058/(b[2]-b[0])
    curve=bpy.data.curves.new('NABZ vector insignia','CURVE'); curve.dimensions='2D'; curve.fill_mode='BOTH'; curve.extrude=.000008
    for contour in contours:
        spline=curve.splines.new('POLY'); spline.points.add(len(contour)-1)
        for point,(x,y) in zip(spline.points,contour): point.co=((x-(b[0]+b[2])/2)*scale, ((b[1]+b[3])/2-y)*scale, 0, 1)
        spline.use_cyclic_u=True
    obj=bpy.data.objects.new('NABZ insignia',curve); bpy.context.collection.objects.link(obj)
    obj.parent=device; obj.location=(0,.014,.00855); curve.materials.append(ink)
    bpy.ops.object.select_all(action='DESELECT'); obj.select_set(True); bpy.context.view_layer.objects.active=obj
    bpy.ops.object.convert(target='MESH'); obj.select_set(False)

def material(name, color, metal, rough):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    m.diffuse_color = (*color, 1)
    return m

def assign(o, m):
    o.data.materials.clear(); o.data.materials.append(m)

def finish(o, parent, name, m, loc):
    o.name = name; o.parent = parent; o.matrix_parent_inverse = Matrix.Identity(4)
    o.location = loc; assign(o,m)
    for p in o.data.polygons: p.use_smooth = True
    return o

def ring(parent, name, loc, radius, tube, m):
    bpy.ops.mesh.primitive_torus_add(major_segments=64, minor_segments=10, major_radius=radius, minor_radius=tube)
    return finish(bpy.context.object,parent,name,m,loc)

for source, target in [('wristband.glb','wristband-refined.glb'),('nava-modular.glb','nava-modular-refined.glb')]:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(ROOT/'public'/source))
    matte=material('NAVA Matte polymer',(.015,.035,.055),.02,.66)
    chrome=material('NAVA Polished chrome',(.46,.57,.64),1,.19)
    satin=material('NAVA Satin titanium',(.07,.105,.13),.82,.34)
    rubber=material('NAVA Soft touch polymer',(.008,.016,.025),0,.82)
    black=material('NAVA Acoustic mesh',(.003,.008,.012),.18,.65)
    light=material('NAVA Callout light',(.035,.16,.20),.35,.28)
    for o in list(bpy.data.objects):
        if o.type!='MESH': continue
        n=o.name.lower()
        if 'domed front' in n: assign(o,matte)
        elif 'lower housing' in n: assign(o,satin)
        elif any(s in n for s in ['magnet','side control','connector','retaining rim','bail']): assign(o,chrome)
        elif 'cradle base' in n or 'magnetic adapter' in n or 'cord' in n: assign(o,rubber)
        elif 'microphone' in n: assign(o,black)
        if any(s in n for s in ['domed front','lower housing','side control','connector']):
            # Weld duplicated glTF normals before adding manufactured edge radii.
            bpy.context.view_layer.objects.active=o; o.select_set(True)
            bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.remove_doubles(threshold=.0000001); bpy.ops.object.mode_set(mode='OBJECT')
            bevel=o.modifiers.new('Precision edge radius','BEVEL'); bevel.width=.00008; bevel.segments=3; bevel.limit_method='ANGLE'; bevel.angle_limit=.55
            bpy.ops.object.modifier_apply(modifier=bevel.name)
            o.select_set(False)
        for poly in o.data.polygons: poly.use_smooth=True
    device=bpy.data.objects['DEVICE_ROOT']
    old_logo=bpy.data.objects.get('N insignia')
    if old_logo: bpy.data.objects.remove(old_logo,do_unlink=True)
    ink=material('NABZ silver insignia',(.65,.83,.89),.55,.3)
    add_logo(device,ink)
    ring(device,'Microphone chrome bezel',(0,-.014,.00837),.00094,.00013,chrome)
    ring(device,'Microphone callout light',(0,-.014,.00844),.00076,.00008,light)
    # Recessed, dark acoustic perforations with actual mesh edges, not a painted dot.
    for row in range(-2,3):
        for col in range(-2,3):
            x=col*.00027; y=row*.00027
            if x*x+y*y > .00059**2: continue
            bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=1)
            o=finish(bpy.context.object,device,'Microphone grille perforation',(black),(x,-.014+y,.00845))
            o.scale=(.000085,.000085,.000025)
    for i,z in enumerate([.013,-.013]):
        ring(device,f'Magnet chrome bezel {i}',(0,-z,-.00024),.0029,.00013,chrome)
        ring(device,f'Magnet callout light {i}',(0,-z,-.00031),.00265,.000085,light)
    # Each dock also receives its own light ring, visible in the necklace callout.
    for rootname, prefix, height in [('WRIST_ROOT','Cradle',.00274),('NECKLACE_ROOT','Necklace',.00254)]:
        parent=bpy.data.objects.get(rootname)
        if parent:
            for i,z in enumerate([.013,-.013]):
                ring(parent,f'{prefix} magnet callout light {i}',(0,-z,height),.00265,.000085,light)
    bpy.ops.export_scene.gltf(filepath=str(ROOT/'public'/target),export_format='GLB',export_yup=True,export_apply=True,export_animations=False)
    print('EXPORTED',target)
