import fitz  # PyMuPDF
import os

pdf_filename = "(TS 101 - 205).pdf"
pdf_path = os.path.join("Index Plan", pdf_filename)
output_dir = "whole_pdf_svg"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

try:
    doc = fitz.open(pdf_path)
    print(f"Opened {pdf_filename} with {len(doc)} pages.")

    for i, page in enumerate(doc):
        print(f"Converting page {i+1}...")
        svg = page.get_svg_image()
        
        output_filename = f"{os.path.splitext(pdf_filename)[0]}_page{i+1}.svg"
        output_path = os.path.join(output_dir, output_filename)
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(svg)
        
        print(f"Saved {output_path}")

    doc.close()
    print("Conversion complete.")

except Exception as e:
    print(f"Error: {e}")
