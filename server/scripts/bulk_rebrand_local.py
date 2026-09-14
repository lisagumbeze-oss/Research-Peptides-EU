"""
Local-only bulk product image rebrand preview.

- Reads catalog titles from scratch inventory (or Supabase read-only)
- Composites product name onto EU vial blank template
- Writes images + HTML gallery under scratch/ (NOT uploaded, NOT committed)

Usage (from repo root):
  python server/scripts/bulk_rebrand_local.py
  python server/scripts/bulk_rebrand_local.py --limit 12
  python server/scripts/bulk_rebrand_local.py --serve
"""
from __future__ import annotations

import argparse
import json
import re
import http.server
import socketserver
import webbrowser
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
SCRATCH = ROOT / "scratch" / "product-rebrand-samples"
TEMPLATE = SCRATCH / "eu-vial-blank-template.png"
INVENTORY = SCRATCH / "catalog-inventory.json"
OUT_DIR = SCRATCH / "bulk-local"
MANIFEST = OUT_DIR / "manifest.json"
GALLERY = OUT_DIR / "index.html"

# Product name band on 1024x1024 blank template (between URL and disclaimer)
NAME_BOX = (360, 640, 665, 760)
NAVY = (26, 54, 93)


def clean_label_title(title: str) -> str:
    t = title.strip()
    t = re.sub(r"\s*\(powder list\)\s*", "", t, flags=re.I)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def wrap_lines(text: str, font: ImageFont.ImageFont, draw: ImageDraw.ImageDraw, max_width: int) -> list[str]:
    words = text.split(" ")
    lines: list[str] = []
    cur = ""
    for w in words:
        trial = f"{cur} {w}".strip()
        bbox = draw.textbbox((0, 0), trial, font=font)
        if bbox[2] - bbox[0] <= max_width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def fit_font(draw: ImageDraw.ImageDraw, text: str, max_width: int, max_height: int, prefer: int = 34):
    font_path = r"C:\Windows\Fonts\segoeuib.ttf"
    size = prefer
    while size >= 14:
        font = ImageFont.truetype(font_path, size=size)
        lines = wrap_lines(text, font, draw, max_width)
        # measure block
        heights = []
        widths = []
        for line in lines:
            bbox = draw.textbbox((0, 0), line, font=font)
            widths.append(bbox[2] - bbox[0])
            heights.append(bbox[3] - bbox[1])
        gap = max(4, size // 6)
        total_h = sum(heights) + gap * (len(lines) - 1)
        if len(lines) <= 4 and total_h <= max_height and (not widths or max(widths) <= max_width):
            return font, lines, gap
        size -= 2
    font = ImageFont.truetype(font_path, size=14)
    return font, wrap_lines(text, font, draw, max_width), 4


def sample_fill(template: Image.Image) -> tuple[int, int, int]:
    """Sample label paper color from the name band so overlay has no hard box edge."""
    px = template.convert("RGB").load()
    cx = (NAME_BOX[0] + NAME_BOX[2]) // 2
    cy = (NAME_BOX[1] + NAME_BOX[3]) // 2
    return px[cx, cy]


def render_product(template: Image.Image, title: str, fill: tuple[int, int, int]) -> Image.Image:
    img = template.copy().convert("RGB")
    draw = ImageDraw.Draw(img)
    draw.rectangle(NAME_BOX, fill=fill)

    label = clean_label_title(title).upper()
    max_w = NAME_BOX[2] - NAME_BOX[0] - 8
    max_h = NAME_BOX[3] - NAME_BOX[1] - 8
    font, lines, gap = fit_font(draw, label, max_w, max_h)

    # vertical center block
    heights = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        heights.append(bbox[3] - bbox[1])
    total_h = sum(heights) + gap * (len(lines) - 1)
    y = NAME_BOX[1] + (NAME_BOX[3] - NAME_BOX[1] - total_h) // 2
    cx = (NAME_BOX[0] + NAME_BOX[2]) // 2

    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text((cx - tw // 2, y), line, font=font, fill=NAVY)
        y += th + gap

    return img


def load_catalog(limit: int | None) -> list[dict]:
    if not INVENTORY.exists():
        raise SystemExit(f"Missing inventory: {INVENTORY}. Run inventory-product-images.ts first.")
    data = json.loads(INVENTORY.read_text(encoding="utf-8"))
    rows = data["rows"]
    if limit is not None:
        rows = rows[:limit]
    return rows


def write_gallery(items: list[dict]) -> None:
    cards = []
    for it in items:
        cards.append(
            f"""
      <article class="card">
        <a href="{it['file']}" target="_blank" rel="noopener">
          <img src="{it['file']}" alt="{it['title']}" loading="lazy" />
        </a>
        <h2>{it['title']}</h2>
        <p class="slug">{it['slug']}</p>
      </article>"""
        )

    html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Research Peptides EU — Local rebrand preview</title>
  <style>
    :root {{
      --bg: #f4faf9;
      --ink: #0f2744;
      --teal: #249688;
      --muted: #4a6170;
      --card: #fff;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      font-family: "Segoe UI", system-ui, sans-serif;
      background: var(--bg);
      color: var(--ink);
    }}
    header {{
      position: sticky; top: 0; z-index: 10;
      background: linear-gradient(90deg, #1d7a73, #1a365d);
      color: #fff;
      padding: 1rem 1.25rem;
      display: flex; gap: 1rem; align-items: baseline; flex-wrap: wrap;
    }}
    header h1 {{ margin: 0; font-size: 1.15rem; font-weight: 650; }}
    header p {{ margin: 0; opacity: .9; font-size: .92rem; }}
    .banner {{
      margin: 1rem 1.25rem 0;
      padding: .85rem 1rem;
      border: 1px solid #b7e4dc;
      background: #ecfbf8;
      border-radius: 10px;
      color: var(--muted);
      font-size: .92rem;
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
      padding: 1.25rem;
    }}
    .card {{
      background: var(--card);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(15,39,68,.08);
    }}
    .card img {{
      display: block; width: 100%; aspect-ratio: 1; object-fit: contain;
      background: #fff;
    }}
    .card h2 {{
      margin: .65rem .85rem .2rem;
      font-size: .95rem;
      line-height: 1.25;
    }}
    .slug {{
      margin: 0 .85rem 0.9rem;
      color: var(--muted);
      font-size: .75rem;
      word-break: break-all;
    }}
  </style>
</head>
<body>
  <header>
    <h1>Local rebrand preview</h1>
    <p>{len(items)} products · not uploaded · not committed</p>
  </header>
  <div class="banner">
    Review these locally first. Nothing has been pushed to the live database or git.
    When approved, we can upload in bulk.
  </div>
  <div class="grid">
    {''.join(cards)}
  </div>
</body>
</html>
"""
    GALLERY.write_text(html, encoding="utf-8")


def serve_gallery(port: int = 8765) -> None:
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(OUT_DIR), **kwargs)

    with socketserver.TCPServer(("127.0.0.1", port), Handler) as httpd:
        url = f"http://127.0.0.1:{port}/index.html"
        print(f"Serving {OUT_DIR} at {url}")
        webbrowser.open(url)
        httpd.serve_forever()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None, help="Only first N products")
    parser.add_argument("--serve", action="store_true", help="Serve local gallery after generate")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--serve-only", action="store_true")
    args = parser.parse_args()

    if args.serve_only:
        if not GALLERY.exists():
            raise SystemExit("No gallery yet. Run without --serve-only first.")
        serve_gallery(args.port)
        return

    if not TEMPLATE.exists():
        raise SystemExit(f"Missing template: {TEMPLATE}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    template = Image.open(TEMPLATE)
    fill = sample_fill(template)
    rows = load_catalog(args.limit)

    items = []
    for i, row in enumerate(rows, 1):
        slug = row["slug"]
        title = row["title"]
        out_name = f"{slug}.png"
        out_path = OUT_DIR / out_name
        img = render_product(template, title, fill)
        img.save(out_path, format="PNG", optimize=True)
        items.append(
            {
                "id": row.get("id"),
                "slug": slug,
                "title": title,
                "file": out_name,
                "path": str(out_path),
            }
        )
        if i % 20 == 0 or i == len(rows):
            print(f"[{i}/{len(rows)}] {slug}")

    MANIFEST.write_text(json.dumps({"count": len(items), "items": items}, indent=2), encoding="utf-8")
    write_gallery(items)
    print(f"\nWrote {len(items)} images -> {OUT_DIR}")
    print(f"Gallery: {GALLERY}")
    print("LOCAL ONLY - no Supabase upload, no git changes.")

    if args.serve:
        serve_gallery(args.port)


if __name__ == "__main__":
    main()
