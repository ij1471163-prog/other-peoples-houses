"""Prepares the art in img/ for the game:
  1. converts character PNGs to WebP (same look, about a tenth of the size), removing the PNG
  2. writes img/manifest.js, the list of pictures the game should use (no guessing at start-up)
Run from the repository root: python3 tools/art/finish.py   (step 1 needs Pillow; skipped without it)"""
import json, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parents[2]
IMG = ROOT / "img"
EXPRS = ["neutral", "smile", "sad", "angry", "shock"]

def convert():
    try:
        from PIL import Image
    except ImportError:
        print("Pillow not installed: keeping PNGs", file=sys.stderr); return 0
    n = 0
    for png in sorted((IMG / "chars").glob("*.png")):
        webp = png.with_suffix(".webp")
        im = Image.open(png); im.load()
        im.save(webp, "WEBP", quality=90, method=4)
        print(f"{png.name}: {png.stat().st_size // 1024} KB -> {webp.name}: {webp.stat().st_size // 1024} KB")
        png.unlink(); n += 1
    return n

def manifest():
    chars, bgs = {}, {}
    for f in sorted((IMG / "chars").glob("*")):
        if f.suffix not in (".webp", ".png") or "-" not in f.stem: continue
        cid, expr = f.stem.rsplit("-", 1)
        if expr not in EXPRS: continue
        cur = chars.setdefault(cid, {})
        if expr not in cur or f.suffix == ".webp": cur[expr] = f"img/chars/{f.name}"
    for f in sorted((IMG / "bg").glob("*")):
        if f.suffix not in (".webp", ".jpg", ".png"): continue
        if f.stem not in bgs or f.suffix == ".webp": bgs[f.stem] = f"img/bg/{f.name}"
    body = json.dumps({"chars": chars, "bg": bgs}, indent=1, sort_keys=True)
    (IMG / "manifest.js").write_text("/* made by tools/art/finish.py — which pictures exist, so the game never has to probe for them */\nwindow.IMG_MANIFEST = " + body + ";\n")
    print(f"manifest: {len(chars)} characters, {sum(len(v) for v in chars.values())} pictures, {len(bgs)} backgrounds")

if __name__ == "__main__":
    IMG.joinpath("chars").mkdir(parents=True, exist_ok=True); IMG.joinpath("bg").mkdir(parents=True, exist_ok=True)
    if "--manifest-only" not in sys.argv: convert()
    manifest()
