**Jouer en ligne : https://madaratn.github.io/Bistro-Ville-3D/**

# Chez Odette — prototype v0.96

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
| Déco | Catalogue intégré au mode déco (tables, chaises, équipement, bar, déco, sols et murs, réserve), glisser-déposer, une table emmène ses chaises, pivoter, copier, ranger dans la réserve, vendre, annuler, cases valides en surbrillance, contrôle qui empêche de bloquer le passage |
| Progression | Pièces, XP et niveaux avec déblocages, note ★ du resto (déco + menu + satisfaction − saleté) qui fait varier l'affluence et la patience |
| Quartier | Bar avec terrasse, cinéma, galerie marchande, immeubles (fenêtres éclairées la nuit). Passants qui vont au cinéma, au bar, font les boutiques ou traversent le trottoir d'en face ; les clients arrivent du quartier et y repartent |
| Ambiance | Carnet de commandes compact et repliable, bulles discrètes, rien qui clignote, mode « Regarder » (interface masquée, caméra qui se promène) |
| Divers | Sauvegarde automatique, gains hors-ligne (jusqu'à 8 h), sons, tutoriel, réglages |

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

1. **Social (le cœur de Restaurant City)** : comptes joueurs et backend (Firebase ou Supabase), amis embauchés comme employés, visites de restos, cadeaux d'ingrédients, classements.
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
