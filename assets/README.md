# Asset attribution

## Laser photograph

`actual-laser.jpg` shows an operating helium–neon laser with its cover removed and its glowing gas-discharge tube visible.

- Original title: **HeNe-Laser.JPG**
- Creator: **Muraer**
- Date: **12 December 2008**
- Source and license verification: [Wikimedia Commons file page](https://commons.wikimedia.org/wiki/File:HeNe-Laser.JPG), checked 13 November 2026.
- Original file: <https://upload.wikimedia.org/wikipedia/commons/1/1e/HeNe-Laser.JPG>
- License selected: [Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)](https://creativecommons.org/licenses/by-sa/3.0/). The photograph retains this license independently of the simulation code.
- Changes: resized from 2848 × 2136 to 1120 × 840 pixels and recompressed as JPEG; no cropping, recoloring, or generated content.
- Attribution is also displayed in the photograph dialog, with links to the source and license and a localized modification notice.

To reproduce the local asset from the original download, run inside this repository:

```sh
curl -fL https://upload.wikimedia.org/wikipedia/commons/1/1e/HeNe-Laser.JPG -o /tmp/HeNe-Laser.JPG
node --input-type=module -e 'import sharp from "sharp"; await sharp("/tmp/HeNe-Laser.JPG").resize({width:1120}).jpeg({quality:88,mozjpeg:true}).toFile("assets/actual-laser.jpg");'
```

The visible pink glow is the gas discharge inside the tube. The laser output appears as a small red spot beyond the tube.

## Upstream apparatus sprites

The PhET-authored lamp, mirror and atom sprites in `phet/` are retained as reference material and retain their upstream attribution in `phet/license.txt`. The live apparatus uses SVG geometry in `src/common/view/LaserArtwork.ts`. See [upstream provenance](../doc/upstream.md) and [the retained upstream license](../doc/licenses/PhET-GPL-2.txt).
