/* Poste actuel des fondateurs : lu dans l'organigramme (table publique organigramme_postes). Aucun mot de passe : clé publique en lecture seule. */
(function(){
  var C=window.HOL_CONFIG;if(!C||!C.url||!C.key||String(C.url).indexOf('VOTRE')>=0||!window.fetch)return;
  var els=[].slice.call(document.querySelectorAll('[data-poste]'));if(!els.length)return;
  function n(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ').trim()}
  fetch(C.url+'/rest/v1/organigramme_postes?select=rang,ordre,titre,titulaire&titulaire=not.is.null&order=rang.asc,ordre.asc',{headers:{apikey:C.key,Authorization:'Bearer '+C.key}})
  .then(function(r){return r.ok?r.json():[]}).then(function(rows){
    els.forEach(function(e){var me=n(e.getAttribute('data-poste')),t=rows.filter(function(p){return n(p.titulaire)===me}).map(function(p){return p.titre});
      if(t.length){e.textContent='Poste actuel : '+t.join(' · ');e.hidden=false}else e.hidden=true})
  }).catch(function(){});
})();
