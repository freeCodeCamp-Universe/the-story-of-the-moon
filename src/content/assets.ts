import type { AssetCredit } from "@/types/content";

const assets = [
  {
    id: "moon-texture-2k",
    file: "moon/moon-2k.jpg",
    source:
      "NASA Goddard Scientific Visualization Studio (CGI Moon Kit, SVS 4720)",
    sourceUrl: "https://svs.gsfc.nasa.gov/4720/",
    originalImageUrl:
      "https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg",
    author: "Ernie Wright, NASA Goddard",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Moon texture: NASA Goddard / Ernie Wright, CGI Moon Kit (SVS 4720).",
    alt: "A natural-color, equirectangular map of the Moon for 3D rendering, created from Lunar Reconnaissance Orbiter camera and laser altimeter data.",
  },
  {
    id: "moon-texture-8k",
    file: "moon/moon-8k.jpg",
    source:
      "NASA Goddard Scientific Visualization Studio (CGI Moon Kit, SVS 4720)",
    sourceUrl: "https://svs.gsfc.nasa.gov/4720/",
    originalImageUrl:
      "https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_16bit_srgb_8k.tif",
    author: "Ernie Wright, NASA Goddard",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Moon texture: NASA Goddard / Ernie Wright, CGI Moon Kit (SVS 4720).",
    alt: "A natural-color, equirectangular map of the Moon for 3D rendering, created from Lunar Reconnaissance Orbiter camera and laser altimeter data.",
  },
  {
    id: "ch1-giant-impact",
    file: "ch1/giant-impact.jpg",
    source: "NASA / JPL-Caltech (Spitzer Space Telescope findings, HD 172555)",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Artist%27s_concept_of_collision_at_HD_172555.jpg",
    originalImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/4a/Artist%27s_concept_of_collision_at_HD_172555.jpg",
    author: "NASA / JPL-Caltech",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Artist's depiction of a collision between two planetary bodies. NASA / JPL-Caltech.",
    alt: "An artist's concept shows a celestial body about the size of our moon slamming at great speed into a body the size of Mercury, spraying glowing debris into space against a black background.",
  },
  {
    id: "eclipse-photo",
    file: "postcards/eclipse.jpg",
    source: "NASA Armstrong Flight Research Center",
    sourceUrl: "https://images.nasa.gov/details/AFRC2017-0233-005",
    originalImageUrl:
      "https://images-assets.nasa.gov/image/AFRC2017-0233-005/AFRC2017-0233-005~large.jpg",
    author: "Carla Thomas, NASA",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Total solar eclipse, Aug 21, 2017. NASA / Carla Thomas (AFRC2017-0233-005).",
    alt: "A total solar eclipse with the Sun's white corona visible around the dark Moon and red Bailey's beads shining along the lunar limb.",
  },
  {
    id: "apollo-17-moon-disc",
    file: "postcards/apollo-17-moon-disc.jpg",
    source: "NASA / Flickr NASA Image and Video Library",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Full_disc_of_the_moon_was_photographed_by_the_Apollo_17_crewmen.jpg",
    originalImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/07/Full_disc_of_the_moon_was_photographed_by_the_Apollo_17_crewmen.jpg",
    author: "NASA",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Full disc of the Moon, Apollo 17, December 19, 1972. NASA (AS17-152-23311).",
    alt: "Full disc of the Moon photographed by the Apollo 17 crew during transearth coast homeward, showing lunar maria including Serenitatis, Tranquillitatis, Nectaris, Fecunditatis, and Crisium.",
  },
  {
    id: "ch2-aristarchus-crater",
    file: "ch2/aristarchus.jpg",
    source: "NASA Science, Moon Craters",
    sourceUrl: "https://science.nasa.gov/moon/lunar-craters/",
    originalImageUrl:
      "https://science.nasa.gov/wp-content/uploads/2024/10/aristarchus-crater-lro-web-1.jpg",
    author: "NASA / GSFC / Arizona State University",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Aristarchus crater, Lunar Reconnaissance Orbiter. NASA / GSFC / Arizona State University.",
    alt: "View of Aristarchus crater from the Lunar Reconnaissance Orbiter, showing slumping terraced walls and peaks in its center. The terrain looks rubble-covered and pitted.",
  },
  {
    id: "ch2-mare-orientale",
    file: "ch2/orientale-artemis.jpg",
    source:
      "Wikimedia Commons file page for NASA Artemis II image of Mare Orientale",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Mare_Orientale_(Artemis_2).jpg",
    originalImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/10/Mare_Orientale_%28Artemis_2%29.jpg",
    author: "NASA",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Mare Orientale photographed by the Artemis II crew. NASA (art002e009277).",
    alt: "Mare Orientale fills the center of the Moon, with its dark lava-filled plain surrounded by broad concentric rings. The bright crater Byrgius appears to the left.",
  },
  {
    id: "ch2-hertzsprung-basin",
    file: "ch2/hertzsprung.jpg",
    source:
      "Wikimedia Commons file page for NASA LRO WAC image of Hertzsprung basin",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Hertzsprung_(LRO).png",
    originalImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/ed/Hertzsprung_%28LRO%29.png",
    author: "NASA / Lunar Reconnaissance Orbiter",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Hertzsprung basin, Lunar Reconnaissance Orbiter WAC mosaic. NASA.",
    alt: "A wide-angle Lunar Reconnaissance Orbiter mosaic of Hertzsprung basin on the Moon's far side, showing a broad circular basin ringed by lighter ridges and scattered impact craters.",
  },
  {
    id: "apollo-11-bootprint",
    file: "postcards/bootprint.jpg",
    source: "NASA, Apollo 11",
    sourceUrl: "https://images.nasa.gov/details/as11-40-5878",
    originalImageUrl:
      "https://images-assets.nasa.gov/image/as11-40-5878/as11-40-5878~large.jpg",
    author: "Buzz Aldrin, Apollo 11",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Bootprint in the lunar soil, Apollo 11, 20 July 1969. NASA / Buzz Aldrin (AS11-40-5878).",
    alt: "A close-up of an astronaut's bootprint pressed into the fine lunar soil during the Apollo 11 moonwalk.",
  },
  {
    id: "apollo-8-launch",
    file: "ch4/apollo-8.jpg",
    source: "NASA",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Apollo_8_liftoff.jpg",
    originalImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/57/Apollo_8_liftoff.jpg",
    author: "NASA",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/multimedia/guidelines/index.html",
    attributionText:
      "Apollo 8 liftoff from Kennedy Space Center, December 21, 1968. NASA (S69-15558).",
    alt: "Apollo 8's Saturn V rocket lifts off from Kennedy Space Center in a towering column of flame and smoke.",
  },
  {
    id: "apollo-8-earthrise",
    file: "postcards/earthrise.jpg",
    source: "NASA, Apollo 8",
    sourceUrl: "https://images.nasa.gov/details/as08-14-2383",
    originalImageUrl:
      "https://images-assets.nasa.gov/image/as08-14-2383/as08-14-2383~large.jpg",
    author: "William Anders, Apollo 8",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Earthrise, Apollo 8, Dec 24, 1968. NASA / William Anders (AS08-14-2383).",
    alt: "The rising Earth hangs above the gray lunar horizon in a telephoto view taken from Apollo 8.",
  },
  {
    id: "erlanger-crater",
    file: "moon/erlanger-crater.jpg",
    source:
      "Wikimedia Commons file page for NASA LROC NAC image of Erlanger crater",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Main_erlanger_crater_large.jpg",
    originalImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/87/Main_erlanger_crater_large.jpg",
    author: "NASA / GSFC / Arizona State University",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Erlanger crater at local sunrise, LROC NAC. NASA / GSFC / Arizona State University.",
    alt: "An overhead view of Erlanger crater near the lunar pole, with the rim lit by low sunlight while the interior stays mostly black in permanent shadow.",
  },
  {
    id: "tranquillitatis-pit",
    file: "moon/tranquillitatis-pit.jpg",
    source:
      "Wikimedia Commons file page for NASA LROC NAC image of the Mare Tranquillitatis pit",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Mare_Tranquillitatis_pit_crater.jpg",
    originalImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/17/Mare_Tranquillitatis_pit_crater.jpg",
    author: "NASA / GSFC / Arizona State University",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Mare Tranquillitatis pit, LROC NAC. NASA / GSFC / Arizona State University.",
    alt: "A near-vertical view of the Mare Tranquillitatis pit: a dark circular opening in the mare plain, with a smooth illuminated floor and scattered boulders inside.",
  },
  {
    id: "moon-near-side",
    file: "moon/lunar-near-side.jpg",
    source: "NASA Science resource page, Lunar Near Side",
    sourceUrl: "https://science.nasa.gov/resource/lunar-near-side-2/",
    originalImageUrl:
      "https://assets.science.nasa.gov/content/dam/science/psd/lunar-science/2023/08/133_lro_nearside.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg",
    author: "NASA / Goddard Space Flight Center / Arizona State University",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Near side of Earth's Moon. NASA / Goddard Space Flight Center / Arizona State University.",
    alt: "Near side of Earth's Moon as mapped from Lunar Reconnaissance Orbiter camera data, with broad dark maria spread across the face.",
  },
  {
    id: "moon-far-side",
    file: "moon/lunar-far-side.jpg",
    source: "NASA Science resource page, Lunar Far Side",
    sourceUrl: "https://science.nasa.gov/resource/lunar-far-side-2/",
    originalImageUrl:
      "https://assets.science.nasa.gov/content/dam/science/psd/lunar-science/2023/08/134_lro_farside.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg",
    author: "NASA / Goddard Space Flight Center / Arizona State University",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Far side of Earth's Moon. NASA / Goddard Space Flight Center / Arizona State University.",
    alt: "Far side of Earth's Moon as mapped from Lunar Reconnaissance Orbiter camera data, showing a brighter, densely cratered surface with almost no dark maria.",
  },
  {
    id: "apollo-9-lm",
    file: "ch4/apollo-9.jpg",
    source: "NASA, Apollo 9",
    sourceUrl: "https://images.nasa.gov/details/as09-20-3064",
    originalImageUrl:
      "https://images-assets.nasa.gov/image/as09-20-3064/as09-20-3064~large.jpg",
    author: "Apollo 9 crew",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "David Scott in the Command and Service Module hatch, March 1969. NASA (AS09-20-3064).",
    alt: "The docked Apollo 9 command and service module and lunar module are seen with Earth in the background, while David Scott stands in the open command-module hatch.",
  },
  {
    id: "apollo-10-lm",
    file: "ch4/apollo-10.jpg",
    source: "NASA, Apollo 10",
    sourceUrl: "https://images.nasa.gov/details/as10-27-3873",
    originalImageUrl:
      "https://images-assets.nasa.gov/image/as10-27-3873/as10-27-3873~large.jpg",
    author: "Apollo 10 crew",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "The Command and Service Module photographed from the Lunar Module in lunar orbit, May 1969. NASA (AS10-27-3873).",
    alt: "The Apollo 10 command and service module floats above the Moon, photographed from the lunar module after separation in lunar orbit.",
  },
  {
    id: "apollo-11-aldrin",
    file: "ch4/apollo-11.jpg",
    source: "NASA, Apollo 11",
    sourceUrl: "https://images.nasa.gov/details/as11-40-5903",
    originalImageUrl:
      "https://images-assets.nasa.gov/image/as11-40-5903/as11-40-5903~large.jpg",
    author: "Neil Armstrong, Apollo 11",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Buzz Aldrin on the Moon, July 20, 1969. NASA / Neil Armstrong (AS11-40-5903).",
    alt: "Buzz Aldrin walks on the lunar surface near a leg of the Apollo 11 lunar module, with Neil Armstrong reflected in his visor.",
  },
  {
    id: "apollo-12-bean",
    file: "ch4/apollo-12.jpg",
    source: "NASA, Apollo 12",
    sourceUrl: "https://images.nasa.gov/details/as12-49-7278",
    originalImageUrl:
      "https://images-assets.nasa.gov/image/as12-49-7278/as12-49-7278~large.jpg",
    author: "Charles Conrad, Apollo 12",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Alan Bean holding a lunar soil sample container, November 1969. NASA / Charles Conrad (AS12-49-7278).",
    alt: "Alan Bean holds a lunar soil sample container on the surface during Apollo 12, with Charles Conrad reflected in his helmet visor.",
  },
  {
    id: "apollo-13-sm",
    file: "ch4/apollo-13.jpg",
    source: "NASA, Apollo 13",
    sourceUrl: "https://images.nasa.gov/details/as13-59-8500",
    originalImageUrl:
      "https://images-assets.nasa.gov/image/as13-59-8500/as13-59-8500~large.jpg",
    author: "Apollo 13 crew",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Damaged Service Module photographed from the Lunar Module, April 1970. NASA (AS13-59-8500).",
    alt: "The damaged Apollo 13 service module after jettison, with an entire panel blown away and internal equipment exposed.",
  },
  {
    id: "apollo-14-shepard",
    file: "ch4/apollo-14.jpg",
    source: "NASA, Apollo 14",
    sourceUrl: "https://images.nasa.gov/details/as14-66-9306",
    originalImageUrl:
      "https://images-assets.nasa.gov/image/as14-66-9306/as14-66-9306~large.jpg",
    author: "Apollo 14 crew",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "The Lunar Module 'Antares' on the lunar surface, February 1971. NASA (AS14-66-9306).",
    alt: "A front view of Apollo 14's lunar module Antares on the Moon, with a bright circular lens flare and the slope of Cone Crater at far left.",
  },
  {
    id: "apollo-15-rover",
    file: "ch4/apollo-15.jpg",
    source: "NASA, Apollo 15",
    sourceUrl: "https://images.nasa.gov/details/as15-86-11603",
    originalImageUrl:
      "https://images-assets.nasa.gov/image/as15-86-11603/as15-86-11603~large.jpg",
    author: "Apollo 15 crew",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "James Irwin and the lunar rover at Hadley Rille, August 1971. NASA (AS15-86-11603).",
    alt: "James Irwin works beside the lunar rover at the Hadley-Apennine site, with the lunar module's shadow in the foreground and Mount Hadley behind him.",
  },
  {
    id: "apollo-16-young",
    file: "ch4/apollo-16.jpg",
    source: "NASA, Apollo 16",
    sourceUrl: "https://images.nasa.gov/details/as16-113-18339",
    originalImageUrl:
      "https://images-assets.nasa.gov/image/as16-113-18339/as16-113-18339~large.jpg",
    author: "Charles Duke, Apollo 16",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "John Young's jumping salute, April 1972. NASA / Charles Duke (AS16-113-18339).",
    alt: "John Young leaps from the lunar surface in salute beside the United States flag, with the lunar module Orion and rover nearby.",
  },
  {
    id: "apollo-17-schmitt",
    file: "ch4/apollo-17.jpg",
    source: "NASA, Apollo 17",
    sourceUrl: "https://images.nasa.gov/details/as17-140-21497",
    originalImageUrl:
      "https://images-assets.nasa.gov/image/as17-140-21497/as17-140-21497~large.jpg",
    author: "Apollo 17 crew",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Harrison Schmitt standing next to a split lunar boulder, December 1972. NASA (AS17-140-21497).",
    alt: "Harrison Schmitt stands beside a huge split lunar boulder at the Taurus-Littrow landing site during Apollo 17.",
  },
  {
    id: "artemis-ii-earthset",
    file: "ch4/artemis-ii-earthset.jpg",
    source: "NASA, Artemis II",
    sourceUrl: "https://www.nasa.gov/image-detail/art002e009288/",
    originalImageUrl:
      "https://www.nasa.gov/wp-content/uploads/2026/04/art002e009288orig.jpg",
    author: "NASA",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText: "Earthset, Artemis II, Apr 6, 2026. NASA (art002e009288).",
    alt: "Earth setting behind the Moon's horizon. Set against the blackness of space, the dark gray surface of the Moon arcs across the foreground. Beyond it, a blue-and-white crescent Earth fills the center of the image, with one tip disappearing beyond the lunar limb.",
  },
  {
    id: "artemis-ii-eclipse",
    file: "ch4/artemis-ii-eclipse.jpg",
    source: "NASA, Artemis II",
    sourceUrl: "https://images.nasa.gov/details/art002e016318",
    originalImageUrl:
      "https://images-assets.nasa.gov/image/art002e016318/art002e016318~orig.jpg",
    author: "NASA",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Solar eclipse captured from a camera mounted on the Orion spacecraft. Venus can be spotted on the left, and Saturn on the right of the Moon. NASA (art002e016318).",
    alt: "A solar eclipse seen from Orion during Artemis II, with a glow around the Moon and Venus to the left and Saturn to the right.",
  },
  {
    id: "ch5-anorthosite-15415",
    file: "ch5/anorthosite-15415.jpg",
    source: "NASA (S71-42951), via Wikimedia Commons",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Apollo_15_Genesis_Rock.jpg",
    originalImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/0d/Apollo_15_Genesis_Rock.jpg",
    author: "NASA",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Apollo 15 sample 15415, the Genesis Rock, an anorthosite from Spur Crater. NASA (S71-42951).",
    alt: "The Genesis Rock, a pale angular anorthosite with a dark dust-coated area along one side, and a scale block on the right.",
  },
  {
    id: "ch5-basalt-70017",
    file: "ch5/basalt-70017.jpg",
    source: "NASA Lunar Sample Curator (JSC), via Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Lunar_basalt_70017.jpg",
    originalImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2c/Lunar_basalt_70017.jpg",
    author: "NASA",
    license: "PD-USGov-NASA",
    licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    attributionText:
      "Apollo 17 sample 70017, a vesicular high-titanium mare basalt. NASA Lunar Sample Curator, JSC.",
    alt: "A dark lunar basalt sample from Apollo 17 with a rough, pitted surface, visible vesicles, and a small scale block at the lower right.",
  },
] as const satisfies readonly AssetCredit[];

export type AssetCreditId = (typeof assets)[number]["id"];

export default assets;
