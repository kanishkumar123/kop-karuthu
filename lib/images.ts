/**
 * ─────────────────────────────────────────────────────────────
 *  IMAGE REGISTRY — every image on the site lives here.
 *  To swap one, change the `src` on a single line. Local files
 *  work too: drop them in /public/images and use "/images/x.jpg".
 * ─────────────────────────────────────────────────────────────
 */

export type Img = {
  src: string;
  alt: string;
  /** CSS object-position, e.g. "50% 30%" */
  focal?: string;
};

const u = (id: string, w = 1800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/* ── Hero slideshow (Pexels, hosted locally in /public/images/hero) ──
   Add, remove or reorder slides here. `focal` is the CSS object-position
   used for the crop (the photos are 5:4, the hero is wide). */
export const heroSlides: Img[] = [
  {
    src: "/images/hero/parade-bus.webp",
    alt: "Liverpool's open-top WINNERS bus moving through red flare smoke and flags",
    focal: "50% 42%",
  },
  {
    src: "/images/hero/parade-players.webp",
    alt: "Liverpool players celebrating on top of the parade bus",
    focal: "50% 30%",
  },
];

/* ── Atmosphere / sections (Unsplash placeholders) ── */
export const redSmoke: Img = {
  src: u("photo-1565099012060-78659e4c209c"),
  alt: "Red flare smoke drifting over a night crowd",
};
export const stadiumNight: Img = {
  src: u("photo-1706675780107-7c43cc487928"),
  alt: "A football match under stadium lights",
};
export const floodlightSnow: Img = {
  src: u("photo-1509928015542-fcc9b3bcd048"),
  alt: "Floodlights cutting through falling snow",
};
export const redSeats: Img = {
  src: u("photo-1636959961919-985cbee8d6d9"),
  alt: "Rows of red stadium seats",
};
export const kopTerrace: Img = {
  src: u("photo-1643796903573-68834ffadcb6"),
  alt: "A stadium stand of red seats around a green pitch",
};
export const studioMic: Img = {
  src: u("photo-1478737270239-2f02b77fc618"),
  alt: "Studio condenser microphone in low light",
};
export const pitchAerial: Img = {
  src: u("photo-1760384702320-a7409c8b4f37"),
  alt: "Aerial view of a floodlit pitch at night",
};
export const watchParty: Img = {
  src: u("photo-1772724317465-1b229eab9c07"),
  alt: "Friends watching a match together at home",
};
export const tacticsBoard: Img = {
  src: u("photo-1556056504-dc77ff4d11b0"),
  alt: "Top-down view of pitch markings",
};
export const transferPen: Img = {
  src: u("photo-1750277120336-ca98ec2e2f90"),
  alt: "A pen signing a contract",
};
export const worldCupTrophy: Img = {
  src: u("photo-1561580726-1bd7aed04eb0"),
  alt: "A golden trophy on a dark background",
};
export const womensFootball: Img = {
  src: u("photo-1603291697926-7e5822ed1ac5"),
  alt: "A player in a red kit running with the ball",
};
export const fanTributes: Img = {
  src: u("photo-1763751626851-024987c2f778"),
  alt: "Scarves and tributes tied to a fence outside a stadium",
};
export const paisleyGates: Img = {
  src: u("photo-1763751626859-3fbfb6735fc7"),
  alt: "Stadium gateway entrance with a mural",
};

/* ── Hosts (placeholders — replace with real photos) ── */
export const hostGowtham: Img = {
  src: u("photo-1572707567502-90b57adeb97b", 1200),
  alt: "Gowtham, co-host of Kop Karuthu",
  focal: "50% 30%",
};
export const hostSeshadhri: Img = {
  src: u("photo-1569680093230-b1b3e769cff0", 1200),
  alt: "Seshadhri, co-host of Kop Karuthu",
  focal: "50% 30%",
};

/* ── Formats reel ── */
export const formats = {
  preview: tacticsBoard,
  review: stadiumNight,
  watchalong: watchParty,
  tactics: pitchAerial,
  transfers: transferPen,
  beyond: worldCupTrophy,
} satisfies Record<string, Img>;

/* ── Legends (Wikimedia Commons, freely licensed) ── */
const wm = (path: string) =>
  `https://upload.wikimedia.org/wikipedia/commons/${path}`;
const wmt = (path: string, file: string) =>
  `https://thumb.wikimedia.org/wikipedia/commons/thumb/${path}/960px-${file}`;

export const legends: Record<string, Img | undefined> = {
  shankly: {
    src: wm(
      "b/bb/The_Shankly_Statue%2C_Anfield_Stadium_-_geograph.org.uk_-_7321201.jpg",
    ),
    alt: "The Bill Shankly statue outside the Kop",
  },
  paisley: {
    src: wmt(
      "9/9a/Paisley_Gateway_close-up.jpg",
      "Paisley_Gateway_close-up.jpg",
    ),
    alt: "The Paisley Gateway at Anfield",
  },
  fagan: undefined, // no verified free photo — typographic portrait is used
  dalglish: {
    src: wm("6/64/Kenny_Dalglish_2009_Singapore.jpg"),
    alt: "Kenny Dalglish",
  },
  benitez: {
    src: wm("c/cb/Shahter-Reak_M_2015_%282%29.jpg"),
    alt: "Rafael Benítez",
  },
  klopp: {
    src: wm(
      "6/6e/2022-07-21_Fu%C3%9Fball%2C_M%C3%A4nner%2CFreundschaftsspiel%2C_RB_Leipzig_-_FC_Liverpool_1DX_2243_by_Stepro_%28cropped%29_%28cropped%29.jpg",
    ),
    alt: "Jürgen Klopp on the touchline",
    focal: "50% 20%",
  },
  liddell: { src: wm("1/17/Billy_Liddell.jpg"), alt: "Billy Liddell" },
  stjohn: {
    src: wm("4/44/Ian_St_John_%281966%29.jpg"),
    alt: "Ian St John in 1966",
  },
  hunt: { src: wm("0/08/Roger_Hunt.jpg"), alt: "Roger Hunt" },
  keegan: {
    src: wm("3/37/Kevin_keegan_panini_card_%28cropped%29.jpg"),
    alt: "Kevin Keegan",
  },
  rush: { src: wm("6/67/Ian_Rush_in_Singapore.jpg"), alt: "Ian Rush" },
  souness: {
    src: wm("0/09/Souness_%28retouched%29.jpg"),
    alt: "Graeme Souness",
  },
  barnes: {
    src: wmt(
      "e/e4/John_Barnes_in_Singapore%2C_2023_01.jpg",
      "John_Barnes_in_Singapore%2C_2023_01.jpg",
    ),
    alt: "John Barnes",
  },
  hansen: {
    src: wmt(
      "1/1b/Kees_Kist_in_aktie%2C_Bestanddeelnr_931-7561_%28cropped%29.jpg",
      "Kees_Kist_in_aktie%2C_Bestanddeelnr_931-7561_%28cropped%29.jpg",
    ),
    alt: "Alan Hansen (left) in action for Liverpool",
  },
  fowler: { src: wm("6/64/Fowler%2C_Robbie.jpg"), alt: "Robbie Fowler" },
  owen: {
    src: wmt("2/24/Michael_Owen.jpg", "Michael_Owen.jpg"),
    alt: "Michael Owen",
  },
  hyypia: {
    src: wm("2/21/Sami_Hyypia_2012_%28cropped%29.jpg"),
    alt: "Sami Hyypiä",
  },
  carragher: {
    src: wmt(
      "c/c8/Football_against_poverty_2014_-_Jamie_Carragher_%28cropped%29.jpg",
      "Football_against_poverty_2014_-_Jamie_Carragher_%28cropped%29.jpg",
    ),
    alt: "Jamie Carragher",
  },
  gerrard: { src: wm("d/d5/Steven_Gerrard_2018.jpg"), alt: "Steven Gerrard" },
  alonso: {
    src: wm(
      "b/b6/Los_Caminos_del_f%C3%BAtbol._Xabi_Alonso_%2839666778464%29_%28cropped%29.jpg",
    ),
    alt: "Xabi Alonso",
  },
  torres: { src: wm("5/57/Fernando_Torres_2017.jpg"), alt: "Fernando Torres" },
  suarez: {
    src: wm("f/f7/Luis_Su%C3%A1rez_2026_%28cropped%29.jpg"),
    alt: "Luis Suárez",
  },
  salah: {
    src: wmt(
      "a/a6/Mohamed_Salah_Argentina_v_Egypt_7_July_2026-163_%28cropped%29.jpg",
      "Mohamed_Salah_Argentina_v_Egypt_7_July_2026-163_%28cropped%29.jpg",
    ),
    alt: "Mohamed Salah",
  },
  firmino: {
    src: wmt(
      "0/00/20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Roberto_Firmino_850_1557.jpg",
      "20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Roberto_Firmino_850_1557.jpg",
    ),
    alt: "Roberto Firmino",
  },
  mane: {
    src: wmt(
      "9/92/Sadio_Mane_France_v_Senegal_16_June_2026-450.jpg",
      "Sadio_Mane_France_v_Senegal_16_June_2026-450.jpg",
    ),
    alt: "Sadio Mané",
  },
  henderson: {
    src: wmt(
      "8/84/Jordan_Henderson_England_v_Ghana_23_June_2026-029_%28cropped%29.jpg",
      "Jordan_Henderson_England_v_Ghana_23_June_2026-029_%28cropped%29.jpg",
    ),
    alt: "Jordan Henderson",
  },
  matip: {
    src: wmt(
      "d/df/2022-07-21_Fu%C3%9Fball%2C_M%C3%A4nner%2CFreundschaftsspiel%2C_RB_Leipzig_-_FC_Liverpool_1DX_2092_by_Stepro_%28cropped%29.jpg",
      "2022-07-21_Fu%C3%9Fball%2C_M%C3%A4nner%2CFreundschaftsspiel%2C_RB_Leipzig_-_FC_Liverpool_1DX_2092_by_Stepro_%28cropped%29.jpg",
    ),
    alt: "Joël Matip in Liverpool training kit",
  },
  thiago: {
    src: wmt(
      "b/bc/UEFA_EURO_qualifiers_Sweden_vs_Spain_20191015_Thiago_Alcantara_13_%28cropped%29.jpg",
      "UEFA_EURO_qualifiers_Sweden_vs_Spain_20191015_Thiago_Alcantara_13_%28cropped%29.jpg",
    ),
    alt: "Thiago Alcântara",
  },
};

/** Legends-section atmosphere */
export const thisIsAnfield: Img = {
  src: wm("b/bc/This_is_Anfield.jpg"),
  alt: "The 'This Is Anfield' sign above the players' tunnel",
};
export const kopFromStand: Img = {
  src: wmt(
    "b/bf/The_pitch_from_the_Kop%2C_Anfield_%28geograph_4705636%29.jpg",
    "The_pitch_from_the_Kop%2C_Anfield_%28geograph_4705636%29.jpg",
  ),
  alt: "The pitch seen from the Kop at Anfield",
};

/**
 * ── Current squad photo overrides ──
 * Squad photos are official Premier League cutouts (500×500), falling back to a
 * Wikipedia photo. To use your own photo, add the player's FPL "code" here
 * (the number in their premierleague.com photo URL), e.g.
 * 116535: { src: "/images/squad/alisson.png", alt: "Alisson Becker" }
 * Transparent cut-out PNGs look best.
 */
export const squadOverrides: Record<number, Img> = {};
