# Joueur automatique pour l'équilibrage

`sim.py` charge une version de test du jeu, branche `bot.js` (un joueur automatique) et fait défiler des journées entières en quelques secondes.

    DEBUG=1 OUT=/tmp/dbg.html python3 src/build3d.py
    python3 tools/sim.py 45 '{}' /tmp/out.json /tmp/dbg.html 270                      # bon joueur
    python3 tools/sim.py 34 '{"help":0.15,"invest":1}' /tmp/out.json /tmp/dbg.html 180  # joueur occasionnel
    python3 tools/sim.py 34 '{"help":0,"invest":0}' /tmp/out.json /tmp/dbg.html 180     # joueur qui n'investit jamais

Chaque ligne du tableau est une journée : recettes, dépenses, résultat, caisse, niveau, note, satisfaction, couverts, équipe, taille de salle, file en cuisine, chapitre de l'histoire, clients servis, dette restante.
(Les chemins `/tmp/sim/bot.js` dans `sim.py` sont à adapter si on le lance ailleurs.)
