import os
import re
import copy
import glob
from lxml import etree
import math

# Parameters
# input_svg_path is now determined dynamically in __main__
output_dir = os.path.join("data", "svgs")
DEBUG = False
SCALE_FACTOR = 10.0 # Scaling 10x as requested ("1- times")

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Grid Parameters from original script
col_start_x = 111.171
row_start_y = 20.304
col_width = 56.7
row_height = 26.928

col_stride = 109.134
row_stride = 26.928

rows = 21
cols = 5
# start_id is now determined dynamically per file

NS = {
    'svg': 'http://www.w3.org/2000/svg',
    'xlink': 'http://www.w3.org/1999/xlink',
    'inkscape': 'http://www.inkscape.org/namespaces/inkscape'
}

def clean_tag(tag):
    if '}' in tag:
        return tag.split('}', 1)[1]
    return tag

class Matrix:
    def __init__(self, a=1, b=0, c=0, d=1, e=0, f=0):
        # SVG Matrix: [a c e]
        #             [b d f]
        self.a, self.b, self.c, self.d, self.e, self.f = a, b, c, d, e, f

    def multiply(self, other):
        # Result = Self * Other (transform composition)
        # Verify: If transform="A B", point p becomes A(B(p)).
        # It means B is applied first, then A.
        # But in SVG: transform="translate(..) scale(..)"
        # This is effectively T * S * p.
        # So we accumulate: Current * Next.
        return Matrix(
            self.a * other.a + self.c * other.b,
            self.b * other.a + self.d * other.b,
            self.a * other.c + self.c * other.d,
            self.b * other.c + self.d * other.d,
            self.a * other.e + self.c * other.f + self.e,
            self.b * other.e + self.d * other.f + self.f
        )
    
    def transform_point(self, x, y):
        return (
            self.a * x + self.c * y + self.e,
            self.b * x + self.d * y + self.f
        )
    
    def __repr__(self):
        return f"Matrix({self.a},{self.b},{self.c},{self.d},{self.e},{self.f})"

def parse_transform(transform_str):
    m = Matrix()
    if not transform_str:
        return m
    
    # Simple parser for "matrix(a,b,c,d,e,f)"
    # Handles multiple matrix(...) occurrences
    pattern = r'matrix\s*\(([^)]+)\)'
    matches = re.finditer(pattern, transform_str)
    
    for match in matches:
        args = match.group(1).replace(',', ' ')
        nums = [float(x) for x in args.split() if x]
        if len(nums) == 6:
            # Create matrix
            next_m = Matrix(*nums)
            m = m.multiply(next_m)
            
    # Note: Does not support translate, scale, rotate, skewX/Y yet.
    # If the input SVG uses them, the transform calculation will be incomplete (identity used).
    # Since the sample only showed 'matrix', this is acceptable for now.
    
    return m

def solve_cubic_extrema(p0, p1, p2, p3):
    # Solves for t where B'(t) = 0 for 1D cubic Bezier:
    # B(t) = (1-t)^3*p0 + 3(1-t)^2*t*p1 + 3(1-t)t^2*p2 + t^3*p3
    # B'(t) = 3(1-t)^2(p1-p0) + 6(1-t)t(p2-p1) + 3t^2(p3-p2)
    # This is a quadratic equation at^2 + bt + c = 0
    # a = 3(-p0 + 3p1 - 3p2 + p3)
    # b = 6(p0 - 2p1 + p2)
    # c = 3(p1 - p0)
    
    a = 3 * (-p0 + 3*p1 - 3*p2 + p3)
    b = 6 * (p0 - 2*p1 + p2)
    c = 3 * (p1 - p0)
    
    vals = [p0, p3] # Endpoints
    
    if abs(a) < 1e-9:
        if abs(b) > 1e-9:
            t = -c / b
            if 0 < t < 1:
                vals.append((1-t)**3*p0 + 3*(1-t)**2*t*p1 + 3*(1-t)*t**2*p2 + t**3*p3)
    else:
        disc = b*b - 4*a*c
        if disc >= 0:
            sqrt_disc = math.sqrt(disc)
            t1 = (-b + sqrt_disc) / (2*a)
            t2 = (-b - sqrt_disc) / (2*a)
            for t in [t1, t2]:
                if 0 < t < 1:
                    vals.append((1-t)**3*p0 + 3*(1-t)**2*t*p1 + 3*(1-t)*t**2*p2 + t**3*p3)
    return min(vals), max(vals)

def get_path_bbox(d):
    if not d:
        return None
    
    # Path parser
    # Split into tokens: commands and numbers
    # Command letters: M, m, L, l, H, h, V, v, C, c, S, s, Q, q, T, t, A, a, Z, z
    # Numbers: float format
    tokens = re.findall(r'[a-zA-Z]|[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?', d)
    
    curr_x, curr_y = 0.0, 0.0
    start_x, start_y = 0.0, 0.0
    
    # We use lists to easily update via nonlocal in helper
    bounds = {'min_x': float('inf'), 'min_y': float('inf'), 'max_x': float('-inf'), 'max_y': float('-inf')}
    
    def update(x, y):
        bounds['min_x'] = min(bounds['min_x'], x)
        bounds['max_x'] = max(bounds['max_x'], x)
        bounds['min_y'] = min(bounds['min_y'], y)
        bounds['max_y'] = max(bounds['max_y'], y)

    idx_ptr = [0]
    count = len(tokens)
    
    last_ctrl_x, last_ctrl_y = 0.0, 0.0 # For S/T commands
    
    current_cmd = 'M' # Default start
    last_cmd_code = None
    
    def get_nums(n):
        res = []
        for _ in range(n):
            if idx_ptr[0] < count:
                val = tokens[idx_ptr[0]]
                # Verify it is a number
                if val[0].isalpha():
                    return None
                idx_ptr[0] += 1
                res.append(float(val))
            else:
                return None
        return res

    while idx_ptr[0] < count:
        token = tokens[idx_ptr[0]]
        
        if token[0].isalpha():
            current_cmd = token
            idx_ptr[0] += 1
            # Reset implicitly repeated command logic
            # (handled by checking current_cmd later)
        else:
            # Repeated command logic
            if current_cmd == 'M': current_cmd = 'L'
            elif current_cmd == 'm': current_cmd = 'l'
            # else keep current_cmd
            
        c = current_cmd
        
        if c == 'M': # Move Abs
            nums = get_nums(2)
            if nums:
                curr_x, curr_y = nums[0], nums[1]
                start_x, start_y = curr_x, curr_y
                update(curr_x, curr_y)
                last_cmd_code = 'M'
                last_ctrl_x, last_ctrl_y = curr_x, curr_y

        elif c == 'm': # Move Rel
            nums = get_nums(2)
            if nums:
                curr_x += nums[0]
                curr_y += nums[1]
                start_x, start_y = curr_x, curr_y
                update(curr_x, curr_y)
                last_cmd_code = 'm'
                last_ctrl_x, last_ctrl_y = curr_x, curr_y

        elif c == 'L': # Line Abs
            nums = get_nums(2)
            if nums:
                curr_x, curr_y = nums[0], nums[1]
                update(curr_x, curr_y)
                last_cmd_code = 'L'
                last_ctrl_x, last_ctrl_y = curr_x, curr_y

        elif c == 'l': # Line Rel
            nums = get_nums(2)
            if nums:
                curr_x += nums[0]
                curr_y += nums[1]
                update(curr_x, curr_y)
                last_cmd_code = 'l'
                last_ctrl_x, last_ctrl_y = curr_x, curr_y

        elif c == 'H': # Horiz Abs
            nums = get_nums(1)
            if nums:
                curr_x = nums[0]
                update(curr_x, curr_y)
                last_cmd_code = 'H'
                last_ctrl_x, last_ctrl_y = curr_x, curr_y

        elif c == 'h': # Horiz Rel
            nums = get_nums(1)
            if nums:
                curr_x += nums[0]
                update(curr_x, curr_y)
                last_cmd_code = 'h'
                last_ctrl_x, last_ctrl_y = curr_x, curr_y

        elif c == 'V': # Vert Abs
            nums = get_nums(1)
            if nums:
                curr_y = nums[0]
                update(curr_x, curr_y)
                last_cmd_code = 'V'
                last_ctrl_x, last_ctrl_y = curr_x, curr_y

        elif c == 'v': # Vert Rel
            nums = get_nums(1)
            if nums:
                curr_y += nums[0]
                update(curr_x, curr_y)
                last_cmd_code = 'v'
                last_ctrl_x, last_ctrl_y = curr_x, curr_y
                
        elif c == 'C': # Cubic Abs (x1 y1 x2 y2 x y)
            nums = get_nums(6)
            if nums:
                p0x, p0y = curr_x, curr_y
                p1x, p1y = nums[0], nums[1]
                p2x, p2y = nums[2], nums[3]
                p3x, p3y = nums[4], nums[5]
                
                # Calculate bounds for curve segment
                x_min, x_max = solve_cubic_extrema(p0x, p1x, p2x, p3x)
                y_min, y_max = solve_cubic_extrema(p0y, p1y, p2y, p3y)
                
                update(x_min, y_min)
                update(x_max, y_max)
                
                curr_x, curr_y = p3x, p3y
                last_ctrl_x, last_ctrl_y = p2x, p2y
                last_cmd_code = 'C'

        elif c == 'c': # Cubic Rel
            nums = get_nums(6)
            if nums:
                # Relative points: absolute coords are curr + relative
                p1x, p1y = curr_x + nums[0], curr_y + nums[1]
                p2x, p2y = curr_x + nums[2], curr_y + nums[3]
                p3x, p3y = curr_x + nums[4], curr_y + nums[5]
                
                x_min, x_max = solve_cubic_extrema(curr_x, p1x, p2x, p3x)
                y_min, y_max = solve_cubic_extrema(curr_y, p1y, p2y, p3y)
                
                update(x_min, y_min)
                update(x_max, y_max)
                
                curr_x, curr_y = p3x, p3y
                last_ctrl_x, last_ctrl_y = p2x, p2y
                last_cmd_code = 'c'
        
        elif c == 'S': # Smooth Cubic Abs
            nums = get_nums(4)
            if nums:
                p1x, p1y = curr_x, curr_y
                if last_cmd_code in ['C', 'c', 'S', 's']:
                    p1x = 2*curr_x - last_ctrl_x
                    p1y = 2*curr_y - last_ctrl_y
                
                p2x, p2y = nums[0], nums[1]
                p3x, p3y = nums[2], nums[3]
                
                x_min, x_max = solve_cubic_extrema(curr_x, p1x, p2x, p3x)
                y_min, y_max = solve_cubic_extrema(curr_y, p1y, p2y, p3y)
                update(x_min, y_min)
                update(x_max, y_max)
                
                curr_x, curr_y = p3x, p3y
                last_ctrl_x, last_ctrl_y = p2x, p2y
                last_cmd_code = 'S'
                
        elif c == 's': # Smooth Cubic Rel
            nums = get_nums(4)
            if nums:
                p1x, p1y = curr_x, curr_y
                if last_cmd_code in ['C', 'c', 'S', 's']:
                    p1x = 2*curr_x - last_ctrl_x
                    p1y = 2*curr_y - last_ctrl_y
                
                p2x, p2y = curr_x + nums[0], curr_y + nums[1]
                p3x, p3y = curr_x + nums[2], curr_y + nums[3]
                
                x_min, x_max = solve_cubic_extrema(curr_x, p1x, p2x, p3x)
                y_min, y_max = solve_cubic_extrema(curr_y, p1y, p2y, p3y)
                update(x_min, y_min)
                update(x_max, y_max)
                
                curr_x, curr_y = p3x, p3y
                last_ctrl_x, last_ctrl_y = p2x, p2y
                last_cmd_code = 's'
                
        elif c == 'Z' or c == 'z':
            curr_x, curr_y = start_x, start_y
            last_cmd_code = 'Z'
            
        else:
            # Skip unknown commands? 
            # If we don't handle it, we might misinterpret subsequent numbers.
            # Fallback: Just consume one token unless we know better.
             pass

    if bounds['min_x'] == float('inf'):
        # Fallback to simple parser if something failed or empty
         nums = re.findall(r'[+\-]?\d*\.?\d+(?:[eE][+\-]?\d+)?', d)
         if not nums: return None
         values = [float(x) for x in nums]
         return (min(values), min(values), max(values), max(values))
         
    return (bounds['min_x'], bounds['min_y'], bounds['max_x'], bounds['max_y'])

def get_element_bbox(elem, matrix):
    tag = clean_tag(elem.tag)
    local_bbox = None
    
    if tag == 'path':
        d = elem.get('d')
        local_bbox = get_path_bbox(d)
        
    elif tag in ['rect', 'image']:
        try:
            x = float(elem.get('x', '0'))
            y = float(elem.get('y', '0'))
            w = float(elem.get('width', '0'))
            h = float(elem.get('height', '0'))
            local_bbox = (x, y, x+w, y+h)
        except ValueError:
            pass
        
    elif tag == 'use':
        try:
            x = float(elem.get('x', '0'))
            y = float(elem.get('y', '0'))
            w = elem.get('width')
            h = elem.get('height')
            if w and h:
                 local_bbox = (x, y, x+float(w), y+float(h))
            else:
                 # Unknown size
                 return None
        except ValueError:
            pass
             
    elif tag == 'circle':
        try:
            cx = float(elem.get('cx', '0'))
            cy = float(elem.get('cy', '0'))
            r = float(elem.get('r', '0'))
            local_bbox = (cx-r, cy-r, cx+r, cy+r)
        except ValueError:
            pass
    
    elif tag == 'text':
        # Text bbox is hard without font metrics.
        # Fallback: Assume it is at (x,y) with size 0?
        # Better: Return None to keep it.
        return None

    if local_bbox:
        minx, miny, maxx, maxy = local_bbox
        pts = [
            matrix.transform_point(minx, miny),
            matrix.transform_point(maxx, miny),
            matrix.transform_point(minx, maxy),
            matrix.transform_point(maxx, maxy)
        ]
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        return (min(xs), min(ys), max(xs), max(ys))
        
    return None

def is_mostly_contained(elem_bbox, tile_bbox, threshold=0.9):
    # Returns True if intersection area is > threshold * elem_bbox area
    # Or strict containment if element has zero area
    
    # Unpack
    ex1, ey1, ex2, ey2 = elem_bbox
    tx1, ty1, tx2, ty2 = tile_bbox
    
    # Element Area
    e_width = ex2 - ex1
    e_height = ey2 - ey1
    e_area = e_width * e_height
    
    # Check for zero area
    if e_area <= 1e-9:
        # Fallback to strict containment check (with epsilon)
        epsilon = 1e-4
        return (ex1 >= tx1 - epsilon and 
                ex2 <= tx2 + epsilon and 
                ey1 >= ty1 - epsilon and 
                ey2 <= ty2 + epsilon)

    # Intersection
    ix1 = max(ex1, tx1)
    iy1 = max(ey1, ty1)
    ix2 = min(ex2, tx2)
    iy2 = min(ey2, ty2)
    
    if ix1 >= ix2 or iy1 >= iy2:
        return False
        
    i_area = (ix2 - ix1) * (iy2 - iy1)
    
    return (i_area / e_area) > threshold

def assign_elements_to_tiles(tree, parent_matrix=None, current_node_id=0):
    # This traverses the tree once and assigns elements to tiles
    # Also tags the tree nodes with unique IDs for later retrieval
    
    # We need a shared dict for assignments: { tile_bg_id: set(node_ids) }
    # Since we can't easily pass it recursively if we start fresh, let's make a class or closure
    pass

class TileAssigner:
    def __init__(self, tiles_list):
        self.tiles = tiles_list # List of dicts with 'box', 'id'
        # Map: tile_index -> set of node IDs to keep
        self.assignments = {i: set() for i in range(len(tiles_list))}
        self.node_id_counter = 0

    def process(self, node, parent_matrix):
        # 1. Tag Node
        my_id = str(self.node_id_counter)
        node.set('__temp_id', my_id)
        self.node_id_counter += 1
        
        # 2. Calculate Matrix
        tag = clean_tag(node.tag)
        transform_attr = node.get('transform')
        local_matrix = parse_transform(transform_attr)
        current_matrix = parent_matrix.multiply(local_matrix)
        
        # 3. Check Leaf Logic
        is_leaf = tag in ['path', 'rect', 'image', 'use', 'circle', 'text', 'line', 'polyline', 'polygon']
        is_defs = tag == 'defs'
        
        keep_for_tiles = set() # Set of tile indices
        
        if is_defs:
            # Mark defs for all tiles
            keep_for_tiles = set(self.assignments.keys())
            
        elif is_leaf:
            bbox = get_element_bbox(node, current_matrix)
            if bbox:
                for i, tile in enumerate(self.tiles):
                    if is_mostly_contained(bbox, tile['box']):
                        keep_for_tiles.add(i)
        
        # 4. Recurse Children
        children = list(node)
        for child in children:
            child_keep_set = self.process(child, current_matrix)
            keep_for_tiles.update(child_keep_set)
            
        # 5. Store Assignments
        # Add this node to the sets of the calculated tiles
        for t_idx in keep_for_tiles:
            self.assignments[t_idx].add(my_id)
            
        return keep_for_tiles

def prune_by_id(node, allowed_ids):
    # Returns True if node should be kept
    my_id = node.get('__temp_id')
    
    # Always keep defs or if ID matches
    tag = clean_tag(node.tag)
    if tag == 'defs':
        # Even if defs is kept, we might want to prune its children?
        # But our logic marked defs children too if we recursed?
        # Let's check `is_defs` logic above.
        # It marked `defs` itself for all tiles.
        # It recursed children.
        # If children were leaves inside defs (like symbols), get_element_bbox would check them?
        # BBox of symbol/path in defs is usually near 0,0 unless used.
        # This is tricky. Objects in defs don't have a "position" on the canvas until used.
        # Simplification: Keep everything in DEFS.
        return True
        
    if my_id in allowed_ids:
        # If I am allowed, I keep myself.
        # But I must prune my children too!
        children = list(node)
        has_visible_children = False
        
        if len(children) == 0:
            # If leaf and allowed, keep
            return True
            
        for child in children:
            if prune_by_id(child, allowed_ids):
                has_visible_children = True
            else:
                node.remove(child)
        
        # optimized: if group became empty, should we remove it?
        # If it was a leaf (like text) it might have no children.
        # If it was a group 'g', and now empty, remove?
        if tag == 'g' and not has_visible_children:
            return False
            
        return True
    
    return False

def process_svg_file(input_svg_path, output_dir_path, start_id):
    print(f"Reading {input_svg_path} (Start ID: {start_id})...")
    parser = etree.XMLParser(remove_blank_text=True)
    try:
        tree = etree.parse(input_svg_path, parser)
    except OSError:
        print(f"Error: Could not open {input_svg_path}")
        return

    if not os.path.exists(output_dir_path):
        os.makedirs(output_dir_path)

    # 1. Setup Tiles
    tiles = []
    current_id = start_id
    for c in range(cols):
        for r in range(rows):
            x = col_start_x + (c * col_stride)
            y = row_start_y + (r * row_stride)
            w = col_width
            h = row_height
            tiles.append({
                'id': current_id,
                'box': (x, y, x+w, y+h),
                'viewBox': f"{x:.3f} {y:.3f} {w:.3f} {h:.3f}",
                'w': w,
                'h': h
            })
            current_id += 1
            
    # 2. Assign Elements (One Pass)
    print("Assigning elements to tiles...")
    assigner = TileAssigner(tiles)
    root = tree.getroot()
    initial_matrix = Matrix()
    
    # We need to process root
    assigner.process(root, initial_matrix)
    
    # 3. Generate Files
    # Convert tree to string to allow fast parsing for copies
    # We need to be careful: the tree now has __temp_id attributes.
    # We want these in the string so we can prune based on them.
    xml_str = etree.tostring(tree, encoding='utf-8')
    
    print(f"Generating {len(tiles)} tiles...")
    
    for i, tile in enumerate(tiles):
        # Parse from string (fast copy)
        tile_root = etree.fromstring(xml_str)
        tile_tree = etree.ElementTree(tile_root)
        
        # Prune
        allowed = assigner.assignments[i]
        
        # Special case: root is always allowed (it contains everything)
        # But prune_by_id checks ID. Root has ID '0'.
        # Ensure root ID is in allowed (it should be if any child is allowed)
        # If tile is empty, root might not be in allowed?
        # Let's force root match or handle empty tiles gracefully.
        
        children = list(tile_root)
        for child in children:
             if not prune_by_id(child, allowed):
                 tile_root.remove(child)

        # Cleanup IDs
        for elem in tile_root.iter():
            if '__temp_id' in elem.attrib:
                del elem.attrib['__temp_id']
                
        # Set ViewBox
        tile_root.set('viewBox', tile['viewBox'])
        tile_root.set('width', f"{tile['w']:.3f}")
        tile_root.set('height', f"{tile['h']:.3f}")

        # Add debug
        if DEBUG:
            rect = etree.Element(f"{{{NS['svg']}}}rect", 
                x=f"{tile['box'][0]:.3f}", 
                y=f"{tile['box'][1]:.3f}", 
                width=f"{tile['w']:.3f}", 
                height=f"{tile['h']:.3f}", 
                fill="#FFFF00",
                fill_opacity="0.2"
            )
            tile_root.insert(0, rect)
        
        # Apply Global Transform (Rebase to 0,0 and Scale)
        # Create a container group for the transform
        transform_group = etree.Element(f"{{{NS['svg']}}}g", 
            transform=f"scale({SCALE_FACTOR}) translate(-{tile['box'][0]:.3f}, -{tile['box'][1]:.3f})"
        )
        
        # Move all current children of root (pruned content + debug rect) into the group
        # Note: We must iterate a copy of list because we modify it
        for child in list(tile_root):
            tile_root.remove(child)
            transform_group.append(child)
            
        # Add the group to root
        tile_root.append(transform_group)
            
        # Set ViewBox and Dimensions scaled
        # New viewBox starts at 0 0, width/height multiplied by scale
        scaled_w = tile['w'] * SCALE_FACTOR
        scaled_h = tile['h'] * SCALE_FACTOR
        tile_root.set('viewBox', f"0 0 {scaled_w:.3f} {scaled_h:.3f}")
        tile_root.set('width', f"{scaled_w:.3f}")
        tile_root.set('height', f"{scaled_h:.3f}")
            
        # Save
        filename = f"TS_{tile['id']}.svg"
        out_path = os.path.join(output_dir_path, filename)
        tile_tree.write(out_path, encoding='utf-8', xml_declaration=True)
        
        if i % 20 == 0:
            print(f"Processed Tile {i+1}/{len(tiles)}")

    print(f"Done processing {input_svg_path}.")

if __name__ == "__main__":
    search_pattern = os.path.join("whole_pdf_svg", "(TS*.svg")
    files = glob.glob(search_pattern)
    files.sort()
    
    if not files:
        print(f"No files found for pattern: {search_pattern}")
    
    for f in files:
        basename = os.path.basename(f)
        # Extract ID from filename like "(TS 123 - ...).svg"
        match = re.search(r"\(TS\s*(\d+)", basename)
        if match:
            start_seq_id = int(match.group(1))
            process_svg_file(f, output_dir, start_seq_id)
        else:
            print(f"Skipping {f}: Could not determine Start ID from filename.")
