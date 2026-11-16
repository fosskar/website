---
title: nixfiles
description: personal nixos infrastructure managed with clan-core
repo: https://github.com/fosskar/nixfiles
tags: [nixos, clan-core, flake-parts, home-manager]
order: 0
---

Aspect-oriented NixOS configuration for a fleet of machines: workstations, a
NAS, a remote Nix builder, a VPS, an aarch64 Home Assistant Green, and the
OpenWrt router and access points. Feature modules export reusable aspects through `flake.modules.*`,
composed into concrete systems by clan roles and machine imports.
