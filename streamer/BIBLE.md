# Rae Calloway — Consistency Bible

Every image and video prompt is built from the locked blocks below, pasted **word for word**.
Only the `[SHIRT]` and `[ACTION]` slots change between videos.

- Studio character: **Rae Calloway** (`@raecalloway.xx`), influencer_id `e0a4de8d-040a-4c67-935b-bd66a361ea25`
- Face reference: `refs/rae-face-reference.png`
- Original room inspiration: `refs/room-master.png`
- **MASTER STILL (approved): `refs/master-still.png`**, source URL
  `https://v3b.fal.media/files/b/0ab33bfe/Oyg6nVVPHJ31lcLIMV5qN_XWsxKuui.png`
  Every shirt still is an **edit of this image** (change the shirt only) so face, room and light never drift.

---

## 1. CHARACTER block (locked)

```
A woman in her mid-to-late twenties with light brown skin and warm undertones,
a few faint freckles across her nose and cheeks, natural full eyebrows, dark brown
almond-shaped eyes, a straight nose and full natural lips. Minimal natural makeup,
bare-skin look, no heavy eyeliner, no lipstick. Dark brown-black tightly coiled
3C curly hair, shoulder length, pulled back into a loose high curly ponytail with
a few curly strands loose at the temples. Small diamond stud earrings.
Slim athletic build. Short natural nails.
```

## 2. ROOM block (locked)

```
A small cozy gaming bedroom at night lit by purple and violet LED light. Lavender
walls washed in purple light. Upper left: a black floating wall shelf holding two
rows of boxed vinyl collectible figures, with two unboxed figures standing on the
right end. Below it on the left wall: a large white circular ring light, switched
on. A small wooden wall shelf with a trailing green pothos plant in a white pot.
A dark walnut wooden desk with a purple LED strip glowing along its back edge; on
the desk a glowing round moon lamp, a short stack of dark books, and a small
orange-outfit anime action figure on a black base. A black boom-arm microphone
stand holding a black studio microphone angled toward her. She sits in a black
leather racing-style gaming chair with no visible text. Purple LED strip glowing
along the baseboard. Dark wood floor. Pale window blinds at the far right edge.
```

## 3. CAMERA block (locked)

```
Vertical 9:16 photo-realistic handheld phone shot from her front-right at seated
eye level. Her chair and body are angled toward an off-screen monitor on the left,
with her face turned toward the camera so her face and the front of her shirt are
clearly visible. Framed from the shelf of figures down to her knees. Natural skin texture,
realistic soft purple ambient light with warm ring-light fill on her face.
```

## 4. PROPS (locked)

```
She holds a white and black modern wireless game controller with both hands,
thumbs on the sticks.
```

## 5. WARDROBE slot

Bottoms (locked): `black high-waisted bike shorts`

`[SHIRT]` — one entry per product, filled from the design files:

| id | Name | Description used in prompt | Design file |
|----|------|----------------------------|-------------|
| tee-01 | Gamma Rae — Black | Black crew-neck tee. Small logo on the wearer's left chest: the word "GAMMA" in bold white italic sans-serif capitals, below it "RAE" in bold hot-pink italic capitals, a white four-point sparkle star to the left of "RAE", and a thin hot-pink swoosh arc curving over "GAMMA". Rest of the shirt plain. | `refs/shirts/tee-01-gamma-rae-black.jpg` |

Fit (locked): `fitted short-sleeve crew-neck T-shirt` + design description, print placement as specified per shirt

## 6. ACTION slot (varies per shot)

Examples:
- `She plays intently, eyes on the screen, thumbs working the sticks.`
- `She leans forward in concentration, then breaks into a big laugh.`
- `She glances at the screen, then back to camera and smiles, pointing at her shirt.`

## 7. NEGATIVE (locked)

```
cartoon, CGI, plastic skin, heavy makeup, straightened hair, different hairstyle,
different face, extra fingers, distorted hands, warped controller, warped or
misspelled shirt print, watermark, subtitles, on-screen captions, changing room layout
```

---

## Production rules

1. Build one **still per shirt** first (character + room + camera + shirt). Owner approves it.
2. Animate only approved stills (start frame = the still). Shots are 10 s; stitch 3 for 30 s.
3. Never change a locked block without updating this file.
4. Final edit layouts:
   - **Video 1 (launch):** `split-screen.sh` — equal halves, Rae on top, GTA 6 gameplay on the bottom.
   - **Every video after:** `facecam-circle.sh` — gameplay full screen, Rae in a small round facecam
     (default top-right, purple ring). Options via env vars: `CORNER`, `SIZE`, `GAME_FIT=fit`, etc.
   - Audio in both: Rae's voice on top, gameplay mixed under it and dipped while she talks.
5. Posts are labelled as AI-generated.
