"""Put the real Sepify time clock screens onto the tablet in the AI clip.

- Tracks the tablet with SIFT features + homography from a clean reference frame.
- Keeps her finger/hand in front of the screen (skin mask).
- Paints out the AI "peg" glitch next to the tablet.
"""
import cv2, numpy as np, os, sys

FR = 'frames'
OUT = 'comp'
os.makedirs(OUT, exist_ok=True)
N = len([f for f in os.listdir(FR) if f.endswith('.png')])
REF = N  # last frame is clean (no hand)
ref = cv2.imread(f'{FR}/{REF:04d}.png')
# screen corners in the reference frame (TL, TR, BR, BL), measured on a grid
C0 = np.float32([[900, 185], [1141, 159], [1142, 636], [900, 584]])

# timeline: which real screen on which frame (1-based)
def screen_for(i):
    if i < 5: return 'pin0'
    if i < 14: return 'pin1'
    if i < 24: return 'pin2'
    if i < 36: return 'pin3'
    if i < 50: return 'pin4'
    if i < 84:
        k = min(16, (i - 50) // 2)
        return f'face{k:02d}'
    if i < 101: return 'ok'
    return 'done'

cache = {}
def scr(name):
    if name not in cache:
        im = cv2.imread(f'scr/{name}.png')
        cache[name] = im
    return cache[name]

sift = cv2.SIFT_create(4000)
gref = cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY)
mref = np.zeros_like(gref)
cv2.fillPoly(mref, [np.int32(C0 + [[-25, -25], [25, -25], [40, 25], [-5, 25]])], 255)
cv2.rectangle(mref, (820, 450), (898, 640), 0, -1)  # skip the peg area
kref, dref = sift.detectAndCompute(gref, mref)
bf = cv2.BFMatcher()

def skin_mask(img):
    ycc = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    y, cr, cb = ycc[..., 0], ycc[..., 1], ycc[..., 2]
    m = ((cr > 138) & (cr < 180) & (cb > 80) & (cb < 130) & (y > 70)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    m = cv2.dilate(m, np.ones((5, 5), np.uint8))
    return m

prevH = np.eye(3)
log = []
for i in range(1, N + 1):
    f = cv2.imread(f'{FR}/{i:04d}.png')
    g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
    sk = skin_mask(f)
    mt = np.zeros_like(g)
    cv2.fillPoly(mt, [np.int32(C0 + [[-60, -40], [60, -40], [70, 60], [-60, 60]])], 255)
    mt[sk > 0] = 0
    k, d = sift.detectAndCompute(g, mt)
    H = None
    if d is not None and len(k) > 20:
        ms = bf.knnMatch(dref, d, k=2)
        good = [m for m, n in ms if m.distance < 0.72 * n.distance]
        if len(good) > 25:
            src = np.float32([kref[m.queryIdx].pt for m in good])
            dst = np.float32([k[m.trainIdx].pt for m in good])
            H, inl = cv2.findHomography(src, dst, cv2.RANSAC, 2.0)
    if H is None:
        H = prevH
    prevH = H
    C = cv2.perspectiveTransform(C0.reshape(-1, 1, 2), H).reshape(-1, 2)
    log.append(C)

# smooth corner tracks over time (removes jitter)
L = np.array(log)
K = 5
Ls = L.copy()
for i in range(len(L)):
    a, b = max(0, i - K), min(len(L), i + K + 1)
    Ls[i] = L[a:b].mean(axis=0)

for i in range(1, N + 1):
    f = cv2.imread(f'{FR}/{i:04d}.png')
    C = Ls[i - 1]
    s = scr(screen_for(i))
    h, w = s.shape[:2]
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(C))
    warped = cv2.warpPerspective(s, M, (f.shape[1], f.shape[0]), flags=cv2.INTER_AREA)
    mask = cv2.warpPerspective(np.full((h, w), 255, np.uint8), M, (f.shape[1], f.shape[0]))
    mask = cv2.erode(mask, np.ones((2, 2), np.uint8))
    # her hand stays in front of the screen
    sk = skin_mask(f)
    sk = cv2.GaussianBlur(sk, (5, 5), 0)
    a = (mask.astype(np.float32) / 255) * (1 - sk.astype(np.float32) / 255)
    a = cv2.GaussianBlur(a, (3, 3), 0)[..., None]
    # screen look: slight softness, lifted blacks like a real display in a room
    wv = cv2.GaussianBlur(warped, (3, 3), 0).astype(np.float32)
    wv = wv * 0.94 + 9
    out = f.astype(np.float32) * (1 - a) + wv * a
    out = np.clip(out, 0, 255).astype(np.uint8)
    # paint out the peg glitch left of the tablet's bottom corner
    if i >= 45:
        bl = C[3]
        x0, y0 = int(bl[0] - 70), int(bl[1] - 130)
        x1, y1 = int(bl[0] + 1), int(bl[1] + 30)
        reg = out[y0:y1, x0:x1]
        gr = cv2.cvtColor(reg, cv2.COLOR_BGR2GRAY)
        pm = (gr < 95).astype(np.uint8) * 255
        # don't touch the tablet itself
        poly = np.int32(C - [x0, y0])
        tab = np.zeros_like(pm); cv2.fillPoly(tab, [poly], 255)
        tab = cv2.dilate(tab, np.ones((7, 7), np.uint8))
        pm[tab > 0] = 0
        pm = cv2.dilate(pm, np.ones((7, 7), np.uint8))
        out[y0:y1, x0:x1] = cv2.inpaint(reg, pm, 6, cv2.INPAINT_TELEA)
    cv2.imwrite(f'{OUT}/{i:04d}.png', out)
print('done', N)
