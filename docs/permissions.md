# Permissions

## Roles principaux

| Role             | Portee                             |
| ---------------- | ---------------------------------- |
| President        | Vue globale association            |
| Tresorier        | Budget, comptes, justificatifs     |
| Vice tresorier   | Budget, comptes, justificatifs     |
| Secretaire       | Membres, evenements, administratif |
| Responsable pole | Membres et evenements de son pole  |
| Membre           | Participation et inscriptions      |

## Regles membres

- Un membre a un seul role.
- Un membre peut appartenir a plusieurs poles.
- Un membre hors bureau doit appartenir a au moins un pole.
- Les presidents, tresoriers, vice-tresoriers et secretaires ne sont pas rattaches a un pole.
- Chaque pole a au maximum deux responsables.
- La suppression fonctionnelle d'un membre correspond a une desactivation.
- Les anciens membres gardent leur acces.
- Les membres inactifs ne peuvent pas s'inscrire aux evenements.

## Matrice initiale

| Action                    | Bureau          | Tresorier       | Responsable pole   | Membre           |
| ------------------------- | --------------- | --------------- | ------------------ | ---------------- |
| Gerer membres             | oui             | oui             | pole uniquement    | profil seulement |
| Gerer budget global       | oui             | oui             | non                | non              |
| Gerer evenement interne   | oui             | non             | pole interne       | non              |
| Gerer evenement externe   | oui             | non             | pole externe       | non              |
| Gerer communication       | oui             | non             | pole communication | non              |
| S'inscrire a un evenement | oui             | oui             | oui                | oui              |
| S'inscrire comme staff    | selon evenement | selon evenement | selon evenement    | selon evenement  |
| Voir justificatifs budget | oui             | oui             | non                | non              |

## Regle serveur

Chaque page protegee, route handler, action serveur et integration externe doit
verifier les permissions avant tout acces aux donnees.
