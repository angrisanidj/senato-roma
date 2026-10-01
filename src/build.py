import json
p='../index.html';s=open(p).read()
d=json.load(open('mapgen/viz.json'));img=open('assets/aug.b64').read();ci=open('assets/caes.b64').read()
i=s.index('var FACES=');j=s.index(';\n',i);FA=json.loads(s[i+len('var FACES='):j])
coin=open('assets/coin.b64').read()
faces='<image id="fg-coin-img" width="380" height="376" href="'+coin+'"/>'+''.join(f'<image id="fg-face-{k}" width="180" height="180" href="{FA[k]}"/>' for k in ('cesare','pompeo','crasso','cicerone','catone','ottaviano','antonio','lepido','cleopatra','vercingetorige'))
a=s.index('<svg class="fg-defs"');b=s.index('</svg>',a)+6
s=s[:a]+'<svg class="fg-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs><image id="fg-aug-img" width="400" height="658" href="data:image/jpeg;base64,'+img+'"/><image id="fg-caes-img" width="400" height="614" href="data:image/jpeg;base64,'+ci+'"/>'+faces+d['defs']+'</defs></svg>'+s[b:]
a=s.index('var VIZ=');b=s.index(';\nvar root=',a)
s=s[:a]+'var VIZ='+json.dumps(d['viz'],ensure_ascii=False,separators=(',',':'))+';\nvar VIZM='+json.dumps(d['vizm'],ensure_ascii=False,separators=(',',':'))+s[b:]
open(p,'w').write(s);print(len(s))
