"""
Draws the game's art for free on GitHub's computers with an open-source model
(Stable Diffusion 1.5 "DreamShaper 8" + LCM-LoRA for speed), removes the
character backgrounds (rembg, anime/cartoon model), and saves everything with
the exact file names the game looks for:

  img/chars/<id>-<expression>.png   (transparent, head to knees)
  img/bg/<place>.jpg                (1600 x 900)

Files that already exist are skipped, so the job can be re-run to continue.
Run by .github/workflows/art.yml. Phases: 1 = every character (neutral),
2 = every background, 3 = the other four expressions.
"""
import os, sys, time, json, hashlib, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CH = ROOT / "img" / "chars"; BG = ROOT / "img" / "bg"
CH.mkdir(parents=True, exist_ok=True); BG.mkdir(parents=True, exist_ok=True)
DEADLINE = time.time() + float(os.environ.get("ART_MINUTES", "300")) * 60
PHASES = os.environ.get("ART_PHASES", "1,2,3").split(",")
ONLY = [x.strip() for x in os.environ.get("ART_ONLY", "").split(",") if x.strip()]
OK = lambda k: not ONLY or k in ONLY

STYLE_C = ("2d visual novel character sprite, western cartoon game art in the style of a life simulation game, "
           "clean bold black outlines, flat cel shading, bright saturated colors, big expressive eyes, glossy hair, "
           "semi-realistic proportions, one single character standing and facing the viewer, three-quarter body shot from head to knees, "
           "fully clothed, modest clothing, plain pure white background, centered")
STYLE_B = ("2d visual novel background art, western cartoon game background in the style of a life simulation game, "
           "clean lineart, cel shading, vibrant warm colors, detailed and cosy, wide shot, eye level, empty scene with no people, daytime")
NEG = ("photo, photorealistic, realistic, 3d, render, nsfw, nude, naked, cleavage, revealing, sexy, lingerie, swimsuit, bikini, "
       "multiple people, two people, crowd, text, letters, watermark, signature, logo, frame, border, lowres, blurry, jpeg artifacts, "
       "deformed, disfigured, bad anatomy, extra fingers, missing fingers, extra limbs, extra arms, cropped head, out of frame, "
       "scenery behind the character, busy background")
NEG_B = ("people, person, character, human, face, text, letters, watermark, signature, logo, lowres, blurry, deformed, photo, "
         "photorealistic, 3d render, nsfw")

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

def load():
    import torch
    from diffusers import StableDiffusionPipeline, LCMScheduler, DPMSolverMultistepScheduler
    torch.set_num_threads(os.cpu_count() or 4)
    model = os.environ.get("ART_MODEL", "Lykon/dreamshaper-8")
    try:
        pipe = StableDiffusionPipeline.from_pretrained(model, torch_dtype=torch.float32, variant="fp16", safety_checker=None, requires_safety_checker=False)
    except Exception as e:
        print("fp16 variant not found, loading full weights:", e)
        pipe = StableDiffusionPipeline.from_pretrained(model, torch_dtype=torch.float32, safety_checker=None, requires_safety_checker=False)
    steps, cfg = 6, 1.6
    try:
        pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
        pipe.load_lora_weights("latent-consistency/lcm-lora-sdv1-5")
        pipe.fuse_lora()
        print("LCM-LoRA loaded")
    except Exception as e:
        print("LCM-LoRA failed, using normal sampler (slower):", e)
        pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, use_karras_sigmas=True)
        steps, cfg = 22, 6.5
    pipe.set_progress_bar_config(disable=True)
    pipe.enable_attention_slicing()
    return pipe, steps, cfg

def gen(pipe, steps, cfg, prompt, neg, w, h, seed):
    import torch
    g = torch.Generator("cpu").manual_seed(seed)
    return pipe(prompt=prompt, negative_prompt=neg, width=w, height=h, num_inference_steps=steps, guidance_scale=cfg, generator=g).images[0]

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
    if rgba.height < 1100:
        k = 1100 / rgba.height
        rgba = rgba.resize((int(rgba.width * k), 1100), Image.LANCZOS)
    return rgba

def commit(msg):
    if os.environ.get("ART_COMMIT") != "1": return
    subprocess.run(["git", "add", "img"], cwd=ROOT)
    if subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=ROOT).returncode == 0: return
    subprocess.run(["git", "commit", "-m", msg], cwd=ROOT, check=True)
    br = os.environ.get("GITHUB_REF_NAME", "main")
    for _ in range(4):
        subprocess.run(["git", "pull", "--rebase", "--autostash", "origin", br], cwd=ROOT)
        if subprocess.run(["git", "push", "origin", "HEAD:" + br], cwd=ROOT).returncode == 0: return
        time.sleep(8)

def main():
    from PIL import Image
    pipe, steps, cfg = load()
    made = 0
    def char(cid, expr):
        nonlocal made
        f = CH / f"{cid}-{expr}.png"
        if f.exists(): return
        t = time.time()
        img = gen(pipe, steps, cfg, f"{STYLE_C}, {CHARS[cid]}, {EXPR[expr]}", NEG, 512, 832, seed_of(cid))
        cutout(img).save(f, optimize=True)
        made += 1; print(f"char {cid}-{expr} {time.time() - t:.0f}s", flush=True)
    def bg(bid):
        nonlocal made
        f = BG / f"{bid}.jpg"
        if f.exists(): return
        t = time.time()
        img = gen(pipe, steps, cfg, f"{STYLE_B}, {BGS[bid]}", NEG_B, 912, 512, seed_of(bid))
        img.resize((1600, 900), Image.LANCZOS).save(f, quality=88, optimize=True)
        made += 1; print(f"bg {bid} {time.time() - t:.0f}s", flush=True)
    if "1" in PHASES:
        for i, cid in enumerate(c for c in CHARS if OK(c)):
            if out_of_time(): break
            char(cid, "neutral")
            if i % 6 == 5: commit("Art: characters")
        commit("Art: characters")
    if "2" in PHASES:
        for i, bid in enumerate(b for b in BGS if OK(b)):
            if out_of_time(): break
            bg(bid)
            if i % 8 == 7: commit("Art: backgrounds")
        commit("Art: backgrounds")
    if "3" in PHASES:
        for i, cid in enumerate(c for c in CHARS if OK(c)):
            for expr in ["smile", "sad", "angry", "shock"]:
                if out_of_time(): break
                char(cid, expr)
            if i % 4 == 3: commit("Art: expressions")
        commit("Art: expressions")
    print(f"done, {made} new images", flush=True)

if __name__ == "__main__":
    main()
