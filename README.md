# Coweplope Organizer

Application privée et collaborative pour organiser les week-ends Coweplope entre amis : logements, agenda, courses, dépenses (Tricount) et poker. Pensée mobile-first, installable comme une PWA.

**Stack :** React + Vite + Tailwind CSS + Lucide React + Supabase.

## Fonctionnalités

- Sélecteur d'édition de week-end (actif / archivé) dans le header
- Simulation de profil (pas de vraie authentification — voir ci-dessous)
- Logements : propositions, vote ❤️ / 👍, commentaires, validation
- Agenda vertical par jour (Ven / Sam / Dim)
- Liste de courses collaborative avec auto-assignation
- Widget dépenses : lien Tricount + soldes indicatifs
- Widget poker : parties, scores, classement général
- Notifications simulées avec bouton "Notifier" (lien WhatsApp `wa.me` pré-rempli)
- PWA installable (manifest + service worker)

## Démarrage rapide

```bash
npm install
npm run dev
```

Sans configuration, l'app tourne en **mode démo** avec des données simulées en mémoire (perdues au rechargement) — pratique pour tester l'interface immédiatement.

## Connecter Supabase (données persistantes et partagées)

1. Crée un projet sur [supabase.com](https://supabase.com)
2. Exécute `schema.sql` dans le SQL Editor du projet (ce fichier est un journal cumulatif — voir son en-tête pour la marche à suivre lors des évolutions futures du schéma)
3. Copie `.env.example` en `.env` et renseigne `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (Project Settings → Data API)
4. Dans **Data API → Settings**, vérifie que les 10 tables sont bien dans "Exposed tables"
5. Relance `npm run dev`

Voir `../GUIDE_MISE_EN_PLACE.md` pour le détail pas à pas et les limites connues (pas de vraie authentification, miroir Tricount indicatif, notifications WhatsApp manuelles).

## Build de production

```bash
npm run build
```

Génère le dossier `dist/`, déployable sur Vercel, Netlify ou tout hébergeur statique (penser à renseigner les variables d'environnement `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` côté hébergeur).

## Structure du projet

```
src/
  components/   un fichier par écran/widget (Dashboard, Lodging, Agenda, Shopping, Widgets...)
  lib/
    api.js            couche d'accès aux données (Supabase ou mock, transparente pour les composants)
    mockData.js        données simulées utilisées en mode démo
    supabaseClient.js  initialisation du client Supabase
    whatsapp.js         lien du groupe + génération des liens wa.me
```
