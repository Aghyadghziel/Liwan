"""
Prepares the site's photographs.

  uv run --python 3.12 --with pillow python tools/photos/prepare.py

Reads tools/photos/selection.json — { key: { file, photographer?, username?, id?, crop? } } —
where `file` is a path to the original (relative to this folder's `raw/`, or absolute). Writes
public/photography/<key>.webp at up to 2400 px, and src/content/media.generated.json with each
file's size, a tiny blur placeholder and its credit. Also rewrites public/photography/CREDITS.md.
"""
import base64, io, json, pathlib
from PIL import Image, ImageOps

here = pathlib.Path(__file__).resolve().parent
root = here.parent.parent
out = root / "public" / "photography"
out.mkdir(parents=True, exist_ok=True)
selection = json.loads((here / "selection.json").read_text())

generated, credits = {}, []
for key, item in selection.items():
    source = pathlib.Path(item["file"])
    if not source.is_absolute():
        source = here / "raw" / source
    image = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
    if "crop" in item:  # fractions of the frame: left, top, right, bottom
        l, t, r, b = item["crop"]
        image = image.crop((int(l * image.width), int(t * image.height), int(r * image.width), int(b * image.height)))
    image.thumbnail((2400, 2400), Image.LANCZOS)
    image.save(out / f"{key}.webp", "WEBP", quality=80, method=6)

    tiny = image.copy()
    tiny.thumbnail((20, 20))
    buffer = io.BytesIO()
    tiny.save(buffer, "WEBP", quality=40)
    entry = {"src": f"/photography/{key}.webp", "w": image.width, "h": image.height, "blur": "data:image/webp;base64," + base64.b64encode(buffer.getvalue()).decode()}
    if item.get("photographer"):
        entry["credit"] = {"name": item["photographer"], "url": f"https://unsplash.com/photos/{item['id']}"}
        credits.append(f"- `{key}.webp` — [{item['photographer']}](https://unsplash.com/@{item['username']}) · https://unsplash.com/photos/{item['id']}")
    generated[key] = entry
    print(key, image.size)

(root / "src" / "content" / "media.generated.json").write_text(json.dumps(generated, indent=1))
(out / "CREDITS.md").write_text(
    "# Photography credits\n\nLIWAN is a fictional studio. These are reference photographs from Unsplash (Unsplash licence), "
    "taken by the photographers below of real buildings that have no connection to it. Files named `hittin-*` are frames of "
    "the site's own 3D model.\n\n" + "\n".join(credits) + "\n"
)
