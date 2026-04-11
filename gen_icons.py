#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

def make_icon(size, path):
    img = Image.new('RGB', (size, size), '#0D0F14')
    draw = ImageDraw.Draw(img)
    # Draw rounded rectangle background
    margin = int(size * 0.1)
    draw.rounded_rectangle([margin, margin, size-margin, size-margin],
                           radius=int(size*0.22), fill='#1C2030')
    # Draw rupee symbol
    emoji_size = int(size * 0.55)
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansSymbols-Regular.ttf', emoji_size)
    except:
        font = ImageFont.load_default()
    text = '₹'
    bbox = draw.textbbox((0,0), text, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    draw.text(((size-tw)//2, (size-th)//2 - int(size*0.03)), text, fill='#1CC98E', font=font)
    img.save(path)
    print(f'Saved {path}')

os.chdir(os.path.dirname(os.path.abspath(__file__)))
make_icon(192, 'icon-192.png')
make_icon(512, 'icon-512.png')
