"""Contact sheet: composit tinted assets on the dark panel color to preview."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "public" / "assets" / "tinted"
PANEL = (7, 33, 27)  # #07211b

names = [
    "features-biometric", "features-pay", "features-swaps", "features-wallet",
    "about-sure-s", "about-sure-u", "about-sure-r", "about-sure-e",
]

cell = 300
cols = 4
rows = 2
sheet = Image.new("RGB", (cols * cell, rows * cell), PANEL)

for i, name in enumerate(names):
    im = Image.open(ROOT / f"{name}.png").convert("RGBA")
    im.thumbnail((cell - 40, cell - 40))
    cx = (i % cols) * cell + (cell - im.width) // 2
    cy = (i // cols) * cell + (cell - im.height) // 2
    sheet.paste(im, (cx, cy), im)

sheet.save(ROOT / "_contact-sheet.png")
print("saved", sheet.size)
