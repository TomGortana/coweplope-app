-- ============================================================
-- Coweplope Organizer — Schéma Supabase
--
-- Ce fichier est un JOURNAL CUMULATIF de tout ce qui a été exécuté
-- sur la base Supabase de prod, pas un script à rejouer en entier.
--
-- Règles à suivre à chaque évolution du schéma (nouvelle table,
-- nouvelle colonne, etc.) :
--   1. Ajoute le nouveau bloc SQL (CREATE TABLE / ALTER TABLE / ...)
--      TOUT EN BAS de ce fichier, sous "AJOUTS", avec un commentaire
--      de date.
--   2. Dans Supabase → SQL Editor, sélectionne et exécute
--      UNIQUEMENT ce nouveau bloc — jamais tout le fichier depuis le
--      début (les CREATE TABLE / INSERT déjà joués plus bas
--      échoueraient ou créeraient des doublons).
--   3. Si c'est une nouvelle table : pense à activer RLS + policy
--      "allow all" (même schéma que les tables existantes), et à la
--      cocher dans Data API → Settings → Exposed tables.
--   4. Préfère `create table if not exists` pour les nouvelles tables
--      : ça rend le bloc inoffensif si jamais tu le relances par
--      erreur.
--
-- Tout ce qui suit (jusqu'à la section AJOUTS) a déjà été exécuté
-- sur la base de prod — colle ce fichier ENTIER uniquement pour
-- initialiser un projet Supabase tout neuf, sinon vas voir GUIDE_MISE_EN_PLACE.md.
-- ============================================================

-- Extension pour les UUID
create extension if not exists "pgcrypto";

-- ---------- MEMBERS ----------
-- Les membres du groupe d'amis (pas de vraie authentification,
-- juste une liste de profils partagés — voir la note sécurité
-- dans le guide de mise en place)
create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_emoji text default '🙂',
  color text default '#6366f1',
  created_at timestamptz default now()
);

-- ---------- WEEKENDS (éditions) ----------
create table weekends (
  id uuid primary key default gen_random_uuid(),
  name text not null,               -- ex: "Coweplope - Novembre 2026"
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz default now()
);

-- ---------- LOGEMENTS ----------
create table lodging_proposals (
  id uuid primary key default gen_random_uuid(),
  weekend_id uuid not null references weekends(id) on delete cascade,
  title text not null,
  url text,
  price numeric,
  comment text,
  status text not null default 'proposed' check (status in ('proposed', 'validated', 'rejected')),
  created_by uuid references members(id),
  created_at timestamptz default now()
);

create table lodging_votes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references lodging_proposals(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  vote_type text not null check (vote_type in ('heart', 'thumbs_up')),
  created_at timestamptz default now(),
  unique (proposal_id, member_id)   -- un seul vote par membre par proposition
);

create table lodging_comments (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references lodging_proposals(id) on delete cascade,
  member_id uuid references members(id),
  content text not null,
  created_at timestamptz default now()
);

-- ---------- AGENDA ----------
create table agenda_events (
  id uuid primary key default gen_random_uuid(),
  weekend_id uuid not null references weekends(id) on delete cascade,
  day text not null check (day in ('ven', 'sam', 'dim')),
  start_time time,
  end_time time,
  title text not null,
  responsible_id uuid references members(id),
  created_at timestamptz default now()
);

-- ---------- COURSES ----------
create table shopping_items (
  id uuid primary key default gen_random_uuid(),
  weekend_id uuid not null references weekends(id) on delete cascade,
  label text not null,
  bought boolean not null default false,
  assigned_to uuid references members(id),
  created_by uuid references members(id),
  created_at timestamptz default now()
);

-- ---------- POKER ----------
create table poker_games (
  id uuid primary key default gen_random_uuid(),
  weekend_id uuid not null references weekends(id) on delete cascade,
  game_date date not null,
  variant text not null,
  buy_in numeric not null default 0,
  created_at timestamptz default now()
);

create table poker_results (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references poker_games(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  net_result numeric not null default 0,   -- positif = gain, négatif = perte
  unique (game_id, member_id)
);

-- ---------- TRICOUNT ----------
create table tricount_links (
  id uuid primary key default gen_random_uuid(),
  weekend_id uuid not null unique references weekends(id) on delete cascade,
  url text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- RLS (Row Level Security)
-- Comme il n'y a pas de vraie authentification (juste un
-- sélecteur de profil côté client), on ouvre l'accès en lecture
-- et écriture à toute personne qui a le lien de l'app + la clé
-- anonyme. Le vrai "verrou" est que ni le lien ni la clé ne
-- sont partagés publiquement. Voir le guide pour les limites de
-- cette approche.
-- ============================================================

alter table members enable row level security;
alter table weekends enable row level security;
alter table lodging_proposals enable row level security;
alter table lodging_votes enable row level security;
alter table lodging_comments enable row level security;
alter table agenda_events enable row level security;
alter table shopping_items enable row level security;
alter table poker_games enable row level security;
alter table poker_results enable row level security;
alter table tricount_links enable row level security;

create policy "allow all - members" on members for all using (true) with check (true);
create policy "allow all - weekends" on weekends for all using (true) with check (true);
create policy "allow all - lodging_proposals" on lodging_proposals for all using (true) with check (true);
create policy "allow all - lodging_votes" on lodging_votes for all using (true) with check (true);
create policy "allow all - lodging_comments" on lodging_comments for all using (true) with check (true);
create policy "allow all - agenda_events" on agenda_events for all using (true) with check (true);
create policy "allow all - shopping_items" on shopping_items for all using (true) with check (true);
create policy "allow all - poker_games" on poker_games for all using (true) with check (true);
create policy "allow all - poker_results" on poker_results for all using (true) with check (true);
create policy "allow all - tricount_links" on tricount_links for all using (true) with check (true);

-- ============================================================
-- Données de test
-- ============================================================

-- Membres
insert into members (name, avatar_emoji, color) values
  ('Thomas', '🎯', '#6366f1'),
  ('Julie', '🌸', '#ec4899'),
  ('Lucas', '🃏', '#f59e0b'),
  ('Amandine', '🎨', '#10b981');

-- Éditions
insert into weekends (name, start_date, end_date, status) values
  ('Coweplope - Novembre 2026', '2026-11-13', '2026-11-15', 'active'),
  ('Coweplope - Mai 2026', '2026-05-08', '2026-05-10', 'archived');

-- Logements (édition active)
insert into lodging_proposals (weekend_id, title, url, price, comment, status, created_by)
select id, 'Chalet Les Sapins', 'https://airbnb.fr/xxx', 450, 'Piscine intérieure, 8 places', 'proposed',
  (select id from members where name = 'Thomas')
from weekends where name = 'Coweplope - Novembre 2026';

insert into lodging_proposals (weekend_id, title, url, price, comment, status, created_by)
select id, 'Maison du Lac', 'https://booking.com/yyy', 380, 'Vue lac, cheminée', 'proposed',
  (select id from members where name = 'Julie')
from weekends where name = 'Coweplope - Novembre 2026';

insert into lodging_proposals (weekend_id, title, url, price, comment, status, created_by)
select id, 'Gîte de la Forêt', 'https://airbnb.fr/zzz', 320, 'Plus isolé mais moins cher', 'proposed',
  (select id from members where name = 'Lucas')
from weekends where name = 'Coweplope - Novembre 2026';

-- Logement validé (édition archivée)
insert into lodging_proposals (weekend_id, title, url, price, comment, status, created_by)
select id, 'Villa Bord de Mer', 'https://airbnb.fr/old', 500, 'Le logement retenu en mai', 'validated',
  (select id from members where name = 'Amandine')
from weekends where name = 'Coweplope - Mai 2026';

-- Courses (édition active)
insert into shopping_items (weekend_id, label, bought, assigned_to, created_by)
select id, 'Apéro (chips, saucisson)', false, (select id from members where name = 'Lucas'), (select id from members where name = 'Thomas')
from weekends where name = 'Coweplope - Novembre 2026';

insert into shopping_items (weekend_id, label, bought, created_by)
select id, 'Café / thé', true, (select id from members where name = 'Julie')
from weekends where name = 'Coweplope - Novembre 2026';

-- Agenda (édition active)
insert into agenda_events (weekend_id, day, start_time, end_time, title, responsible_id)
select id, 'ven', '19:00', '21:00', 'Arrivée + installation', (select id from members where name = 'Thomas')
from weekends where name = 'Coweplope - Novembre 2026';

insert into agenda_events (weekend_id, day, start_time, end_time, title, responsible_id)
select id, 'sam', '10:00', '12:00', 'Randonnée', (select id from members where name = 'Amandine')
from weekends where name = 'Coweplope - Novembre 2026';

-- Tricount (édition active)
insert into tricount_links (weekend_id, url)
select id, 'https://tricount.com/xxxxx'
from weekends where name = 'Coweplope - Novembre 2026';

-- Poker (édition archivée, 2 parties terminées)
insert into poker_games (weekend_id, game_date, variant, buy_in)
select id, '2026-05-09', 'Texas Hold''em', 10
from weekends where name = 'Coweplope - Mai 2026';

insert into poker_games (weekend_id, game_date, variant, buy_in)
select id, '2026-05-10', 'Texas Hold''em', 15
from weekends where name = 'Coweplope - Mai 2026';

-- Résultats partie 1
insert into poker_results (game_id, member_id, net_result)
select g.id, m.id, v.net from
  (select id from poker_games where game_date = '2026-05-09') g,
  (values ('Thomas', 25), ('Julie', -5), ('Lucas', -15), ('Amandine', -5)) as v(name, net)
join members m on m.name = v.name;

-- Résultats partie 2
insert into poker_results (game_id, member_id, net_result)
select g.id, m.id, v.net from
  (select id from poker_games where game_date = '2026-05-10') g,
  (values ('Thomas', 10), ('Julie', 5), ('Lucas', -20), ('Amandine', 5)) as v(name, net)
join members m on m.name = v.name;

-- ============================================================
-- AJOUTS
-- Nouveaux blocs SQL au fil des évolutions du schéma. Chaque bloc
-- ci-dessous a déjà été exécuté sur la base de prod (sinon il ne
-- devrait pas être ici, mais en attente de review). Ajoute les
-- tiens à la suite, avec la date.
-- ============================================================

-- 2026-09-20 : présence des membres par week-end.
-- Un membre est considéré PRÉSENT par défaut sur une édition ; une ligne
-- ici ne représente que les ABSENCES explicites (pas besoin de lister
-- tout le monde à chaque fois).
create table if not exists weekend_absences (
  id uuid primary key default gen_random_uuid(),
  weekend_id uuid not null references weekends(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz default now(),
  unique (weekend_id, member_id)
);

alter table weekend_absences enable row level security;
create policy "allow all - weekend_absences" on weekend_absences for all using (true) with check (true);
