---
title: gitops
description: flux-managed gitops repository for a talos playground cluster
repo: https://github.com/fosskar/gitops
tags: [kubernetes, flux, talos, helm]
order: 5
---

Helm-first GitOps for the `kube-nixbox` Talos cluster: every application is a
Helm chart deployed through a Flux `HelmRelease`, and Flux `Kustomization`
objects only deliver them. Early and mostly empty for now.
