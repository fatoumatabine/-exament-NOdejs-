const bearerSecurity = [{ bearerAuth: [] }];

const errorContent = {
  "application/json": {
    schema: { $ref: "#/components/schemas/ErrorResponse" }
  }
};

const successMessage = (message, schemaRef) => ({
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string", example: message },
    ...(schemaRef ? { data: { $ref: schemaRef } } : {})
  }
});

const singleDataResponse = (schemaRef) => ({
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    data: { $ref: schemaRef }
  }
});

const listDataResponse = (schemaRef, exampleCount) => ({
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    count: { type: "integer", example: exampleCount },
    data: {
      type: "array",
      items: { $ref: schemaRef }
    }
  }
});

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "API RESTful de Gestion des Approvisionnements",
    version: "1.0.0",
    description:
      "API Node.js/Express documentee avec Swagger pour gerer les fournisseurs, produits, approvisionnements, l'upload d'images Cloudinary et l'authentification JWT avec SQLite via Prisma."
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Serveur local"
    }
  ],
  tags: [
    { name: "Auth", description: "Inscription, connexion et recuperation du profil utilisateur" },
    { name: "Fournisseurs", description: "CRUD des fournisseurs" },
    { name: "Produits", description: "CRUD des produits et gestion du stock" },
    { name: "Approvisionnements", description: "CRUD des approvisionnements avec ajustement automatique du stock" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    parameters: {
      idParam: {
        name: "id",
        in: "path",
        required: true,
        description: "Identifiant de la ressource",
        schema: {
          type: "integer",
          example: 1
        }
      }
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: {
            type: "string",
            example: "Stock insuffisant. La quantite a decrementer depasse le stock disponible."
          }
        }
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          nom: { type: "string", example: "Admin Boutique" },
          email: { type: "string", format: "email", example: "admin@boutique.com" }
        }
      },
      UserProfile: {
        allOf: [
          { $ref: "#/components/schemas/User" },
          {
            type: "object",
            properties: {
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" }
            }
          }
        ]
      },
      RegisterRequest: {
        type: "object",
        required: ["nom", "email", "password"],
        properties: {
          nom: { type: "string", example: "Admin Boutique" },
          email: { type: "string", format: "email", example: "admin@boutique.com" },
          password: { type: "string", format: "password", example: "secret123" }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@boutique.com" },
          password: { type: "string", format: "password", example: "secret123" }
        }
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Authentification reussie." },
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.exemple.signature"
          },
          user: { $ref: "#/components/schemas/User" }
        }
      },
      MeResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          user: { $ref: "#/components/schemas/UserProfile" }
        }
      },
      FournisseurInput: {
        type: "object",
        required: ["nom", "telephone", "adresse"],
        properties: {
          nom: { type: "string", example: "Touba Distribution" },
          telephone: { type: "string", example: "+22236123456" },
          adresse: { type: "string", example: "Nouakchott, Tevragh Zeina" }
        }
      },
      Fournisseur: {
        allOf: [
          { $ref: "#/components/schemas/FournisseurInput" },
          {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" }
            }
          }
        ]
      },
      Produit: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          libelle: { type: "string", example: "Ordinateur Portable HP" },
          prixUnitaire: { type: "number", example: 350000 },
          quantiteEnStock: { type: "integer", example: 15 },
          imageUrl: {
            type: "string",
            example: "https://res.cloudinary.com/demo/image/upload/v1/gestion-approvisionnements/hp.jpg"
          },
          imagePublicId: {
            type: "string",
            example: "gestion-approvisionnements/hp"
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      ProduitCreateForm: {
        type: "object",
        required: ["libelle", "prixUnitaire", "image"],
        properties: {
          libelle: { type: "string", example: "Ordinateur Portable HP" },
          prixUnitaire: { type: "number", example: 350000 },
          quantiteEnStock: { type: "integer", example: 5 },
          image: { type: "string", format: "binary" }
        }
      },
      ProduitUpdateJson: {
        type: "object",
        properties: {
          libelle: { type: "string", example: "Ordinateur Portable Lenovo" },
          prixUnitaire: { type: "number", example: 390000 },
          quantiteEnStock: { type: "integer", example: 12 }
        }
      },
      ProduitUpdateForm: {
        type: "object",
        properties: {
          libelle: { type: "string", example: "Ordinateur Portable Lenovo" },
          prixUnitaire: { type: "number", example: 390000 },
          quantiteEnStock: { type: "integer", example: 12 },
          image: { type: "string", format: "binary" }
        }
      },
      StockUpdateInput: {
        type: "object",
        required: ["quantite"],
        properties: {
          quantite: { type: "integer", minimum: 1, example: 3 }
        }
      },
      ApprovisionnementInput: {
        type: "object",
        required: ["quantite", "fournisseurId", "produitId"],
        properties: {
          date: { type: "string", format: "date-time", example: "2026-05-02T08:30:00.000Z" },
          quantite: { type: "integer", minimum: 1, example: 10 },
          fournisseurId: { type: "integer", example: 1 },
          produitId: { type: "integer", example: 1 }
        }
      },
      Approvisionnement: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          date: { type: "string", format: "date-time" },
          quantite: { type: "integer", example: 10 },
          fournisseurId: { type: "integer", example: 1 },
          produitId: { type: "integer", example: 1 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      ApprovisionnementPopulated: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          date: { type: "string", format: "date-time" },
          quantite: { type: "integer", example: 10 },
          fournisseurId: { type: "integer", example: 1 },
          produitId: { type: "integer", example: 1 },
          fournisseur: { $ref: "#/components/schemas/Fournisseur" },
          produit: {
            type: "object",
            properties: {
              id: { type: "integer", example: 1 },
              libelle: { type: "string", example: "Ordinateur Portable HP" },
              prixUnitaire: { type: "number", example: 350000 },
              quantiteEnStock: { type: "integer", example: 15 },
              imageUrl: {
                type: "string",
                example: "https://res.cloudinary.com/demo/image/upload/v1/gestion-approvisionnements/hp.jpg"
              },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" }
            }
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      }
    }
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Creer un compte utilisateur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Compte cree avec succes",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" }
              }
            }
          },
          400: { description: "Donnees invalides", content: errorContent },
          409: { description: "Email deja utilise", content: errorContent }
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Se connecter et recuperer un JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Connexion reussie",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" }
              }
            }
          },
          400: { description: "Donnees invalides", content: errorContent },
          401: { description: "Identifiants invalides", content: errorContent }
        }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Recuperer le profil de l'utilisateur connecte",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Profil utilisateur",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeResponse" }
              }
            }
          },
          401: { description: "Token manquant ou invalide", content: errorContent }
        }
      }
    },
    "/api/fournisseurs": {
      post: {
        tags: ["Fournisseurs"],
        summary: "Creer un fournisseur",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FournisseurInput" }
            }
          }
        },
        responses: {
          201: {
            description: "Fournisseur cree",
            content: {
              "application/json": {
                schema: successMessage(
                  "Fournisseur cree avec succes.",
                  "#/components/schemas/Fournisseur"
                )
              }
            }
          },
          400: { description: "Donnees invalides", content: errorContent },
          401: { description: "Non autorise", content: errorContent }
        }
      },
      get: {
        tags: ["Fournisseurs"],
        summary: "Lister tous les fournisseurs",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Liste des fournisseurs",
            content: {
              "application/json": {
                schema: listDataResponse("#/components/schemas/Fournisseur", 2)
              }
            }
          },
          401: { description: "Non autorise", content: errorContent }
        }
      }
    },
    "/api/fournisseurs/{id}": {
      get: {
        tags: ["Fournisseurs"],
        summary: "Recuperer un fournisseur par son identifiant",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Fournisseur trouve",
            content: {
              "application/json": {
                schema: singleDataResponse("#/components/schemas/Fournisseur")
              }
            }
          },
          400: { description: "Identifiant invalide", content: errorContent },
          404: { description: "Fournisseur introuvable", content: errorContent }
        }
      },
      put: {
        tags: ["Fournisseurs"],
        summary: "Modifier un fournisseur",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FournisseurInput" }
            }
          }
        },
        responses: {
          200: {
            description: "Fournisseur modifie",
            content: {
              "application/json": {
                schema: successMessage(
                  "Fournisseur modifie avec succes.",
                  "#/components/schemas/Fournisseur"
                )
              }
            }
          },
          400: { description: "Requete invalide", content: errorContent },
          404: { description: "Fournisseur introuvable", content: errorContent }
        }
      },
      delete: {
        tags: ["Fournisseurs"],
        summary: "Supprimer un fournisseur",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Fournisseur supprime",
            content: {
              "application/json": {
                schema: successMessage("Fournisseur supprime avec succes.")
              }
            }
          },
          400: { description: "Suppression impossible", content: errorContent },
          404: { description: "Fournisseur introuvable", content: errorContent }
        }
      }
    },
    "/api/produits": {
      post: {
        tags: ["Produits"],
        summary: "Creer un produit avec upload d'image sur Cloudinary",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/ProduitCreateForm" }
            }
          }
        },
        responses: {
          201: {
            description: "Produit cree",
            content: {
              "application/json": {
                schema: successMessage(
                  "Produit cree avec succes.",
                  "#/components/schemas/Produit"
                )
              }
            }
          },
          400: { description: "Donnees invalides ou image absente", content: errorContent },
          401: { description: "Non autorise", content: errorContent }
        }
      },
      get: {
        tags: ["Produits"],
        summary: "Lister tous les produits",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Liste des produits",
            content: {
              "application/json": {
                schema: listDataResponse("#/components/schemas/Produit", 3)
              }
            }
          },
          401: { description: "Non autorise", content: errorContent }
        }
      }
    },
    "/api/produits/{id}": {
      get: {
        tags: ["Produits"],
        summary: "Recuperer un produit par son identifiant",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Produit trouve",
            content: {
              "application/json": {
                schema: singleDataResponse("#/components/schemas/Produit")
              }
            }
          },
          400: { description: "Identifiant invalide", content: errorContent },
          404: { description: "Produit introuvable", content: errorContent }
        }
      },
      put: {
        tags: ["Produits"],
        summary: "Modifier un produit avec image optionnelle",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProduitUpdateJson" }
            },
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/ProduitUpdateForm" }
            }
          }
        },
        responses: {
          200: {
            description: "Produit modifie",
            content: {
              "application/json": {
                schema: successMessage(
                  "Produit modifie avec succes.",
                  "#/components/schemas/Produit"
                )
              }
            }
          },
          400: { description: "Requete invalide", content: errorContent },
          404: { description: "Produit introuvable", content: errorContent }
        }
      },
      delete: {
        tags: ["Produits"],
        summary: "Supprimer un produit",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Produit supprime",
            content: {
              "application/json": {
                schema: successMessage("Produit supprime avec succes.")
              }
            }
          },
          400: { description: "Suppression impossible", content: errorContent },
          404: { description: "Produit introuvable", content: errorContent }
        }
      }
    },
    "/api/produits/{id}/increment": {
      patch: {
        tags: ["Produits"],
        summary: "Incrementer le stock d'un produit",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StockUpdateInput" }
            }
          }
        },
        responses: {
          200: {
            description: "Stock incremente",
            content: {
              "application/json": {
                schema: successMessage(
                  "Stock incremente avec succes.",
                  "#/components/schemas/Produit"
                )
              }
            }
          },
          400: { description: "Quantite invalide", content: errorContent },
          404: { description: "Produit introuvable", content: errorContent }
        }
      }
    },
    "/api/produits/{id}/decrement": {
      patch: {
        tags: ["Produits"],
        summary: "Decrementer le stock d'un produit",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StockUpdateInput" }
            }
          }
        },
        responses: {
          200: {
            description: "Stock decremente",
            content: {
              "application/json": {
                schema: successMessage(
                  "Stock decremente avec succes.",
                  "#/components/schemas/Produit"
                )
              }
            }
          },
          400: { description: "Stock insuffisant ou quantite invalide", content: errorContent },
          404: { description: "Produit introuvable", content: errorContent }
        }
      }
    },
    "/api/approvisionnements": {
      post: {
        tags: ["Approvisionnements"],
        summary: "Creer un approvisionnement et incrementer automatiquement le stock",
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApprovisionnementInput" }
            }
          }
        },
        responses: {
          201: {
            description: "Approvisionnement cree",
            content: {
              "application/json": {
                schema: successMessage(
                  "Approvisionnement cree avec succes.",
                  "#/components/schemas/ApprovisionnementPopulated"
                )
              }
            }
          },
          400: { description: "Donnees invalides", content: errorContent },
          404: { description: "Produit ou fournisseur introuvable", content: errorContent }
        }
      },
      get: {
        tags: ["Approvisionnements"],
        summary: "Lister tous les approvisionnements",
        security: bearerSecurity,
        responses: {
          200: {
            description: "Liste des approvisionnements",
            content: {
              "application/json": {
                schema: listDataResponse("#/components/schemas/ApprovisionnementPopulated", 4)
              }
            }
          },
          401: { description: "Non autorise", content: errorContent }
        }
      }
    },
    "/api/approvisionnements/{id}": {
      get: {
        tags: ["Approvisionnements"],
        summary: "Recuperer un approvisionnement par son identifiant",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Approvisionnement trouve",
            content: {
              "application/json": {
                schema: singleDataResponse("#/components/schemas/ApprovisionnementPopulated")
              }
            }
          },
          400: { description: "Identifiant invalide", content: errorContent },
          404: { description: "Approvisionnement introuvable", content: errorContent }
        }
      },
      put: {
        tags: ["Approvisionnements"],
        summary: "Modifier un approvisionnement et reajuster le stock",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApprovisionnementInput" }
            }
          }
        },
        responses: {
          200: {
            description: "Approvisionnement modifie",
            content: {
              "application/json": {
                schema: successMessage(
                  "Approvisionnement modifie avec succes.",
                  "#/components/schemas/ApprovisionnementPopulated"
                )
              }
            }
          },
          400: { description: "Requete invalide ou stock incoherent", content: errorContent },
          404: {
            description: "Approvisionnement, produit ou fournisseur introuvable",
            content: errorContent
          }
        }
      },
      delete: {
        tags: ["Approvisionnements"],
        summary: "Supprimer un approvisionnement et decrementer le stock correspondant",
        security: bearerSecurity,
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "Approvisionnement supprime",
            content: {
              "application/json": {
                schema: successMessage("Approvisionnement supprime avec succes.")
              }
            }
          },
          400: {
            description: "Suppression impossible car elle rendrait le stock negatif",
            content: errorContent
          },
          404: { description: "Approvisionnement introuvable", content: errorContent }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
