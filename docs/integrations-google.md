# Integrations Google

## Perimetre

Google Drive et Google Docs remplacent SharePoint pour ce projet.

- Google Drive stocke les dossiers, fichiers, photos, videos et archives.
- Google Docs gere les documents editables, modeles et comptes rendus.

## Dossiers connus

| Usage                | Folder ID                           |
| -------------------- | ----------------------------------- |
| Global               | `151NYdP3wsJM-flxlWVcFOJU7w1nQebE_` |
| Bureau               | `108VoWFGXKcy-T1VX5iwmPoivDC1k-pMK` |
| CA                   | `1EWnAp1HY2_LwD1vC-BLiXuP6lCmPysjF` |
| Pole externe         | `1bb3iG6X5gFRukCLYFbVb3llxD6TyEW7p` |
| Pole interne         | `16QH-EJ_bVfVJedm-WhBxlpdT2aPcbBSE` |
| Pole communication   | `1X8OvjnzNhwy5NXeZUu_WNLITkg8aTup4` |
| Medias photos videos | `1JUD8Zaew4BSvLSzRrXkj39ztoAjd0--2` |

## Regles

- Ne jamais stocker de secrets Google dans le repository.
- Les ecritures Drive ou Docs doivent etre explicitement demandees par un besoin metier.
- La suppression distante est interdite par defaut.
- L'application stocke des references vers les fichiers externes.
- Les droits d'acces doivent suivre les roles et poles du projet.
