"""
Draws the game's art for free on GitHub's computers with open-source AI and
saves it with the exact file names the game looks for:

  img/chars/<id>-<expression>.png   (transparent, head to knees, ~1200 px tall)
  img/bg/<place>.jpg                (1600 x 900)

Model: DreamShaper XL v2 Turbo (SDXL, open licence). Falls back to DreamShaper 8
(SD 1.5 + LCM-LoRA) if SDXL can't load. Character backgrounds are removed with
rembg (isnet-anime). The other four expressions are drawn from the neutral
picture (img2img) so the face, hair and clothes stay the same person.

The work is split into shards so GitHub runs many computers at once
(ART_SHARD / ART_SHARDS). Files that already exist are skipped.
"""
import os, sys, time, json, hashlib, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(os.environ.get("ART_OUT", str(ROOT / "img")))
CH = OUT / "chars"; BG = OUT / "bg"
CH.mkdir(parents=True, exist_ok=True); BG.mkdir(parents=True, exist_ok=True)
EXIST_CH = ROOT / "img" / "chars"; EXIST_BG = ROOT / "img" / "bg"
DEADLINE = time.time() + float(os.environ.get("ART_MINUTES", "300")) * 60
PHASES = os.environ.get("ART_PHASES", "1,2,3").split(",")
ONLY = [x.strip() for x in os.environ.get("ART_ONLY", "").split(",") if x.strip()]
OK = lambda k: not ONLY or k in ONLY
SHARD, SHARDS = int(os.environ.get("ART_SHARD", "0")), max(1, int(os.environ.get("ART_SHARDS", "1")))

STYLE_C = ("masterpiece, best quality, 2d illustration, visual novel character sprite, polished western cartoon art style like a modern life simulation game, "
           "clean confident lineart, smooth cel shading with soft highlights, rich saturated colors, appealing attractive face, expressive eyes with highlights, glossy detailed hair, "
           "natural semi-realistic proportions, one single character standing and facing the viewer, three-quarter body shot from head to knees, "
           "fully clothed, modest clothing, plain pure white background, centered, sharp focus")
STYLE_B = ("masterpiece, best quality, 2d illustration, visual novel background art, polished western cartoon game background like a modern life simulation game, "
           "clean lineart, soft cel shading, warm cinematic lighting, rich colors, highly detailed, cosy and lived-in, wide shot, eye level, one point perspective, "
           "empty scene with no people, daytime")
NEG = ("photo, photorealistic, realistic skin texture, 3d, render, cgi, anime chibi, nsfw, nude, naked, cleavage, revealing, sexy, lingerie, swimsuit, bikini, "
       "multiple people, two people, crowd, text, letters, watermark, signature, logo, frame, border, lowres, blurry, jpeg artifacts, "
       "deformed, disfigured, ugly, bad anatomy, bad hands, extra fingers, missing fingers, extra limbs, extra arms, cropped head, out of frame, "
       "scenery behind the character, busy background, shadow on background")
NEG_B = ("people, person, character, human, face, text, letters, watermark, signature, logo, lowres, blurry, deformed, photo, "
         "photorealistic, 3d render, nsfw, distorted perspective")

EXPR = {
    "neutral": "calm neutral expression, mouth closed",
    "smile": "warm happy smile",
    "sad": "sad expression, downturned mouth, worried eyebrows",
    "angry": "angry frown, furrowed eyebrows",
    "shock": "shocked surprised expression, wide eyes, open mouth",
}

CHARS = {
    "elias": "Elias, 72 year old old fisherman, thick white full beard, blue knitted beanie hat, weathered kind face, blue eyes, yellow fisherman raincoat open over a cream cable-knit wool sweater, dark grey trousers",
    "sami": "Sami, 29 year old Middle Eastern man, short black hair with a fade, short black beard, warm brown skin, white t-shirt, green grocery shop apron, blue jeans, one hand on hip",
    "marco": "Marco, 28 year old Italian man, curly brown hair, thin mustache, green eyes, blue striped shirt with rolled-up sleeves, black waist apron, holding a coffee cup, cheerful cafe owner",
    "irene": "Dr. Irene, 45 year old woman doctor, red hair in a bun, glasses, freckles, white lab coat over teal scrubs, stethoscope around her neck, holding a clipboard",
    "martha": "Martha, 62 year old plump cleaning lady, grey hair under a blue polka dot headscarf, pink cardigan, white apron with little red flowers, yellow rubber gloves, hands on hips, chatty",
    "leo": "Leo, 19 year old young man, messy dark brown hair, slim, red jacket over a mustard yellow hoodie, black headphones around his neck, black jeans, hands in pockets, young artist",
    "frank": "Frank, 54 year old mechanic, balding grey-brown hair, big bushy mustache, broad shoulders, grey t-shirt, navy blue work overalls with a name patch, arms crossed, gruff",
    "margaret": "Margaret, 54 year old British woman, kind but tired eyes, greying light brown bob haircut, lavender knitted cardigan over a cream blouse, dark grey knee-length skirt, small gold brooch, hands gently clasped in front",
    "nora": "Nora, 50 year old woman, short dark pixie haircut, sharp eyes, long red coat, yellow scarf, black trousers, one hand on hip, blunt and confident",
    "evelyn": "Evelyn, 38 year old woman lighthouse keeper, dirty blonde hair in a long side braid, teal eyes, navy blue fisherman cable-knit sweater, red scarf, brown trousers, quirky friendly",
    "victor": "Victor, 50 year old wealthy hotel owner, slicked back black hair, smug charming smile, dark navy three-piece suit, white shirt, red tie, red pocket square, one hand in pocket, villain",
    "kell": "Kell, 42 year old very tall broad Black man, buzz cut, short black beard, black suit and black shirt, arms crossed, stoic bodyguard",
    "ana": "Ana, 31 year old woman hotel maid, wearing a blue hijab that covers her hair and neck, modest long-sleeved dark grey maid dress with a white apron, hands clasped in front, kind face",
    "stella": "Stella, 32 year old woman florist, wavy ginger hair, freckles, pink t-shirt, green florist apron, blue jeans, holding a small bouquet of flowers, cheerful",
    "kai": "Kai, 23 year old surfer guy, long sun-bleached blond hair, tanned skin, teal t-shirt, orange board shorts, waving one hand, goofy grin",
    "rex": "Officer Rex, 46 year old police officer, short dark brown hair, mustache, navy blue police uniform shirt with a gold badge, black belt, hands on his belt, tired but kind",
    "bella": "Bella, 27 year old hotel receptionist woman, black hair in a high ponytail, burgundy blazer over a white blouse, gold name badge, black skirt below the knee, sassy smile",
    "ingrid": "Ingrid, 74 year old elderly woman, white hair in a bun, round glasses, green cardigan over a cream blouse, purple skirt, pink brooch, sweet grandmother",
    "maya": "Maya, 41 year old fisherwoman, tanned skin, dark hair in a ponytail, orange waterproof fishing jacket, dark green trousers, arms crossed, tough",
    "olivia": "Olivia, 26 year old Black woman activist, big natural afro hair, yellow hoodie covered in colourful badges, blue jeans, holding a clipboard, determined",
    "gregor": "Gregor, 66 year old gravedigger, bald head, grey full beard, long dark olive coat, holding a shovel, cheerful old man",
}

BGS = {
    "station": "small seaside town train station platform at dusk, red train, wooden bench, station sign, lamp posts",
    "motel": "cheap shabby motel room interior, single bed, old lamp, window with red neon sign outside, worn carpet",
    "street": "charming seaside town main street, small grocery shop with green awning on the left, cafe with red awning on the right, cobblestones, sea visible at the end of the street",
    "grocery": "cosy small corner grocery shop interior, shelves of food, fruit crates, counter with old cash register",
    "cafe": "cosy small seaside cafe interior, wooden tables, chalkboard menu, coffee machine, warm light",
    "harbor": "small fishing harbor, wooden pier, small blue fishing boats, seagulls, boathouses, calm sea",
    "elias_ext": "old fisherman's stone cottage exterior on a narrow street, blue door, fishing nets hanging on the wall",
    "living": "old fisherman's cottage living room, stone fireplace, armchair, old radio, framed photos, window",
    "kitchen": "small old cottage kitchen, wooden table, kettle on the stove, cupboards, window with sea view",
    "bath": "small old cottage bathroom, white bathtub with shower curtain, sink with mirror, tiled walls",
    "elias_bed": "old man's bedroom, simple bed with patchwork quilt, wooden dresser, framed photograph, small window",
    "your_room": "small guest bedroom in an old cottage, single bed, model ship on a shelf, boxes",
    "shed": "fisherman's shed interior, fishing nets, ropes, tools on the wall, wooden workbench",
    "clinic": "small town doctor's clinic examination room, examination bed, desk, medical cabinet",
    "boathouse": "artist's converted boathouse living room, orange sofa, old tv and game console, seagull mural on the wall, easel, ladder to a loft",
    "loft": "messy attic loft bedroom of a young artist, mattress on the floor, round window, stacks of sketchbooks",
    "bh_bath": "tiny quirky bathroom with stickers around the mirror, small shower, wooden walls",
    "dock": "wooden dock behind a boathouse over the sea, lamp post, crates, calm water",
    "garage": "small town car repair garage, red classic car on a lift, tyres, tools on the wall",
    "sami_attic": "small cosy attic room above a shop, sloped ceiling, single bed, tiny kitchenette, window over a harbor",
    "cliff_road": "neat white two-storey house on a cliff top road by the sea, all curtains closed, small garden with roses, white fence",
    "marg_living": "tidy dim sitting room with closed lavender curtains, sofa, portrait of a teenage boy on the wall, ironing board, clock",
    "marg_kitchen": "tidy cream kitchen, dining table set with three plates, stove with a pot, clock on the wall",
    "marg_guest": "neat light blue guest bedroom, single bed, wardrobe, desk lamp, window",
    "marg_bed": "middle-aged woman's bedroom, double bed, dresser with framed photos, closed curtains",
    "dan_room": "teenage boy's bedroom kept untouched, band posters, guitar, desk with a computer, football, made bed",
    "marg_bath": "clean white bathroom, bathtub, shower curtain, sink with mirror, medicine cabinet",
    "lh_ext": "red and white striped lighthouse on a rocky cliff with a small keeper's cottage, sea, seagulls",
    "lh_living": "lighthouse keeper's cottage living room, stone walls, fireplace, grandfather clock, armchair, accordion on a chair, camp bed",
    "lh_kitchen": "quirky lighthouse cottage kitchen, jars with labels, pots on the stove, round table",
    "lh_room": "cosy bedroom inside a lighthouse cottage, bookshelf, desk with old logbooks, red blanket",
    "lh_bath": "old lighthouse cottage bathroom, clawfoot bathtub with bubbles, old radio, yellow towel",
    "lh_tower": "inside the lantern room at the top of a lighthouse, giant glass lens in the center, windows all around showing the sea",
    "lh_attic": "dusty dark attic with low beams, old wooden trunk, small window, old wall clock, creepy atmosphere",
    "hotel_lobby": "grand luxury hotel lobby, marble floor, chandelier, reception desk, potted plants, burgundy and gold",
    "hotel_suite": "luxury hotel suite bedroom, big bed, gold and burgundy decor, large window with a sea view",
    "hotel_office": "dark wood luxury office of a rich man, big desk, leather chair, bookcase, safe, portrait on the wall",
    "hotel_staff": "hotel laundry room and staff corridor, washing machines, folded towels, lockers",
    "beach": "sunny sandy beach, sea waves, red beach umbrella, surfboard, dunes",
    "cemetery": "old seaside churchyard cemetery, gravestones, small stone church, grass, calm and peaceful",
    "florist": "colourful small flower shop interior, buckets of flowers, wooden counter, plants everywhere",
    "police": "small town police station office, desk with old computer, notice board, filing cabinets, holding cell bars",
}

def seed_of(s):
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16)

def out_of_time():
    return time.time() > DEADLINE

class Painter:
    """text-to-image and image-to-image with the best model that loads"""
    def __init__(self):
        import torch
        torch.set_num_threads(os.cpu_count() or 4)
        self.torch = torch
        self.xl = False
        model = os.environ.get("ART_MODEL", "Lykon/dreamshaper-xl-v2-turbo")
        try:
            from diffusers import StableDiffusionXLPipeline, StableDiffusionXLImg2ImgPipeline, DPMSolverMultistepScheduler
            try:
                pipe = StableDiffusionXLPipeline.from_pretrained(model, torch_dtype=torch.float32, variant="fp16", use_safetensors=True)
            except Exception as e:
                print("fp16 variant not found, loading full weights:", e, flush=True)
                pipe = StableDiffusionXLPipeline.from_pretrained(model, torch_dtype=torch.float32, use_safetensors=True)
            pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, use_karras_sigmas=True, algorithm_type="dpmsolver++")
            pipe.enable_vae_tiling()
            self.pipe = pipe
            self.i2i = StableDiffusionXLImg2ImgPipeline(**pipe.components)
            self.steps, self.cfg, self.xl = 8, 2.2, True
            self.sizes = {"char": (832, 1216), "bg": (1344, 768)}
            print("SDXL loaded:", model, flush=True)
        except Exception as e:
            print("SDXL failed, falling back to SD 1.5:", e, flush=True)
            from diffusers import StableDiffusionPipeline, StableDiffusionImg2ImgPipeline, LCMScheduler
            pipe = StableDiffusionPipeline.from_pretrained("Lykon/dreamshaper-8", torch_dtype=torch.float32, safety_checker=None, requires_safety_checker=False)
            pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
            pipe.load_lora_weights("latent-consistency/lcm-lora-sdv1-5"); pipe.fuse_lora()
            self.pipe = pipe
            self.i2i = StableDiffusionImg2ImgPipeline(**pipe.components)
            self.steps, self.cfg = 6, 1.6
            self.sizes = {"char": (512, 832), "bg": (912, 512)}
        for p in (self.pipe, self.i2i):
            p.set_progress_bar_config(disable=True)

    def draw(self, prompt, neg, kind, seed):
        w, h = self.sizes[kind]
        g = self.torch.Generator("cpu").manual_seed(seed)
        return self.pipe(prompt=prompt, negative_prompt=neg, width=w, height=h, num_inference_steps=self.steps, guidance_scale=self.cfg, generator=g).images[0]

    def redraw(self, image, prompt, neg, seed, strength=0.55):
        g = self.torch.Generator("cpu").manual_seed(seed)
        steps = max(self.steps, int(round(self.steps / strength)))
        return self.i2i(prompt=prompt, negative_prompt=neg, image=image, strength=strength, num_inference_steps=steps, guidance_scale=self.cfg, generator=g).images[0]

_session = None
def cutout(img):
    global _session
    from rembg import remove, new_session
    from PIL import Image
    if _session is None:
        try: _session = new_session("isnet-anime")
        except Exception: _session = new_session("u2net")
    rgba = remove(img, session=_session, post_process_mask=True)
    box = rgba.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    if box:
        x0, y0, x1, y1 = box
        rgba = rgba.crop((max(0, x0 - 6), max(0, y0 - 6), min(rgba.width, x1 + 6), rgba.height))
    if rgba.height != 1200:
        k = 1200 / rgba.height
        rgba = rgba.resize((max(1, int(rgba.width * k)), 1200), Image.LANCZOS)
    return rgba

def exists(kind, name):
    return (EXIST_CH if kind == "char" else EXIST_BG).joinpath(name).exists() or (CH if kind == "char" else BG).joinpath(name).exists()

def main():
    from PIL import Image
    chars = [c for c in CHARS if OK(c)]
    bgs = [b for b in BGS if OK(b)]
    mine_c = [c for i, c in enumerate(chars) if i % SHARDS == SHARD]
    mine_b = [b for i, b in enumerate(bgs) if (i + len(chars)) % SHARDS == SHARD]
    todo = [c for c in mine_c if any(not exists("char", f"{c}-{e}.png") for e in (EXPR if "3" in PHASES else ["neutral"]))]
    todo_b = [b for b in mine_b if "2" in PHASES and not exists("bg", f"{b}.jpg")]
    print(f"shard {SHARD}/{SHARDS}: characters {todo}, backgrounds {todo_b}", flush=True)
    if not todo and not todo_b:
        print("nothing to draw", flush=True); return
    P = Painter()
    made = 0
    for cid in todo:
        if out_of_time(): break
        seed = seed_of(cid)
        base_prompt = f"{STYLE_C}, {CHARS[cid]}"
        f = CH / f"{cid}-neutral.png"
        neutral = None
        if "1" in PHASES and not exists("char", f.name):
            t = time.time()
            neutral = P.draw(f"{base_prompt}, {EXPR['neutral']}", NEG, "char", seed)
            neutral.save(CH / f"{cid}-neutral.raw.jpg", quality=92)
            cutout(neutral).save(f, optimize=True)
            made += 1; print(f"char {cid}-neutral {time.time() - t:.0f}s", flush=True)
        if "3" in PHASES:
            raw = CH / f"{cid}-neutral.raw.jpg"
            if neutral is None and raw.exists(): neutral = Image.open(raw).convert("RGB")
            if neutral is None:
                src = EXIST_CH / f"{cid}-neutral.png"
                if src.exists():
                    im = Image.open(src).convert("RGBA"); bgw = Image.new("RGBA", im.size, (255, 255, 255, 255)); bgw.alpha_composite(im)
                    neutral = bgw.convert("RGB").resize(P.sizes["char"], Image.LANCZOS)
            for expr in ["smile", "sad", "angry", "shock"]:
                if out_of_time() or neutral is None: break
                fe = CH / f"{cid}-{expr}.png"
                if exists("char", fe.name): continue
                t = time.time()
                img = P.redraw(neutral, f"{base_prompt}, {EXPR[expr]}, same character, same outfit", NEG, seed + 7)
                cutout(img).save(fe, optimize=True)
                made += 1; print(f"char {cid}-{expr} {time.time() - t:.0f}s", flush=True)
    for bid in todo_b:
        if out_of_time(): break
        t = time.time()
        img = P.draw(f"{STYLE_B}, {BGS[bid]}", NEG_B, "bg", seed_of(bid))
        img.resize((1600, 900), Image.LANCZOS).save(BG / f"{bid}.jpg", quality=88, optimize=True)
        made += 1; print(f"bg {bid} {time.time() - t:.0f}s", flush=True)
    for raw in CH.glob("*.raw.jpg"): raw.unlink()
    print(f"done, {made} new images", flush=True)

if __name__ == "__main__":
    main()
