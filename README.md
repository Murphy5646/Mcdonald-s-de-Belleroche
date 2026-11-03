# McDonald's Belleroche — base du nouveau site (statique, GitHub Pages)

Projet indépendant, non affilié à McDonald's Corporation.

## Déployer
Pousser le dossier à la racine du dépôt, puis Settings > Pages > branche main, dossier /(root).
Tous les chemins sont relatifs : le site fonctionne dans un sous-dossier (user.github.io/depot/).

## À renseigner
- `js/config.js` : prix (valeurs de démo), adresse, horaires, services, téléphone, carte (uniquement si vérifiés).
- `js/config.js > api.fieldMap` et `api.format` : à aligner sur le contrat réel du backend /candidature.
- `mentions.html` : éditeur, RGPD.
- `<meta og:image>` : URL absolue après publication.

## Images (emplacements affichés tant que le fichier est absent)
assets/img/hero.jpg (1600x1280), editorial-1.jpg, editorial-2.jpg (1400x1050), restaurant.jpg (1600x900),
og.jpg (1200x630), et dans assets/img/products/ : burger, frites, coca-cola, ice-tea, cafe, cafe-au-lait, lait-chocolat (.jpg, 1200x900).
Recadrage uniforme automatique (object-fit: cover).

## Tests à faire de votre côté (non exécutés ici)
Chrome/Edge/Firefox, mobile/tablette, panier, formulaire contre l'API réelle, console, chargement des images.
