# Joueur automatique pour l'équilibrage

`sim.py` charge une version de test du jeu, branche `bot.js` (un joueur automatique) et fait défiler des journées entières en quelques secondes.

    DEBUG=1 OUT=/tmp/dbg.html python3 src/build3d.py
    python3 tools/sim.py 45 '{}' /tmp/out.json /tmp/dbg.html 270                      # bon joueur
    python3 tools/sim.py 34 '{"help":0.15,"invest":1}' /tmp/out.json /tmp/dbg.html 180  # joueur occasionnel
    python3 tools/sim.py 34 '{"help":0,"invest":0}' /tmp/out.json /tmp/dbg.html 180     # joueur qui n'investit jamais

Chaque ligne du tableau est une journée : recettes, dépenses, résultat, caisse, niveau, note, satisfaction, couverts, équipe, taille de salle, file en cuisine, chapitre de l'histoire, clients servis, dette restante.
(Les chemins `/tmp/sim/bot.js` dans `sim.py` sont à adapter si on le lance ailleurs.)


# Captures d'écran à la taille d'un téléphone

`captures.py` ouvre le jeu dans un navigateur sans écran, à la taille voulue, enchaîne une liste d'étapes (ouvrir un panneau, lancer un mini-jeu, changer l'heure…) et assemble les captures en planches. C'est l'outil de la passe de finition v0.95 : il sert à vérifier que rien ne déborde sur un petit écran.

    DEBUG=1 OUT=/tmp/dbg.html python3 src/build3d.py
    VW=360 VH=684 SAVE=/tmp/save.json python3 tools/captures.py etapes.json PREFIXE

- `VW`, `VH` : taille de l'écran (360×684 par défaut, 320×600 pour un petit téléphone, 412×880 pour un grand).
- `SAVE` : une sauvegarde (le contenu de la clé `bistroville_v2`), ou `none` pour une partie neuve.
- `LITE=0` : effets complets (plus lent sans carte graphique) ; `TITLE=1` : passer par l'écran titre.
- `etapes.json` : une liste d'objets `{"name", "js", "wait", "shot", "print"}` ; `js` est exécuté dans le jeu.
- Les chemins `/tmp/aud/` sont à adapter si on le lance ailleurs.

`partie.py` fait tourner une vraie partie en accéléré, sans rien neutraliser, et liste tous les messages et fenêtres que le joueur verrait dans la journée.
