export type OfficeMapPoint = {
  slug: string;
  canton: string;
  x: number;
  y: number;
  sourceName: string;
  precision: "office-address" | "postal-code";
};

export const officeMapPoints = [
  {
    "slug": "regionales-zivilstandsamt-aarau-aarau-ag",
    "canton": "AG",
    "x": 460.4,
    "y": 222.4,
    "sourceName": "Laurenzenvorstadt 1 5000 Aarau",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-baden-baden-ag",
    "canton": "AG",
    "x": 514.9,
    "y": 205.2,
    "sourceName": "Baden",
    "precision": "postal-code"
  },
  {
    "slug": "regionales-zivilstandsamt-bremgarten-bremgarten-ag-ag",
    "canton": "AG",
    "x": 525.8,
    "y": 231.6,
    "sourceName": "Rathausplatz 1 5620 Bremgarten AG",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-brugg-brugg-ag",
    "canton": "AG",
    "x": 496.1,
    "y": 202.2,
    "sourceName": "Untere Hofstatt 4 5200 Brugg AG",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-dietikon-zh-dietikon-ag",
    "canton": "AG",
    "x": 538,
    "y": 220.8,
    "sourceName": "Dietikon",
    "precision": "postal-code"
  },
  {
    "slug": "regionales-zivilstandsamt-laufenburg-laufenburg-ag",
    "canton": "AG",
    "x": 463.7,
    "y": 185.4,
    "sourceName": "Gerichtsgasse 80 5080 Laufenburg",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-lenzburg-lenzburg-ag",
    "canton": "AG",
    "x": 490,
    "y": 223.7,
    "sourceName": "Rathausgasse 1 5600 Lenzburg",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-leuggern-leuggern-ag",
    "canton": "AG",
    "x": 498.1,
    "y": 181.1,
    "sourceName": "Schulweg 1 5316 Leuggern",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-mellingen-mellingen-ag",
    "canton": "AG",
    "x": 511,
    "y": 217,
    "sourceName": "Kleine Kirchgasse 11 5507 Mellingen",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-menziken-burg-ag",
    "canton": "AG",
    "x": 489.6,
    "y": 257,
    "sourceName": "Hauptstrasse 80 5736 Burg AG",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-muri-muri-ag",
    "canton": "AG",
    "x": 525,
    "y": 248.6,
    "sourceName": "Seetalstrasse 6 5630 Muri AG",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-rheinfelden-rheinfelden-ag",
    "canton": "AG",
    "x": 404.8,
    "y": 186.7,
    "sourceName": "Marktgasse 16 4310 Rheinfelden",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-schoftland-schoftland-ag",
    "canton": "AG",
    "x": 461.4,
    "y": 242,
    "sourceName": "Bahnhofstrasse 5 5040 Schöftland",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-sins-sins-ag",
    "canton": "AG",
    "x": 537.4,
    "y": 266.4,
    "sourceName": "Kirchstrasse 14 5643 Sins",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-wettingen-wettingen-ag",
    "canton": "AG",
    "x": 523.6,
    "y": 207.1,
    "sourceName": "Wettingen",
    "precision": "postal-code"
  },
  {
    "slug": "regionales-zivilstandsamt-wohlen-wohlen-ag",
    "canton": "AG",
    "x": 511.6,
    "y": 231.9,
    "sourceName": "Zentralstrasse 20 5610 Wohlen AG",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-zofingen-zofingen-ag",
    "canton": "AG",
    "x": 438.2,
    "y": 245.5,
    "sourceName": "Kirchplatz 26 4800 Zofingen",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-zurzach-bad-zurzach-ag",
    "canton": "AG",
    "x": 515,
    "y": 179.6,
    "sourceName": "Hauptstrasse 50 5330 Bad Zurzach",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-appenzell-appenzell-ai",
    "canton": "AI",
    "x": 761.1,
    "y": 236.1,
    "sourceName": "Marktgasse 2 9050 Appenzell",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-hinterland-appenzell-ausserrhoden-herisau-ar",
    "canton": "AR",
    "x": 734.2,
    "y": 225.6,
    "sourceName": "Herisau",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-mittelland-appenzell-ausserrhoden-buhler-ar",
    "canton": "AR",
    "x": 765.1,
    "y": 225.6,
    "sourceName": "Bühler",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-vorderland-appenzell-ausserrhoden-rehetobel-ar",
    "canton": "AR",
    "x": 777.8,
    "y": 214.9,
    "sourceName": "Rehetobel",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-bern-mittelland-bern-be",
    "canton": "BE",
    "x": 326,
    "y": 320.7,
    "sourceName": "Laupenstrasse 18a 3008 Bern",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-berner-jura-courtelary-be",
    "canton": "BE",
    "x": 246.3,
    "y": 267.5,
    "sourceName": "Courtelary",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-emmental-langnau-i-e-be",
    "canton": "BE",
    "x": 403.2,
    "y": 323.5,
    "sourceName": "Langnau im Emmental",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-oberaargau-langenthal-be",
    "canton": "BE",
    "x": 404.6,
    "y": 262.8,
    "sourceName": "Melchnaustrasse 28 4900 Langenthal",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-oberland-ost-interlaken-be",
    "canton": "BE",
    "x": 420.5,
    "y": 378,
    "sourceName": "Schloss 8 3800 Interlaken",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-oberland-west-thun-be",
    "canton": "BE",
    "x": 367.7,
    "y": 362,
    "sourceName": "Scheibenstrasse 3 3600 Thun",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-seeland-biel-bienne-be",
    "canton": "BE",
    "x": 283.5,
    "y": 278.2,
    "sourceName": "Faubourg du Lac / Seevorstadt 105 2502 Biel/Bienne",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-basel-landschaft-arlesheim-bl",
    "canton": "BL",
    "x": 367,
    "y": 200.5,
    "sourceName": "Kirchgasse 5 4144 Arlesheim",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-basel-stadt-basel-bs",
    "canton": "BS",
    "x": 360.8,
    "y": 186.6,
    "sourceName": "Rittergasse 11 4051 Basel",
    "precision": "office-address"
  },
  {
    "slug": "office-de-l-etat-civil-de-la-broye-estavayer-le-lac-fr",
    "canton": "FR",
    "x": 198.8,
    "y": 342.2,
    "sourceName": "Estavayer-le-Lac",
    "precision": "postal-code"
  },
  {
    "slug": "office-de-l-etat-civil-de-la-glane-romont-fr",
    "canton": "FR",
    "x": 213.6,
    "y": 373.4,
    "sourceName": "Romont",
    "precision": "postal-code"
  },
  {
    "slug": "office-de-l-etat-civil-de-la-gruyere-bulle-fr",
    "canton": "FR",
    "x": 229.5,
    "y": 400.1,
    "sourceName": "Bulle",
    "precision": "postal-code"
  },
  {
    "slug": "office-de-l-etat-civil-de-la-sarine-fribourg-fr",
    "canton": "FR",
    "x": 266.7,
    "y": 352.2,
    "sourceName": "Fribourg",
    "precision": "postal-code"
  },
  {
    "slug": "office-de-l-etat-civil-de-la-singine-tafers-fr",
    "canton": "FR",
    "x": 277.4,
    "y": 350.8,
    "sourceName": "Tafers",
    "precision": "postal-code"
  },
  {
    "slug": "office-de-l-etat-civil-de-la-veveyse-chatel-st-denis-fr",
    "canton": "FR",
    "x": 217.5,
    "y": 411.9,
    "sourceName": "Châtel-St-Denis",
    "precision": "postal-code"
  },
  {
    "slug": "office-de-l-etat-civil-du-lac-morat-fr",
    "canton": "FR",
    "x": 250.2,
    "y": 327.9,
    "sourceName": "Greng",
    "precision": "postal-code"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-chene-bougeries-voirons-chene-bougeries-ge",
    "canton": "GE",
    "x": 52.5,
    "y": 484.7,
    "sourceName": "Chêne-Bougeries",
    "precision": "postal-code"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-cologny-campagne-et-rive-gauche-du-lac-vesenaz-ge",
    "canton": "GE",
    "x": 55.5,
    "y": 477,
    "sourceName": "Vésenaz",
    "precision": "postal-code"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-pregny-chambesy-rive-droite-du-lac-chambesy-ge",
    "canton": "GE",
    "x": 40.4,
    "y": 476.6,
    "sourceName": "Chambésy",
    "precision": "postal-code"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-de-bernex-bernex-ge",
    "canton": "GE",
    "x": 25.4,
    "y": 491.1,
    "sourceName": "Rue de Bernex 313 1233 Bernex",
    "precision": "office-address"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-de-chene-bourg-chene-bourg-ge",
    "canton": "GE",
    "x": 53.1,
    "y": 486.2,
    "sourceName": "Chêne-Bourg",
    "precision": "postal-code"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-de-lancy-grand-lancy-ge",
    "canton": "GE",
    "x": 35.7,
    "y": 490,
    "sourceName": "Grand-Lancy",
    "precision": "postal-code"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-de-meyrin-meyrin-ge",
    "canton": "GE",
    "x": 25.2,
    "y": 478.4,
    "sourceName": "Meyrin",
    "precision": "postal-code"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-chene-bougeries-voirons-chene-bougeries-ge-b4244918",
    "canton": "GE",
    "x": 52.5,
    "y": 484.7,
    "sourceName": "Chêne-Bougeries",
    "precision": "postal-code"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-cologny-campagne-et-rive-gauche-du-lac-vesenaz-ge-4160c25f",
    "canton": "GE",
    "x": 55.5,
    "y": 477,
    "sourceName": "Vésenaz",
    "precision": "postal-code"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-pregny-chambesy-rive-droite-du-lac-chambesy-ge-bb46004d",
    "canton": "GE",
    "x": 40.4,
    "y": 476.6,
    "sourceName": "Chambésy",
    "precision": "postal-code"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-de-bernex-bernex-ge-009d6565",
    "canton": "GE",
    "x": 24.2,
    "y": 490.9,
    "sourceName": "Bernex",
    "precision": "postal-code"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-de-chene-bourg-chene-bourg-ge-66f1e848",
    "canton": "GE",
    "x": 53.1,
    "y": 486.2,
    "sourceName": "Chêne-Bourg",
    "precision": "postal-code"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-de-lancy-grand-lancy-ge-46f3b13a",
    "canton": "GE",
    "x": 35.7,
    "y": 490,
    "sourceName": "Grand-Lancy",
    "precision": "postal-code"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-de-meyrin-meyrin-ge-21679e0e",
    "canton": "GE",
    "x": 25.2,
    "y": 478.4,
    "sourceName": "Meyrin",
    "precision": "postal-code"
  },
  {
    "slug": "office-de-l-etat-civil-de-carouge-carouge-ge",
    "canton": "GE",
    "x": 40.2,
    "y": 490,
    "sourceName": "Carouge",
    "precision": "postal-code"
  },
  {
    "slug": "office-de-l-etat-civil-de-carouge-carouge-ge-6f56b27b",
    "canton": "GE",
    "x": 40.2,
    "y": 490,
    "sourceName": "Carouge",
    "precision": "postal-code"
  },
  {
    "slug": "service-de-l-etat-civil-de-la-ville-de-geneve-geneve-ge",
    "canton": "GE",
    "x": 45.2,
    "y": 484.2,
    "sourceName": "Genève",
    "precision": "postal-code"
  },
  {
    "slug": "service-de-l-etat-civil-de-la-ville-de-geneve-geneve-ge-d35f7e7c",
    "canton": "GE",
    "x": 45.2,
    "y": 484.2,
    "sourceName": "Genève",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-glarus-glarus-gl",
    "canton": "GL",
    "x": 682.6,
    "y": 300.6,
    "sourceName": "Glarus",
    "precision": "postal-code"
  },
  {
    "slug": "ufficio-stato-civile-bernina-poschiavo-gr",
    "canton": "GR",
    "x": 896.8,
    "y": 454,
    "sourceName": "Poschiavo",
    "precision": "postal-code"
  },
  {
    "slug": "ufficio-stato-civile-regione-moesa-santa-maria-in-calanca-gr",
    "canton": "GR",
    "x": 702.5,
    "y": 468.6,
    "sourceName": "Sta. Maria in Calanca",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-albula-tiefencastel-gr",
    "canton": "GR",
    "x": 798.1,
    "y": 383.5,
    "sourceName": "Stradung 26 7450 Tiefencastel",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-imboden-domat-ems-gr",
    "canton": "GR",
    "x": 770.4,
    "y": 345.2,
    "sourceName": "Plaz 7 7013 Domat/Ems",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-inn-en-scuol-gr",
    "canton": "GR",
    "x": 963.5,
    "y": 368.1,
    "sourceName": "Scuol",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-landquart-landquart-gr",
    "canton": "GR",
    "x": 793.3,
    "y": 316.3,
    "sourceName": "Bahnhofplatz 2a 7302 Landquart",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-maloja-st-moritz-gr",
    "canton": "GR",
    "x": 855.9,
    "y": 419.8,
    "sourceName": "Via Maistra 12 7500 St. Moritz",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-plessur-chur-gr",
    "canton": "GR",
    "x": 788,
    "y": 342.3,
    "sourceName": "Klostergasse 11 7000 Chur",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-prattigau-davos-davos-platz-gr",
    "canton": "GR",
    "x": 852,
    "y": 354.7,
    "sourceName": "Berglistutz 8 7270 Davos Platz",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-surselva-ilanz-gr",
    "canton": "GR",
    "x": 716.6,
    "y": 358.9,
    "sourceName": "Glennerstrasse 22 7130 Ilanz",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-viamala-thusis-gr",
    "canton": "GR",
    "x": 767.8,
    "y": 376.4,
    "sourceName": "Marktwiesenweg # 7430 Thusis",
    "precision": "office-address"
  },
  {
    "slug": "office-de-l-etat-civil-du-jura-delemont-ju",
    "canton": "JU",
    "x": 308.7,
    "y": 227.7,
    "sourceName": "Rue du 24-Septembre 1 2800 Delémont",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-amt-willisau-willisau-lu",
    "canton": "LU",
    "x": 445.9,
    "y": 284.2,
    "sourceName": "Willisau",
    "precision": "postal-code"
  },
  {
    "slug": "regionales-zivilstandsamt-ebikon-ebikon-lu",
    "canton": "LU",
    "x": 525.9,
    "y": 291.3,
    "sourceName": "Ebikon",
    "precision": "postal-code"
  },
  {
    "slug": "regionales-zivilstandsamt-emmen-emmenbrucke-lu",
    "canton": "LU",
    "x": 491.7,
    "y": 280.6,
    "sourceName": "Emmenbrücke",
    "precision": "postal-code"
  },
  {
    "slug": "regionales-zivilstandsamt-hochdorf-hochdorf-lu",
    "canton": "LU",
    "x": 513.2,
    "y": 271.7,
    "sourceName": "Hochdorf",
    "precision": "postal-code"
  },
  {
    "slug": "regionales-zivilstandsamt-luzern-luzern-lu",
    "canton": "LU",
    "x": 517.8,
    "y": 296,
    "sourceName": "Luzern",
    "precision": "postal-code"
  },
  {
    "slug": "regionales-zivilstandsamt-oberer-sempachersee-sempach-lu",
    "canton": "LU",
    "x": 495.8,
    "y": 279.1,
    "sourceName": "Sempach",
    "precision": "postal-code"
  },
  {
    "slug": "regionales-zivilstandsamt-sursee-sursee-lu",
    "canton": "LU",
    "x": 473.5,
    "y": 270.3,
    "sourceName": "Sursee",
    "precision": "postal-code"
  },
  {
    "slug": "regionales-zivilstandsamt-wolhusen-wolhusen-lu",
    "canton": "LU",
    "x": 467,
    "y": 296.8,
    "sourceName": "Wolhusen",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-horw-horw-lu",
    "canton": "LU",
    "x": 519.4,
    "y": 306.1,
    "sourceName": "Horw",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-kriens-kriens-lu",
    "canton": "LU",
    "x": 506.7,
    "y": 313.7,
    "sourceName": "Kriens",
    "precision": "postal-code"
  },
  {
    "slug": "etat-civil-des-montagnes-neuchateloises-le-locle-ne",
    "canton": "NE",
    "x": 173.9,
    "y": 296.8,
    "sourceName": "Avenue de l'Hôtel-de-Ville 1 2400 Le Locle",
    "precision": "office-address"
  },
  {
    "slug": "office-de-l-etat-civil-de-boudry-boudry-ne",
    "canton": "NE",
    "x": 189.8,
    "y": 319.2,
    "sourceName": "Boudry",
    "precision": "postal-code"
  },
  {
    "slug": "office-de-l-etat-civil-de-l-arrondissement-de-neuchatel-neuchatel-ne",
    "canton": "NE",
    "x": 214.7,
    "y": 310.9,
    "sourceName": "Rue de l'Hôtel-de-Ville 2 2000 Neuchâtel",
    "precision": "office-address"
  },
  {
    "slug": "office-de-l-etat-civil-du-val-de-ruz-cernier-ne",
    "canton": "NE",
    "x": 208.4,
    "y": 296,
    "sourceName": "Rue de l'Epervier 6 2053 Cernier",
    "precision": "office-address"
  },
  {
    "slug": "office-de-l-etat-civil-du-val-de-travers-les-verrieres-ne",
    "canton": "NE",
    "x": 115.3,
    "y": 330.3,
    "sourceName": "Grand-Bourgeau 61 2126 Les Verrières",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-und-burgerrecht-nidwalden-stans-nw",
    "canton": "NW",
    "x": 527.5,
    "y": 316.5,
    "sourceName": "Stans",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-obwalden-sarnen-ow",
    "canton": "OW",
    "x": 504.2,
    "y": 333.1,
    "sourceName": "Brünigstrasse 180a 6060 Sarnen",
    "precision": "office-address"
  },
  {
    "slug": "regionales-zivilstandsamt-st-gallen-st-gallen-sg",
    "canton": "SG",
    "x": 754,
    "y": 214.7,
    "sourceName": "St.Jakob-Strasse 2 9000 St. Gallen",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-gossau-gossau-sg",
    "canton": "SG",
    "x": 614.4,
    "y": 242.1,
    "sourceName": "Gossauerrietweg 18.1 8625 Gossau ZH",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-rapperswil-jona-jona-sg",
    "canton": "SG",
    "x": 635,
    "y": 258.4,
    "sourceName": "St. Gallerstrasse 40 8645 Jona",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-region-wil-wil-sg",
    "canton": "SG",
    "x": 682.4,
    "y": 209.5,
    "sourceName": "Wil",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-rheintal-altstatten-sg",
    "canton": "SG",
    "x": 791.3,
    "y": 227.7,
    "sourceName": "Altstätten",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-rorschach-rorschach-sg",
    "canton": "SG",
    "x": 779.9,
    "y": 203.8,
    "sourceName": "Hauptstrasse 29 9400 Rorschach",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-sarganserland-wangs-sg",
    "canton": "SG",
    "x": 766,
    "y": 301.7,
    "sourceName": "Neuwangserstrasse 1 7323 Wangs",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-toggenburg-wattwil-sg",
    "canton": "SG",
    "x": 689.4,
    "y": 242.4,
    "sourceName": "Grüenaustrasse 7 9630 Wattwil",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-uznach-uznach-sg",
    "canton": "SG",
    "x": 667.8,
    "y": 259.6,
    "sourceName": "Obergasse 24 8730 Uznach",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-uzwil-uzwil-sg",
    "canton": "SG",
    "x": 700.5,
    "y": 213,
    "sourceName": "Stickereiplatz 1 9240 Uzwil",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-werdenberg-buchs-sg-1-sg",
    "canton": "SG",
    "x": 773.6,
    "y": 270.5,
    "sourceName": "St. Gallerstrasse 68 9470 Buchs SG",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-stadt-schaffhausen-schaffhausen-sh",
    "canton": "SH",
    "x": 590,
    "y": 154.8,
    "sourceName": "Schaffhausen",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-dorneck-thierstein-dornach-1-so",
    "canton": "SO",
    "x": 367.8,
    "y": 204.2,
    "sourceName": "Dornach",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-olten-gosgen-olten-1-facher-so",
    "canton": "SO",
    "x": 428.4,
    "y": 233.1,
    "sourceName": "Olten 1 Fächer",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-solothurn-solothurn-so",
    "canton": "SO",
    "x": 348.4,
    "y": 263.8,
    "sourceName": "Patriotenweg 9 4500 Solothurn",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-thal-gau-balsthal-so",
    "canton": "SO",
    "x": 386,
    "y": 240.1,
    "sourceName": "Balsthal",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-ausserschwyz-pfaffikon-sz",
    "canton": "SZ",
    "x": 621.2,
    "y": 264.1,
    "sourceName": "Unterdorfstrasse 9 8808 Pfäffikon SZ",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-innerschwyz-schwyz-sz",
    "canton": "SZ",
    "x": 594,
    "y": 304.3,
    "sourceName": "Herrengasse 17 6430 Schwyz",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-thurgau-ost-amriswil-tg",
    "canton": "TG",
    "x": 737.1,
    "y": 188.6,
    "sourceName": "Zielweg 1 8580 Amriswil",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-thurgau-west-frauenfeld-tg",
    "canton": "TG",
    "x": 648.4,
    "y": 186.3,
    "sourceName": "Bankplatz 1 8500 Frauenfeld",
    "precision": "office-address"
  },
  {
    "slug": "servizio-circondariale-dello-stato-civile-di-bellinzona-bellinzona-ti",
    "canton": "TI",
    "x": 675.7,
    "y": 487.8,
    "sourceName": "Via Lugano 4 6500 Bellinzona",
    "precision": "office-address"
  },
  {
    "slug": "servizio-circondariale-dello-stato-civile-di-locarno-locarno-ti",
    "canton": "TI",
    "x": 626.2,
    "y": 492.5,
    "sourceName": "Via della Posta 9 6600 Locarno",
    "precision": "office-address"
  },
  {
    "slug": "servizio-circondariale-dello-stato-civile-di-lugano-breganzona-ti",
    "canton": "TI",
    "x": 655.2,
    "y": 527.5,
    "sourceName": "Via Dott. G. Polar 46 6932 Breganzona",
    "precision": "office-address"
  },
  {
    "slug": "servizio-circondariale-dello-stato-civile-di-mendrisio-mendrisio-ti",
    "canton": "TI",
    "x": 667.8,
    "y": 557.8,
    "sourceName": "Via Municipio 13 6850 Mendrisio",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-uri-altdorf-ur",
    "canton": "UR",
    "x": 592.6,
    "y": 335.1,
    "sourceName": "Marktgasse 6 6460 Altdorf UR",
    "precision": "office-address"
  },
  {
    "slug": "office-de-l-etat-civil-du-canton-de-vaud-lausanne-vd",
    "canton": "VD",
    "x": 145.9,
    "y": 414.3,
    "sourceName": "Avenue de Sévelin 46 1004 Lausanne",
    "precision": "office-address"
  },
  {
    "slug": "office-de-l-etat-civil-de-martigny-martigny-vs",
    "canton": "VS",
    "x": 251.8,
    "y": 506.1,
    "sourceName": "Martigny",
    "precision": "postal-code"
  },
  {
    "slug": "office-de-l-etat-civil-de-monthey-monthey-vs",
    "canton": "VS",
    "x": 220,
    "y": 474.8,
    "sourceName": "Avenue du Simplon 32 1870 Monthey",
    "precision": "office-address"
  },
  {
    "slug": "office-de-l-etat-civil-de-sierre-sierre-vs",
    "canton": "VS",
    "x": 352.3,
    "y": 469,
    "sourceName": "Sierre",
    "precision": "postal-code"
  },
  {
    "slug": "office-de-l-etat-civil-de-sion-sion-vs",
    "canton": "VS",
    "x": 308.6,
    "y": 479,
    "sourceName": "Sion",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-brig-glis-brig-glis-vs",
    "canton": "VS",
    "x": 448.3,
    "y": 460,
    "sourceName": "Alte Simplonstrasse 26 3900 Brig",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-visp-visp-vs",
    "canton": "VS",
    "x": 421,
    "y": 466.3,
    "sourceName": "Visp",
    "precision": "postal-code"
  },
  {
    "slug": "zivilstandsamt-kreis-baar-baar-zg",
    "canton": "ZG",
    "x": 566.4,
    "y": 266.2,
    "sourceName": "Rathausstrasse 2 6340 Baar",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-kreis-cham-cham-zg",
    "canton": "ZG",
    "x": 551.4,
    "y": 269.3,
    "sourceName": "Mandelhof # 6330 Cham",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-kreis-zug-zug-zg",
    "canton": "ZG",
    "x": 563.7,
    "y": 270.4,
    "sourceName": "Gubelstrasse 22 6300 Zug",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-dielsdorf-dielsdorf-zh",
    "canton": "ZH",
    "x": 550.1,
    "y": 202.6,
    "sourceName": "Mühlestrasse 4 8157 Dielsdorf",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-volketswil-volketswil-zh",
    "canton": "ZH",
    "x": 601.1,
    "y": 223.4,
    "sourceName": "Zentralstrasse 21 8604 Volketswil",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-zollikon-zollikon-zh",
    "canton": "ZH",
    "x": 577.6,
    "y": 234,
    "sourceName": "Bergstrasse 20 8702 Zollikon",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-zurich-zurich-zh",
    "canton": "ZH",
    "x": 569.8,
    "y": 227.7,
    "sourceName": "Stadthausquai 17 8001 Zürich",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-bezirk-andelfingen-kleinandelfingen-zh",
    "canton": "ZH",
    "x": 600.8,
    "y": 177,
    "sourceName": "Kanzleistrasse 2 8451 Kleinandelfingen",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-bulach-bulach-zh",
    "canton": "ZH",
    "x": 568.8,
    "y": 195.4,
    "sourceName": "Allmendstrasse 6 8180 Bülach",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-dietikon-dietikon-zh",
    "canton": "ZH",
    "x": 538.8,
    "y": 220.3,
    "sourceName": "Bremgartnerstrasse 22 8953 Dietikon",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-dubendorf-dubendorf-zh",
    "canton": "ZH",
    "x": 586.7,
    "y": 221.6,
    "sourceName": "Usterstrasse 2 8600 Dübendorf",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-furttal-regensdorf-zh",
    "canton": "ZH",
    "x": 553.9,
    "y": 213.5,
    "sourceName": "Watterstrasse 116 8105 Regensdorf",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-horgen-horgen-zh",
    "canton": "ZH",
    "x": 582.1,
    "y": 251.6,
    "sourceName": "Bahnhofstrasse 10 8810 Horgen",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-illnau-effretikon-effretikon-zh",
    "canton": "ZH",
    "x": 601.6,
    "y": 214.9,
    "sourceName": "Märtplatz 29 8307 Effretikon",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-kloten-kloten-zh",
    "canton": "ZH",
    "x": 578.8,
    "y": 209.7,
    "sourceName": "Kirchgasse 7 8302 Kloten",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-kusnacht-kusnacht-zh-zh",
    "canton": "ZH",
    "x": 579.1,
    "y": 239.1,
    "sourceName": "Obere Dorfstrasse 32 8700 Küsnacht ZH",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-mannedorf-mannedorf-zh",
    "canton": "ZH",
    "x": 602.8,
    "y": 253.2,
    "sourceName": "Bahnhofstrasse 10 8708 Männedorf",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-pfaffikon-pfaffikon-zh-zh",
    "canton": "ZH",
    "x": 625.2,
    "y": 227.7,
    "sourceName": "Pfaffberg 1r 8330 Pfäffikon ZH",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-ruti-zh-ruti-zh-zh",
    "canton": "ZH",
    "x": 637.8,
    "y": 252.6,
    "sourceName": "Breitenhofstrasse 30 8630 Rüti ZH",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-sihltal-albis-adliswil-zh",
    "canton": "ZH",
    "x": 566.7,
    "y": 240.1,
    "sourceName": "Zürichstrasse 10 8134 Adliswil",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-thalwil-ruschlikon-kilchberg-thalwil-zh",
    "canton": "ZH",
    "x": 575,
    "y": 244.7,
    "sourceName": "Alte Landstrasse 112 8800 Thalwil",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-uster-uster-zh",
    "canton": "ZH",
    "x": 608.9,
    "y": 232.3,
    "sourceName": "Bahnhofstrasse 17 8610 Uster",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-wetzikon-wetzikon-zh",
    "canton": "ZH",
    "x": 627,
    "y": 236.9,
    "sourceName": "Bahnhofstrasse 167 8620 Wetzikon ZH",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-winterthur-winterthur-zh",
    "canton": "ZH",
    "x": 609,
    "y": 199.3,
    "sourceName": "Pionierstrasse 7 8400 Winterthur",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-wadenswil-wadenswil-zh",
    "canton": "ZH",
    "x": 598.4,
    "y": 258.3,
    "sourceName": "Florhofstrasse 6 8820 Wädenswil",
    "precision": "office-address"
  }
] satisfies OfficeMapPoint[];
