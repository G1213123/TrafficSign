import os
import re

# Parameters
input_svg_path = r"whole_pdf_svg/(TS 101 - 205)_page1.svg"
output_dir = os.path.join("data", "svgs")

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Grid Parameters from User
# Canvas: 842 x 595.22
# Start (Col 1, Row 1): x=111.171, y=20.304
# Row 2 y=47.232 -> Row stride = 26.928
# Col 1 Width: 56.7
# Col 2 Start x=220.305 -> Col stride = 109.134

col_start_x = 111.171
row_start_y = 20.304
col_width = 56.7
row_height = 26.928 # Derived from stride (47.232 - 20.304)

col_stride = 109.134 # Derived from (220.305 - 111.171)
row_stride = 26.928

rows = 21
cols = 5
start_id = 101

# Read the original SVG
with open(input_svg_path, 'r', encoding='utf-8') as f:
    svg_content = f.read()

# Helper to generate a modified SVG header
def create_svg_header(viewBox, width, height):
    # We replace the attributes in the opening <svg> tag.
    # The original has: <svg ... width="842" height="595.22" viewBox="0 0 842 595.22">
    # We want: <svg ... width="{width}" height="{height}" viewBox="{viewBox}">
    
    # Simple regex replacement on the first occurrences
    # Note: This assumes standard formatting as seen in the file read
    
    # Replace width="..."
    return f'width="{width}" height="{height}" viewBox="{viewBox}"'

# Iterate and generate
current_id = start_id

# Regex for the svg tag attributes
# We will match the entire opening tag and reconstruct it, or just replace specific attrs.
# Replacing strictly might be safer to avoid messing up namespaces.
# Let's find the position of the first <svg ... >
svg_tag_match = re.search(r'<svg[^>]*>', svg_content)
if not svg_tag_match:
    raise Exception("Could not find <svg> tag")

original_svg_tag = svg_tag_match.group(0)
start_pos = svg_tag_match.start()
end_pos = svg_tag_match.end()

pre_svg = svg_content[:start_pos]
post_svg = svg_content[end_pos:]

def replace_attr(tag, attr, value):
    # Regex to find attr="value" or attr='value' and replace it
    pattern = rf'{attr}=["\'][^"\']*["\']'
    if re.search(pattern, tag):
        return re.sub(pattern, f'{attr}="{value}"', tag)
    else:
        # If attribute doesn't exist, insert it before the end
        return tag.replace('>', f' {attr}="{value}">')

for c in range(cols):
    for r in range(rows):
        # Calculate box
        x = col_start_x + (c * col_stride)
        y = row_start_y + (r * row_stride)
        w = col_width
        h = row_height
        
        # ViewBox string: min-x min-y width height
        viewBox = f"{x:.3f} {y:.3f} {w:.3f} {h:.3f}"
        
        # Modify the SVG tag
        new_tag = original_svg_tag
        new_tag = replace_attr(new_tag, "width", f"{w:.3f}")
        new_tag = replace_attr(new_tag, "height", f"{h:.3f}")
        new_tag = replace_attr(new_tag, "viewBox", viewBox)
        
        # Construct new SVG content
        new_svg_content = pre_svg + new_tag + post_svg
        
        # Save
        filename = f"TS_{current_id}.svg"
        with open(os.path.join(output_dir, filename), 'w', encoding='utf-8') as f:
            f.write(new_svg_content)
            
        current_id += 1

print(f"Generated {current_id - start_id} SVG files in {output_dir}")
