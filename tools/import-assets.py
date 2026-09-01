"""
One-off asset import for the 2026 site refresh.

Pulls artwork from the legacy site (_legacy/Images) and from the 2011-2015
design archive on D:, then writes web-optimised copies into assets/img.

Re-runnable: it overwrites outputs. Requires Pillow (pip install pillow).
"""
import os
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
LEGACY = ROOT / "_legacy" / "Images"
ARCHIVE = Path(r"D:\_business202606\___Clients\11 - GameOdyssey\_GO Games 2011-14\Dropbox GO Web 2015July\Game Odyssey Web")
ELEM = ARCHIVE / "Elements for Pages"
SHOTS = ARCHIVE / "Exported Screenshots for Product Pages" / "Exported"
OLDSITE = ARCHIVE / "_Proposed and old designs" / "Website" / "Game Pages Website"
OUT = ROOT / "assets" / "img"

JPEG_Q = 82


def save_jpg(img, path, width=None, quality=JPEG_Q):
    img = img.convert("RGB")
    if width and img.width > width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    return img


def save_png(img, path, width=None):
    if width and img.width > width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG", optimize=True)
    return img


def open_img(path):
    if not path.exists():
        print(f"  !! missing source: {path}", file=sys.stderr)
        return None
    return Image.open(path)


def game_dir(slug):
    d = OUT / "games" / slug
    d.mkdir(parents=True, exist_ok=True)
    return d


def shots(slug, sources, widths=(1200, 400)):
    """Write shots/01.jpg ... and thumbs shots/01-thumb.jpg."""
    d = game_dir(slug) / "shots"
    d.mkdir(exist_ok=True)
    for i, src in enumerate(sources, 1):
        img = open_img(src)
        if img is None:
            continue
        save_jpg(img, d / f"{i:02d}.jpg", widths[0])
        save_jpg(img, d / f"{i:02d}-thumb.jpg", widths[1], quality=78)


GAMES = {
    "backgammon": {
        "icon": LEGACY / "Games_Bg_Icon.png",
        "logo": LEGACY / "BG_Logo.png",
        "hero": LEGACY / "BG_Bg.png",
        "banner": LEGACY / "BackGammon.png",
        "shots": [],
    },
    "brain-drops": {
        "icon": LEGACY / "Games_Bd_Icon.png",
        "logo": LEGACY / "BD_Logo.png",
        "hero": LEGACY / "BD_Bg.png",
        "banner": LEGACY / "Braindrop_Web1.png",
        "shots": [
            ELEM / "Brain Drops Page Bits" / "game_screen_BD.jpg",
            ELEM / "Brain Drops Page Bits" / "game screen-01.jpg",
            ELEM / "Brain Drops Page Bits" / "game-screen-01.jpg",
        ],
    },
    "bug-me-not": {
        "icon": LEGACY / "Games_BMN_Icon.png",
        "logo": None,  # cropped from the hero below
        "hero": LEGACY / "BMN_Bg.png",
        "banner": LEGACY / "BMN_Web2.png",
        "shots": [SHOTS / "BMN Product Page Screenshots" / f"BMN_Full_{i}.jpg" for i in (1, 2, 3)],
    },
    "v-type": {
        "icon": LEGACY / "Games_VType_Icon.png",
        "logo": LEGACY / "VType_Logo.png",
        "hero": LEGACY / "Vtype_Bg.png",
        "banner": LEGACY / "Vtype_Web1.png",
        "shots": [SHOTS / "VType Product Page Screenshots" / f"vtype_full_0{i}.jpg" for i in (1, 2, 3)],
    },
    "vocabularious": {
        "icon": LEGACY / "Games_Vocab_Icon.png",
        "logo": LEGACY / "Vocab_logo.png",
        "hero": LEGACY / "Vcab_Bg.png",
        "banner": LEGACY / "Vocab_Web1.png",
        "shots": [SHOTS / "Vocabularious Product Page Screenshots" / f"vocab_full_0{i}.jpg" for i in (1, 2, 3)],
    },
    "word-invader": {
        "icon": LEGACY / "Games_WI_Icon.png",
        "logo": LEGACY / "WILogo.png",
        "hero": LEGACY / "WI_Bg.png",
        "banner": LEGACY / "WordInvader_web1.png",
        "shots": [SHOTS / "Word Invader  Product Page Screenshots" / f"WI_full_0{i}.jpg" for i in (1, 2, 3)],
    },
    "poker": {
        "icon": ELEM / "200x200 images for item placers" / "Game Icons 200x200" / "poker.png",
        "logo": ELEM / "Poker Page Bits" / "Poker_logo.png",
        "hero": ELEM / "Poker Page Bits" / "Poker_background.jpg",
        "banner": ELEM / "Home Page Banner bits" / "Poker-Home-Page-Banner.jpg",
        "shots": [
            OLDSITE / "Poker Screen Shot 1.png",
            OLDSITE / "Poker Screen Shot 2.jpg",
            OLDSITE / "Poker Screen Shot 3.png",
        ],
    },
}


def main():
    for slug, g in GAMES.items():
        print(f"== {slug}")
        d = game_dir(slug)

        icon = open_img(g["icon"])
        if icon is not None:
            save_png(icon.convert("RGBA").resize((200, 200), Image.LANCZOS), d / "icon.png")

        if g["logo"] is not None:
            logo = open_img(g["logo"])
            if logo is not None:
                save_png(logo.convert("RGBA"), d / "logo.png", 800)

        hero = open_img(g["hero"])
        if hero is not None:
            save_jpg(hero, d / "hero.jpg", 1920)
            save_jpg(hero, d / "hero-960.jpg", 960, quality=78)
            if slug == "bug-me-not":
                # The Bug Me Not wordmark only exists baked into the picnic
                # blanket of the hero art; crop it out for use as the logo.
                crop = hero.crop((470, 100, 1400, 480)).convert("RGBA")
                # Feather the edges so the grass around the blanket fades out
                # instead of ending in a hard rectangle.
                from PIL import ImageDraw, ImageFilter
                mask = Image.new("L", crop.size, 0)
                ImageDraw.Draw(mask).rounded_rectangle(
                    (40, 40, crop.width - 40, crop.height - 40), radius=60, fill=255
                )
                mask = mask.filter(ImageFilter.GaussianBlur(28))
                crop.putalpha(mask)
                save_png(crop, d / "logo.png", 800)

        banner = open_img(g["banner"])
        if banner is not None:
            save_jpg(banner, d / "banner.jpg", 1920)
            save_jpg(banner, d / "banner-960.jpg", 960, quality=78)

        shots(slug, g["shots"])

    print("== site")
    site = OUT / "site"
    site.mkdir(parents=True, exist_ok=True)

    # The archive "GO Logo.png" has a blue button box baked in; the legacy site
    # logo is the transparent wordmark.
    logo = open_img(LEGACY / "Logo.png")
    if logo is not None:
        logo = logo.convert("RGBA")
        save_png(logo, site / "logo.png")
        # The rocket roundel on the left of the wordmark becomes the favicon.
        bbox = logo.getbbox()
        h = bbox[3] - bbox[1]
        roundel = logo.crop((bbox[0], bbox[1], bbox[0] + h, bbox[3]))
        for size in (32, 64, 180, 512):
            save_png(roundel.resize((size, size), Image.LANCZOS), site / f"favicon-{size}.png")
        roundel.resize((64, 64), Image.LANCZOS).save(
            ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)]
        )

    cinema = open_img(ELEM / "Cinema-Room.jpg")
    if cinema is not None:
        save_jpg(cinema, site / "cinema.jpg", 1200)

    # Bob's 16-frame walk cycle (128x130 per frame) from the 2014 CodeIgniter site.
    bob = open_img(Path(r"C:\dev\goweb\danieldownes-goweb-9436bd94ac1b\danieldownes-goweb-9436bd94ac1b\assets\images\atlases\bobanimation.png"))
    if bob is not None:
        save_png(bob.convert("RGBA"), site / "bob-walk.png")

    # Immortal Unchained promo image from the legacy home page.
    immortal = open_img(LEGACY / "header.jpg")
    if immortal is not None:
        save_jpg(immortal, site / "immortal-unchained.jpg", 920, quality=85)

    coin = open_img(ELEM / "gocoin.png")
    if coin is not None:
        save_png(coin.convert("RGBA"), site / "gocoin.png")

    # Summary
    total = 0
    for p in sorted(OUT.rglob("*")):
        if p.is_file():
            total += p.stat().st_size
    print(f"assets/img total: {total/1024/1024:.1f} MB")


if __name__ == "__main__":
    main()
