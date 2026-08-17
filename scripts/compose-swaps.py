"""Compose the XON <-> USDT swap illustration programmatically.

Uses the official Xode pink-X logo (scripts/xode-icon-pink.png) for the XON
coin and a drawn Tether-style green T coin for USDT, linked by mint swap
arrows. Output: transparent PNG matching the site's flat mint style.
"""
from PIL import Image, ImageDraw, ImageFont
import math
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, '..', 'public', 'assets', 'gen', 'clear', 'feature-swaps.png')
XODE_LOGO = os.path.join(ROOT, 'xode-icon-pink.png')

W, H = 1536, 1024
MINT = (47, 224, 194, 255)
MINT_DARK = (24, 160, 138, 255)
XON_PINK = (233, 53, 139, 255)
USDT_GREEN = (38, 161, 123, 255)
USDT_DARK = (24, 110, 84, 255)
WHITE = (255, 255, 255, 255)

img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# ---- fonts (bundled with matplotlib) --------------------------------------
import matplotlib
FONT_DIR = os.path.join(os.path.dirname(matplotlib.__file__), 'mpl-data', 'fonts', 'ttf')
def font(size):
    return ImageFont.truetype(os.path.join(FONT_DIR, 'DejaVuSans-Bold.ttf'), size)

# ---- coin geometry ---------------------------------------------------------
R = 215
C_LEFT = (420, 500)
C_RIGHT = (1116, 500)

def coin_shadow(cx, cy):
    # subtle dark ellipse under the coin for depth
    d.ellipse([cx - R, cy - R + 16, cx + R, cy + R + 16], fill=(0, 0, 0, 70))

# ---- XON coin: official logo face -----------------------------------------
coin_shadow(*C_LEFT)
logo = Image.open(XODE_LOGO).convert('RGBA').resize((R * 2, R * 2), Image.LANCZOS)
img.paste(logo, (C_LEFT[0] - R, C_LEFT[1] - R), logo)
d = ImageDraw.Draw(img)

# ticker below coin
f_tick = font(64)
for cx, label in ((C_LEFT[0], 'XON'), (C_RIGHT[0], 'USDT')):
    bb = d.textbbox((0, 0), label, font=f_tick)
    d.text((cx - (bb[2] - bb[0]) / 2, C_LEFT[1] + R + 34), label, font=f_tick, fill=WHITE)

# ---- USDT coin: drawn green circle + white T -------------------------------
coin_shadow(*C_RIGHT)
cx, cy = C_RIGHT
d.ellipse([cx - R, cy - R, cx + R, cy + R], fill=USDT_GREEN)
# Tether T: wide top bar + stem
bar_w, bar_h = 200, 44
stem_w, stem_h = 52, 210
ty = cy - 130
d.rounded_rectangle([cx - bar_w // 2, ty, cx + bar_w // 2, ty + bar_h], 14, fill=WHITE)
d.rounded_rectangle([cx - stem_w // 2, ty + bar_h - 6, cx + stem_w // 2, ty + bar_h + stem_h], 14, fill=WHITE)

# ---- mint swap arrows (in the gap between the coins) ------------------------
def arrow_arc(bbox, start_deg, end_deg, width=34):
    d.arc(bbox, start_deg, end_deg, fill=MINT, width=width)

def arrowhead(tip, direction_deg, size=64):
    tx, ty = tip
    a = math.radians(direction_deg)
    back = (tx - size * math.cos(a), ty - size * math.sin(a))
    perp = (-math.sin(a), math.cos(a))
    p1 = (back[0] + perp[0] * size * 0.45, back[1] + perp[1] * size * 0.45)
    p2 = (back[0] - perp[0] * size * 0.45, back[1] - perp[1] * size * 0.45)
    d.polygon([tip, p1, p2], fill=MINT)

# top arrow: left -> right, sweeping over the top of the gap
arrow_arc([600, 240, 936, 540], 200, 340)
arrowhead((926, 339), 70)
# bottom arrow: right -> left, sweeping under the bottom of the gap
arrow_arc([600, 460, 936, 760], 20, 160)
arrowhead((610, 661), 250)

# ---- tight crop ------------------------------------------------------------
bbox = img.getbbox()
pad = 30
img = img.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad),
                min(W, bbox[2] + pad), min(H, bbox[3] + pad)))
img.save(OUT)
print('saved', OUT, img.size)
