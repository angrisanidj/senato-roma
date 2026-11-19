import json
p='../index.html';s=open(p).read()
d=json.load(open('mapgen/viz.json'));img=open('assets/aug.b64').read();ci=open('assets/caes.b64').read()
i=s.index('var FACES=');j=s.index(';\n',i);FA=json.loads(s[i+len('var FACES='):j])
coin=open('assets/coin.b64').read()
import glob,os
import base64
os.makedirs('../img/scene',exist_ok=True)
for q in sorted(glob.glob('assets/painted/*.b64')):
    open('../img/scene/'+os.path.basename(q)[:-4]+'.jpg','wb').write(base64.b64decode(open(q).read().strip()))
# le scene illustrate restano file a parte: la pagina le scarica solo quando servono
painted=''.join(f'<image id="fg-pt-{os.path.basename(q)[:-4]}" width="1280" height="720" data-src="img/scene/{os.path.basename(q)[:-4]}.jpg"/>' for q in sorted(glob.glob('assets/painted/*.b64')))
faces='<image id="fg-coin-img" width="380" height="376" href="'+coin+'"/>'+''.join(f'<image id="fg-face-{k}" width="180" height="180"/>' for k in ('cesare','pompeo','crasso','cicerone','catone','ottaviano','antonio','lepido','cleopatra','vercingetorige'))
a=s.index('<svg class="fg-defs"');b=s.index('</svg>',a)+6
s=s[:a]+'<svg class="fg-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs><image id="fg-aug-img" width="400" height="658" href="data:image/jpeg;base64,'+img+'"/><image id="fg-caes-img" width="400" height="614" href="data:image/jpeg;base64,'+ci+'"/>'+faces+painted+d['defs']+'</defs></svg>'+s[b:]
a=s.index('var VIZ=');b=s.index(';\nvar root=',a)
# le illustrazioni stanno in data/viz-d.js (desktop) e data/viz-m.js (telefono): la pagina scarica solo il formato che usa
os.makedirs('../data',exist_ok=True)
for key,name in (('viz','d'),('vizm','m')):
    open('../data/viz-'+name+'.js','w',encoding='utf-8').write('window.__fgViz=window.__fgViz||{};window.__fgViz.'+name+'='+json.dumps(d[key],ensure_ascii=False,separators=(',',':'))+';')
s=s[:a]+'var VIZ=null;'+chr(10)+'var VIZM=null'+s[b:]
open(p,'w').write(s);print(len(s))
