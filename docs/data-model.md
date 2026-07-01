# Modele de donnees

## Entites initiales

- `Member` : membre de l'association, role unique, statut et informations de profil.
- `MemberPole` : rattachement multi-poles d'un membre.
- `PasswordResetToken` : jeton de reinitialisation de mot de passe.
- `Event` : evenement interne ou externe.
- `Activity` : activite rattachee a un evenement.
- `EventRegistration` : inscription d'un membre a un evenement.
- `StaffAssignment` : affectation staff sur evenement ou activite.
- `BudgetEntry` : recette, depense ou prevision.
- `CommunicationPost` : publication planifiee ou publiee.
- `InventoryItem` : materiel, stock et localisation.
- `ExternalFileReference` : reference vers Google Drive ou Google Docs.

## Regles structurantes

- Un evenement peut avoir plusieurs activites.
- Une activite appartient toujours a un evenement.
- Un membre peut appartenir a plusieurs poles.
- Un membre hors bureau doit appartenir a au moins un pole.
- Les roles bureau ne sont pas rattaches a un pole.
- La limite de deux responsables par pole est appliquee dans les services metier.
- Les budgets sont historises via des lignes de budget.
- Les medias et documents externes ne sont pas dupliques dans la base.
- Les montants sont stockes en centimes.
