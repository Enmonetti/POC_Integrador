"""Gera os QR Codes de teste da PoC (marcador/*.png e marcador/etiquetas.pdf).

Uso:  python marcador/gerar_qrcodes.py
Requer: pip install pillow reportlab
"""
import json
import os
from PIL import Image, ImageDraw, ImageFont
from reportlab.graphics.barcode import qrencoder

PASTA = os.path.dirname(os.path.abspath(__file__))
DADOS = os.path.join(PASTA, "..", "dados", "ativos.json")


def fonte(tamanho, negrito=False):
    nomes = ["DejaVuSans-Bold.ttf" if negrito else "DejaVuSans.ttf", "arialbd.ttf" if negrito else "arial.ttf"]
    for n in nomes:
        for base in ["/usr/share/fonts/truetype/dejavu", "C:/Windows/Fonts", ""]:
            try:
                return ImageFont.truetype(os.path.join(base, n), tamanho)
            except OSError:
                pass
    return ImageFont.load_default()


def matriz_qr(texto):
    qr = qrencoder.QRCode(None, qrencoder.QRErrorCorrectLevel.M)
    qr.addData(texto)
    qr.make()
    n = qr.getModuleCount()
    return [[qr.isDark(l, c) for c in range(n)] for l in range(n)]


def etiqueta(codigo, titulo, subtitulo, modulo=16):
    m = matriz_qr(codigo)
    n = len(m)
    borda = 4  # zona de silêncio exigida pelo padrão QR
    lado = (n + 2 * borda) * modulo
    img = Image.new("RGB", (lado, lado + 150), "white")
    d = ImageDraw.Draw(img)
    for l in range(n):
        for c in range(n):
            if m[l][c]:
                x, y = (c + borda) * modulo, (l + borda) * modulo
                d.rectangle([x, y, x + modulo - 1, y + modulo - 1], fill="black")
    d.text((lado / 2, lado + 20), titulo, font=fonte(44, True), fill="black", anchor="mt")
    d.text((lado / 2, lado + 80), subtitulo, font=fonte(26), fill=(90, 90, 90), anchor="mt")
    return img


def main():
    with open(DADOS, encoding="utf-8") as f:
        ativos = json.load(f)["ativos"]

    imagens = []
    for a in ativos:
        img = etiqueta(a["codigo"], a["codigo"], f'{a["nome"]} · Pat. {a["patrimonio"]}')
        img.save(os.path.join(PASTA, f'{a["codigo"]}.png'))
        imagens.append(img)

    # QR Codes de teste para os cenários de erro
    testes = [
        ("ATV-999", "ATV-999", "TESTE: código não cadastrado (404)"),
        ("TESTE-INVALIDO", "INVÁLIDO", "TESTE: fora do padrão ATV-000"),
    ]
    for conteudo, titulo, sub in testes:
        img = etiqueta(conteudo, titulo, sub)
        nome = "teste-nao-encontrado" if conteudo == "ATV-999" else "teste-invalido"
        img.save(os.path.join(PASTA, f"{nome}.png"))
        imagens.append(img)

    # Folha para imprimir com todas as etiquetas
    imagens[0].save(os.path.join(PASTA, "etiquetas.pdf"), save_all=True, append_images=imagens[1:])
    print(f"{len(imagens)} QR Codes gerados em {PASTA}")


if __name__ == "__main__":
    main()
