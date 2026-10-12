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
RAW = OUT / "raw"; RAW.mkdir(parents=True, exist_ok=True)
EXIST_CH = ROOT / "img" / "chars"; EXIST_BG = ROOT / "img" / "bg"
DEADLINE = time.time() + float(os.environ.get("ART_MINUTES", "300")) * 60
PHASES = os.environ.get("ART_PHASES", "1,2,3").split(",")
ONLY = [x.strip() for x in os.environ.get("ART_ONLY", "").split(",") if x.strip()]
OK = lambda k: not ONLY or k in ONLY
SHARD, SHARDS = int(os.environ.get("ART_SHARD", "0")), max(1, int(os.environ.get("ART_SHARDS", "1")))

# Prompts are short on purpose: the text encoders only read ~75 tokens, so the
# character description goes FIRST and the style comes after it.
STYLE_C = "solo, plain white background, 2d cartoon illustration, visual novel character art, clean lineart, cel shading, three-quarter body from head to knees, casual everyday clothes"
STYLE_B = "2d cartoon illustration, visual novel background art, clean lineart, cel shading, warm light, detailed, no people"
NEG = "photo, realistic, 3d, nsfw, nude, underwear, multiple people, desk, table, counter, furniture, flower pots, shelves, text, watermark, blurry, bad hands, extra fingers, cropped head, background scenery"
NEG_B = "people, person, character, text, watermark, blurry, photo, 3d render, palm trees, tropical"

EXPR = {
    "neutral": "calm expression",
    "smile": "warm happy smile",
    "sad": "sad expression, downturned mouth, worried eyebrows",
    "angry": "angry frown, furrowed eyebrows",
    "shock": "shocked surprised expression, wide eyes, open mouth",
}

# Activity poses (phase 4): the same person, drawn from their neutral picture, holding what they use
# for that part of their day. File: img/chars/<id>-<activity>.png. The activity names are the ones in
# each character's `life` table (js/chars/<id>.js); the game shows the pose while they are doing it.
ACT_ART = {
    "elias":    {"cook": "holding a frying pan and a wooden spatula, cooking breakfast",
                 "mend": "holding a tangled fishing net in both hands, mending it",
                 "fish": "holding a fishing rod over his shoulder, fisherman",
                 "rest": "holding a steaming mug of tea in both hands, relaxed"},
    "leo":      {"eat": "holding a bowl of cereal and a spoon, eating",
                 "draw": "holding a sketchbook and a pencil, drawing",
                 "game": "holding a video game controller, playing",
                 "deliver": "holding a bike helmet under one arm and a phone, delivery rider"},
    "margaret": {"cook": "holding a saucepan and a wooden spoon, cooking",
                 "tea": "holding a teacup and saucer",
                 "table": "carrying three white dinner plates"},
    "evelyn":   {"cook": "holding a frying pan, cooking",
                 "gulls": "holding a paper bag of bread crumbs, throwing crumbs",
                 "watch": "holding a polishing cloth and a glass lens"},
    "martha":   {"clean": "holding a feather duster and a bucket, cleaning"},
    "sami":     {"shop": "carrying a cardboard box of groceries"},
    "marco":    {"serve": "holding a tray with two cups of coffee, waiter"},
    "nora":     {"phone": "holding a phone to her ear, talking"},
    "kell":     {"read": "holding an open paperback book, reading"},
    "ana":      {"clean": "holding a stack of folded white towels",
                 "laundry": "carrying a laundry basket full of sheets"},
    "gregor":   {"dig": "holding a shovel, leaning on it"},
    "irene":    {"doctor": "stethoscope around her neck, holding a clipboard"},
    "maya":     {"mend": "holding a fishing net in both hands, mending it"},
    "kai":      {"surf": "holding a surfboard under one arm"},
    "olivia":   {"petition": "holding a clipboard and a pen"},
    "stella":   {"flowers": "holding a bouquet of flowers"},
    "ingrid":   {"tea": "holding a teacup and saucer"},
}
ACT_STRENGTH = float(os.environ.get("ART_ACT_STRENGTH", "0.62"))

# per-character expression wording (the ghost's "angry" face is his scream)
EXPR_FOR = {"keeper": {"angry": "screaming, mouth wide open, furious wild eyes", "smile": "faint gentle peaceful smile"}}
def expr_text(cid, e):
    return EXPR_FOR.get(cid, {}).get(e, EXPR[e])

CHARS = {
    "elias": "72 year old fisherman, lean wiry build, thick white beard, blue knitted beanie, kind blue eyes, yellow raincoat over cream wool sweater",
    "sami": "29 year old Arab man, short and stocky, round face, short black hair, short black beard, white t-shirt, green shop apron, jeans, hand on hip",
    "marco": "28 year old Italian man, slim, curly brown hair, thin mustache, blue striped shirt with rolled sleeves, black waist apron, holding a coffee cup",
    "irene": "45 year old woman doctor, tall and slender, red hair in a bun, glasses, white lab coat over teal scrubs, stethoscope, holding a clipboard",
    "martha": "62 year old short plump cleaning lady, round body, grey hair, blue polka dot headscarf, pink cardigan, white floral apron, yellow rubber gloves, hands on hips",
    "leo": "19 year old skinny lanky young man, messy dark hair, red jacket over mustard yellow hoodie, black headphones around neck, hands in pockets",
    "frank": "54 year old heavyset mechanic, big belly, broad shoulders, balding, big grey mustache, grey t-shirt, navy blue work overalls, arms crossed",
    "margaret": "anime style, 54 year old petite slim woman, greying light brown bob haircut, tired kind eyes, lavender knitted cardigan, cream blouse, grey long skirt, hands clasped",
    "nora": "50 year old tall sturdy woman, short dark pixie haircut, sharp eyes, long red coat, yellow scarf, black trousers, hand on hip",
    "keeper": "ghost of an 80 year old lighthouse keeper, very tall gaunt old man, pale grey skin, white full beard, hollow sleepless eyes, long dark navy keeper coat with brass buttons, peaked cap, holding a teacup",
    "evelyn": "38 year old tall athletic woman, blonde hair in a side braid, navy blue fisherman sweater, red scarf, brown trousers, quirky smile",
    "victor": "50 year old rich man, well fed with a slight paunch, slicked back black hair, smug smile, dark navy suit, white shirt, red tie, one hand in pocket",
    "kell": "42 year old huge muscular black man, very broad, buzz cut, short beard, black suit, arms crossed, bodyguard",
    "ana": "31 year old short slight latina woman, dark hair in a neat bun, hotel maid uniform, grey dress with white apron, hands clasped, kind face",
    "stella": "anime style, 32 year old plus size woman, full figured, round cheerful face, wavy ginger hair, freckles, pink t-shirt, green florist apron, jeans, holding one small bouquet",
    "kai": "23 year old athletic surfer guy, lean muscles, long sun bleached blond hair, tanned, teal t-shirt, orange board shorts, waving hand, goofy grin",
    "rex": "46 year old tall broad policeman, slight belly, short dark hair, mustache, navy blue police uniform with gold badge, hands on belt",
    "bella": "27 year old petite slim woman receptionist standing, no desk, no furniture, black hair in high ponytail, burgundy blazer, white blouse, black knee length skirt, sassy smile",
    "ingrid": "74 year old small frail grandmother, slightly hunched, white hair in a bun, round glasses, green cardigan, cream blouse, purple long skirt, sweet smile",
    "maya": "41 year old strong muscular fisherwoman, broad shoulders, tanned, dark ponytail, orange waterproof jacket, dark green trousers, arms crossed",
    "olivia": "26 year old short chubby black woman, round face, big natural afro hair, yellow hoodie with badges, jeans, holding a clipboard",
    "gregor": "66 year old tall thin bony gravedigger, close up from head to knees, bald, grey full beard, long dark olive coat, holding a shovel, cheerful",
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
    "beach": "northern european seaside beach, sand dunes with grass, grey-blue sea waves, red beach umbrella, surfboard, cliffs",
    "cemetery": "old seaside churchyard cemetery, gravestones, small stone church, grass, calm and peaceful",
    "florist": "colourful small flower shop interior, buckets of flowers, wooden counter, plants everywhere",
    "police": "small town police station office, desk with old computer, notice board, filing cabinets, holding cell bars",
}

SALT = os.environ.get("ART_SALT", "")  # change it to get a different drawing of the same thing

def seed_of(s):
    return int(hashlib.md5((s + SALT).encode()).hexdigest()[:8], 16)

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
            self.steps, self.cfg, self.xl = 7, 2.2, True
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

    def redraw(self, image, prompt, neg, seed, strength=0.5):
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
    """a picture counts as done if it exists as .png/.jpg or as the smaller .webp the game ships"""
    names = [name, name.rsplit(".", 1)[0] + ".webp"]
    dirs = [EXIST_CH, CH] if kind == "char" else [EXIST_BG, BG]
    return any(d.joinpath(n).exists() for d in dirs for n in names)

def main():
    from PIL import Image
    chars = [c for c in CHARS if OK(c)]
    bgs = [b for b in BGS if OK(b)]
    mine_c = [c for i, c in enumerate(chars) if i % SHARDS == SHARD]
    mine_b = [b for i, b in enumerate(bgs) if (i + len(chars)) % SHARDS == SHARD]
    need = lambda c: list(EXPR if "3" in PHASES else ["neutral"]) + (list(ACT_ART.get(c, {})) if "4" in PHASES else [])
    todo = [c for c in mine_c if any(not exists("char", f"{c}-{e}.png") for e in need(c))]
    todo_b = [b for b in mine_b if "2" in PHASES and not exists("bg", f"{b}.jpg")]
    print(f"shard {SHARD}/{SHARDS}: characters {todo}, backgrounds {todo_b}", flush=True)
    if not todo and not todo_b:
        print("nothing to draw", flush=True); return
    P = Painter()
    made = 0
    for cid in todo:
        if out_of_time(): break
        seed = seed_of(cid)
        base_prompt = CHARS[cid]
        f = CH / f"{cid}-neutral.png"
        neutral = None
        if "1" in PHASES and not exists("char", f.name):
            t = time.time()
            neutral = P.draw(f"{base_prompt}, {expr_text(cid, 'neutral')}, {STYLE_C}", NEG, "char", seed)
            neutral.save(CH / f"{cid}-neutral.raw.jpg", quality=92)
            neutral.save(RAW / f"{cid}-neutral.png")
            made += 1; print(f"char {cid}-neutral {time.time() - t:.0f}s", flush=True)
        if "3" in PHASES or "4" in PHASES:
            raw = CH / f"{cid}-neutral.raw.jpg"
            if neutral is None and raw.exists(): neutral = Image.open(raw).convert("RGB")
            if neutral is None:
                src = EXIST_CH / f"{cid}-neutral.png"
                if not src.exists(): src = EXIST_CH / f"{cid}-neutral.webp"
                if src.exists():
                    im = Image.open(src).convert("RGBA"); bgw = Image.new("RGBA", im.size, (255, 255, 255, 255)); bgw.alpha_composite(im)
                    neutral = bgw.convert("RGB").resize(P.sizes["char"], Image.LANCZOS)
            for expr in (["smile", "sad", "angry", "shock"] if "3" in PHASES else []):
                if out_of_time() or neutral is None: break
                fe = CH / f"{cid}-{expr}.png"
                if exists("char", fe.name): continue
                t = time.time()
                img = P.redraw(neutral, f"{base_prompt}, {expr_text(cid, expr)}, {STYLE_C}", NEG, seed + 7)
                img.save(RAW / f"{cid}-{expr}.png")
                made += 1; print(f"char {cid}-{expr} {time.time() - t:.0f}s", flush=True)
            # phase 4: what they do during the day (a stronger redraw, so the hands and the object change)
            for act, what in (ACT_ART.get(cid, {}).items() if "4" in PHASES else []):
                if out_of_time() or neutral is None: break
                fa = CH / f"{cid}-{act}.png"
                if exists("char", fa.name): continue
                t = time.time()
                img = P.redraw(neutral, f"{base_prompt}, calm expression, {what}, {STYLE_C}", NEG, seed + 11, strength=ACT_STRENGTH)
                img.save(RAW / f"{cid}-{act}.png")
                made += 1; print(f"char {cid}-{act} {time.time() - t:.0f}s", flush=True)
    for bid in todo_b:
        if out_of_time(): break
        t = time.time()
        img = P.draw(f"{BGS[bid]}, northern european seaside town, {STYLE_B}", NEG_B, "bg", seed_of(bid))
        img.resize((1600, 900), Image.LANCZOS).save(BG / f"{bid}.jpg", quality=88, optimize=True)
        made += 1; print(f"bg {bid} {time.time() - t:.0f}s", flush=True)
    for raw in CH.glob("*.raw.jpg"): raw.unlink()
    # free the drawing model, then cut the characters out of their white backgrounds
    del P
    import gc; gc.collect()
    for raw in sorted(RAW.glob("*.png")):
        t = time.time()
        cutout(Image.open(raw).convert("RGB")).save(CH / raw.name, optimize=True)
        raw.unlink(); print(f"cutout {raw.name} {time.time() - t:.0f}s", flush=True)
    print(f"done, {made} new images", flush=True)

if __name__ == "__main__":
    main()
