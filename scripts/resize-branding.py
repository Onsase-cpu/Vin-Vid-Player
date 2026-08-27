from pathlib import Path

from PIL import Image


ASSET_DIR = Path("/home/ubuntu/vinplayer-app/assets/images")
ASSETS = [
    "icon.png",
    "splash-icon.png",
    "favicon.png",
    "android-icon-foreground.png",
]

for name in ASSETS:
    target = ASSET_DIR / name
    with Image.open(target) as image:
        image = image.convert("RGBA")
        image.thumbnail((512, 512), Image.Resampling.LANCZOS)
        image.save(target, format="PNG", optimize=True, compress_level=9)
        print(f"Optimized {name}: {image.width}x{image.height}")
