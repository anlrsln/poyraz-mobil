"""Poyraz Mobilya — uygulama ikonlarini vektor logodan (poyraz-logo.pdf) uretir.

Kaynak: PDF'in qlmanage ile 4096px'e render edilmis hali.
Logonun gercek renkleri korunur: #015697 (lacivert) + #1AB7EA (acik mavi).

Kus amblemi "POYRAZ" yazisinin uzerinde durur ama pusula ignesi araya giriyor;
bu yuzden amblem bagli-bilesen analizi ile ayiklanir (kirpma tahminiyle degil).
"""
from PIL import Image
from collections import deque
import os
import subprocess
import sys
import tempfile

# Kullanim:  python3 scripts/gen-assets.py [logo.pdf] [assets/]
PDF = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/poyraz/poyraz-logo.pdf")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), "..", "assets")
OUT = os.path.abspath(OUT)

INK_MIN   = 229                        # #1AB7EA'nin min kanali (255-26): kapanma orani
LOGO_BBOX = (373, 535, 3724, 2467)     # tum logo, yazi dahil
BIRD_BOX  = (1060, 500, 2500, 1563)    # amblem penceresi (y=1564'te harfler basliyor)
BIRD_MIN_AREA = 5000                   # ignenin alani 6516 -> alan yetmez, bbox ile ayrilir


def render_pdf(pdf, tmpdir, size=4096):
    """PDF'i qlmanage ile buyuk bir PNG'ye render eder (macOS, ek bagimlilik yok)."""
    subprocess.run(["qlmanage", "-t", "-s", str(size), "-o", tmpdir, pdf],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    out = os.path.join(tmpdir, os.path.basename(pdf) + ".png")
    if not os.path.exists(out):
        raise SystemExit(f"render basarisiz: {pdf}")
    return out


def load_flat(src):
    im = Image.open(src).convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    return Image.alpha_composite(bg, im).convert("RGB")


def components(mask_img):
    """4-komsuluk bagli bilesenler -> [(alan, etiket, bbox)], buyukten kucuge."""
    W, H = mask_img.size
    m = bytearray(mask_img.tobytes())
    lab = [0] * (W * H)
    out = []
    cid = 0
    for i in range(W * H):
        if not m[i] or lab[i]:
            continue
        cid += 1
        q = deque([i]); lab[i] = cid
        x0 = y0 = 1 << 30; x1 = y1 = -1; n = 0
        while q:
            p = q.popleft(); n += 1
            py, px = divmod(p, W)
            x0 = min(x0, px); x1 = max(x1, px)
            y0 = min(y0, py); y1 = max(y1, py)
            for nx, ny in ((px+1, py), (px-1, py), (px, py+1), (px, py-1)):
                if 0 <= nx < W and 0 <= ny < H:
                    j = ny * W + nx
                    if m[j] and not lab[j]:
                        lab[j] = cid; q.append(j)
        out.append((n, cid, (x0, y0, x1, y1)))
    out.sort(reverse=True)
    return lab, out


def extract_bird(flat):
    """Amblemi dondurur: pusula ignesi ve kirintilar atilir."""
    crop = flat.crop(BIRD_BOX)
    W, H = crop.size
    mask = crop.convert("L").point(lambda v: 1 if v < 235 else 0)
    lab, comps = components(mask)

    keep = set()
    for area, cid, (x0, y0, x1, y1) in comps:
        # igne: ince (genislik < 200) ve pencerenin altina kadar uzanan dikey parca
        thin_vertical = (x1 - x0) < 200 and y1 > H - 20
        if area >= BIRD_MIN_AREA and not thin_vertical:
            keep.add(cid)
        else:
            print(f"  atilan bilesen: alan={area} bbox={(x0, y0, x1, y1)}")

    out = Image.new("RGB", (W, H), (255, 255, 255))
    src, dst = crop.load(), out.load()
    for y in range(H):
        row = y * W
        for x in range(W):
            if lab[row + x] in keep:
                dst[x, y] = src[x, y]
    return out.crop(out.convert("L").point(lambda v: 255 if v < 235 else 0).getbbox())


def keyed(img):
    """Beyaz zemini saydama cevirir. alpha = murekkep orani,
    renk = 'beyaz uzerine kompozit' isleminin tersi -> koyu zeminde halo olmaz."""
    img = img.convert("RGB")
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    src, dst = img.load(), out.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b = src[x, y]
            cov = 255 - min(r, g, b)
            if cov <= 2:
                continue
            a = min(255, cov * 255 // INK_MIN)
            k = 255 / a
            dst[x, y] = (max(0, min(255, round(255 - (255 - r) * k))),
                         max(0, min(255, round(255 - (255 - g) * k))),
                         max(0, min(255, round(255 - (255 - b) * k))), a)
    return out


def white_silhouette(img):
    """Android bildirim ikonu / karanlik tema: beyaz siluet, saydam zemin.
    (Android yalnizca alpha kanalini kullanip app.json'daki renkle boyar.)"""
    img = img.convert("RGB")
    out = Image.new("RGBA", img.size, (255, 255, 255, 0))
    src, dst = img.load(), out.load()
    for y in range(img.height):
        for x in range(img.width):
            cov = 255 - min(src[x, y])
            if cov > 2:
                dst[x, y] = (255, 255, 255, min(255, cov * 255 // INK_MIN))
    return out


def fit(img, box):
    s = min(box / img.width, box / img.height)
    return img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)


def center(canvas, img):
    canvas.paste(img, ((canvas.width - img.width) // 2, (canvas.height - img.height) // 2),
                 img if img.mode == "RGBA" else None)
    return canvas


tmp = tempfile.mkdtemp()
flat = load_flat(render_pdf(PDF, tmp))
print("kaynak:", PDF, flat.size)
bird = extract_bird(flat)
print("amblem:", bird.size)
bird_rgba = keyed(bird)

# icon.png — iOS + Android uygulama ikonu (iOS saydamlik kabul etmez -> opak beyaz zemin)
center(Image.new("RGB", (1024, 1024), (255, 255, 255)), fit(bird_rgba, 780)).save(f"{OUT}/icon.png")

# adaptive-icon.png — Android maskeler; guvenli alan merkezdeki ~%66 (676px)
center(Image.new("RGB", (1024, 1024), (255, 255, 255)), fit(bird_rgba, 600)).save(f"{OUT}/adaptive-icon.png")

# notification-icon.png — 96px beyaz siluet, saydam
center(Image.new("RGBA", (96, 96), (255, 255, 255, 0)), fit(white_silhouette(bird), 88)).save(f"{OUT}/notification-icon.png")

# splash.png + logo.png — tum logo (yazi dahil), saydam zemin
logo = flat.crop(LOGO_BBOX)
for name, width in (("splash.png", 1200), ("logo.png", 900)):
    keyed(logo.resize((width, round(logo.height * width / logo.width)), Image.LANCZOS)).save(f"{OUT}/{name}")

# logo-white.png — karanlik tema icin beyaz siluet (tintColor calismazsa yedek)
white_silhouette(logo.resize((900, round(logo.height * 900 / logo.width)), Image.LANCZOS)).save(f"{OUT}/logo-white.png")
print("bitti")
