from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
from pathlib import Path
import math, json, hashlib
ROOT=Path(__file__).resolve().parents[1]
AS=ROOT/'assets'
GAME=ROOT/'games'/'energy-capsules'
GAME.mkdir(parents=True, exist_ok=True)
(GAME/'assets').mkdir(parents=True, exist_ok=True)

# Convert local Unbounded WOFF2 to a TTF working copy for Pillow.
from fontTools.ttLib import TTFont
woff=AS/'fonts'/'unbounded-cyrillic-800-normal.woff2'
import tempfile
ttf=Path(tempfile.gettempdir())/'galaxy-unbounded-energycapsules.ttf'
f=TTFont(str(woff)); f.flavor=None; f.save(str(ttf))

corgi=Image.open(AS/'corgi.png').convert('RGBA')
cat=Image.open(AS/'cat.png').convert('RGBA')
space=Image.open(AS/'v14_space_bg.webp').convert('RGBA')

def contain(im, box):
    w,h=box; s=min(w/im.width,h/im.height); return im.resize((max(1,int(im.width*s)),max(1,int(im.height*s))),Image.Resampling.LANCZOS)

def glow_pill(size=(118,60), core=(255,104,193,255), accent=(104,238,255,255), rotate=0):
    w,h=size; pad=36
    base=Image.new('RGBA',(w+pad*2,h+pad*2),(0,0,0,0))
    # glow
    gl=Image.new('RGBA',base.size,(0,0,0,0)); gd=ImageDraw.Draw(gl)
    gd.rounded_rectangle((pad,pad,pad+w,pad+h), radius=h//2, fill=core[:3]+(185,))
    gl=gl.filter(ImageFilter.GaussianBlur(18)); base.alpha_composite(gl)
    d=ImageDraw.Draw(base)
    # dark violet outline
    d.rounded_rectangle((pad-4,pad-4,pad+w+4,pad+h+4), radius=h//2+4, fill=(73,26,128,245))
    # body gradient mask
    mask=Image.new('L',base.size,0); md=ImageDraw.Draw(mask); md.rounded_rectangle((pad,pad,pad+w,pad+h),radius=h//2,fill=255)
    grad=Image.new('RGBA',base.size,(0,0,0,0)); gp=grad.load()
    for y in range(base.height):
        t=max(0,min(1,(y-pad)/max(1,h)))
        r=int(255*(1-t)+core[0]*t); g=int(230*(1-t)+core[1]*t); b=int(244*(1-t)+core[2]*t)
        for x in range(pad,pad+w+1): gp[x,y]=(r,g,b,255)
    grad.putalpha(mask); base.alpha_composite(grad)
    # central energy window
    d=ImageDraw.Draw(base)
    cx=pad+w//2; cy=pad+h//2
    d.rounded_rectangle((cx-18,cy-16,cx+18,cy+16),radius=12,fill=(65,31,126,230),outline=(235,240,255,220),width=2)
    d.ellipse((cx-8,cy-8,cx+8,cy+8),fill=accent)
    # end caps and highlights
    d.rounded_rectangle((pad+4,pad+5,pad+18,pad+h-5),radius=7,fill=(255,255,255,115))
    d.rounded_rectangle((pad+w-18,pad+5,pad+w-4,pad+h-5),radius=7,fill=(255,255,255,80))
    d.arc((pad+8,pad+5,pad+w-8,pad+h-5),190,342,fill=(255,255,255,180),width=3)
    if rotate:
        base=base.rotate(rotate,Image.Resampling.BICUBIC,expand=True)
    return base

def add_star(im, xy, r, color=(255,255,255,235)):
    x,y=xy; lay=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(lay)
    pts=[]
    for i in range(8):
        a=-math.pi/2+i*math.pi/4; rr=r if i%2==0 else r*.22
        pts.append((x+math.cos(a)*rr,y+math.sin(a)*rr))
    d.polygon(pts,fill=color)
    gl=lay.filter(ImageFilter.GaussianBlur(max(2,int(r/2.5)))); im.alpha_composite(gl); im.alpha_composite(lay)

def place(im, obj, xy, anchor='center'):
    x,y=xy
    if anchor=='center': x-=obj.width//2; y-=obj.height//2
    elif anchor=='bottom': x-=obj.width//2; y-=obj.height
    im.alpha_composite(obj,(int(x),int(y)))

# Icon builder
for active in (False,True):
    im=Image.new('RGBA',(512,512),(0,0,0,0))
    # neon orbital arcs
    arc=Image.new('RGBA',im.size,(0,0,0,0)); ad=ImageDraw.Draw(arc)
    ad.arc((28,88,484,420),205,520,fill=(191,64,255,150),width=18)
    ad.arc((48,104,464,405),215,510,fill=(75,228,255,130),width=8)
    im.alpha_composite(arc.filter(ImageFilter.GaussianBlur(9))); im.alpha_composite(arc)
    if not active:
        a=contain(corgi,(310,310)); b=contain(cat,(220,220))
        place(im,a,(202,447),'bottom'); place(im,b,(372,430),'bottom')
        items=[(132,126,-22),(286,93,13),(390,180,-8)]
    else:
        a=contain(corgi,(248,248)).transpose(Image.Transpose.FLIP_LEFT_RIGHT); b=contain(cat,(292,292))
        place(im,a,(150,432),'bottom'); place(im,b,(337,447),'bottom')
        items=[(112,176,12),(255,90,-10),(405,126,22),(386,248,-15)]
    for x,y,r in items: place(im,glow_pill((92,46),rotate=r),(x,y))
    for x,y,r in [(64,78,11),(444,73,10),(255,42,8),(430,300,7)]: add_star(im,(x,y),r,(255,199,245,235))
    p=AS/'icons'/('energy-capsules-active.webp' if active else 'energy-capsules.webp')
    im.save(p,'WEBP',lossless=True,quality=100,method=6)

# Title art with actual local Unbounded text
W,H=1400,420
im=Image.new('RGBA',(W,H),(0,0,0,0))
text='Энергокапсулы'
# fit font
size=132
while size>40:
    font=ImageFont.truetype(str(ttf),size)
    bb=ImageDraw.Draw(Image.new('L',(1,1))).textbbox((0,0),text,font=font,stroke_width=0)
    tw=bb[2]-bb[0]; th=bb[3]-bb[1]
    if tw<=1120 and th<=190: break
    size-=2
x=(W-tw)//2; y=92-bb[1]
# glow masks
mask=Image.new('L',(W,H),0); md=ImageDraw.Draw(mask); md.text((x,y),text,font=font,fill=255,stroke_width=0)
outer=mask.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.GaussianBlur(8))
cyan=Image.new('RGBA',(W,H),(73,229,255,0)); cyan.putalpha(outer.point(lambda v:int(v*.48))); im.alpha_composite(cyan)
# purple stroke layer
stroke=Image.new('RGBA',(W,H),(0,0,0,0)); sd=ImageDraw.Draw(stroke)
sd.text((x,y),text,font=font,fill=(255,255,255,0),stroke_width=18,stroke_fill=(89,27,142,255)); im.alpha_composite(stroke)
# magenta inner outline
stroke2=Image.new('RGBA',(W,H),(0,0,0,0)); s2=ImageDraw.Draw(stroke2)
s2.text((x,y),text,font=font,fill=(255,255,255,0),stroke_width=9,stroke_fill=(246,54,178,255)); im.alpha_composite(stroke2)
# face gradient masked
grad=Image.new('RGBA',(W,H),(0,0,0,0)); pix=grad.load()
for yy in range(H):
    t=max(0,min(1,(yy-100)/180))
    c=(255,int(244-95*t),int(226-45*t),255) if t<.55 else (255,int(188-60*(t-.55)/.45),int(215+25*(t-.55)/.45),255)
    for xx in range(max(0,x-5),min(W,x+tw+5)): pix[xx,yy]=c
grad.putalpha(mask); im.alpha_composite(grad)
# highlights via offset mask
high=Image.new('RGBA',(W,H),(255,255,255,0)); hm=mask.filter(ImageFilter.GaussianBlur(1)); shifted=ImageChops.offset(hm,0,-5); high.putalpha(shifted.point(lambda v:int(v*.18))); im.alpha_composite(high)
# accessories
place(im,glow_pill((130,64),rotate=-16),(98,228)); place(im,glow_pill((130,64),rotate=15),(1304,221))
# orbit arcs
arc=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(arc); d.arc((130,42,1270,392),10,172,fill=(72,232,255,165),width=7); d.arc((160,62,1240,377),190,348,fill=(237,55,181,140),width=8); im.alpha_composite(arc.filter(ImageFilter.GaussianBlur(5))); im.alpha_composite(arc)
for pos,r,c in [((210,62),13,(255,215,241,255)),((1168,74),12,(98,240,255,255)),((1220,330),9,(255,174,224,255)),((178,334),8,(99,238,255,255))]: add_star(im,pos,r,c)
# downscale to standard 1024x307-ish with transparent safe top/bottom, keep 1024x341
im=im.resize((1024,307),Image.Resampling.LANCZOS)
out=Image.new('RGBA',(1024,341),(0,0,0,0)); out.alpha_composite(im,(0,17)); out.save(AS/'titles'/'energy-capsules.png')

# Splash 1080x1920
s=space.copy()
# overlay to harmonize magenta-violet and reserve contrast
veil=Image.new('RGBA',s.size,(35,9,66,45)); s.alpha_composite(veil)
# title
T=Image.open(AS/'titles'/'energy-capsules.png').convert('RGBA'); T=contain(T,(940,320)); place(s,T,(540,235))
# chutes/rails glowing diagonals
rail=Image.new('RGBA',s.size,(0,0,0,0)); rd=ImageDraw.Draw(rail)
lines=[((72,500),(420,1040)),((1008,500),(660,1040)),((72,770),(420,1265)),((1008,770),(660,1265))]
for a,b in lines:
    rd.line([a,b],fill=(97,232,255,120),width=12)
    rd.line([a,b],fill=(246,72,186,120),width=4)
s.alpha_composite(rail.filter(ImageFilter.GaussianBlur(14))); s.alpha_composite(rail)
# characters
ca=contain(corgi,(520,520)); ct=contain(cat,(455,455))
place(s,ca,(382,1520),'bottom'); place(s,ct,(760,1490),'bottom')
# capsules placed along lanes
caps=[(245,735,-28),(815,650,26),(305,1008,-26),(760,990,25),(520,860,0)]
for px,py,rot in caps: place(s,glow_pill((150,74),rotate=rot),(px,py))
# reactor orb in center
orb=Image.new('RGBA',(280,280),(0,0,0,0)); od=ImageDraw.Draw(orb); od.ellipse((40,40,240,240),fill=(102,31,157,150),outline=(136,239,255,230),width=7); od.ellipse((88,88,192,192),fill=(248,72,185,215)); od.ellipse((112,112,168,168),fill=(255,237,247,245)); s.alpha_composite(orb.filter(ImageFilter.GaussianBlur(22)),(400,1050)); s.alpha_composite(orb,(400,1050))
for pos,r,c in [((170,390),12,(255,224,244,255)),((915,415),14,(100,235,255,255)),((520,480),9,(255,177,224,255)),((130,1320),10,(99,237,255,255)),((930,1280),10,(255,182,226,255))]: add_star(s,pos,r,c)
# subtle bottom fade for HTML button readability
fade=Image.new('RGBA',s.size,(0,0,0,0)); fp=fade.load()
for yy in range(1600,1920):
    a=int(120*((yy-1600)/320))
    for xx in range(1080): fp[xx,yy]=(4,8,42,a)
s.alpha_composite(fade)
s.convert('RGB').save(AS/'splashes'/'energy-capsules.webp','WEBP',quality=94,method=6)

# Also store a source composite preview in game assets for provenance.
source_preview=Image.new('RGBA',(768,768),(0,0,0,0));
source_preview.alpha_composite(Image.open(AS/'icons'/'energy-capsules.webp').convert('RGBA').resize((384,384)),(0,192));
source_preview.alpha_composite(Image.open(AS/'icons'/'energy-capsules-active.webp').convert('RGBA').resize((384,384)),(384,192));
source_preview.save(GAME/'assets'/'catalog-composition-source.png')
print('art built')
