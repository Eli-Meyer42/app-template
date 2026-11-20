"""Regenerate the app icons. Edit the drawing, then: python3 make-icons.py"""
from PIL import Image, ImageDraw

BG = (79, 112, 136, 255)        # accent colour

def icon(size, maskable=False):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable:
        d.rectangle([0, 0, size, size], fill=BG); pad = size * 0.30
    else:
        d.rounded_rectangle([0, 0, size, size], radius=size * 0.22, fill=BG); pad = size * 0.24
    w = size - pad * 2
    W = (255, 255, 255, 255)
    # --- replace this mark with the app's own ---
    d.rounded_rectangle([pad, pad + w*0.30, pad + w, pad + w*0.42], radius=w*0.06, fill=W)
    d.rounded_rectangle([pad, pad + w*0.58, pad + w*0.64, pad + w*0.70], radius=w*0.06, fill=W)
    d.ellipse([pad + w*0.78, pad + w*0.54, pad + w*1.00, pad + w*0.76], fill=W)
    return img

for s in (192, 512):
    icon(s).save(f'icon-{s}.png')
icon(512, maskable=True).save('icon-maskable-512.png')
icon(180).save('apple-touch-icon.png')
print('icons written')
