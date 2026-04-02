import struct
import zlib
from collections import Counter


def read_png_chunks(path: str):
    with open(path, "rb") as f:
        sig = f.read(8)
        if sig != b"\x89PNG\r\n\x1a\n":
            raise ValueError("Not a PNG file")
        while True:
            length_bytes = f.read(4)
            if not length_bytes:
                break
            length = struct.unpack(">I", length_bytes)[0]
            chunk_type = f.read(4)
            chunk_data = f.read(length)
            f.read(4)  # CRC
            yield chunk_type, chunk_data
            if chunk_type == b"IEND":
                break


def extract_dominant_colors(path: str, quant: int = 8, top_n: int = 12):
    width = height = None
    bit_depth = color_type = None
    idat = b""

    for ctype, cdata in read_png_chunks(path):
        if ctype == b"IHDR":
            width, height, bit_depth, color_type, _, _, _ = struct.unpack(">IIBBBBB", cdata)
        elif ctype == b"IDAT":
            idat += cdata

    if width is None:
        raise ValueError("Missing IHDR")
    if bit_depth != 8 or color_type not in (2, 6):
        raise ValueError(f"Unsupported PNG format (bit_depth={bit_depth}, color_type={color_type})")

    stride = 3 if color_type == 2 else 4
    raw = zlib.decompress(idat)

    counts = Counter()
    i = 0
    for _y in range(height):
        _filter = raw[i]
        i += 1
        row = raw[i : i + width * stride]
        i += width * stride

        for x in range(0, len(row), stride):
            r = row[x]
            g = row[x + 1]
            b = row[x + 2]
            if r > 245 and g > 245 and b > 245:
                continue  # skip background
            qr = (r // quant) * quant
            qg = (g // quant) * quant
            qb = (b // quant) * quant
            counts[(qr, qg, qb)] += 1

    return counts.most_common(top_n), (width, height, bit_depth, color_type)


if __name__ == "__main__":
    png_path = r"C:\Users\james\OneDrive\Desktop\DSK\NIYIMPAJames\wellgates\assets\wellgates-logo.png"
    top, meta = extract_dominant_colors(png_path, quant=8, top_n=14)
    w, h, bd, ct = meta
    print(f"PNG: {w}x{h} bit_depth={bd} color_type={ct}")
    print("Top colors (quantized):")
    for (r, g, b), c in top:
        print(f"#{r:02x}{g:02x}{b:02x}  {c}")
