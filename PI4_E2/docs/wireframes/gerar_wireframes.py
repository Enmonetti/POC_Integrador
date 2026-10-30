from PIL import Image, ImageDraw, ImageFont
import os

S = 2  # escala para nitidez
OUT = "/home/claude/PI4_E2/docs/wireframes"
os.makedirs(OUT, exist_ok=True)

FR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FM = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
def f(size, bold=False, mono=False):
    return ImageFont.truetype(FM if mono else (FB if bold else FR), int(size * S))

INK = (31, 41, 55); MUTED = (107, 114, 128); LINE = (156, 163, 175)
BLUE = (11, 87, 155); BLUE_BG = (232, 241, 250); CAM = (210, 213, 218)
GREEN = (22, 128, 61); GREEN_BG = (220, 252, 231)
RED = (185, 28, 28); RED_BG = (254, 226, 226)
AMBER = (146, 94, 0); AMBER_BG = (254, 243, 199)
WHITE = (255, 255, 255)

PW, PH = 300, 600  # tamanho do celular (unidades lógicas)

def s(*v): return [int(x * S) for x in v]

def rect(d, x, y, w, h, fill=None, outline=INK, r=8, width=1.5, dash=False):
    if dash:
        step = 8
        for xx in range(int(x), int(x + w), step * 2):
            d.line(s(xx, y, min(xx + step, x + w), y), fill=outline, width=int(width * S))
            d.line(s(xx, y + h, min(xx + step, x + w), y + h), fill=outline, width=int(width * S))
        for yy in range(int(y), int(y + h), step * 2):
            d.line(s(x, yy, x, min(yy + step, y + h)), fill=outline, width=int(width * S))
            d.line(s(x + w, yy, x + w, min(yy + step, y + h)), fill=outline, width=int(width * S))
        return
    d.rounded_rectangle(s(x, y, x + w, y + h), radius=int(r * S), fill=fill,
                        outline=outline, width=int(width * S) if outline else 0)

def text(d, x, y, t, size=12, bold=False, color=INK, anchor="la", mono=False):
    d.text(s(x, y), t, font=f(size, bold, mono), fill=color, anchor=anchor)

def button(d, x, y, w, t, primary=False, h=38):
    rect(d, x, y, w, h, fill=BLUE if primary else BLUE_BG, outline=BLUE, r=8)
    text(d, x + w / 2, y + h / 2, t, 13, True, WHITE if primary else BLUE, "mm")

def banner(d, x, y, w, t, kind, h=34):
    fg, bg = {"ok": (GREEN, GREEN_BG), "err": (RED, RED_BG), "wait": (AMBER, AMBER_BG)}[kind]
    rect(d, x, y, w, h, fill=bg, outline=fg, r=6, width=1)
    text(d, x + 10, y + h / 2, t, 11.5, True, fg, "lm")

def qr(d, x, y, n=56):
    rect(d, x, y, n, n, fill=WHITE, outline=INK, r=2, width=1)
    c = n / 7
    for (i, j) in [(0, 0), (4, 0), (0, 4)]:
        rect(d, x + 4 + i * c * 1.05, y + 4 + j * c * 1.05, c * 2.4, c * 2.4, fill=INK, outline=None, r=1)
        rect(d, x + 4 + i * c * 1.05 + c * 0.6, y + 4 + j * c * 1.05 + c * 0.6, c * 1.2, c * 1.2, fill=WHITE, outline=None, r=1)
    for (i, j) in [(4.3, 4.3), (5.4, 4.6), (4.6, 5.5), (3.4, 3.2), (5.6, 3.5)]:
        rect(d, x + i * c, y + j * c, c * 0.7, c * 0.7, fill=INK, outline=None, r=0)

def phone(num, title):
    img = Image.new("RGB", s(PW, PH), WHITE)
    d = ImageDraw.Draw(img)
    rect(d, 4, 4, PW - 8, PH - 8, outline=INK, r=26, width=2.5)
    # cabeçalho do wireframe
    rect(d, 14, 16, PW - 28, 40, fill=BLUE, outline=None, r=10)
    d.ellipse(s(22, 22, 50, 50), fill=WHITE)
    text(d, 36, 36, str(num), 15, True, BLUE, "mm")
    text(d, 60, 36, title, 14, True, WHITE, "lm")
    return img, d

X0, CW = 24, PW - 48  # área útil

# ---------- Tela 1: Início ----------
img, d = phone(1, "Início")
text(d, PW / 2, 100, "Inventário de Computadores", 15, True, INK, "mm")
text(d, PW / 2, 124, "Consulte um computador pelo QR Code", 11, False, MUTED, "mm")
rect(d, X0, 150, CW, 150, fill=BLUE_BG, outline=LINE, r=10, dash=False)
qr(d, PW / 2 - 32, 170, 64)
text(d, PW / 2, 262, "Aponte a câmera para a etiqueta", 11, False, MUTED, "mm")
text(d, PW / 2, 280, "colada no computador", 11, False, MUTED, "mm")
button(d, X0, 330, CW, "Ler QR Code", primary=True, h=46)
button(d, X0, 390, CW, "Digitar código manualmente")
text(d, X0, 460, "Ação 1 de 1 para iniciar a leitura.", 10.5, False, MUTED)
rect(d, X0, 520, CW, 40, fill=AMBER_BG, outline=AMBER, r=6, width=1)
text(d, PW / 2, 540, "PoC — dados simulados (dados/ativos.json)", 10, True, AMBER, "mm")
img.save(f"{OUT}/01-inicio.png"); t1 = img

# ---------- Tela 2: Leitura pela câmera ----------
img, d = phone(2, "Leitura pela câmera")
banner(d, X0, 72, CW, "Aguardando QR Code...", "wait")
rect(d, X0, 116, CW, 290, fill=CAM, outline=LINE, r=8)
text(d, PW / 2, 136, "ÁREA DA CÂMERA (vídeo ao vivo)", 10.5, True, MUTED, "mm")
# mira
mx, my, mw = PW / 2 - 70, 190, 140
for (cx, cy, dx, dy) in [(mx, my, 1, 1), (mx + mw, my, -1, 1), (mx, my + mw, 1, -1), (mx + mw, my + mw, -1, -1)]:
    d.line(s(cx, cy, cx + 24 * dx, cy), fill=BLUE, width=4 * S)
    d.line(s(cx, cy, cx, cy + 24 * dy), fill=BLUE, width=4 * S)
qr(d, PW / 2 - 30, my + 40, 60)
text(d, PW / 2, 368, "Centralize o QR Code na mira", 11, True, INK, "mm")
text(d, PW / 2, 386, "a leitura é automática", 10.5, False, MUTED, "mm")
button(d, X0, 424, CW, "Digitar código manualmente")
button(d, X0, 472, CW, "Voltar")
text(d, X0, 530, "Mensagens desta tela:", 10, True, MUTED)
text(d, X0, 546, "• Espera: \"Aguardando QR Code...\"", 9.5, False, MUTED)
text(d, X0, 561, "• Erro: câmera negada → Tela 5", 9.5, False, MUTED)
img.save(f"{OUT}/02-leitura-camera.png"); t2 = img

# ---------- Tela 3: Resultado em RA ----------
img, d = phone(3, "Resultado em RA")
banner(d, X0, 72, CW, "Ativo encontrado: ATV-001", "ok")
rect(d, X0, 116, CW, 380, fill=CAM, outline=LINE, r=8)
text(d, PW / 2, 136, "IMAGEM DA CÂMERA (ao vivo)", 10.5, True, MUTED, "mm")
qx, qy = X0 + 22, 160
qr(d, qx, qy, 58)
rect(d, qx - 4, qy - 4, 66, 66, outline=GREEN, r=3, width=2.5)
# ligação marcador -> cartão
d.line(s(qx + 62, qy + 29, qx + 100, qy + 29, qx + 100, 240), fill=GREEN, width=int(2 * S))
# cartão sobreposto (RA)
cx, cy, cw = X0 + 14, 240, CW - 28
rect(d, cx, cy, cw, 196, fill=WHITE, outline=GREEN, r=10, width=2)
text(d, cx + 12, cy + 18, "Dell OptiPlex 3080", 13.5, True, INK, "lm")
rows = [("Código", "ATV-001"), ("Patrimônio", "1025"), ("Local", "Lab. 3 — Sala 12"),
        ("Status", "Em uso"), ("Config.", "i5 · 8 GB · SSD 256")]
for i, (k, v) in enumerate(rows):
    yy = cy + 48 + i * 28
    text(d, cx + 12, yy, k, 10.5, False, MUTED, "lm")
    text(d, cx + 92, yy, v, 11, True, INK, "lm")
    if i < len(rows) - 1:
        d.line(s(cx + 10, yy + 14, cx + cw - 10, yy + 14), fill=(229, 231, 235), width=S)
text(d, PW / 2, 470, "Cartão acompanha o QR Code na imagem", 10, False, MUTED, "mm")
button(d, X0, 512, CW, "Nova consulta", primary=True)
text(d, PW / 2, 568, "Via manual: mesmo cartão, sem câmera", 9.5, False, MUTED, "mm")
img.save(f"{OUT}/03-resultado-ra.png"); t3 = img

# ---------- Tela 4: Consulta manual ----------
img, d = phone(4, "Consulta manual")
text(d, X0, 90, "Digite o código da etiqueta", 13, True, INK, "lm")
text(d, X0, 110, "Use quando a câmera ou a RA falhar.", 10.5, False, MUTED, "lm")
text(d, X0, 146, "Código do ativo", 11, True, INK, "lm")
rect(d, X0, 160, CW, 40, fill=WHITE, outline=INK, r=6)
text(d, X0 + 12, 180, "ATV-001", 13, False, INK, "lm", mono=True)
text(d, X0, 214, "Formato: ATV-000 (3 letras, hífen, 3 números)", 9.5, False, MUTED, "lm")
button(d, X0, 238, CW, "Consultar", primary=True, h=44)
text(d, X0, 312, "Estados após \"Consultar\":", 10.5, True, MUTED, "lm")
banner(d, X0, 326, CW, "Consultando...", "wait")
banner(d, X0, 368, CW, "Formato inválido. Ex.: ATV-001", "err")
text(d, X0, 418, "• 200 OK → Tela 3 (cartão sem câmera)", 10, False, MUTED, "lm")
text(d, X0, 436, "• 404 → Tela 5", 10, False, MUTED, "lm")
button(d, X0, 470, CW, "Voltar para a câmera")
img.save(f"{OUT}/04-consulta-manual.png"); t4 = img

# ---------- Tela 5: Erro ----------
img, d = phone(5, "Erro / Não encontrado")
d.ellipse(s(PW / 2 - 30, 86, PW / 2 + 30, 146), fill=RED_BG, outline=RED, width=2 * S)
text(d, PW / 2, 116, "!", 30, True, RED, "mm")
text(d, PW / 2, 172, "Ativo não encontrado", 15, True, RED, "mm")
text(d, PW / 2, 196, "O código ATV-999 não está", 11, False, INK, "mm")
text(d, PW / 2, 213, "cadastrado no inventário.", 11, False, INK, "mm")
button(d, X0, 246, CW, "Tentar ler novamente", primary=True)
button(d, X0, 294, CW, "Digitar código manualmente")
text(d, X0, 362, "Outras mensagens desta tela:", 10.5, True, MUTED, "lm")
banner(d, X0, 378, CW, "Câmera bloqueada: libere acesso", "err")
banner(d, X0, 420, CW, "QR Code inválido (fora do padrão)", "err")
banner(d, X0, 462, CW, "Falha ao consultar. Tente de novo.", "err")
text(d, X0, 520, "Toda mensagem de erro oferece", 10, False, MUTED, "lm")
text(d, X0, 536, "uma saída: nova leitura ou digitar.", 10, False, MUTED, "lm")
img.save(f"{OUT}/05-erro.png"); t5 = img

# ---------- Visão geral do fluxo ----------
GAP = 70
screens = [t1, t2, t3, t4, t5]
W = 40 + 5 * PW + 4 * GAP + 40
H = 120 + PH + 330
ov = Image.new("RGB", s(W, H), WHITE)
d = ImageDraw.Draw(ov)
text(d, 40, 40, "Wireframes — Fluxo de leitura do QR Code (PoC E2 · computadores)", 22, True, INK)
text(d, 40, 76, "Telas numeradas na ordem de uso. Setas = navegação principal; tabela abaixo lista todas as transições.", 12.5, False, MUTED)
top = 110
for i, sc in enumerate(screens):
    ov.paste(sc, (s(40 + i * (PW + GAP))[0], s(top)[0]))

def arrow(x1, x2, y, label, color=BLUE):
    d.line(s(x1, y, x2 - 10, y), fill=color, width=3 * S)
    d.polygon([tuple(s(x2, y)), tuple(s(x2 - 12, y - 7)), tuple(s(x2 - 12, y + 7))], fill=color)
    lines = label.split("\n")
    for k, ln in enumerate(lines):
        text(d, (x1 + x2) / 2, y - 14 - (len(lines) - 1 - k) * 15, ln, 10, True, color, "mm")

xr = lambda i: 40 + i * (PW + GAP) + PW
xl = lambda i: 40 + i * (PW + GAP)
arrow(xr(0) + 4, xl(1) - 4, top + 360, "Ler\nQR Code")
arrow(xr(1) + 4, xl(2) - 4, top + 300, "QR lido\n200 OK", GREEN)
arrow(xr(2) + 4, xl(3) - 4, top + 360, "Digitar\ncódigo", MUTED)
arrow(xr(3) + 4, xl(4) - 4, top + 300, "404", RED)

# tabela de transições
ty = top + PH + 30
text(d, 40, ty, "Transições entre telas", 15, True, INK)
cols = [40, 200, 520, 1000]
hdr = ["De → Para", "Ação do usuário / evento", "O que acontece (API)", "Mensagem exibida"]
rowsT = [
    ("1 → 2", "Toca em \"Ler QR Code\"", "Pede permissão e abre a câmera", "Aguardando QR Code..."),
    ("1 → 4", "Toca em \"Digitar código\"", "—", "—"),
    ("2 → 3", "QR Code reconhecido", "GET /api/ativos/ATV-001 → 200 OK", "Ativo encontrado: ATV-001"),
    ("2 → 5", "QR desconhecido / câmera negada", "GET → 404  ou  erro de permissão", "Ativo não encontrado / Câmera bloqueada"),
    ("2 → 4", "Toca em \"Digitar código\"", "Fecha a câmera", "—"),
    ("4 → 3", "Toca em \"Consultar\"", "Valida formato; GET → 200 OK", "Consultando... → cartão do ativo"),
    ("4 → 4", "Código fora do formato", "Bloqueado antes de chamar a API", "Formato inválido. Ex.: ATV-001"),
    ("4 → 5", "Toca em \"Consultar\"", "GET → 404 Not Found", "Ativo não encontrado"),
    ("5 → 2 / 4", "\"Tentar ler novamente\" / \"Digitar código\"", "Nova tentativa", "—"),
    ("3 → 1", "Toca em \"Nova consulta\"", "Limpa o resultado", "—"),
]
rh = 24
yy = ty + 26
rect(d, 40, yy, W - 80, rh, fill=BLUE, outline=None, r=4)
for c, h in zip(cols, hdr):
    text(d, c + 10, yy + rh / 2, h, 11, True, WHITE, "lm")
for i, r_ in enumerate(rowsT):
    y0 = yy + rh * (i + 1)
    if i % 2 == 0:
        rect(d, 40, y0, W - 80, rh, fill=(245, 247, 250), outline=None, r=0)
    for j, (c, v) in enumerate(zip(cols, r_)):
        text(d, c + 10, y0 + rh / 2, v, 10.5, j == 0, INK, "lm", mono=(j == 2 and "GET" in v))
ov.save(f"{OUT}/00-fluxo-completo.png")
print("ok", ov.size)
