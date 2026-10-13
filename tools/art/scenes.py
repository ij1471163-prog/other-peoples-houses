"""
Trial: a character INSIDE a room doing something (eating, drinking...), drawn for free
on GitHub's computers. Nothing is committed: the pictures come back as a download to
look at first.

How: the character's own picture is pasted into the room's own background, then the
whole picture is redrawn (image-to-image) with the activity in the prompt, while
IP-Adapter looks at the character's picture to keep the same face and clothes.
Each scene is drawn three ways (light / medium / strong redraw) to pick from.
"""
import os, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
os.environ.setdefault("ART_OUT", "out")
import generate as G
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = Path("out/scenes"); OUT.mkdir(parents=True, exist_ok=True)

# id: (character, room, what they do, where they stand: x centre 0-1, height 0-1)
SCENES = {
    "leo-boathouse-eat": ("leo", "boathouse", "sitting on the orange sofa eating a bowl of cereal with a spoon", (0.55, 0.78)),
    "leo-boathouse-draw": ("leo", "boathouse", "sitting and drawing in a sketchbook with a pencil, focused", (0.45, 0.78)),
    "margaret-marg_kitchen-tea": ("margaret", "marg_kitchen", "sitting at the dining table drinking a cup of tea", (0.5, 0.75)),
    "evelyn-lh_living-read": ("evelyn", "lh_living", "sitting by the window reading a book, holding a cup of tea", (0.6, 0.78)),
    "victor-hotel_suite-drink": ("victor", "hotel_suite", "standing by the window holding a glass of whiskey, smug", (0.6, 0.85)),
}
TRIES = [(0.55, 0.5), (0.7, 0.6), (0.82, 0.7)]   # (redraw strength, how much to follow the character picture)
STYLE = "2d cartoon illustration, visual novel scene, clean lineart, cel shading, warm light, detailed room"
NEG = "photo, realistic, 3d, nsfw, nude, multiple people, two people, text, watermark, blurry, bad hands, extra fingers, deformed face"

def char_png(cid):
    for ext in ("webp", "png"):
        p = ROOT / "img" / "chars" / f"{cid}-neutral.{ext}"
        if p.exists(): return Image.open(p).convert("RGBA")
    raise SystemExit("no picture for " + cid)

def composite(bg, ch, x, hfrac):
    W, H = bg.size
    h = int(H * hfrac); w = int(ch.width * h / ch.height)
    ch = ch.resize((w, h), Image.LANCZOS)
    out = bg.convert("RGBA"); out.alpha_composite(ch, (int(W * x - w / 2), H - h))
    return out.convert("RGB")

def main():
    only = [s for s in os.environ.get("SCENE", "").split(",") if s]
    todo = {k: v for k, v in SCENES.items() if not only or k in only}
    P = G.Painter()
    pipe = P.pipe
    pipe.load_ip_adapter("h94/IP-Adapter", subfolder="sdxl_models", weight_name="ip-adapter_sdxl.bin")
    from diffusers import StableDiffusionXLImg2ImgPipeline
    i2i = StableDiffusionXLImg2ImgPipeline(**pipe.components); i2i.set_progress_bar_config(disable=True)
    import torch
    for sid, (cid, room, what, (x, hf)) in todo.items():
        bg = Image.open(ROOT / "img" / "bg" / f"{room}.jpg").convert("RGB").resize((1344, 768), Image.LANCZOS)
        ch = char_png(cid)
        start = composite(bg, ch, x, hf); start.save(OUT / f"{sid}-0-start.jpg", quality=88)
        ref = Image.new("RGB", ch.size, "white"); ref.paste(ch, mask=ch.split()[3])
        prompt = f"{G.CHARS[cid]}, {what}, in a {G.BGS[room]}, {STYLE}" if hasattr(G, "CHARS") else f"{what}, {STYLE}"
        for n, (st, ips) in enumerate(TRIES, 1):
            i2i.set_ip_adapter_scale(ips)
            g = torch.Generator("cpu").manual_seed(1234 + n)
            steps = max(P.steps, int(round(P.steps / st)))
            img = i2i(prompt=prompt, negative_prompt=NEG, image=start, ip_adapter_image=ref, strength=st,
                      num_inference_steps=steps, guidance_scale=P.cfg, generator=g).images[0]
            img.save(OUT / f"{sid}-{n}.jpg", quality=88); print("drew", sid, n, flush=True)

if __name__ == "__main__":
    main()
