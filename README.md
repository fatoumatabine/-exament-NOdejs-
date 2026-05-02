# API RESTful de Gestion des Approvisionnements

API Node.js/Express pour gerer les fournisseurs, produits et approvisionnements avec SQLite, Prisma, JWT, Cloudinary et Swagger.

## Stack

- Node.js + Express
- SQLite + Prisma
- JWT pour l'authentification
- Cloudinary + Multer pour l'upload d'images
- Swagger UI pour la documentation

## Prerequis

- Node.js 18+
- Un compte Cloudinary

## Installation

1. Installer les dependances :

```bash
npm install
```

2. Configurer les variables d'environnement :

```bash
cp .env.example .env
```

3. Renseigner `DATABASE_URL`, `JWT_SECRET` et les variables Cloudinary dans `.env`.

4. Generer le client Prisma et creer la base SQLite locale :

```bash
npm run prisma:generate
npm run prisma:push
```

5. Demarrer le serveur :

```bash
npm run dev
```

## Routes principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `CRUD /api/fournisseurs`
- `CRUD /api/produits`
- `PATCH /api/produits/:id/increment`
- `PATCH /api/produits/:id/decrement`
- `CRUD /api/approvisionnements`

## Swagger

La documentation interactive est disponible sur :

```bash
/api-docs
```

## Regles metier couvertes

- Toutes les routes metier sont protegees par JWT.
- Le stock d'un produit ne peut jamais devenir negatif.
- Lorsqu'un approvisionnement est cree, le stock du produit est automatiquement incremente dans la meme transaction.
- La modification ou la suppression d'un approvisionnement reajuste aussi le stock pour garder la coherence.
- L'image d'un produit est envoyee en `multipart/form-data`, stockee sur Cloudinary puis enregistree en base.
# -exament-NOdejs-
