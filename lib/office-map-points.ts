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
    "slug": "zivilstandsamt-wettingen-wettingen-ag",
    "canton": "AG",
    "x": 522.1,
    "y": 206.8,
    "sourceName": "Alb. Zwyssigstrasse 76 5430 Wettingen",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-baden-baden-ag",
    "canton": "AG",
    "x": 517.5,
    "y": 205.4,
    "sourceName": "Oberstadtstrasse 4 5400 Baden",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-dietikon-dietikon-ag",
    "canton": "AG",
    "x": 538.8,
    "y": 220.3,
    "sourceName": "Bremgartnerstrasse 22 8953 Dietikon",
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
    "slug": "zivilstandsamt-hinterland-appenzell-a-rh-herisau-ar",
    "canton": "AR",
    "x": 732.1,
    "y": 224.2,
    "sourceName": "Poststrasse 6 9100 Herisau",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-mittelland-buhler-ar",
    "canton": "AR",
    "x": 759.3,
    "y": 225.9,
    "sourceName": "Unterer Steigbach 1 9055 Bühler",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-vorderland-rehetobel-ar",
    "canton": "AR",
    "x": 777.1,
    "y": 214.9,
    "sourceName": "St. Gallerstrasse 11 9038 Rehetobel",
    "precision": "office-address"
  },
  {
    "slug": "office-de-l-etat-civil-du-jura-bernois-courtelary-be",
    "canton": "BE",
    "x": 246.3,
    "y": 269.6,
    "sourceName": "Rue de la Préfecture 2 2608 Courtelary",
    "precision": "office-address"
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
    "slug": "zivilstandsamt-emmental-langnau-im-emmental-be",
    "canton": "BE",
    "x": 402.9,
    "y": 322.1,
    "sourceName": "Marktstrasse 7 3550 Langnau im Emmental",
    "precision": "office-address"
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
    "slug": "office-de-l-etat-civil-du-canton-de-fribourg-zivilstandsamt-des-kantons-freiburg-fribourg-fr",
    "canton": "FR",
    "x": 264,
    "y": 352.3,
    "sourceName": "Rue de l'Abbé-Bovet 14 1700 Fribourg",
    "precision": "office-address"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-campagne-et-rive-gauche-du-lac-vesenaz-ge",
    "canton": "GE",
    "x": 54.3,
    "y": 477.6,
    "sourceName": "Chemin des Rayes 26f 1222 Vésenaz",
    "precision": "office-address"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-chene-bourg-thonex-veyrier-chene-bourg-ge",
    "canton": "GE",
    "x": 52.7,
    "y": 487.2,
    "sourceName": "Avenue PETIT-SENN 46 1225 Chêne-Bourg",
    "precision": "office-address"
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
    "slug": "arrondissement-de-l-etat-civil-de-carouge-carouge-ge",
    "canton": "GE",
    "x": 40.4,
    "y": 488.9,
    "sourceName": "Place du Marché 14 1227 Carouge GE",
    "precision": "office-address"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-de-chene-bougeries-voirons-chene-bougeries-ge",
    "canton": "GE",
    "x": 50.8,
    "y": 486.1,
    "sourceName": "Route du Vallon 4 1224 Chêne-Bougeries",
    "precision": "office-address"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-de-geneve-geneve-6-ge",
    "canton": "GE",
    "x": 44.7,
    "y": 485.1,
    "sourceName": "Rue de la Mairie 37 1207 Genève",
    "precision": "office-address"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-de-lancy-grand-lancy-1-ge",
    "canton": "GE",
    "x": 36.7,
    "y": 488.8,
    "sourceName": "Route du Grand-Lancy 39a 1212 Grand-Lancy",
    "precision": "office-address"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-meyrin-mandement-vernier-meyrin-ge",
    "canton": "GE",
    "x": 27.5,
    "y": 478.2,
    "sourceName": "Rue des Boudines 2 1217 Meyrin",
    "precision": "office-address"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-rive-droite-du-lac-chambesy-ge",
    "canton": "GE",
    "x": 40.7,
    "y": 477.2,
    "sourceName": "Route de Pregny 47 1292 Chambésy",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-glarus-glarus-gl",
    "canton": "GL",
    "x": 685.7,
    "y": 299.9,
    "sourceName": "Postgasse 29 8750 Glarus",
    "precision": "office-address"
  },
  {
    "slug": "ufficio-di-stato-civile-bernina-poschiavo-gr",
    "canton": "GR",
    "x": 903.6,
    "y": 458.3,
    "sourceName": "Via da Clalt 2 7742 Poschiavo",
    "precision": "office-address"
  },
  {
    "slug": "ufficio-di-stato-civile-moesa-santa-maria-in-calanca-gr",
    "canton": "GR",
    "x": 703,
    "y": 471.8,
    "sourceName": "A la Gescia 22 6541 Sta. Maria in Calanca",
    "precision": "office-address"
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
    "slug": "zivilstandsamt-en-scuol-gr",
    "canton": "GR",
    "x": 957.9,
    "y": 353.8,
    "sourceName": "Bagnera 171 7550 Scuol",
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
    "slug": "zivilstandskreis-amt-willisau-willisau-lu",
    "canton": "LU",
    "x": 448.6,
    "y": 282.7,
    "sourceName": "Schlossstrasse 5 6130 Willisau",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-ebikon-ebikon-lu",
    "canton": "LU",
    "x": 525.9,
    "y": 290.7,
    "sourceName": "Riedmattstrasse 14 6030 Ebikon",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-emmen-emmenbrucke-lu",
    "canton": "LU",
    "x": 511.7,
    "y": 291.9,
    "sourceName": "Rüeggisingerstrasse 22 6020 Emmenbrücke",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-hochdorf-hochdorf-lu",
    "canton": "LU",
    "x": 514.7,
    "y": 272.4,
    "sourceName": "Hauptstrasse 3 6280 Hochdorf",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-horw-horw-lu",
    "canton": "LU",
    "x": 518.7,
    "y": 304.9,
    "sourceName": "Gemeindehausplatz 1 6048 Horw",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-kriens-kriens-lu",
    "canton": "LU",
    "x": 512.2,
    "y": 301.6,
    "sourceName": "Stadtplatz 1 6010 Kriens",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-luzern-luzern-lu",
    "canton": "LU",
    "x": 517.4,
    "y": 298.8,
    "sourceName": "Obergrundstrasse 28 6003 Luzern",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-oberer-sempachersee-sempach-lu",
    "canton": "LU",
    "x": 492.5,
    "y": 279,
    "sourceName": "Stadtstrasse 8 6204 Sempach",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-sursee-sursee-lu",
    "canton": "LU",
    "x": 473.9,
    "y": 271.3,
    "sourceName": "Centralstrasse 9 6210 Sursee",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandskreis-wolhusen-wolhusen-lu",
    "canton": "LU",
    "x": 466.5,
    "y": 295.9,
    "sourceName": "Menznauerstrasse 13 6110 Wolhusen",
    "precision": "office-address"
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
    "slug": "office-de-l-etat-civil-boudry-ne",
    "canton": "NE",
    "x": 193.7,
    "y": 320.4,
    "sourceName": "Rue Louis-Favre 37 2017 Boudry",
    "precision": "office-address"
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
    "slug": "zivilstandsamt-nidwalden-stans-nw",
    "canton": "NW",
    "x": 531.2,
    "y": 318.7,
    "sourceName": "Marktgasse 3 6370 Stans",
    "precision": "office-address"
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
    "slug": "regionales-zivilstandsamt-rheintal-altstatten-sg-sg",
    "canton": "SG",
    "x": 790.1,
    "y": 225.8,
    "sourceName": "Rathausplatz 1 9450 Altstätten SG",
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
    "slug": "zivilstandsamt-wil-wil-sg",
    "canton": "SG",
    "x": 681.6,
    "y": 206.2,
    "sourceName": "Marktgasse 58 9500 Wil SG",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-schaffhausen-schaffhausen-sh",
    "canton": "SH",
    "x": 590.4,
    "y": 155.4,
    "sourceName": "Safrangasse 8 8200 Schaffhausen",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-kreis-dorneck-thierstein-dornach-so",
    "canton": "SO",
    "x": 364.5,
    "y": 201.5,
    "sourceName": "Amthausstrasse 7 4143 Dornach",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-kreis-olten-gosgen-olten-so",
    "canton": "SO",
    "x": 429.1,
    "y": 232,
    "sourceName": "Hauptgasse 25 4600 Olten",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-kreis-thal-gau-klus-balsthal-so",
    "canton": "SO",
    "x": 383,
    "y": 242,
    "sourceName": "Wengimattstrasse 2 4710 Balsthal",
    "precision": "office-address"
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
    "slug": "arrondissement-de-l-etat-civil-de-martigny-martigny-vs",
    "canton": "VS",
    "x": 247,
    "y": 506.4,
    "sourceName": "Avenue de la Gare 29 1920 Martigny",
    "precision": "office-address"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-de-sierre-sierre-vs",
    "canton": "VS",
    "x": 345.5,
    "y": 465.5,
    "sourceName": "Avenue de France 21 3960 Sierre",
    "precision": "office-address"
  },
  {
    "slug": "arrondissement-de-l-etat-civil-de-sion-sion-vs",
    "canton": "VS",
    "x": 309.4,
    "y": 478.1,
    "sourceName": "Rue de Conthey 1 1950 Sion",
    "precision": "office-address"
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
    "slug": "zivilstandsamt-brig-glis-brig-glis-vs",
    "canton": "VS",
    "x": 448.3,
    "y": 460,
    "sourceName": "Alte Simplonstrasse 26 3900 Brig",
    "precision": "office-address"
  },
  {
    "slug": "zivilstandsamt-des-kreises-visp-visp-vs",
    "canton": "VS",
    "x": 424.3,
    "y": 465.8,
    "sourceName": "St. Martiniplatz 1 3930 Visp",
    "precision": "office-address"
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
    "slug": "zivilstandskreis-wadenswil-wadenswil-zh",
    "canton": "ZH",
    "x": 598.4,
    "y": 258.3,
    "sourceName": "Florhofstrasse 6 8820 Wädenswil",
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
  }
] satisfies OfficeMapPoint[];
