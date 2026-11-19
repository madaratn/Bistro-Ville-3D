# Chez Odette — le serveur multijoueur

Un petit serveur sans dépendance (Node 18 ou plus). Il garde les fiches des joueurs, les confréries et les
aménagements des bistrots, et prévient en direct les joueurs connectés quand quelque chose change.

## L'essayer sur son ordinateur

```bash
node server/server.js            # écoute sur http://localhost:8787
```

Dans le jeu : **Ville → Moi → Connexion**, saisir `http://localhost:8787`, puis « Se connecter ».

## Le mettre en ligne

Il faut un hébergeur qui garde un petit disque (les données tiennent dans un seul fichier, `data/db.json`).

1. Crée un compte chez un hébergeur d'applications (Render, Fly.io, Railway, ou n'importe quel serveur privé avec Docker).
2. Déploie le dossier `server/` : un `Dockerfile` est fourni. Sans Docker, la commande de démarrage est `node server.js`.
3. Réglages à donner à l'hébergeur :
   - `PORT` : le port d'écoute (souvent imposé par l'hébergeur) ;
   - `DATA` : le dossier du disque persistant (par exemple `/data`) ;
   - `SECRET` : une longue phrase secrète, à ne jamais changer ensuite (elle protège l'identité des joueurs).
4. Vérifie que l'adresse **https** répond : elle doit afficher `{"jeu":"Chez Odette", …}`.
5. Donne cette adresse au jeu :
   - pour essayer : Ville → Moi → Connexion, dans le jeu ;
   - pour tous les joueurs : reconstruis le jeu avec l'adresse inscrite d'office,
     `MP_SERVER=https://ton-serveur.example python3 src/build3d.py`, puis republie le site et l'application.

L'application Android n'accepte que les adresses **https**.

## Ce que le serveur garantit, et ce qu'il ne fait pas encore

- Chaque joueur n'écrit que ses propres documents (sa fiche, son bistrot, sa confrérie, sa sauvegarde privée).
- Les points de la semaine ne peuvent pas bondir d'un coup (plafond par écriture), et les écritures sont limitées à 90 par minute.
- Les fiches muettes depuis 45 jours sont effacées.
- Un serveur = une ville de 120 bistrots (6 quartiers de 20 emplacements). Quand elle est pleine, les nouveaux venus
  jouent avec les voisins du jeu en attendant qu'une place se libère. `MAXPLAYERS` permet de baisser ce plafond.
- L'identité d'un joueur est une clé gardée par son appareil : pas de mot de passe, donc pas de reprise de partie
  sur un autre téléphone pour l'instant (la sauvegarde en ligne ne sert qu'au même appareil).
- Il n'y a ni modération des messages, ni répartition sur plusieurs machines, ni plusieurs villes par serveur :
  c'est un serveur de lancement pour une petite communauté, pas une infrastructure de jeu en ligne massif.

## Les essais

```bash
python3 tools/mp_test.py /chemin/vers/jeu_debug.html          # trois joueurs contre ce serveur
python3 tools/mp_test_claude.py /chemin/vers/jeu_debug.html   # le pilote de la page claude.ai, sur une imitation
```
