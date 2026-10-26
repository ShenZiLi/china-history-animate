// C is the invariant character design. Era adapters change the drawing medium,
// garment envelope and cloth accent, never the joint positions or face profile.
const eras = [
  ["rock", "#743d25", "hide", "waist", "crop"],
  ["pottery", "#392f29", "tunic", "waist", "crop"],
  ["bronze", "#334d43", "tunic", "waist", "tied"],
  ["silk", "#403e31", "long", "waist", "tied"],
  ["clay", "#554039", "tunic", "waist", "tied"],
  ["rubbing", "#ddd9c2", "tunic", "waist", "tied"],
  ["ink", "#303f35", "long", "waist", "tied"],
  ["mural", "#4f3930", "long", "waist", "tied"],
  ["ink", "#293a32", "tunic", "waist", "tied"],
  ["wash", "#35443d", "tunic", "waist", "tied"],
  ["dry-ink", "#3c4034", "long", "waist", "tied"],
  ["woodcut", "#30392e", "tunic", "waist", "tied"],
  ["scroll", "#4c3a2c", "tunic", "waist", "cap"],
  ["lithograph", "#34352f", "jacket", "waist", "cap"],
  ["film", "#303732", "jacket", "cuff", "crop"],
  ["print", "#364337", "jacket", "cuff", "crop"],
  ["pixel", "#344e42", "jacket", "cuff", "crop"],
  ["digital", "#304b40", "jacket", "cuff", "crop"],
  ["gold-line", "#514b39", "jacket", "cuff", "crop"],
  ["engraving", "#364746", "jacket", "cuff", "crop"],
  ["fiber", "#34513b", "tunic", "cuff", "crop"],
  ["engineering", "#c2d1cd", "jacket", "cuff", "crop"],
  ["stipple", "#d6cfb7", "jacket", "cuff", "crop"],
  ["renewal", "#304e3b", "tunic", "cuff", "crop"],
];

export function appearanceFor(scene) {
  const [medium, ink, garment, accent, hair] = eras[scene.index] ?? eras[8];
  const accentColor =
    scene.index === 5
      ? "#bab69e"
      : [13, 14].includes(scene.index)
        ? "#7a796d"
        : "#a35439";
  return {
    medium,
    ink,
    garment,
    accent,
    accentColor,
    hair,
    paper: scene.paper,
  };
}
