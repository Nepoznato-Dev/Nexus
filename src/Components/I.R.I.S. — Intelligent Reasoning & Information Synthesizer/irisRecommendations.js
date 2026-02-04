/**
 * irisRecommendations.js - IRIS Shader/Resource Pack Recommendations
 */

const SHADER_RECOMMENDATIONS = [
  { id: 'complementary-reimagined', name: 'Complementary Reimagined', tier: 'balanced', note: 'Great visuals with solid FPS.' },
  { id: 'sildurs-vibrant', name: "Sildur's Vibrant", tier: 'visual', note: 'Bright, colorful, cinematic lighting.' },
  { id: 'bsl', name: 'BSL Shaders', tier: 'visual', note: 'Beautiful lighting and water.' },
  { id: 'makeup-ultra-fast', name: 'MakeUp - Ultra Fast', tier: 'performance', note: 'Best FPS for low-end PCs.' }
];

const RESOURCE_PACK_RECOMMENDATIONS = [
  { id: 'faithful-32x', name: 'Faithful 32x', tier: 'balanced', note: 'Vanilla+ with crisp textures.' },
  { id: 'vanillatweaks', name: 'VanillaTweaks', tier: 'performance', note: 'Minimal changes, optional tweaks.' },
  { id: 'better-default', name: 'Better Default', tier: 'visual', note: 'Stylized but still vanilla-friendly.' }
];

const IRIS_MOD_IDS = ['iris', 'iris-shaders'];

export function getRecommendations(modList = []) {
  const hasIris = modList.some((mod) =>
    IRIS_MOD_IDS.some((id) => mod.name?.toLowerCase().includes(id))
  );

  return {
    shaders: hasIris ? SHADER_RECOMMENDATIONS : SHADER_RECOMMENDATIONS.slice(0, 1),
    resourcePacks: RESOURCE_PACK_RECOMMENDATIONS,
    note: hasIris
      ? 'Iris detected: you can use any shader pack listed below.'
      : 'Install Iris for shader support. Recommended packs still work without shaders.'
  };
}

export default { getRecommendations };
