(function(){
"use strict";
var A=window.SITE.api,f=document.getElementById("rec");if(!f)return;
var $=function(s){return f.querySelector(s)},steps=[].slice.call(f.querySelectorAll("[data-step]")),bar=[].slice.call(document.querySelectorAll(".steps li")),cur=0,busy=false;
var MAX=5*1024*1024;
var V={prenom:function(v){return v.trim().length>=2||"Indiquez votre prénom."},nom:function(v){return v.trim().length>=2||"Indiquez votre nom."},
 email:function(v){return/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())||"Adresse e-mail invalide."},
 tel:function(v){return/^\+?[\d\s.\-]{8,18}$/.test(v.trim())||"Numéro de téléphone invalide."},
 poste:function(v){return!!v||"Choisissez un poste."},dispo:function(v){return v.trim().length>=3||"Indiquez vos disponibilités."},
 motivation:function(v){return v.trim().length>=30||"Au moins 30 caractères (actuellement "+v.trim().length+")."},
 cv:function(v,el){var x=el.files[0];return!x?"Joignez votre CV au format PDF.":(x.type!=="application/pdf"&&!/\.pdf$/i.test(x.name))?"Le CV doit être un PDF.":x.size>MAX?"Fichier trop lourd (5 Mo maximum).":true},
 lettre:function(v,el){var x=el.files[0];return!x||((x.type==="application/pdf"||/\.pdf$/i.test(x.name))&&x.size<=MAX)||"PDF de 5 Mo maximum."},
 consent:function(v,el){return el.checked||"Votre consentement est nécessaire pour traiter la candidature."}};
function check(el){var fn=V[el.name];if(!fn)return true;var r=fn(el.value,el),box=el.closest(".fld"),ok=r===true;box.classList.toggle("bad",!ok);box.querySelector(".err").textContent=ok?"":r;el.setAttribute("aria-invalid",!ok);return ok}
function stepOk(i){return steps[i].querySelectorAll("[name]").length&&[].slice.call(steps[i].querySelectorAll("[name]")).map(check).every(Boolean)}
function show(i){cur=i;steps.forEach(function(s,k){s.hidden=k!==i});bar.forEach(function(b,k){b.className=k<i?"done":k===i?"cur":""});$("#sl").textContent="Étape "+(i+1)+" sur "+steps.length;var h=steps[i].querySelector("legend");if(h)h.focus()}
f.addEventListener("input",function(e){if(e.target.name)check(e.target)});f.addEventListener("change",function(e){if(e.target.name)check(e.target)});
f.addEventListener("click",function(e){if(e.target.closest("[data-next]")&&stepOk(cur))show(cur+1);if(e.target.closest("[data-prev]"))show(cur-1)});
function msg(t,m){var b=document.getElementById("res");b.className="alert "+t;b.textContent=m;b.hidden=false;b.scrollIntoView({block:"center"})}
f.addEventListener("submit",function(e){e.preventDefault();if(busy)return;
 if(!stepOk(cur))return;var all=[].slice.call(f.querySelectorAll("[name]"));if(!all.map(check).every(Boolean)){msg("ko","Certains champs sont à corriger avant l'envoi.");return}
 busy=true;var btn=$("[type=submit]");btn.disabled=true;btn.textContent="Envoi en cours…";document.getElementById("res").hidden=true;
 var M=A.fieldMap,body,headers={};
 if(A.format==="json"){var o={};all.forEach(function(el){if(el.type!=="file"&&M[el.name])o[M[el.name]]=el.type==="checkbox"?el.checked:el.value});body=JSON.stringify(o);headers["Content-Type"]="application/json"}
 else{body=new FormData();all.forEach(function(el){if(!M[el.name])return;if(el.type==="file"){if(el.files[0])body.append(M[el.name],el.files[0])}else body.append(M[el.name],el.type==="checkbox"?String(el.checked):el.value)})}
 var ctl=new AbortController(),to=setTimeout(function(){ctl.abort()},A.timeoutMs);
 fetch(A.url,{method:"POST",body:body,headers:headers,signal:ctl.signal}).then(function(r){
  return r.text().then(function(t){var j=null;try{j=JSON.parse(t)}catch(_){}return{ok:r.ok,s:r.status,j:j}})}).then(function(r){
  if(!r.ok)throw{k:"srv",s:r.s};
  if(A.requireJson&&r.j===null)throw{k:"inv"};
  f.hidden=true;document.querySelector(".steps").hidden=true;msg("ok","Votre candidature a bien été reçue par le serveur. Merci !");
 }).catch(function(er){
  var m=er&&er.k==="srv"?"Le serveur a refusé la candidature (code "+er.s+"). Vérifiez vos informations puis réessayez.":
        er&&er.k==="inv"?"Réponse inattendue du serveur : nous ne pouvons pas confirmer que votre candidature a été reçue. Ne la considérez pas comme envoyée.":
        er&&er.name==="AbortError"?"Le serveur met trop de temps à répondre. Votre candidature n'est pas confirmée, réessayez.":
        "Connexion impossible. Vérifiez votre réseau puis réessayez. Votre candidature n'a pas été envoyée.";
  msg("ko",m);
 }).then(function(){clearTimeout(to);busy=false;btn.disabled=false;btn.textContent="Envoyer ma candidature"});
});
show(0);
})();
