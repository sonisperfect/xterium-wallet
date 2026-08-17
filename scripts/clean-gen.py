"""Post-process generated feature illustrations:
- crop the bottom strip (watermark zone)
- remove the dark background -> transparent
- autocrop to content
Writes to public/assets/gen/clean/.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "public" / "assets" / "gen"
OUT = ROOT / "clean"
OUT.mkdir(exist_ok=True)


def clean(src: Path, dst: Path, tol_lo: float = 16.0, tol_hi: float = 55.0):
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    # crop bottom 9% (watermark strip) before sampling corners
    im = im.crop((0, 0, w, int(h * 0.91)))
    w, h = im.size
    px = im.load()
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            d = ((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2) ** 0.5
            if d <= tol_lo:
                px[x, y] = (r, g, b, 0)
            elif d < tol_hi:
                alpha = int(255 * (d - tol_lo) / (tol_hi - tol_lo))
                px[x, y] = (r, g, b, min(a, alpha))

    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.save(dst)
    print(f"clean {src.name}: bg={bg} -> {im.size}")


for name in ["feature-biometric", "feature-pay", "feature-swaps", "feature-wallet"]:
    clean(ROOT / f"{name}.png", OUT / f"{name}.png")
