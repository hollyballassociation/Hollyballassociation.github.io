# Site Hollyball Association — version de production

Contenu : `index.html` (le site), `config.js` (vos clés), `schema.sql` (la base de données).
Tout est gratuit pour démarrer. Comptez environ 30 minutes.

## 1. Créer la base de données (Supabase)
1. Créez un compte sur https://supabase.com puis « New project ». Choisissez un mot de passe de base solide (gardez-le) et la région la plus proche (Europe).
2. Ouvrez **SQL Editor > New query**, collez tout le contenu de `schema.sql`, cliquez **Run**. Il doit afficher « Success ».

## 2. Relier le site à la base
1. Dans Supabase : **Project Settings > API**. Copiez « Project URL » et la clé **anon public**.
2. Ouvrez `config.js` et remplacez `VOTRE-PROJET.supabase.co` et `VOTRE-CLE-ANON-PUBLIQUE`.
   La clé anon est publique par conception. Ne copiez JAMAIS la clé « service_role ».

## 3. Régler l'authentification
Dans Supabase : **Authentication > Providers > Email** : gardez « Confirm email » activé, et mettez « Minimum password length » à 8.
**Authentication > URL Configuration** : indiquez l'adresse de votre site (« Site URL »), nécessaire pour les e-mails de confirmation et de réinitialisation.
Note : l'envoi d'e-mails par défaut de Supabase est limité à quelques messages par heure. Pour le vrai lancement, configurez un fournisseur d'e-mail (SMTP) dans **Authentication > SMTP Settings**.

## 4. Mettre le site en ligne
Le plus simple : https://app.netlify.com/drop — glissez-y le dossier complet (index.html + config.js). Vous obtenez une adresse immédiatement ; vous pourrez y brancher votre nom de domaine Hollyball Association. Cloudflare Pages ou GitHub Pages conviennent aussi.

## 5. Devenir administrateur
1. Sur le site, ouvrez Menu > Espace compte > S'inscrire avec l'adresse hollyballassociation@gmail.com, confirmez l'e-mail, connectez-vous.
2. Dans Supabase > SQL Editor, exécutez :
```sql
insert into public.roles (id, niv)
  select id, 0 from auth.users where email = 'hollyballassociation@gmail.com'
  on conflict (id) do update set niv = 0;
```
3. Reconnectez-vous : un panneau « Validation des comptes » apparaît dans l'espace compte. Vous y validez le niveau demandé par chaque inscrit (jusque-là, tout le monde est « Visiteur »).

## Ce qui est sécurisé / ce qui reste à faire
- Les mots de passe sont gérés par Supabase Auth (chiffrés côté serveur). Le site ne les voit jamais.
- Chaque personne ne voit que son propre profil ; seul un administrateur voit les autres comptes et valide les niveaux (règles RLS dans `schema.sql`, vérifiées sur un PostgreSQL de test).
- **Pas encore en base** : licences, compétitions, affiliations, actualités et résultats en direct restent des données de démonstration enregistrées dans le navigateur de chaque visiteur. Les passer en base est l'étape suivante.
- Sauvegardes : activez-les dans Supabase (offre payante) ou exportez régulièrement les tables.

## Étape 2 — Licences et affiliations dans la base

1. Supabase > **SQL Editor** > **New query** > collez tout le contenu de `schema_licences.sql` > **Run** (confirmez l'avertissement si demandé).
2. GitHub > votre dépôt > **Add file > Upload files** > envoyez le nouveau `index.html` (il remplace l'ancien) > **Commit changes**.
3. Attendez 1 minute, rouvrez le site, connectez-vous et testez : ajout d'une licence (niveau 5 ou plus haut requis), demande d'affiliation, validation par l'administrateur.

Limites : le registre des licences est public (nom, catégorie, club ; l'âge n'est visible qu'aux niveaux 0 à 3). Les droits d'écriture dépendent du niveau, pas de la structure. Actualités, matchs, Draft et compétitions restent locaux au navigateur.

## Étape 3 — Actualités et résultats de matchs dans la base

1. Supabase > SQL Editor > New query > collez `schema_actus_matchs.sql` > Run (à faire après `schema_licences.sql`).
2. GitHub > Add file > Upload files > envoyez le nouveau `index.html` > Commit changes.

Règles : tout le monde lit les actualités et les résultats. Publier une actualité ou saisir un résultat : niveaux 0 à 5 (les arbitres, niveau 7, peuvent saisir les résultats). Supprimer une actualité : niveaux 0 et 1. Les actualités sont créées automatiquement (nouvelle licence, résultat, affiliation, draft) quand un compte autorisé agit. Les points et matchs joués par joueur, la sélection de la Draft et la compétition choisie restent locaux.

## Étape 4 — Points des joueurs et Draft dans la base

1. Supabase > SQL Editor > New query > collez `schema_draft_points.sql` > Run (après `schema_licences.sql`).
2. GitHub > Add file > Upload files > envoyez le nouveau `index.html` > Commit changes.

Règles : tout le monde lit les points, la sélection Draft et son historique. Les points et matchs joués s'ajoutent à la fin d'un match (« Terminer le match ») par les niveaux 0 à 5 et les arbitres (7) ; ils ne peuvent pas être réécrits à la main. Sélectionner des joueurs pour la Draft et valider : niveaux 0 et 1. Seuls les niveaux 0 à 3 voient l'âge des joueurs, donc seuls eux voient la liste des candidats Draft.

## Étape 5 — Seul l'administrateur modifie le site

1. Supabase > SQL Editor > New query > collez `schema_admin_seul.sql` > Run (en dernier, après les autres fichiers).
2. GitHub > Add file > Upload files > envoyez le nouveau `index.html` > Commit changes.

Résultat : seul le compte de niveau 0 (Administrateur) voit et peut utiliser les outils de modification (nouvelle licence, saisie des scores, direct, sélection et validation Draft, validation des affiliations). Les autres comptes et les visiteurs ne font que lire. La base refuse aussi leurs modifications, même s'ils contournent le site. Seule exception : tout compte connecté peut envoyer une demande d'affiliation, qui reste « En attente ».

## Étape 6 — Photos et vidéos dans les actualités

1. Supabase > SQL Editor > New query > collez `schema_actus_media.sql` > Run (après `schema_admin_seul.sql`). Faites cette étape AVANT d'envoyer le nouvel `index.html`.
2. GitHub > Add file > Upload files > envoyez le nouvel `index.html` > Commit changes.

Utilisation (compte administrateur) : page Accueil > Actualités > « Publier une actualité » : texte, photo ou vidéo facultatives, Publier. Les photos sont réduites automatiquement (1600 px maximum). Vidéos : MP4 ou MOV, 50 Mo maximum. Le plan gratuit de Supabase offre 1 Go de stockage au total. Le bouton « Supprimer » (deux clics) retire l'actualité et son fichier.

## Étape 7 — Compte joueur : numéro de licence obligatoire

1. Supabase > SQL Editor > New query > collez `schema_compte_joueur.sql` > Run. À faire AVANT d'envoyer le nouvel `index.html`.
2. GitHub > Add file > Upload files > envoyez le nouvel `index.html` > Commit changes.

Fonctionnement : à l'inscription, si le niveau « Joueur » est choisi, un champ « Numéro de licence » apparaît. Le numéro doit exister (licence de catégorie Joueur), le nom saisi doit correspondre à celui de la licence (accents et majuscules ignorés), et une licence ne peut servir qu'à un seul compte. Le niveau Joueur est alors accordé automatiquement. Entraîneurs, arbitres et autres niveaux : inscription inchangée, sans numéro de licence. La connexion se fait toujours avec l'adresse e-mail.

Limite : les numéros de licence et les noms figurent dans le registre public, donc quelqu'un qui connaît le nom et le numéro d'un joueur peut créer son compte avant lui. Le niveau Joueur ne donne aucun droit de modification.

## Étape 8 — E-mail automatique à la création d'une licence Joueur

Dans le formulaire « Nouvelle licence » (catégorie Joueur), l'administrateur saisit l'e-mail du joueur. À la création, le joueur reçoit un e-mail avec son numéro de licence et un code d'activation, puis active son compte (Menu > Espace compte > Activer). Le niveau Joueur lui est accordé automatiquement. L'e-mail du joueur n'est pas enregistré dans la base : il sert seulement à l'envoi. La carte « Envoyer le code d'activation » permet de renvoyer le code.

Réglages Supabase OBLIGATOIRES :
1. Authentication > Emails > SMTP Settings : activez un SMTP personnalisé (sans cela, Supabase n'envoie que 2 e-mails par heure). Exemple Gmail : hôte smtp.gmail.com, port 465, utilisateur hollyballassociation@gmail.com, mot de passe = « mot de passe d'application » Google (validation en 2 étapes requise).
2. Authentication > Emails > Templates : collez le contenu de `modele_email_licence.html` dans « Confirm signup » ET dans « Magic Link » (sujet : Votre licence Hollyball Association).
3. Authentication > Providers > Email : « Email OTP Expiration » à 86400 (24 h).
Puis envoyez le nouvel `index.html` sur GitHub.

## Étape 9 : photos (profil et licenciés)

1. Supabase > SQL Editor > New query > coller le contenu de `schema_photos.sql` > Run (message « Success »).
2. Sur GitHub, remplacer `index.html` par le nouveau fichier (Commit changes).
3. Création d'une licence (administrateur) : champ « Photo du licencié (facultatif) », aperçu immédiat sur la carte. Dans le Registre, la photo s'affiche à gauche de chaque ligne ; toucher une ligne affiche la carte du licencié.
4. Espace compte : « Ma photo de profil », chaque compte peut changer la sienne ; l'administrateur voit les photos dans la validation des comptes.
Photos réduites automatiquement (480 px) ; seul l'administrateur peut ajouter la photo d'un licencié. Les photos des licenciés sont visibles publiquement : ne les enregistrer qu'avec l'accord de la personne.

## Étape 10 : espace compte « profil » et expériences Hollyball

1. Supabase > SQL Editor > New query > coller `schema_experiences.sql` > Run.
2. Remplacer `index.html` sur GitHub (Commit changes).
3. Espace compte : bandeau, photo en haut, nom en grand. Les comptes Entraîneur, Arbitre et Joueur (niveau validé) ont « Mes expériences Hollyball » : chaque ajout est publié dans le fil d'actualité ; supprimer l'expérience retire aussi la publication.
4. Licences (administrateur) : carte « Changer la photo d'un licencié » pour une licence déjà créée.

## Étape 11 : paiement des licences par Mobile Money

1. Supabase > SQL Editor > New query > coller `schema_paiements.sql` > Run.
2. Remplacer `index.html` sur GitHub (Commit changes).
3. Connecté en administrateur : onglet International > carte « Paiements Mobile Money » > « Tarifs et numéros de l'association » : choisir la devise, saisir les 3 prix et les numéros Orange Money / M-Pesa / Airtel Money, Enregistrer.
4. Le membre connecté : onglet International > Paiement des licences > choisit le licencié, envoie l'argent au numéro indiqué, saisit la référence du SMS et son numéro, « J'ai payé ».
5. L'administrateur vérifie le SMS de réception dans son téléphone, puis « Confirmer » : la licence passe à « Payée » (colonne Paiement du registre). « Refuser » si la référence est fausse.
Ce n'est pas un paiement automatique : un paiement automatique demande un compte chez un prestataire agréé (FlexPay, CinetPay, etc.).

## Étape 12 : profils des joueurs

1. Supabase > SQL Editor > New query > coller `schema_profils_joueurs.sql` > Run.
2. Remplacer `index.html` sur GitHub (Commit changes).
3. Joueur : Menu > Espace compte > « Mon profil joueur » : sexe, taille, poids ; l'âge, les points et passes décisives de carrière s'affichent automatiquement.
4. Administrateur, en direct : nouveau bouton « Passe décisive » ; en terminant le match, points, passes et matchs s'ajoutent à la carrière des joueurs.
5. Clubs, entraîneurs, ligues, fédérations, confédérations et administrateurs : onglet Licences, toucher une ligne du registre : carte + profil complet du joueur. Visiteurs, arbitres et autres joueurs ne voient pas sexe, âge, taille ni poids.

## Étape 13 : comptes des structures et répertoire des joueurs

1. Supabase > SQL Editor > New query > coller `schema_structures.sql` > Run.
2. Remplacer `index.html` sur GitHub (Commit changes).
3. Affiliation : l'administrateur affilie la structure (onglet Affiliation > Demande d'affiliation : renseigner l'e-mail de contact, puis Approuver). Le numéro d'affiliation (AFF-F-001, etc.) est affiché dans la colonne N° (visible par l'administrateur seulement) : le transmettre à la structure.
4. Création du compte d'une confédération, fédération, académie ou école : Menu > Espace compte > Créer un compte > niveau demandé, puis le numéro d'affiliation. L'e-mail doit être l'e-mail de contact enregistré lors de l'affiliation. Sans affiliation validée, la création est refusée.
5. Une structure qui a déjà un compte (celui qui a déposé la demande) : Menu > Espace compte > Espace structure > saisir le numéro > Activer.
6. Répertoire : onglet Affiliation > « Répertoire de mes joueurs » : ajouter un joueur avec ou sans licence. Avec licence, le numéro doit exister dans la base (joueur), sinon il est rejeté. Une licence obtenue plus tard s'ajoute à la ligne du joueur.

## Étape 14 — Compétitions (équipes, calendrier, joueurs inscrits, statistiques)
1. Supabase > SQL Editor > New query > coller `schema_competitions.sql` > Run.
2. Sur GitHub, remplacer `index.html` (Commit changes).
3. Administrateur : onglet Compétition > ajouter les équipes éligibles (avec ou sans structure affiliée), saisir les dates du calendrier.
4. Club / école / académie / fédération éligible : inscrit ses joueurs (depuis son répertoire) dans l'équipe de la compétition.
5. En direct : choisir les deux équipes, puis les joueurs inscrits ; à la fin du match, points, passes, victoire/nul/défaite sont enregistrés dans la compétition.
6. Chaque compétition affiche classement, historique, statistiques, meilleur Hollymen (points + passes), meilleur toucheur, meilleur passeur.

## Étape 15 — Boutique et sponsors
1. Supabase > SQL Editor > New query > coller `schema_boutique.sql` > Run.
2. Sur GitHub, remplacer `index.html` (Commit changes).
3. Onglet Boutique : l'administrateur ajoute les articles (nom, prix USD/CDF, photo) ; « Commander » ouvre WhatsApp.
4. Sponsors : visibles seulement en bas de l'onglet Accueil ; l'administrateur ajoute nom, niveau, site et logo.

## Étape 16 — Tableau de bord administrateur et boutique sur l'accueil
1. Supabase > SQL Editor > New query > coller `schema_tableau_bord.sql` > Run.
2. Sur GitHub, remplacer `index.html` (Commit changes).
3. L'onglet « Tableau de bord » n'apparaît que pour le compte administrateur : visites, nouveaux inscrits, comptes par type.
4. Les articles de la boutique sont aussi présentés sur l'Accueil (au-dessus des sponsors).

## Étape 17 — Référencement Google
1. Sur GitHub : remplacer `index.html`, puis ajouter `robots.txt` et `sitemap.xml` (Add file > Upload files).
2. Sur search.google.com/search-console : ajouter la propriété « Préfixe d'URL » https://hollyballassociation.github.io/ ; valider avec le fichier HTML de Google (à téléverser à la racine du dépôt).
3. Inspection de l'URL > « Demander une indexation » ; Sitemaps > ajouter sitemap.xml.

## Étape 18 — Site installable comme une appli (iPhone)
1. Sur GitHub, remplacer `index.html` et ajouter `manifest.webmanifest`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`.
2. Sur iPhone (Safari) : ouvrir le site > bouton Partager > « Sur l'écran d'accueil » > Ajouter.

## Étape 18 — Installer le site comme une appli
1. Sur GitHub, ajouter à la racine : `index.html` (remplacé), `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`.
2. Sur iPhone (Safari) : Partager > « Sur l'écran d'accueil » > Ajouter. L'icône Hollyball s'ouvre en plein écran.

## Étape 19 — Accueil visible, autres onglets réservés aux comptes
L'Accueil reste ouvert à tous. Les autres onglets portent un cadenas tant qu'on n'est pas connecté : un clic ouvre l'espace compte (connexion, inscription, activation), puis le site va directement à l'onglet demandé.
Attention : c'est un verrou d'affichage ; les données publiques restent lisibles par l'API tant que les règles de la base (RLS) autorisent la lecture anonyme.

## Étape 20 — Protection réelle des données (base de données)
1. Supabase > SQL Editor > New query > coller `schema_acces_comptes.sql` > Run.
2. Sur GitHub, remplacer `index.html`.
Après cela, un visiteur sans compte ne peut plus lire (même via l'API) : licences, résultats, statistiques, draft, compétitions, expériences, paiement. Restent publics : actualités, structures affiliées, boutique, sponsors et les compteurs de l'accueil.

## Étape 21 — Deux types de compte : Membre et Structure
1. Supabase > SQL Editor > New query > coller `schema_comptes_types.sql` > Run (à exécuter en dernier).
2. Sur GitHub, remplacer `index.html`.
3. À l'inscription il n'y a plus que deux choix : **Membre** (joueur, entraîneur, arbitre, supporter) et **Structure**.
4. Membre : compte créé tout de suite. Quand l'administrateur crée sa licence avec son e-mail, le code d'activation arrive aussitôt et le compte devient Joueur. Entraîneur/arbitre : niveau accordé par l'administrateur.
5. Structure (confédération, fédération, ligue/district, club, académie, école) : l'administrateur l'affilie dans l'onglet Affiliation avec l'e-mail de contact ; à l'approbation, le numéro d'affiliation et le code d'activation partent aussitôt à cet e-mail. La structure ouvre « Activer », saisit le code et choisit son mot de passe ; son niveau est accordé automatiquement selon son type.
6. Tableau de bord : « Comptes par type » et « Répertoire de tous les comptes » (recherche + filtre), plus la liste des structures affiliées pas encore activées avec un bouton pour renvoyer le code.

## Étape 22 — Barre de recherche sur l'Accueil
1. Sur GitHub, remplacer uniquement `index.html` (aucun SQL à exécuter).
2. L'Accueil a une section « Rechercher » (sous la photo) : joueurs, entraîneurs, arbitres, clubs, équipes, compétitions, actualités, boutique, sponsors et pages du site. Un clic sur un résultat ouvre la page concernée.
3. Les données réservées aux comptes (joueurs, équipes, compétitions) ne sont cherchables qu'une fois connecté, comme le reste de la protection.

## Étape 23 — Notifications (cloche)
1. Supabase > SQL Editor > New query > coller `schema_notifications.sql` > Run.
2. Sur GitHub, remplacer `index.html`.
3. Une cloche apparaît à côté du bouton Menu pour les comptes connectés, avec un badge rouge (nombre de notifications non lues). Chaque compte ne voit que ses notifications et celles envoyées à tous.
4. Administrateur : en bas du panneau de la cloche, choisir « Tous les comptes » ou « Un compte précis (e-mail) », écrire un titre et un message, puis Envoyer. Il peut aussi supprimer une notification.

## Étape 24 — Page Sport (présentation et règlement) visible par tous
1. Sur GitHub, remplacer uniquement `index.html` (aucun SQL).
2. L'onglet Sport (histoire, postes, terrain, règles, règlement général) s'ouvre sans compte. Les autres onglets restent réservés aux comptes.
3. Des données structurées Google (organisation, logo, contact) ont été ajoutées pour enrichir l'affichage dans les résultats. Google met plusieurs jours ou semaines à les prendre en compte.
4. Search Console > Inspection de l'URL > « Demander une indexation » pour accélérer.

## Étape 25 — Pages dédiées pour Google (Sport et Règlement)
1. Sur GitHub (Add file > Upload files), envoyer à la racine, en une seule fois : `index.html`, `sport.html`, `reglement.html`, `sitemap.xml`, `terrain-schema.jpg`, `terrain-pelouse.jpg` (Commit changes).
2. Adresses : https://hollyballassociation.github.io/sport.html et https://hollyballassociation.github.io/reglement.html
3. Search Console : Inspection de l'URL pour chacune des deux adresses > « Demander une indexation », puis Sitemaps > renvoyer sitemap.xml.

## Étape 26 — Nouvel Accueil (inspiré de la maquette)
1. Sur GitHub (Add file > Upload files), envoyer à la racine : `index.html` (remplacé) et `hero.jpg` (nouveau). Commit changes.
2. L'Accueil a maintenant : grand titre avec photo, barre de recherche, 6 cartes de raccourcis (communauté, actualités, discipline, événements, formation, international), bloc « À propos » avec les chiffres réels, et la carte « Notre mission ».

## Étape 27 — Contact repensé (WhatsApp, e-mail, appel)
1. Sur GitHub, remplacer uniquement `index.html`.
2. Le bouton « Nous contacter » est maintenant une petite pastille ronde jaune en bas à droite. Elle ouvre un panneau avec WhatsApp, E-mail et Appeler, chacun avec une icône « Copier » (e-mail et téléphone) et un lien « Ouvrir directement dans Gmail ».
3. Si, installé sur l'écran d'accueil, l'e-mail ou l'appel ne s'ouvre toujours pas, ouvrez le site dans Safari : les liens e-mail et appel y utilisent l'application par défaut du téléphone.

## Étape 27 — Contact plus discret et boutons e-mail / appel
1. Sur GitHub, remplacer uniquement `index.html` (Commit changes).
2. Le bouton « Nous contacter » est maintenant une petite pastille ronde jaune avec une bulle de discussion ; il ouvre un panneau avec WhatsApp, E-mail (Gmail), Appeler et un bouton Copier pour l'e-mail et le numéro.
3. E-mail ouvre directement Gmail avec le message prêt ; « Ou ouvrir l'application Mail » sert de secours.

## Étape 28 — API Hollyball réservée à l'administrateur
Sur GitHub, remplacer uniquement `index.html`. La carte « API Hollyball » (page International) n'est visible que pour le compte administrateur.

## Étape 29 — Plan d'action réservé à l'administrateur
Sur GitHub, remplacer uniquement `index.html`. Dans l'onglet Association, le « Plan d'action en trois étapes » n'est visible que pour le compte administrateur ; la section s'appelle maintenant « Vision à long terme » pour les autres.

## Étape 30 — Audit du site et nettoyage
Sur GitHub, remplacer uniquement `index.html`. Les anciens textes « Phase 2… Aperçu : les données restent dans ce navigateur » ont été retirés des onglets ; deux balises en double supprimées ; le champ « Devise » de la boutique a une étiquette d'accessibilité.

## Étape 31 — Pages « Communauté » et « Événements »
1. Supabase > SQL Editor > New query : collez le contenu de `schema_communaute_evenements.sql` > Run (« Success »).
2. GitHub : remplacez `index.html` par la nouvelle version (Add file > Upload files).
3. Connecté en administrateur : Accueil > carte « La communauté » > « Ajouter une page » (plateforme, nom, lien https, nombre d'abonnés). Pour changer les abonnés : saisissez le nombre puis « Mettre à jour » (les nombres sont saisis à la main, aucune API automatique).
4. Carte « Événements » : ajoutez matchs, entraînements, formations. Les matchs dont vous fixez la date dans Compétitions apparaissent automatiquement dans « À venir », puis dans « Passés » après la date.
Les deux pages sont publiques (visibles sans compte).

## Étape 32 — Photos visibles sur Google
Téléversez sur GitHub (Add file > Upload files, à la racine) : les 17 fichiers `hollyball-*.jpg`, `index.html`, `sport.html`, `sitemap.xml`.
Puis Search Console : Sitemaps > renvoyez `sitemap.xml`, et Inspection de l'URL > `https://hollyballassociation.github.io/sport.html` > « Demander une indexation ». Les photos apparaissent dans Google Images sous quelques jours à quelques semaines.

## Étape 33 — Créateurs du Hollyball (Accueil + page publique) et onglet Association ouvert
Téléversez sur GitHub (racine) : `index.html`, `sport.html`, `createurs.html` (nouveau), `sitemap.xml`, `hollyball-reagan-luboya-yabamba-co-createur.jpg`, `hollyball-sayrus-emmanuel-mbole-mayembe-co-createur.jpg`.
Puis Search Console : Sitemaps > renvoyez `sitemap.xml` ; Inspection de l'URL > `https://hollyballassociation.github.io/createurs.html` > « Demander une indexation » (idem pour `sport.html` et l'Accueil).
Pour aider Google : ajoutez dans la description de vos pages Facebook, Instagram et TikTok « Hollyball Association – sport inventé par Reagan Luboya Yabamba et Sayrus Emmanuel Mbole Mayembe (RDC) », puis publiez régulièrement.
Les liens des réseaux s'ajoutent ensuite dans Accueil > La communauté (administrateur).

## Étape 34 — Page biographie de Sayrus Emmanuel Mbole Mayembe
Téléversez sur GitHub (racine) : `sayrus-emmanuel-mbole-mayembe.html` (nouveau), `createurs.html`, `index.html`, `sitemap.xml`.
Search Console : renvoyez `sitemap.xml`, puis Inspection de l'URL > `https://hollyballassociation.github.io/sayrus-emmanuel-mbole-mayembe.html` > « Demander une indexation ».
Pour renforcer : même biographie sur Facebook, Instagram, TikTok, LinkedIn ; ajoutez ensuite les liens de ces profils (je les mets dans les données de la page).

## Étape 35 — Logos des compétitions et des équipes, officialisation des résultats
1. Supabase > SQL Editor > New query : collez `schema_logos_officiel.sql` > Run (« Success »).
2. GitHub : remplacez `index.html`.
3. Administrateur, onglet Compétitions : « Logo de la compétition » (une image par compétition) ; dans « Équipes éligibles », chaque équipe a un champ pour son logo (PNG ou JPG, redimensionné automatiquement).
4. Onglet En direct : les logos de la compétition et des deux équipes choisies s'affichent à côté de leurs noms.
5. Onglet Événements : les matchs du calendrier affichent les logos ; un résultat officiel apparaît dans « Passés » avec son score.
6. Officialisation : Compétitions > tableau « Calendrier et résultats » > colonne « Officiel » > « Officialiser ». Le résultat devient public et est publié dans Actualités avec les logos. Si le score est modifié ensuite, le résultat redevient non officiel.
Important : « Terminer le match » en direct n'envoie plus rien dans Actualités ; seule l'officialisation publie.

## Étape 36 — Photos de l'Accueil en diaporama
Remplacez `index.html` sur GitHub. Sur l'Accueil, « Le Hollyball en images » affiche une seule photo qui change toutes les 5 secondes (17 photos, flèches et balayage du doigt). La galerie complète reste sur la page Sport.

## Étape 37 — Actualités en diaporama
Remplacez `index.html` sur GitHub. Sur l'Accueil, « Actualités » affiche une seule actualité à la fois, qui change toutes les 5 secondes (flèches et balayage du doigt). Le défilement s'arrête tant qu'une vidéo est en lecture. L'administrateur voit toujours le bouton « Supprimer » sur l'actualité affichée.

## Étape 38 — Bouton « Partager » sur les actualités
- Chaque actualité de l'Accueil a un bouton jaune **Partager**.
- Sur iPhone : ouvre la fenêtre de partage native (WhatsApp, Facebook, Instagram, TikTok, Messages…) avec le texte, le lien du site et la photo si l'actualité en a une.
- Si le partage natif n'existe pas (ordinateur) : boutons WhatsApp, Facebook et « Copier le texte » (pour coller dans Instagram ou TikTok).
- Remplacez seulement `index.html` sur GitHub. Aucun SQL.
- Limite : le lien partagé ouvre le site (Accueil), pas une page propre à l'actualité.

## Étape 39 — Correctif de sécurité (tableau des compétitions)
- Les noms d'équipes affichés dans le tableau des scores sont désormais insérés sans interpréter de HTML (empêche l'injection de code par un nom piégé). Remplacez `index.html` sur GitHub. Aucun SQL.
- À faire aussi côté comptes : voir la liste de contrôle de sécurité donnée dans la conversation (double authentification GitHub, Supabase et e-mail ; sauvegarde ; réglages d'inscription).

## Étape 40 — Sécurité des licences (e-mail obligatoire) + export CSV

### A. Licences : l'e-mail du joueur devient obligatoire pour activer sa licence
Avant, un membre dont le nom ressemblait à celui d'une licence pouvait la réclamer. Maintenant, la licence doit avoir une adresse e-mail enregistrée par l'administrateur, et le compte doit utiliser cette même adresse.
1. Supabase > SQL Editor > New query > collez `schema_licence_email.sql` > Run (« Success »). À exécuter EN DERNIER, après tous les autres fichiers.
2. Remplacez `index.html` sur GitHub.
3. **Licences existantes (important) :** pour chaque joueur déjà inscrit dans le registre qui n'a pas encore de compte, allez dans Licences > « Envoyer le code d'activation », saisissez le numéro de licence et l'e-mail du joueur, puis « Envoyer le code ». L'e-mail est enregistré et le joueur reçoit son code. Tant que ce n'est pas fait, le joueur voit « cette licence n'a pas d'adresse e-mail enregistrée ».
4. Les nouvelles licences Joueur créées avec le champ « E-mail du joueur » sont enregistrées automatiquement avec cet e-mail.
5. Les joueurs qui ont déjà un compte lié ne sont pas touchés.

### B. Export CSV (sauvegarde)
- Tableau de bord > carte « Sauvegarde : exporter en CSV » : choisissez les données (licences, structures, comptes, résultats, paiements, etc.) puis « Télécharger le CSV ». Sur iPhone, enregistrez le fichier dans « Fichiers ».
- À faire une fois par mois. Les fichiers contiennent des données personnelles : gardez-les en lieu sûr.
- Les cellules qui commencent par = + - @ sont neutralisées (protection contre les formules piégées dans Excel).
- Aucun SQL pour cette partie.

## Étape 41 — Double authentification (code à 6 chiffres) pour l'administrateur du site
Le compte administrateur du site peut être protégé par un code à 6 chiffres (Google Authenticator). Le contrôle est fait par la base de données : sans le code, le serveur traite l'administrateur comme un simple visiteur, même si quelqu'un trouve son mot de passe.

### Mise en place (dans cet ordre)
1. Supabase > SQL Editor > New query > collez `schema_mfa_admin.sql` > Run (« Success »). À exécuter EN DERNIER. Tant que vous n'avez pas activé la double authentification, rien ne change pour vous.
2. Remplacez `index.html` sur GitHub.
3. Connectez-vous au site avec le compte administrateur, ouvrez **Tableau de bord**, descendez jusqu'à **Sécurité du compte administrateur**. La ligne « Protection côté serveur » doit dire « prête ».
4. Touchez **Activer la double authentification**. Touchez « Ouvrir dans l'application d'authentification » (Google Authenticator ajoute « Hollyball »). Si rien ne s'ouvre, ajoutez un compte manuellement avec la clé affichée (type « basée sur le temps »).
5. **Notez la clé secrète sur papier.** Elle permet de remettre l'application sur un nouveau téléphone.
6. Saisissez le code à 6 chiffres affiché, puis « Confirmer ».
7. Test : déconnectez-vous, reconnectez-vous (e-mail et mot de passe). Une fenêtre « Vérification en deux étapes » demande le code. Gardez la page ouverte tant que ce test n'est pas réussi.

### Si vous perdez le téléphone sans avoir la clé secrète
- Supabase > Authentication > Users > votre utilisateur > menu ⋯ > « Remove MFA factors » (si l'option existe), ou
- Supabase > SQL Editor : `delete from auth.mfa_factors where user_id = (select id from auth.users where email = 'hollyballassociation@gmail.com');` puis Run. La double authentification est alors désactivée : reconnectez-vous et réactivez-la avec le nouveau téléphone.

### Sécurité anti-blocage
- Si la base ne peut pas lire les facteurs (cas improbable), le site affiche « Protection côté serveur non confirmée » et ne bloque jamais l'administrateur.
- Après 5 codes faux, la saisie est suspendue 30 secondes.

## Étape 42 : Popularité (visites) et onglet Contact

1. Supabase > SQL Editor > New query : collez le contenu de `schema_popularite.sql` > Run. (À faire après `schema_tableau_bord.sql`, qui est déjà en place.)
2. GitHub > Add file > Upload files : envoyez `index.html` (remplacez l'ancien) puis « Commit changes ».
3. Test : en bas de l'Accueil, la section « Popularité » affiche les visites au total, les visiteurs différents, les 30 derniers jours et aujourd'hui. Le bouton flottant ouvre l'onglet « Nous contacter » (bouton « Retour à l'accueil » pour revenir). Le contact n'apparaît plus en bas des autres onglets.

Suggestions (ajout à l'étape 43) : dans l'onglet Messages, « Membres à découvrir » propose 10 comptes (nom et niveau seulement) : les 3 plus récents, plus des comptes tirés au hasard. Le bouton « Autres suggestions » en tire d'autres. Il faut relancer `schema_messagerie.sql` dans Supabase (il remplace les fonctions sans rien perdre).

Changement (étape 43) : le bouton flottant rond ouvre maintenant **Messages** (avec la pastille rouge des messages non lus). **Contact** est un onglet du menu du haut, public, à la place de l'ancien onglet Messages. Seul `index.html` change.

Événements (étape 43) : l'onglet Événements a trois sous-onglets : **Matchs** (par défaut), **Entraînements** et **Formations**. Chacun montre ses événements à venir et passés. Le sous-onglet Entraînements affiche aussi les 17 photos de Hollyball. Quand l'administrateur ajoute un événement, le type choisi est celui du sous-onglet ouvert. Seul `index.html` change.

## Étape 44 : Organigramme de gouvernance

1. Supabase > SQL Editor > New query : collez le contenu de `schema_organigramme.sql` > Run. (Il crée les 9 postes de départ ; le relancer ne les duplique pas.)
2. GitHub > Upload files : remplacez `index.html`.
3. Onglet **Association**, section « Organigramme de gouvernance » : tout le monde voit le président, le vice-président, les pôles et les 4 commissions permanentes.
4. Connecté en administrateur, chaque poste a ses champs : intitulé, mission, titulaire (vide = « Poste à pourvoir »), « Enregistrer » et « Retirer ce poste » (confirmation en deux touches). Le formulaire « Ajouter un poste » en bas crée un poste dans le niveau choisi (sommet, vice-présidence, pôles, commissions).
5. Seul l'administrateur peut nommer ou modifier : c'est la base de données qui refuse toute autre écriture.

Mise à jour de l'étape 44 : l'organigramme a 5 niveaux : 1 Président, 2 Vice-président, 3 Secrétariat général, Trésorerie et Direction technique et développement, 4 Commissions permanentes, 5 Commission de discipline, Commission médicale et sécurité, Commission d'arbitrage et Commission des jeunes. Relancez `schema_organigramme.sql` dans Supabase (il met à niveau l'ancienne version sans rien perdre : les noms de titulaires sont gardés) puis remplacez `index.html`.

## Étape 45 : poste actuel des fondateurs, partout sur le site

Les titres de fondateur ne changent jamais. En dessous, une ligne dorée « Poste actuel : … » se met à jour toute seule d'après l'organigramme : sur les cartes « Les fondateurs » et les photos des créateurs (Accueil, Association, page Créateurs) et sur les deux biographies. Quand vous nommez quelqu'un à un poste (onglet Association > Organigramme), sa ligne change ; s'il n'a aucun poste, la ligne disparaît. Le nom est comparé sans tenir compte des majuscules, des accents ni des espaces en trop ; une liste de suggestion propose les 4 fondateurs pour éviter les fautes de frappe.
GitHub > Upload files : `index.html`, `createurs.html`, `reagan-luboya-yabamba.html`, `sayrus-emmanuel-mbole-mayembe.html` et le nouveau fichier `poste.js`. (`schema_organigramme.sql` doit avoir été exécuté.)

## Étape 46 : formulaire de demande d'adhésion (adhesion.html)

Le lien du formulaire : **https://hollyballassociation.github.io/adhesion.html** (ouvre directement le formulaire). On peut aussi ouvrir le formulaire avec un type déjà choisi : `…/adhesion.html?profil=joueur` (ou `entraineur`, `arbitre`, `membre`, `benevole`, `partenaire`, `structure`).

1. Supabase > SQL Editor > New query : collez `schema_adhesions.sql` > Run.
2. GitHub > Upload files : `adhesion.html`, `index.html`, `sitemap.xml`, `sport.html`, `reglement.html`, `createurs.html`, `sayrus-emmanuel-mbole-mayembe.html`, `reagan-luboya-yabamba.html`.
3. **Activer l'envoi par e-mail (une seule fois)** : ouvrez https://hollyballassociation.github.io/adhesion.html, envoyez une demande de test. Le service gratuit FormSubmit envoie alors un e-mail de confirmation à hollyballassociation@gmail.com (regardez aussi les Spams) : ouvrez-le et touchez « Activate Form ». Ensuite, chaque demande arrive dans la boîte Gmail de l'association, avec l'adresse du candidat en « répondre à ».
4. Chaque demande est aussi enregistrée dans la base : connecté en administrateur, onglet Tableau de bord > « Demandes d'adhésion » (WhatsApp, e-mail, marquer traitée, supprimer).
5. Si l'envoi automatique échoue, le candidat voit des boutons « Envoyer par WhatsApp » et « Copier ma demande ».


### Mise à jour : compte obligatoire pour l'adhésion
- Il faut être connecté pour remplir `adhesion.html`. Sinon la page propose « Se connecter ou créer un compte », puis ramène automatiquement au formulaire.
- Côté serveur aussi : relancez `schema_adhesions.sql` dans Supabase (SQL Editor > Run). Il retire l'accès aux visiteurs sans compte et enregistre le compte auteur de la demande.
- Fichiers à envoyer sur GitHub : `adhesion.html`, `index.html`, `logo-hollyball.png`.


### Étape 47 : fiche d'affiliation des structures (affiliation.html)
- Même principe que l'adhésion : compte obligatoire, formulaire avec les rubriques de la fiche officielle (identification, responsable légal, informations propres à la catégorie, motifs, engagement), puis fiche PDF pré-remplie à télécharger.
- La demande arrive par e-mail (FormSubmit, déjà activé pour hollyballassociation@gmail.com) et dans la base. L'administrateur la lit dans Tableau de bord > « Demandes d'affiliation (fiche officielle) ».
- Les parties réservées (référence, frais d'affiliation, vérification, décision) restent vides sur la fiche pour être remplies à la main.
- Lien : https://hollyballassociation.github.io/affiliation.html (option `?categorie=club`, `ecole`, `academie`, `ligue`, `federation`, `confederation`, `fihb`).
- À faire : exécuter `schema_affiliations.sql` dans Supabase, puis envoyer `affiliation.html`, `index.html` et `sitemap.xml` sur GitHub.


### Étape 48 : niveaux, suggestions aux académies et annuaire « Contacter »
- **Niveaux** (joueurs et entraîneurs) : Amateur par défaut, Semi-professionnel, Professionnel. Une académie passe un joueur de son répertoire d'amateur à semi-pro quand sa formation est terminée (bouton « Formation terminée : valider semi-pro »). Le niveau Professionnel et celui des entraîneurs sont attribués par l'administrateur (Tableau de bord > « Niveaux des joueurs et entraîneurs »).
- **Lieu des structures** : chaque structure renseigne sa ville (et son district) dans son répertoire (onglet Affiliation).
- **Suggestions** : les joueurs amateurs du répertoire des écoles affiliées de même pays, ville (et district) apparaissent chez l'académie, qui n'a qu'à les ajouter.
- **Contacter** (onglet Messages, carte « Annuaire ») : les structures écrivent aux autres structures ; clubs, écoles et académies écrivent aussi aux joueurs et entraîneurs ; les arbitres ne sont joignables que par l'administration, la FIHB, les confédérations, fédérations, ligues et académies.
- À faire : exécuter `schema_niveaux_contacts.sql` dans Supabase (SQL Editor > Run), puis envoyer `index.html` sur GitHub.

## Étape 49 — Billetterie (Événements)

1. Supabase > SQL Editor : exécutez `schema_billetterie.sql` (une seule fois).
2. Envoyez `index.html` sur GitHub (remplace l'ancien).
3. Vérifiez vos numéros Mobile Money dans « Paiement des licences » (réglages admin) : la billetterie les utilise.
4. Page Événements > onglet **Billetterie** (compte admin) : choisissez l'événement, « Ouvrir la billetterie », puis ajoutez les catégories (nom, prix, places, porte).
5. Un acheteur connecté réserve, paie par Mobile Money et saisit la référence. Vous confirmez dans « Paiements à vérifier » : les billets (QR code) apparaissent dans « Mes billets ».
6. À l'entrée : tapez le code du billet dans « Contrôle à l'entrée » puis « Valider l'entrée » (refuse les billets déjà utilisés).

Limites : confirmation du paiement manuelle ; pas de choix de siège (catégories + porte) ; pas de scan caméra.

## Étape 50 — Paiement automatique par Moneroo (licences + billets)

Principe : le membre clique sur « Payer maintenant », arrive sur la page de paiement sécurisée Moneroo (Mobile Money Orange/Airtel/Vodacom/Africell, carte), paie, revient sur le site : la licence passe « payée » ou les billets sont délivrés, sans aucune vérification de votre part. Le mode manuel (référence + confirmation admin) reste actif tant que la case « Paiement automatique » n'est pas cochée.

1. **Compte Moneroo** : créez-le gratuitement sur app.moneroo.io/auth/register, complétez le profil de l'association. Dans l'espace Moneroo, vérifiez que la **RDC** et la devise utilisée (CDF ou USD) sont bien activées pour votre compte. Récupérez la **clé secrète** (Developers > API keys) et, dans Developers > Webhooks, le **secret de signature**.
2. **Supabase > SQL Editor** : collez `schema_paiement_auto.sql` > Run (après `schema_paiements.sql` et `schema_billetterie.sql`).
3. **Supabase > Edge Functions > Deploy a new function > Via Editor** : nom exactement `paiement`, collez le contenu de `edge/paiement.ts`, Deploy. Dans ses réglages, **désactivez « Verify JWT »** (Moneroo appelle la fonction sans connexion ; la fonction vérifie elle-même le membre et re-contrôle chaque résultat auprès de Moneroo).
4. **Edge Functions > Secrets** : ajoutez `MONEROO_SECRET_KEY` (clé secrète), `MONEROO_WEBHOOK_SECRET` (secret de signature), `PAIEMENT_CB_SECRET` (mot de passe de votre choix, 20 caractères ou plus, sans espaces).
5. **Moneroo > Developers > Webhooks** : ajoutez l'adresse `https://qslofismlgjbzjunmgix.supabase.co/functions/v1/paiement?cb=VOTRE_PAIEMENT_CB_SECRET` (remplacez par le mot de passe de l'étape 4) et activez les événements de paiement (payment.success, payment.failed, payment.cancelled).
6. Envoyez `index.html` sur GitHub.
7. Site > carte « Tarifs et numéros » (page Compétitions/Paiement) : cochez **Paiement automatique par Moneroo**, Enregistrer.
8. **Test avant d'annoncer** : fixez un petit prix, payez avec votre propre numéro, vérifiez que la licence passe « payée ». En cas de problème, décochez la case : le mode manuel reprend aussitôt.

Notes : l'API Moneroo utilisée est celle de leur documentation publique ; si la devise CDF est refusée, passez la devise du site en USD. Moneroo prélève une commission. Le site fonctionne même si le webhook tarde : au retour sur le site, le paiement est re-vérifié automatiquement.

## Étape 51 — Carte de licence officielle (recto/verso), QR code et modification par l'administrateur

Nouvelle carte au design Hollyball (recto : photo, nom, prénom, date de naissance, sexe, nationalité, équipe, poste, n° de licence, code-barres ; verso : informations importantes, valeurs, QR code, contacts). Elle s'affiche dans la page des licences : cliquez une ligne du registre pour voir la carte de ce licencié ; un joueur voit sa propre carte. Boutons : voir le verso, imprimer / enregistrer en PDF.

**QR code opérationnel** : il ouvre `licence.html?c=…`, page publique qui affiche la licence avec un bandeau « LICENCE VALIDE », « EXPIRÉE » ou « SUSPENDUE ». Cette page ne montre ni la date de naissance, ni le sexe, ni l'e-mail ; le code du QR est secret (impossible à deviner à partir du numéro de licence).

**Modification par l'administrateur** : carte « Modifier une licence (carte) » sous le registre : prénom, nom, date de naissance, sexe, nationalité, équipe, poste, saison, dates d'émission et d'expiration, case « Licence active » (décochée = suspendue). La photo se change dans « Changer la photo d'un licencié ».

À faire :
1. Supabase > SQL Editor : coller `schema_carte_licence.sql` > Run.
2. Envoyer sur GitHub (à la racine) : `index.html`, `carte.js`, `licence.html` (le logo est maintenant intégré dans `carte.js`).
3. Ouvrir la page des licences, cliquer une licence, compléter ses informations (naissance, sexe, nationalité), puis scanner le QR code avec un téléphone pour vérifier.

## Étape 52 — Direct vidéo dans l'onglet « En direct »

L'administrateur lance un direct YouTube ou Facebook ; il s'affiche dans l'onglet En direct pour tous les membres connectés. La vidéo n'est jamais envoyée ni stockée sur le site ou dans la base : elle reste chez YouTube / Facebook. Seul le lien est gardé le temps du direct, puis effacé.

1. Supabase > SQL Editor : coller `schema_live.sql` > Run.
2. Envoyer `index.html` sur GitHub.
3. Pour diffuser : lancez le direct dans l'application YouTube (+ > Passer en direct) ou Facebook (Live), copiez le lien du direct, ouvrez le site > En direct > « Lancer un direct vidéo », collez le lien, « Lancer le direct sur le site ».
4. À la fin : « Terminer le direct » (deux clics), puis les boutons de partage apparaissent (partage de l'iPhone pour Instagram/TikTok/WhatsApp, Facebook, X, copier le lien). Pensez aussi à arrêter le direct dans YouTube ou Facebook.

Notes : TikTok Live ne peut pas être affiché sur un site ; l'onglet En direct reste réservé aux membres connectés comme avant.

## Étape 53 — Mode clair et mode sombre

Un bouton soleil / lune dans l'en-tête (à côté du bouton Menu) bascule entre le mode sombre (l'apparence actuelle, par défaut) et le mode clair. Le choix est gardé sur l'appareil. Le mode clair reprend les couleurs du logo : bleu marine (en-tête, bandeaux, pied de page) et or (boutons, accents), sur fond blanc bleuté.

À faire : envoyer `index.html` sur GitHub.

Note : les pages séparées (adhesion.html, affiliation.html, licence.html, pages des créateurs) restent pour l'instant en mode sombre.

## Étape 54 — Mode clair / sombre sur Adhésion, Affiliation et Licence
Fichiers à envoyer à la racine du dépôt GitHub (remplacer les anciens) : `adhesion.html`, `affiliation.html`, `licence.html`.
Le bouton soleil/lune est en haut à droite ; le choix est mémorisé (même réglage que le site principal). Aucune étape Supabase.

## Étape 55 — Légalité et accessibilité
Nouveaux fichiers à envoyer à la racine GitHub : `mentions-legales.html`, `confidentialite.html`, `conditions.html`, `accessibilite.html`.
À remplacer : `index.html`, `adhesion.html`, `affiliation.html`, `licence.html`, `reglement.html`, `sport.html`, `createurs.html`, `reagan-luboya-yabamba.html`, `sayrus-emmanuel-mbole-mayembe.html`, `sitemap.xml`.
Ouvrir `mentions-legales.html` : remplir les 5 passages surlignés en jaune « À compléter » (statut, siège, enregistrement, représentant légal, région Supabase), puis faire relire les 3 textes juridiques par un juriste congolais.
Aucune étape Supabase.

## Étape 56 — Performance, parcours, sauvegarde
Fichiers à remplacer à la racine GitHub : `index.html` (360 Ko au lieu de 633 Ko : deux images intégrées remplacées par `terrain-schema.jpg` et `terrain-pelouse.jpg`, déjà présentes ; chargement différé des images ; bloc « Que voulez-vous faire ? » ; bouton de sauvegarde dans le Tableau de bord) et `sw.js` (version 2 : images en cache, pages lisibles hors connexion).
Aucune étape Supabase. Sauvegarde : Tableau de bord > « Télécharger la sauvegarde », une fois par semaine.

## Étape 57 — Notifications WhatsApp (fonctionnalité 2)
Fichier à remplacer à la racine GitHub : `index.html`. Aucune étape Supabase.
Boutons WhatsApp (administrateur seulement), message déjà écrit, numéros congolais normalisés (0812345678 → +243812345678) :
- Adhésions : accusé de réception ou suite donnée.
- Billetterie : rappel de paiement (commandes en attente) et confirmation des billets (10 dernières commandes confirmées).
- Licences : carte « Modifier une licence » > numéro du titulaire > envoi du lien de vérification.
- Événements : rappel à envoyer à un groupe ou un contact.
Envoi semi-automatique : l'administrateur touche « Envoyer » dans WhatsApp. L'envoi 100 % automatique exige un compte WhatsApp Business API (Meta, payant), non pris en charge ici.

## Étape 58 — Calendrier et résultats en direct (fonctionnalité 3)
1. Supabase > SQL Editor : exécuter `schema_calendrier.sql` (ajoute heure et lieu aux matchs ; relançable sans risque).
2. GitHub : remplacer `index.html`.
Dans Compétitions : bloc « Prochains matchs » (badges Aujourd'hui / Demain / Dans N jours / EN DIRECT, lieu, score provisoire) et « Derniers résultats officiels ». Le classement se recalcule seul. Les visiteurs voient les changements sans recharger (vérification toutes les 30 s, bouton « Actualiser »). L'administrateur règle date, heure et lieu dans le tableau.
Sans l'étape 1, le site fonctionne comme avant (la date seule est enregistrée) et prévient l'administrateur.

## Étape 59 — Pages publiques de joueurs et d'équipes (fonctionnalité 4)
1. Supabase > SQL Editor : exécuter `schema_profils_publics.sql` (relançable sans risque).
2. GitHub, nouveaux fichiers : `joueur.html`, `equipe.html`. À remplacer : `index.html`, `confidentialite.html` (mention du profil public).
Fonctionnement :
- Le profil public est désactivé par défaut. Joueur majeur : il l'active lui-même (Mon profil joueur). Mineur ou à la place du joueur : l'administrateur l'active (carte « Modifier une licence ») après accord écrit du joueur ou du parent/tuteur.
- Page `joueur.html?c=CODE` : nom, poste, club, nationalité, saison, photo, points, passes décisives, matchs, détail par compétition. Jamais l'âge, le sexe, la taille, le poids, les coordonnées ni le numéro de licence.
- Page `equipe.html?n=NOM` : bilan des matchs officialisés, joueurs à profil public. Les noms d'équipes des « Prochains matchs » y mènent.
- Partage : bouton Partager (téléphone), WhatsApp, Facebook, copier le lien. Retrait : un clic (« Retirer le profil public ») ou par e-mail.
- Limite : sur Facebook/WhatsApp, l'aperçu du lien affiche le titre générique du site (site statique : l'aperçu ne peut pas contenir le nom du joueur).
