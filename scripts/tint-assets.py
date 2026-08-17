"""Recolor Xterium brand assets to sit naturally on the dark mint theme.

- features-*.png: remove the cream/white background -> transparent, autocrop.
- about-sure-*.png: gray glyph -> mint (#2fe0c2), autocrop.
Outputs go to public/assets/tinted/.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "public" / "assets"
OUT = ROOT / "tinted"
OUT.mkdir(exist_ok=True)

MINT = (47, 224, 194)


def remove_light_bg(src: Path, dst: Path, tol_lo: float = 18.0, tol_hi: float = 60.0):
    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size
    # sample background from the four corners
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            d = ((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2) ** 0.5
            if d <= tol_lo:
                px[x, y] = (r, g, b, 0)
            elif d < tol_hi:
                # feathered edge
                alpha = int(255 * (d - tol_lo) / (tol_hi - tol_lo))
                px[x, y] = (r, g, b, min(a, alpha))

    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.save(dst)
    print(f"bg-remove {src.name}: bg={bg} -> {dst.name} {im.size}")


def tint_gray(src: Path, dst: Path):
    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
            # keep dark strokes dark-mint, light strokes bright-mint
            scale = 0.35 + 0.65 * lum
            px[x, y] = (
                int(MINT[0] * scale),
                int(MINT[1] * scale),
                int(MINT[2] * scale),
                a,
            )
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.save(dst)
    print(f"tint {src.name} -> {dst.name} {im.size}")


for name in ["features-biometric", "features-pay", "features-swaps", "features-wallet"]:
    remove_light_bg(ROOT / f"{name}.png", OUT / f"{name}.png")

for name in ["about-sure-s", "about-sure-u", "about-sure-r", "about-sure-e"]:
    tint_gray(ROOT / f"{name}.png", OUT / f"{name}.png")
