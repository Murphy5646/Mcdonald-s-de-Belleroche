# McDonald's de Belleroche — site et recrutement

Site vitrine avec un formulaire de candidature qui envoie chaque
candidature en message privé Discord, via une petite API.

## Comment ça marche

```
Visiteur → site (GitHub Pages) → API (Wispbyte) → bot Discord → MP au recruteur
```

- Le site (`github/index.html`) est un fichier unique : HTML, CSS et
  JavaScript sont regroupés dedans pour qu'il n'y ait rien à mal
  configurer.
- L'API (`wispbyte/bot.py`) reçoit les candidatures, les vérifie,
  limite les abus, puis demande au bot Discord d'envoyer un MP.
- Seul le site indiqué dans `ALLOWED_ORIGINS` est autorisé à appeler
  l'API (voir *Protection* plus bas).

## Mise en ligne

### 1. Le site, sur GitHub Pages

1. Mets `github/index.html` à la racine du dépôt (à côté de
   `README.md`), rien d'autre.
2. Dans *Settings > Pages* : source *Deploy from a branch*, branche
   `main`, dossier `/ (root)`.
3. Attends la coche verte dans l'onglet *Actions*, puis ouvre le site.

### 2. L'API et le bot, sur Wispbyte

1. Dépose `bot.py` et `requirements.txt` sur le serveur.
2. Copie `.env.example` en `.env` et remplis-le :

   ```
   DISCORD_TOKEN=le_token_du_bot
   OWNER_ID=ton_id_discord
   PORT=le_port_donné_par_wispbyte
   ALLOWED_ORIGINS=https://murphy5646.github.io
   ```

3. Démarre avec `python bot.py`.
4. Vérifie `https://<ton-domaine>/health` : `bot_ready` doit valoir
   `true`.

### 3. Le bot Discord

- Crée l'application sur le Discord Developer Portal, récupère le
  token (`Bot > Reset Token`), aucun intent privilégié requis.
- Invite-le sur un serveur où tu es aussi présent (obligatoire pour
  qu'il puisse t'envoyer un MP).
- Sur ce serveur, autorise les messages privés dans tes paramètres de
  confidentialité.

## Avant publication

Remplace les exemples dans `index.html` par les vraies informations :
menu, prix, adresse, horaires, avantages du poste.

## Protection du code

Voir `LICENSE.md`. En résumé :

- Le dépôt GitHub peut être mis en **privé** (*Settings > General >
  Danger Zone > Change visibility*) si tu ne veux pas qu'il soit
  visible publiquement. Le site reste public même si le dépôt est
  privé, tant que GitHub Pages est activé.
- Chaque fichier porte un en-tête de copyright. Ne le supprime pas :
  en cas de copie, c'est la preuve la plus simple que le code t'
  appartient.
- `ALLOWED_ORIGINS` empêche quiconque copie le site de faire
  fonctionner le formulaire ailleurs : sans ton domaine exact dans
  cette liste, l'API refuse la requête.
- Si le token Discord fuite un jour (poussé par erreur sur un dépôt
  public, capture d'écran, etc.), régénère-le immédiatement dans le
  Developer Portal : l'ancien devient inutilisable.

Un site web reste toujours lisible dans le navigateur de n'importe
qui : aucune protection ne rend le HTML/CSS/JS invisible. Ces mesures
servent à décourager la copie et à la rendre inutile sans ton
serveur, pas à la rendre techniquement impossible.
