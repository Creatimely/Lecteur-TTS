# Lecteur de texte (Text-to-Speech)

Lecteur de texte à voix haute qui tourne entièrement dans le navigateur grâce à la
[Web Speech API](https://developer.mozilla.org/docs/Web/API/SpeechSynthesis). Aucune dépendance, aucun serveur, aucune donnée envoyée.

## Fonctionnalités
- Lecture, pause, reprise et arrêt
- Choix de la voix (celles de votre système), vitesse, hauteur et volume
- Surlignage du mot en cours de lecture
- Import de fichiers `.txt` / `.md`
- Réglages et texte mémorisés localement
- Thème clair/sombre automatique, clavier et lecteurs d'écran pris en charge
- Découpage des longs textes pour éviter les coupures de Chrome

## Démarrage
```bash
git clone https://github.com/<votre-compte>/lecteur-tts.git
cd lecteur-tts
npm start      # http://localhost:3000
npm test       # tests unitaires (Node 18+)
```
Les modules ES exigent un serveur HTTP : n'ouvrez pas `index.html` directement via `file://`.

## Structure
```
index.html          interface
src/app.js          logique de l'interface et synthèse vocale
src/chunker.js      découpage du texte (testé)
src/style.css       styles
test/               tests (node --test)
.github/workflows/  CI + déploiement GitHub Pages
```

## Déployer sur GitHub Pages
Dans *Settings → Pages*, choisissez **GitHub Actions** comme source. Chaque push sur `main` lance les tests puis publie le site.

## Compatibilité
Chrome, Edge, Safari et Firefox récents. Les voix disponibles dépendent de votre système et de votre navigateur.

## Licence
MIT — voir [LICENSE](LICENSE).
