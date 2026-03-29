

# Amélioration du module Contrat — Disclaimer + Design

## Objectif
1. Renforcer le disclaimer légal (Partnery = outil de simplification, pas de responsabilité juridique)
2. Améliorer le design global de la page contrat

## Changements prévus

### 1. Refonte du ContractDisclaimer
- Remplacer la petite alerte actuelle par un encart plus visible et structuré avec une icône `ShieldAlert`
- Texte clair en 3 points : (1) outil de simplification administrative, (2) aucune responsabilité sur le contenu/exécution, (3) ne constitue pas un conseil juridique
- Design : fond avec bordure colorée, texte lisible, icône proéminente

### 2. Amélioration du header de la page ContractDetail
- Ajouter un gradient subtil en background sur le header
- Badge de statut plus visible avec des couleurs plus marquées
- Meilleur espacement et hiérarchie visuelle

### 3. Refonte des ContractSectionCard
- Headers de section avec icônes plus grandes et un label stylisé (lettres A-E en badge coloré)
- Meilleur contraste entre les sections éditables et verrouillées
- Bordures et ombres plus raffinées

### 4. Amélioration de la section financière
- Rendre le récapitulatif financier plus visuel avec un fond gradient et une mise en avant du net créateur
- Séparateurs plus nets

### 5. Refonte de la section signatures
- Boîtes de signature avec un design plus premium (gradient, icônes, bordures stylisées)
- État "signé" plus célébratoire (vert avec coche animée)
- État "en attente" plus clair

### 6. Disclaimer dans le dialog de création aussi
- Ajouter une ligne de disclaimer dans `CreateContractDialog` avant le bouton de création

## Fichiers modifiés
- `src/components/contracts/ContractDisclaimer.tsx` — refonte complète
- `src/pages/ContractDetail.tsx` — améliorations header + layout
- `src/components/contracts/ContractSectionCard.tsx` — design amélioré des headers
- `src/components/contracts/ContractSignatureSection.tsx` — design premium
- `src/components/contracts/ContractFinancialSection.tsx` — récapitulatif visuel
- `src/components/contracts/CreateContractDialog.tsx` — ajout disclaimer

