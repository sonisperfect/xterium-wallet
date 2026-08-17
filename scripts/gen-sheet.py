"""Contact sheet for cleaned generated assets on the dark panel color."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "public" / "assets" / "gen" / "clean"
PANEL = (7, 33, 27)

names = ["feature-biometric", "feature-pay", "feature-swaps", "feature-wallet"]
cell = 420
sheet = Image.new("RGB", (2 * cell, 2 * cell), PANEL)
for i, name in enumerate(names):
    im = Image.open(ROOT / f"{name}.png").convert("RGBA")
    im.thumbnail((cell - 30, cell - 30))
    cx = (i % 2) * cell + (cell - im.width) // 2
    cy = (i // 2) * cell + (cell - im.height) // 2
    sheet.paste(im, (cx, cy), im)
sheet.save(ROOT / "_sheet.png")
print("saved", sheet.size)
