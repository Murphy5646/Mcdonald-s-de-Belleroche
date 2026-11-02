(function(){
"use strict";
var S=window.SITE,$=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var eur=function(n){return n.toFixed(2).replace(".",",")+" €"};
var byId={};S.products.forEach(function(p){byId[p.id]=p});
var page=document.body.dataset.page;

/* Photo avec emplacement identifié si le fichier est absent */
function ph(src,label,size,alt){return '<figure class="ph" data-label="'+label+'" data-size="'+size+'"><img src="'+src+'" alt="'+(alt||"")+'" loading="lazy" onerror="this.remove()"></figure>'}
window.BL={ph:ph};
document.addEventListener("DOMContentLoaded",function(){$$("[data-ph]").forEach(function(el){var d=el.dataset;el.outerHTML=ph(d.ph,d.ph.split("/").pop(),d.size,d.alt)})});

/* Panier */
var cart={};try{cart=JSON.parse(localStorage.getItem("bl_cart")||"{}")}catch(e){cart={}}
Object.keys(cart).forEach(function(k){if(!byId[k]||!(cart[k]>0))delete cart[k]});
function save(){try{localStorage.setItem("bl_cart",JSON.stringify(cart))}catch(e){}}
function count(){return Object.keys(cart).reduce(function(a,k){return a+cart[k]},0)}
function total(){return Object.keys(cart).reduce(function(a,k){return a+cart[k]*byId[k].price},0)}

/* Coque commune */
var nav=[["index.html","Accueil","home"],["carte.html","La carte","menu"],["restaurant.html","Restaurant","resto"],["recrutement.html","Recrutement","jobs"]];
function shell(){
 var b=document.body;
 b.insertAdjacentHTML("afterbegin",'<a class="skip" href="#main">Aller au contenu</a><div class="strip">'+S.disclaimer+'</div>'+
 '<header class="top"><div class="wrap bar"><a class="logo" href="index.html" aria-label="Accueil Belleroche"><i aria-hidden="true">B</i>Belleroche</a>'+
 '<nav class="main" id="nav" aria-label="Navigation principale">'+nav.map(function(n){return '<a href="'+n[0]+'"'+(n[2]===page?' aria-current="page"':'')+'>'+n[1]+'</a>'}).join("")+'</nav><span class="sp"></span>'+
 '<a class="btn btn-g cmd" href="carte.html">Commander</a>'+
 '<button class="cartb" id="cartb" aria-label="Ouvrir le panier">🛒<b id="cnt">0</b></button>'+
 '<button class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="nav">☰</button></div></header>');
 b.insertAdjacentHTML("beforeend",'<footer class="site"><div class="wrap"><div class="fl">'+nav.map(function(n){return '<a href="'+n[0]+'">'+n[1]+'</a>'}).join("")+'<a href="mentions.html">Mentions légales et confidentialité</a></div><p>'+S.disclaimer+'</p></div></footer>'+
 '<div class="shade" id="shade"></div><aside class="drawer" id="drawer" aria-label="Panier" role="dialog" aria-modal="true"><header><h2>Mon panier</h2><button class="btn btn-o" id="cclose" style="padding:8px 14px">Fermer</button></header>'+
 '<ul class="lines" id="lines"></ul><footer><div class="tot"><span>Total</span><span id="tot"></span></div><p class="note">Démonstration : aucune commande n\'est transmise à un restaurant.</p><button class="btn btn-r" id="pay" style="width:100%">Valider ma sélection</button></footer></aside><div class="toast" id="toast" role="status" aria-live="polite"></div>');
 var hd=$("header.top");addEventListener("scroll",function(){hd.classList.toggle("sc",scrollY>6)},{passive:true});
 var nv=$("#nav"),bg=$("#burger");bg.onclick=function(){var o=nv.classList.toggle("open");bg.setAttribute("aria-expanded",o);bg.textContent=o?"✕":"☰"};
 var last;function open(){last=document.activeElement;$("#drawer").classList.add("on");$("#shade").classList.add("on");$("#cclose").focus()}
 function close(){$("#drawer").classList.remove("on");$("#shade").classList.remove("on");if(last)last.focus()}
 $("#cartb").onclick=open;$("#cclose").onclick=close;$("#shade").onclick=close;
 addEventListener("keydown",function(e){if(e.key==="Escape"&&$("#drawer").classList.contains("on"))close()});
 $("#pay").onclick=function(){toast(count()?"Démo : cette sélection n'est envoyée nulle part.":"Votre panier est vide.")};
 $("#lines").onclick=function(e){var t=e.target.closest("[data-a]");if(!t)return;var id=t.dataset.id;change(id,t.dataset.a==="+"?1:-1,true)};
 window.BL.openCart=open;
 if(!localStorage.getItem("bl_ok")){b.insertAdjacentHTML("beforeend",'<div class="cookie" id="ck" role="region" aria-label="Information stockage"><p>Ce site n\'utilise aucun cookie de suivi ni de publicité. Il stocke seulement votre panier sur cet appareil. <a href="mentions.html">En savoir plus</a></p><button class="btn btn-g" id="ckb">Compris</button></div>');
  $("#ckb").onclick=function(){try{localStorage.setItem("bl_ok","1")}catch(e){}$("#ck").remove()}}
 render();
}
var tt;function toast(m){var t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("on")},2200)}
function change(id,d,quiet){cart[id]=(cart[id]||0)+d;if(cart[id]<=0)delete cart[id];save();render();
 if(d>0&&!quiet){toast(byId[id].name+" ajouté au panier");var b=$("#cartb");b.classList.remove("bump");void b.offsetWidth;b.classList.add("bump")}}
function render(){
 $("#cnt").textContent=count();$("#tot").textContent=eur(total());
 var ids=Object.keys(cart);
 $("#lines").innerHTML=ids.length?ids.map(function(id){var p=byId[id];return '<li>'+ph(p.img,"","",p.name)+'<span class="n">'+p.name+'<small>'+eur(p.price)+'</small></span><span class="qty"><button data-a="-" data-id="'+id+'" aria-label="Retirer un '+p.name+'">−</button><span>'+cart[id]+'</span><button data-a="+" data-id="'+id+'" aria-label="Ajouter un '+p.name+'">+</button></span></li>'}).join(""):'<li class="empty" style="display:block;width:100%">Votre panier est vide.<br>Ajoutez un produit depuis la carte.</li>';
 $("#pay").disabled=!ids.length;
}

/* Carte produits */
function card(p){return '<article class="card"><button class="open" data-open="'+p.id+'" aria-label="Voir la fiche : '+p.name+'">'+ph(p.img,p.img.split("/").pop(),"1200×900",p.name)+'</button><h3>'+p.name+'</h3><p>'+p.desc+'</p><div class="row"><span class="price">'+eur(p.price)+'</span><button class="add" data-add="'+p.id+'" aria-label="Ajouter '+p.name+' au panier">+</button></div></article>'}
function menu(){
 var host=$("#menu");if(!host)return;var limit=+host.dataset.limit||0;
 var cats=["Tout"].concat(S.products.map(function(p){return p.cat}).filter(function(c,i,a){return a.indexOf(c)===i}));
 var st={c:"Tout",q:""},grid=$("#grid");
 function draw(){var q=st.q.toLowerCase();var l=S.products.filter(function(p){return(st.c==="Tout"||p.cat===st.c)&&(p.name+" "+p.desc).toLowerCase().indexOf(q)>-1});
  if(limit)l=l.slice(0,limit);
  grid.innerHTML=l.length?l.map(card).join(""):'<div class="empty" style="grid-column:1/-1"><h3>Aucun résultat</h3><p>Essayez un autre mot ou choisissez « Tout ».</p></div>'}
 if(!limit){$("#chips").innerHTML=cats.map(function(c){return '<button class="chip" aria-pressed="'+(c==="Tout")+'">'+c+'</button>'}).join("");
  $("#chips").onclick=function(e){var b=e.target.closest(".chip");if(!b)return;st.c=b.textContent;$$(".chip").forEach(function(x){x.setAttribute("aria-pressed",x===b)});draw()};
  $("#q").oninput=function(e){st.q=e.target.value;draw()}}
 draw();
 var dlg=$("#dlg");
 host.onclick=function(e){var a=e.target.closest("[data-add]"),o=e.target.closest("[data-open]");
  if(a)change(a.dataset.add,1);
  if(o&&dlg){var p=byId[o.dataset.open],n=1;
   dlg.innerHTML='<div style="position:relative"><button class="x" aria-label="Fermer">✕</button></div><div class="dlg">'+ph(p.img,p.img.split("/").pop(),"1200×900",p.name)+'<div><h2 style="font-size:1.8rem">'+p.name+'</h2><p>'+p.desc+'</p><p class="todo">'+p.detail+' Allergènes et valeurs nutritionnelles : à renseigner.</p><span class="price" style="font-size:1.5rem">'+eur(p.price)+'</span><span class="qty" style="align-self:flex-start"><button data-q="-" aria-label="Moins">−</button><span id="dq">1</span><button data-q="+" aria-label="Plus">+</button></span><button class="btn btn-r" data-go>Ajouter au panier</button></div></div>';
   dlg.onclick=function(ev){var t=ev.target;if(t.closest(".x")||t===dlg)dlg.close();var q=t.closest("[data-q]");if(q){n=Math.max(1,Math.min(20,n+(q.dataset.q==="+"?1:-1)));$("#dq").textContent=n}
    if(t.closest("[data-go]")){change(p.id,n);dlg.close()}};
   dlg.showModal()}}
}

/* Restaurant */
function resto(){var h=$("#rinfo");if(!h)return;var r=S.restaurant,td='<span class="todo">À renseigner</span>';
 h.innerHTML='<div><h3>Adresse</h3>'+(r.address||td)+'</div><div><h3>Horaires</h3>'+(r.hours?r.hours.map(function(x){return x+"<br>"}).join(""):td)+'</div><div><h3>Contact</h3>'+(r.phone||td)+'</div><div><h3>Services</h3>'+(r.services.length?r.services.join("<br>"):td)+'</div>';
 var m=$("#map");if(m)m.innerHTML=r.mapEmbedUrl?'<iframe title="Carte" src="'+r.mapEmbedUrl+'" loading="lazy" style="border:0;width:100%;height:340px;border-radius:14px"></iframe>':'<p class="todo">La carte s\'affichera lorsqu\'une adresse vérifiée sera renseignée.</p>'}

shell();menu();resto();
if("IntersectionObserver" in window){var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.15});$$(".rv").forEach(function(el){io.observe(el)})}else $$(".rv").forEach(function(el){el.classList.add("in")});
})();
