/**
 * communityModPacks.js - Featured community mod packs (local-only)
 */

export const COMMUNITY_PACKS = [
  {
    id: 'student-boost',
    name: 'Student FPS Boost',
    author: 'Nexus Community',
    description: 'Fast and stable set for school laptops.',
    mods: ['sodium-fabric', 'lithium', 'starlight', 'ferrite-core', 'modernfix'],
    tags: ['performance', 'laptop']
  },
  {
    id: 'vanilla-plus-lite',
    name: 'Vanilla+ Lite',
    author: 'Nexus Community',
    description: 'Small QOL upgrades without heavy visuals.',
    mods: ['sodium-fabric', 'lithium', 'appleskin', 'jade', 'inventory-sorter'],
    tags: ['qol', 'balanced']
  },
  {
    id: 'chill-builds',
    name: 'Chill Builds',
    author: 'Nexus Community',
    description: 'Building-focused helpers with light performance boosts.',
    mods: ['sodium-fabric', 'lithium', 'litematica', 'xaeros-minimap'],
    tags: ['builders', 'qol']
  }
];

export default COMMUNITY_PACKS;
