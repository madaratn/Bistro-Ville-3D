**Jouer en ligne : https://madaratn.github.io/Bistro-Ville-3D/**

# Chez Odette — prototype v0.99.5

Jeu mobile de gestion de restaurant (Android + iOS), inspiré des mécaniques de Restaurant City,
avec un nom, des graphismes et des personnages 100 % originaux.

## Ce qui est déjà jouable

| Système | Contenu |
|---|---|
| Restaurant isométrique | Salle 8×8 agrandissable jusqu'à 14×14, rue, porte, haies, enseigne avec le nom du resto, ardoise du menu |
| Clients et service | Arrivent par la rue (file d'attente si c'est complet), sont accueillis et conduits à une table propre par un serveur (une tablée par table), lisent le menu, lèvent la main, commandent sur la tablette du serveur (la commande s'affiche sur l'écran de la cuisine), mangent, demandent l'addition (terminal de paiement), laissent un pourboire selon leur satisfaction |
| Entretien | Après le départ des clients : débarrassage avec un bac, restes vidés dans la poubelle, vaisselle au retour plonge (bord de la cuisine), lavée à l'évier par un cuisinier |
| Circulation | Chacun réserve la case où il va, attend que l'autre passe, contourne ou s'écarte poliment dans les passages étroits ; serveurs chargés et clients prioritaires |
| Cuisine | Espace réservé aux cuisiniers, réglable (coin, largeur, profondeur) : gazinières, fours, tables de préparation, évier, passe-plat. Chaque plat suit son circuit (découpe → gaz ou four → passe-plat), visible sur le rail des bons |
| Boissons | Frigo dès le niveau 1 (eau, soda, jus, bière), bar à cocktails au niveau 5 (vin, mojito, cosmopolitan, spritz, whisky), barman |
| Équipe | Cuisiniers, serveurs (service, boissons, débarrassage), barmans, agents d'entretien. Ils prennent de l'XP et accélèrent (niveau 1 à 5) |
| Menu | 15 recettes (entrées, plats, desserts), de 3 à 6 places au menu, niveaux 1 à 10 améliorés avec des ingrédients |
| Ingrédients | Potager en temps réel (10 graines, parcelles en plus), marché, ingrédients bonus à ramasser sur le trottoir, quiz gourmand (5 questions/jour) |
| Déco | Catalogue intégré au mode déco (tables, chaises, équipement, bar, déco, 53 sols, 22 tapis, 64 murs, 151 objets muraux, réserve), glisser-déposer, une table emmène ses chaises, pivoter, copier, ranger dans la réserve, vendre, annuler, cases valides en surbrillance, contrôle qui empêche de bloquer le passage |
| Progression | Pièces, XP et niveaux avec déblocages, note ★ du resto (déco + menu + satisfaction − saleté) qui fait varier l'affluence et la patience |
| Quartier | Bar avec terrasse, cinéma, galerie marchande, immeubles (fenêtres éclairées la nuit). Passants qui vont au cinéma, au bar, font les boutiques ou traversent le trottoir d'en face ; les clients arrivent du quartier et y repartent |
| Ambiance | Carnet de commandes compact et repliable, bulles discrètes, rien qui clignote, mode « Regarder » (interface masquée, caméra qui se promène) |
| Divers | Sauvegarde automatique, gains hors-ligne (jusqu'à 8 h), sons, tutoriel, réglages |

### v0.99.5 : les succès
- **40 succès à quatre paliers** (bronze, argent, or, diamant), rangés en cinq familles : Service, Imprévus, Cuisine, Déco, Quartier. Exemples : clients servis, tables encaissées, encaissements rapides, séries de gestes, feux éteints, pannes réparées, médailles d’or (et d’affilée), plats maîtrisés, recettes au niveau 10, sols et murs achetés, tapis posés, note maximale, habitués conquis, chapitres de l’histoire, journées terminées.
- **12 succès secrets**, cachés derrière un indice : éteindre un feu en moins d’une seconde, rattraper un resquilleur au ras de la porte, encaisser 6 tables en 10 secondes, régler 6 imprévus en 30 secondes, une journée sans un seul client fâché, quatre médailles d’or le même jour, la salle comble…
- **Le moment du déblocage** : une bannière tombe du haut de l’écran avec le badge qui tourne, des rayons, des confettis et une petite fanfare (plus grande pour l’or, le diamant et les secrets). Quand il ne manque presque rien (90 %), un petit « Presque ! » montre ce qu’il reste.
- **Récupérer** : chaque palier se récupère d’un toucher dans le panneau Succès (bouton doré sur le côté, avec le nombre de récompenses en attente, et dans « Plus »). Les pièces s’envolent vers le compteur ; « Tout récupérer » les enchaîne en cascade. Bronze 60 pièces, argent 150, or 400, diamant 1 000, secret 300, plus de l’expérience.
- **Le rang de chef** : chaque palier rapporte des points (5, 10, 20, 40 ; 25 pour un secret). Dix rangs, de Commis à Immortel. Chaque nouveau rang ouvre un coffre (pièces, expérience, 10 d’énergie) et une **déco exclusive** introuvable autrement : diplôme d’apprenti, tapis d’honneur, toque dorée, extincteur d’or, plaque des trois étoiles, tapis étoilé d’or, néon « Légende », coupe de Paris, tapis de diamant. Elles apparaissent verrouillées dans l’atelier pour donner envie.
- En ville, le rang de chef s’affiche sur la fiche des autres joueurs et dans le bandeau de visite.
- Les parties en cours reçoivent d’un coup tous les paliers déjà mérités, à récupérer.
- Rythme mesuré en simulation (6 jours) : environ 7 paliers le premier jour, 10 à 13 les deux jours suivants, puis 4 à 7 par jour ; le rang 4 (Sous-chef) vers le cinquième jour pour un joueur attentif. Les récompenses ajoutent environ 10 à 20 % aux recettes d’un joueur actif après les premiers jours.

Code : `src/succes.js` (succès, secrets, rangs, bannière, panneau, décos exclusives), `src/succes_patch.py` (branchements).

### v0.99.4 : la caisse, c’est toi
- **Le joueur tient la caisse** (difficultés normale et chef) : l’équipe n’encaisse plus et les clients ne paient plus tout seuls. Quand une table veut payer, une bulle verte apparaît avec un cercle qui se vide ; sans toi, la table part sans payer et fâchée. Encaisser vite (cercle encore à moitié plein) rapporte un pourboire de 25 % du repas, sinon 10 %.
- **La réputation** : chaque client parti fâché ou sans payer, chaque imprévu raté fait baisser la note (jusqu’à −1,5 ★), donc l’affluence et la patience des clients. Elle remonte d’elle-même quand le service est bien tenu, et une médaille d’or en efface une partie. Elle apparaît dans le détail de la note.
- **Les heures de pointe** : de 12 h à 13 h 30 et de 19 h 30 à 21 h, les clients arrivent en masse (+45 %, +60 % en chef) et les imprévus se rapprochent. La pastille du jour affiche « Affluence ».
- **Plus serré partout** : imprévus deux fois plus fréquents (toutes les 25 à 50 secondes en normale, 20 à 40 en chef), jusqu’à 3 ou 4 en même temps, cercles plus courts (feu 4,5 à 7 s, réclamation 6 à 10 s, panne 25 à 32 s), resquilleurs plus rapides, clients 20 à 70 % moins patients en normale (45 à 90 % en chef).
- Une piqûre de rappel d’Odette explique la caisse, la réputation et les heures de pointe aux joueurs qui ont déjà vu la v0.99.3.
- Équilibrage (simulation de 6 jours, du niveau 3 au niveau 7) : sans rien toucher, le bistrot ne gagne plus rien et la note tombe sous 1,5 ★ ; un joueur moyen gagne environ deux fois moins qu’avant avec une note autour de 2,5 ★ ; un joueur très attentif (300 à 400 gestes par jour) gagne environ 20 % de moins qu’avant et décroche l’or presque à chaque service.

### v0.99.3 : la salle a besoin de toi
- **Les imprévus** : le service ne tourne plus tout seul. Une poêle qui flambe (trois coups pour l’éteindre, sinon le plat brûle et la fumée agace la salle), une machine en panne (quatre coups de clé, sinon le dépanneur passe et c’est cher), une flaque (un serveur qui glisse casse l’assiette, un client qui glisse râle), un client qui se plaint (sans excuses, il part fâché sans payer), un resquilleur qui file vers la porte. Chaque imprévu a sa bulle et son cercle qui se vide ; une flèche au bord de l’écran montre ceux qu’on ne voit pas, et la toucher y emmène la caméra.
- **Les clients pressés** : badge doré, patience courte. Placés, servis et encaissés vite (coups de main), ils paient presque le double.
- **La médaille du service** : à la fin du petit-déjeuner, du midi, de l’après-midi et de la soirée, une médaille de bronze, d’argent ou d’or selon trois critères : personne de fâché, 80 % des imprévus réglés, clients ravis à 75 %. Elle rapporte des pièces et de l’expérience. Le bilan du soir compte les imprévus réglés et les médailles.
- **La pression monte avec le bistrot** : flaques et réclamations au niveau 2, feux et clients pressés au niveau 3, pannes au niveau 4, resquilleurs au niveau 5. Plus le niveau grimpe, plus les imprévus sont fréquents et plus les clients sont impatients et nombreux.
- Chaque imprévu réglé rend 1 d’énergie et compte comme un petit geste ; la note qui baisse se met à trembler ; deux nouvelles missions du jour (régler des imprévus, décrocher l’or) ; la bulle « cuisson parfaite » change d’icône pour ne pas ressembler à un feu.
- **Réglages → Jeu → Difficulté** : Détente (le service d’avant, sans imprévus), Normale (par défaut), Chef (tout dès le début, plus souvent, clients moins patients, médailles +50 %).
- Équilibrage (simulation de 6 jours) : un joueur qui règle 9 imprévus sur 10 gagne environ 20 % de plus qu’avant ; un joueur qui ne touche à rien gagne environ 5 % de moins, perd 3 à 40 clients fâchés par jour au lieu de 0 à 4, et ne décroche jamais l’or.

Limites : les imprévus n’existent pas pendant le tutoriel du premier jour ; ils se mettent en pause quand un menu est ouvert ou en mode « Regarder » ; en vitesse ×2 ou ×3, ils arrivent deux ou trois fois plus souvent. Essayé sur navigateur en taille téléphone, pas sur un vrai téléphone.

Code : `src/imprevus.js` (imprévus, clients pressés, médailles, bulles et flèches), `src/imprevus_patch.py` (branchements dans la boucle du jeu, réglages, bilan, missions).

### v0.99.2 : murs et sols
- **40 nouveaux sols** (53 en tout), avec de vrais motifs et un léger relief : bâtons rompus, point de Hongrie, chevrons, parquet tressé, parquet Versailles, pont de bateau, bambou, tomettes hexagonales, cabochons, damier en diagonale, mosaïques, terrazzo, marbres, carreaux de ciment, écailles, moquettes, tatami, tôle larmée, dalles de pierre, pavés, gazon, sable fin.
- **51 nouveaux murs** (64 en tout) : dix teintes unies, pois, vichy, arlequin, carrelage métro, briques, lambris, bardage, rondins, pierre apparente, tôle ondulée, boiseries, damas, fleurs, jungle, vagues japonaises, cerisier, bambous, Art déco, zellige, tartan, cannage, velours capitonné, mur ardoise, et six fresques panoramiques (sommets, Paris, le large, zen, campagne, ciel). Le soubassement a lui aussi ses motifs (panneaux, métro, planches, damier).
- **111 nouveaux objets muraux** (151 en tout) : 30 tableaux et affiches, 6 fenêtres (hublot, shoji, verrière d’atelier, fenêtre fleurie, fenêtre palace, store rayé), appliques, lanternes et lampions, cinq néons et des lettres lumineuses, horloges, miroirs, étagères garnies, plantes et mur végétal, et des objets par style (bord de mer, diner, chalet, industriel, japonais, palace, guinguette).
- **Les tapis, une nouveauté** : 22 modèles de 1×1 à 4×3 cases (paillasson, jute, kilim, persans, berbère, patchwork, marin, tatami, jardin de sable, peau de vache, nappe de pique-nique, marelle…). Ils se déroulent sous les meubles, ne gênent personne, se tournent d’un toucher, et comptent dans la note de déco. 14 tapis au plus par salle ; la gomme en rend la moitié du prix.
- **L’atelier déco rangé** : l’onglet Sols a trois modes (toute la salle, carreau par carreau, tapis) ; l’onglet Murs a trois rayons (papiers peints, fenêtres et enseignes, déco murale). Le filtre par style s’applique partout, et chaque vignette montre le vrai motif.
- Les huit restaurants témoins reçoivent chacun un tapis et six objets muraux de leur style. En ville, les visiteurs voient les tapis des autres joueurs.
- Corrigé au passage : le « + » ne se propose plus sur les deux pans de mur que l’enseigne recouvre ; une cuisine qu’on agrandit reprend (et rembourse) les tapis qu’elle recouvre.

Limites : un objet par pan de mur ; les objets muraux n’entrent pas dans la note (les sols, les murs et les tapis, si) ; les tapis ne se rangent pas dans la réserve ; essayé sur navigateur de bureau en taille téléphone, pas sur un vrai téléphone.

Code : `src/deco3_sols.js`, `src/deco3_murs.js`, `src/deco3_objets.js`, `src/deco3_tapis.js` (contenu), `src/deco3_patch.py` (atelier, annulation, restaurants témoins, note).

### v0.99.1 : l'histoire sans attente
- La règle « un chapitre par jour » disparaît : dès qu'un chapitre est terminé, le suivant s'ouvre. Seuls ses objectifs en fixent le rythme.
- Après la fenêtre « Chapitre terminé », l'ouverture du chapitre suivant arrive d'elle-même ; le panneau Histoire propose aussi un bouton « Commencer le chapitre ».
- Dans la liste « Aujourd'hui », terminer un chapitre coche toujours la ligne Histoire pour la journée, mais elle reste ouverte et affiche l'objectif suivant.

Code : `src/story3_patch.py`.

### Nouveautés v0.99 : La Ville (multijoueur)
- **Une ville partagée** : une carte de six quartiers (Le Vieux-Port, Les Halles, La Gare, La Butte, Les Jardins, Le Belvédère), 120 emplacements. Chaque joueur y installe son bistrot ; on se promène sur la carte (glisser, pincer), on ouvre la fiche de n'importe quel bistrot.
- **Visiter les autres** : un vrai tour dans le bistrot d'un autre joueur, avec son aménagement, puis retour chez soi sans rien perdre. Cinq coups de cœur à donner par jour.
- **Les confréries** : en fonder une (500 pièces, nom, sigle, emblème, couleur) ou en rejoindre une, tableau de messages, demande de coup de main et entraide (énergie pour l'un, pièces et points pour l'autre), objectif de la semaine à quatre paliers, exclusion par le fondateur.
- **Classements de la semaine** : bistrots et confréries, quatre ligues (Diamant, Or, Argent, Bronze), récompense à réclamer la semaine suivante. Chaque client servi vaut un point.
- **La guerre des quartiers** : la confrérie qui marque le plus de points dans un quartier le tient la semaine suivante ; ses membres installés là touchent 5 % de pourboires en plus.
- **Jouable seul** : sans connexion, la ville est peuplée de 36 voisins et de 3 confréries du jeu, clairement signalés comme tels.
- **Trois connexions, un seul code** (`src/net.js`) :
  - la page publiée sur claude.ai utilise sa base de données partagée (le propriétaire de la page et les personnes qu'il y invite en écriture jouent ensemble ; un simple visiteur regarde) ;
  - la version web libre et l'application Android se branchent sur le serveur du dossier `server/` (Node, sans dépendance, à héberger soi-même : voir `server/README.md`) ;
  - sans l'un ni l'autre, le jeu reste hors ligne avec les voisins du jeu.
- **Sauvegarde en ligne** de la partie, privée, pour la retrouver après une réinstallation.
- **Sécurité de base** : chaque joueur n'écrit que ses propres documents (sa fiche, son bistrot, sa confrérie) ; tout le reste se calcule en lisant ceux des autres, et ce qui vient des autres est nettoyé avant affichage. Le serveur plafonne les bonds de points et le débit d'écriture.

Limites connues : une ville = 120 bistrots ; pas de modération des messages ni d'anti-triche sérieux (sur claude.ai, les points sont déclarés par chaque joueur) ; pas de combat ni d'échanges en temps réel ; la connexion claude.ai n'a été essayée que sur une imitation de sa base, pas en conditions réelles.

Code : `src/net.js` (connexions), `src/ville.js` (carte, visites, classements, quartiers), `src/guilde.js` (confréries, panneau « La Ville »), `server/` (serveur), `tools/mp_test.py` et `tools/mp_test_claude.py` (essais à plusieurs joueurs).

### Nouveautés v0.98 : la mise en scène, la carte, les options
- **Des dialogues joués par les personnages** : deux acteurs 3D en pied se font face au-dessus du texte. Celui qui parle est dans la lumière, fait des gestes selon son humeur (il salue, croise les bras, lève les mains), l'autre l'écoute dans l'ombre. Une petite bulle marque l'émotion du moment.
- **Le confort de lecture** : le texte reprend son souffle à la ponctuation, un **journal** permet de relire les répliques de la scène, et un mode **auto** fait avancer le dialogue tout seul.
- **Mes scènes** : depuis le panneau Histoire, on revoit l'ouverture de chaque chapitre vécu, avec ses propres choix.
- **Précédemment…** : après quelques heures d'absence, une carte rappelle la saison, le chapitre et l'objectif en cours.
- **La carte en fiches illustrées** : chaque plat a sa grande photo, son prix en étiquette, ses services, sa maîtrise ; les recettes montrent le niveau, les étoiles et les ingrédients manquants.
- **Un vrai écran d'options**, en cinq onglets : *Image* (qualité Haute / Équilibrée / Légère, effets, ombres de contact, flou, personnages détaillés, acteurs 3D, finesse de l'image, 60 ou 30 images par seconde), *Son* (volumes séparés des effets et de la musique, voix des personnages, vibrations), *Confort* (taille du texte, vitesse du texte, avance automatique, contraste renforcé, animations réduites), *Jeu*, *Partie* (code de sauvegarde à copier pour changer de téléphone, reprise d'une partie par son code).
- **La déco** : veinage du bois et métal brossé sur tous les meubles, tables dressées (serviette, fourchette, couteau et verre à chaque place), rideaux aux fenêtres.
- **L'interface** : le contenu des fenêtres arrive en cascade à l'ouverture.

Code : `src/bust.js` (acteurs 3D), `src/scene.js` (journal, auto, rythme du texte), `src/opts.js` et `src/opt_patch.py` (options, volumes, Mes scènes, Précédemment), `src/menu2.js` (la carte), `src/render3d.js` (`matDetail`, `tableSets`, `winDrapes`).

### Nouveautés v0.97 : les personnages et l'image
- **Des personnages refaits de la tête aux pieds** : chaque client, chaque employé et les onze personnages de l'histoire sont maintenant de vraies figurines articulées (épaules, coudes, genoux, pieds), avec un visage détaillé (yeux brillants, paupières, sourcils, bouche qui parle et qui mâche), des coiffures peignées mèche par mèche, des tenues complètes (gilets, tabliers, foulards, lunettes, moustaches, chapeaux). Un seul maillage par personnage : c'est plus beau, et il y a moins d'objets à afficher qu'avant.
- **Des gros plans vivants dans les dialogues** : le médaillon dessiné laisse la place au personnage lui-même, en 3D. Il cligne des yeux, articule pendant que le texte s'écrit, et change d'expression à chaque réplique (sourire, moue, surprise, tristesse…). Les mêmes portraits servent dans les fiches des voisins et le tutoriel.
- **Une image plus riche** : ombres de contact sous les meubles, les assiettes et les personnages (occlusion ambiante), sol en relief avec joints creusés, veinage du bois et reflets, nuances d'un carreau à l'autre.
- **Tous les mécanismes sont conservés** : service, histoire, élan, étoiles, ardoise, mini-jeux, Belmont… rien ne change côté règles ni côté sauvegarde.
- **Réglable** : Plus → Réglages → « Personnages détaillés » permet de revenir aux personnages d'avant, à chaud. Si l'appareil peine, le jeu coupe de lui-même les ombres de contact, puis les effets d'image. En mode léger, les personnages sont allégés et le sol reste simple.

Code : `src/chars_hd.js` (géométrie, squelette, matière et animation des personnages), `src/bust.js` (gros plans des scènes et portraits), l'occlusion ambiante dans `src/gfx.js`, le sol dans `src/render3d.js` (`floorDet`, `floorMat`), le réglage dans `src/hd_patch.py`.

### Nouveautés v0.96 : l'histoire et le service
- **Des scènes, plus des fenêtres** : chaque dialogue se joue en bandes cinéma, avec le portrait du personnage, ses expressions, le texte qui s'écrit, une carte de titre à chaque chapitre et une musique d'ambiance pour les moments forts. Le service se met en pause pendant qu'on lit.
- **Des choix qui restent** : vingt décisions au fil des 28 chapitres (offrir le café au banquier, payer le loyer de Lucien, publier ou non l'article sur Belmont…). Les personnages s'en souviennent plus tard, et un épilogue raconte ce que chacun est devenu selon les réponses données. Le cœur ramène le quartier, le panache fait grimper les pourboires.
- **Le registre** : le joueur signe de son prénom, et tout le monde s'adresse à lui correctement (« mon grand » ou « ma grande »).
- **Les personnages viennent vraiment** : Albert, M. Pinson, Mme Fourchette et Victor Belmont s'assoient en salle quand l'histoire le demande ; le chapitre du duel se joue en direct, score contre score, pendant les coups de feu.
- **L'élan** : une série de clients contents qui multiplie les pourboires (jusqu'à ×1,5) et se brise au premier client fâché.
- **Les étoiles du service** : chaque bilan du soir note l'accueil, le régal et l'élan, avec une prime.
- **L'ardoise** : un plat du jour à choisir chaque matin, commandé deux fois plus souvent et payé plus cher.
- **Les commandes des voisins** : un habitué demande une grosse quantité d'un plat pour le lendemain soir.
- **Sensations** : pièces qui volent jusqu'à la caisse, compteur qui défile, voix par personnage, tempête et fête de quartier selon le chapitre.
- Les anciennes parties sont reprises telles quelles : Odette présente les nouveautés à la première ouverture.

Code : `src/scene.js` (lecteur de scènes), `src/flow.js` (élan, étoiles, ardoise, commandes, duel), `src/saga.js` (les 28 chapitres, leurs choix et l'épilogue), et les correctifs `scene_patch.py`, `flow_patch.py`, `story2_patch.py`.

### Ajouts récents (v0.91 à v0.95)
- **De quoi s'occuper** : défis express pendant le service (5 par journée), cinq mini-jeux (3 parties chacun par journée) qui rendent de l'énergie.
- **Le vaisselier d'Odette** : un meuble offert par Mamie Odette, où se pose un souvenir du quartier à chaque chapitre terminé (28 objets, +2 % de pourboires chacun).
- **Les voisins à table** : dix personnages de l'histoire viennent manger à leur heure, laissent un cadeau et deviennent des amis (3 cœurs).
- **Chapitres qui rapportent** : pièces à chaque étape, +2 % sur le prix des plats par page du carnet.
- **Finition v0.95** : interface revue sur petit écran (barre du haut, équipe, carte, réglages, écran titre), messages lisibles plus longtemps, nombres à la française, fin de chapitre en une seule fenêtre, tutoriel à jour, bandeau d'événement qui se replie, récompenses qui attendent leur tour, et environ 37 % d'objets dessinés en moins (pièces fixes des personnages et des meubles soudées).

Rendu **3D temps réel avec Three.js** : ombres douces, éclairage d'ambiance, cycle jour/nuit selon l'heure réelle, personnages animés, voitures, particules.

Le jeu final est un seul fichier autonome : `www/index.html` (Three.js et la police Fredoka sont inclus dedans, il fonctionne hors ligne).

### Code source
- `src/render3d.js` : moteur 3D (scène, modèles, personnages, caméra, interactions)
- `src/v2_backup.html` : logique du jeu et interface de base (clients, équipe, menu, jardin, boutique…)
- `src/logic_patch.py`, `src/deco_patch.py`, `src/bar_patch.py`, `src/service_patch.py`, `src/traffic_patch.py`, `src/bin_patch.py`, `src/fix_patch.py`, `src/city_patch.py` : évolutions de la logique (comportements, cuisine, mode déco, boissons)
- `src/chars_real.js` : personnages réalistes animés ; `src/city.js` : le quartier et ses passants ; `src/deco.css`, `src/calm.css` : styles du mode déco et de l'ambiance
- `src/build3d.py` : assemble les deux en `www/index.html`

Pour reconstruire après une modification :
```bash
cd build && npm install three@0.170 esbuild && cd ..
python3 src/build3d.py
```

## Personnages (faciles à décliner)

Les personnages sont dessinés par le code dans `src/chars_cozy.js`, à partir de pièces :
- `STAFF_LOOKS` : la tenue de chaque métier (couleurs, coiffe, accessoires). Ajoute une entrée pour créer une variante (ex. `patissier`, `sommelier`) et donne `variant:'patissier'` à l'employé.
- `CHAR_HATS`, `CHAR_EXTRAS`, `CHAR_HAIR` : coiffes, accessoires et coiffures. Chaque pièce est une petite fonction ; il suffit d'en ajouter une pour qu'elle soit utilisable dans une tenue.
- `charSpec(a)` : fabrique la fiche d'un personnage (peau, cheveux, tenue, enfant ou adulte).

## Lancer le jeu

- **Navigateur** : ouvre `www/index.html`, ou lance `npm run serve` puis va sur http://localhost:8080 (sur ton téléphone, utilise l'IP de ton PC).

## Créer les applis Android et iOS (Capacitor)

Prérequis : Node 20+, Android Studio (pour Android), un Mac avec Xcode (pour iOS).

```bash
npm install
npx cap add android
npx cap add ios          # sur Mac uniquement
npx cap sync
npm run android          # ouvre Android Studio, puis ▶ Run ou Build > Generate Signed APK/AAB
npm run ios              # ouvre Xcode, puis ▶ Run ou Product > Archive
```

Après chaque modification de `www/index.html`, relance `npx cap sync`.

Pour publier : compte Google Play Console (25 $ une fois) et Apple Developer Program (99 $/an).
Change aussi `appId` dans `capacitor.config.json` pour un identifiant à toi.

## Feuille de route proposée

1. **Social, la suite** (la ville, les visites, les confréries et les classements existent depuis la v0.99) : comptes avec reprise sur un autre appareil, plusieurs villes par serveur, amis embauchés comme employés, cadeaux d'ingrédients, modération des messages, événements de ville.
2. **Avatar** : personnalisation du joueur et des employés (coiffures, tenues).
3. **Contenu** : plus de recettes et de meubles, déco murale (cadres, fenêtres), objets sur plusieurs cases, tabourets de bar où les clients s'assoient, thèmes saisonniers.
4. **Graphismes** : remplacer le dessin par code par de vrais sprites (illustrateur ou pack d'assets), animations, musique.
5. **Monétisation** : monnaie premium, objets cosmétiques, pub récompensée (« double tes gains »).
6. **Technique** : passer à Phaser ou Godot si le jeu grossit beaucoup, sauvegarde cloud, analytics.

## Crédits
- Moteur 3D : Three.js (licence MIT). Police : Fredoka (SIL Open Font License).
- Les modèles compressés utilisés par le jeu sont dans `build/chars2/` (script : `build/process_umc.mjs`).

## Licence

© 2026 Ali Mezghenni. Tous droits réservés. Ce projet n'est pas libre de droits : voir le fichier [LICENSE](LICENSE). Toute copie, modification, redistribution ou utilisation commerciale est interdite sans autorisation écrite. Composants tiers : voir [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
