/**
 * LEGENDS — hand-curated. Figures are Liverpool, all competitions,
 * from public records (LFChistory.net / Wikipedia). Please sanity-check
 * and edit here; this is the only place they live.
 * Photos: lib/images.ts → `legends[imageKey]`.
 */

export type TrophyKey = "league" | "euro" | "fa" | "leaguecup" | "uefa" | "super" | "cwc";

export const trophyNames: Record<TrophyKey, string> = {
  league: "League title",
  euro: "European Cup / Champions League",
  fa: "FA Cup",
  leaguecup: "League Cup",
  uefa: "UEFA Cup",
  super: "UEFA Super Cup",
  cwc: "Club World Cup",
};

export type Legend = {
  key: string;
  name: string;
  nickname?: string;
  role: string;
  years: string;
  /** players: apps/goals · managers: matches */
  apps?: number;
  goals?: number;
  matches?: number;
  statsNote?: string;
  trophies: Partial<Record<TrophyKey, number>>;
  moment: string;
  momentDate: string;
};

export type Era = { key: string; title: string; span: string; legends: Legend[] };

export const eras: Era[] = [
  {
    key: "greats",
    title: "Pre-Premier League greats",
    span: "1938 – 1992",
    legends: [
      {
        key: "liddell", name: "Billy Liddell", nickname: "Liddellpool", role: "Winger", years: "1938–1961", apps: 534, goals: 228,
        trophies: { league: 1 },
        moment: "So central to the club that fans called it ‘Liddellpool’. League champion in the first season after the war.",
        momentDate: "1946–47",
      },
      {
        key: "hunt", name: "Roger Hunt", nickname: "Sir Roger", role: "Striker", years: "1958–1969", apps: 492, goals: 285,
        trophies: { league: 2, fa: 1 },
        moment: "Scored the goals that took Shankly's side out of the Second Division and on to two titles.",
        momentDate: "1961–62",
      },
      {
        key: "stjohn", name: "Ian St John", nickname: "The Saint", role: "Striker", years: "1961–1971", apps: 425, goals: 118,
        trophies: { league: 2, fa: 1 },
        moment: "A diving header in extra time at Wembley won the club its first FA Cup.",
        momentDate: "1 May 1965",
      },
      {
        key: "keegan", name: "Kevin Keegan", role: "Forward", years: "1971–1977", apps: 323, goals: 100,
        trophies: { league: 3, euro: 1, uefa: 2, fa: 1 },
        moment: "Ran Berti Vogts ragged in Rome as the club won its first European Cup.",
        momentDate: "25 May 1977",
      },
      {
        key: "dalglish", name: "Kenny Dalglish", nickname: "King Kenny", role: "Forward & manager", years: "1977–1990", apps: 515, goals: 172,
        trophies: { league: 6, euro: 3, fa: 1, leaguecup: 4 },
        moment: "A chip over the Bruges keeper at Wembley retained the European Cup. He later won three titles as manager.",
        momentDate: "10 May 1978",
      },
      {
        key: "hansen", name: "Alan Hansen", role: "Centre-back", years: "1977–1991", apps: 620, goals: 14,
        trophies: { league: 8, euro: 3, fa: 2, leaguecup: 4 },
        moment: "Eight league titles, jointly the most of any Liverpool player, all won with a centre-back's calm.",
        momentDate: "1977–1991",
      },
      {
        key: "souness", name: "Graeme Souness", role: "Midfielder", years: "1978–1984", apps: 359, goals: 56,
        trophies: { league: 5, euro: 3, leaguecup: 4 },
        moment: "Captained the treble season and lifted the European Cup in Rome.",
        momentDate: "30 May 1984",
      },
      {
        key: "rush", name: "Ian Rush", role: "Striker", years: "1980–1996", apps: 660, goals: 346,
        trophies: { league: 5, euro: 2, fa: 3, leaguecup: 5 },
        moment: "The club's all-time top scorer. Two goals in the 1986 FA Cup final against Everton sealed the double.",
        momentDate: "10 May 1986",
      },
      {
        key: "barnes", name: "John Barnes", nickname: "Digger", role: "Winger", years: "1987–1997", apps: 407, goals: 108,
        trophies: { league: 2, fa: 1, leaguecup: 1 },
        moment: "The best player in England during the 1987–88 title season. Football Writers' Player of the Year.",
        momentDate: "1987–88",
      },
    ],
  },
  {
    key: "managers",
    title: "The managers",
    span: "1959 – 2024",
    legends: [
      {
        key: "shankly", name: "Bill Shankly", role: "Manager", years: "1959–1974", matches: 783,
        trophies: { league: 3, fa: 2, uefa: 1 },
        moment: "Took a Second Division club and made it the pride of England. The first FA Cup came at Wembley.",
        momentDate: "1 May 1965",
      },
      {
        key: "paisley", name: "Bob Paisley", role: "Manager", years: "1974–1983", matches: 535,
        trophies: { league: 6, euro: 3, uefa: 1, leaguecup: 3, super: 1 },
        moment: "Rome, the first European Cup. The quiet man from the boot room went on to win three.",
        momentDate: "25 May 1977",
      },
      {
        key: "fagan", name: "Joe Fagan", role: "Manager", years: "1983–1985", matches: 131,
        trophies: { league: 1, euro: 1, leaguecup: 1 },
        moment: "A treble in his first season, finished with a penalty shoot-out in Rome.",
        momentDate: "30 May 1984",
      },
      {
        key: "benitez", name: "Rafael Benítez", role: "Manager", years: "2004–2010", matches: 350,
        trophies: { euro: 1, fa: 1, super: 1 },
        moment: "3-0 down at half-time in Istanbul. Six minutes later it was 3-3.",
        momentDate: "25 May 2005",
      },
      {
        key: "klopp", name: "Jürgen Klopp", role: "Manager", years: "2015–2024", matches: 491,
        trophies: { league: 1, euro: 1, fa: 1, leaguecup: 2, super: 1, cwc: 1 },
        moment: "Turned doubters into believers, then ended the 30-year wait for the league.",
        momentDate: "25 June 2020",
      },
    ],
  },
  {
    key: "modern",
    title: "The modern era",
    span: "1993 – 2014",
    legends: [
      {
        key: "fowler", name: "Robbie Fowler", nickname: "God", role: "Striker", years: "1993–2001, 2006–07", apps: 369, goals: 183,
        trophies: { fa: 1, leaguecup: 2, uefa: 1 },
        moment: "A hat-trick against Arsenal in 4 minutes 33 seconds. The Kop named him God.",
        momentDate: "28 Aug 1994",
      },
      {
        key: "owen", name: "Michael Owen", role: "Striker", years: "1996–2004", apps: 297, goals: 158,
        trophies: { fa: 1, leaguecup: 2, uefa: 1 },
        moment: "Two late goals turned the 2001 FA Cup final against Arsenal. He won the Ballon d'Or that year.",
        momentDate: "12 May 2001",
      },
      {
        key: "hyypia", name: "Sami Hyypiä", role: "Centre-back", years: "1999–2009", apps: 464, goals: 35,
        trophies: { euro: 1, uefa: 1, fa: 2, leaguecup: 2, super: 1 },
        moment: "Signed for £2.6m and gave the club a decade at centre-back.",
        momentDate: "1999–2009",
      },
      {
        key: "carragher", name: "Jamie Carragher", nickname: "Carra", role: "Defender", years: "1996–2013", apps: 737, goals: 5,
        trophies: { euro: 1, uefa: 1, fa: 2, leaguecup: 3, super: 2 },
        moment: "Played through cramp in extra time in Istanbul and kept blocking shots. He retired second on the club's all-time appearance list.",
        momentDate: "25 May 2005",
      },
      {
        key: "gerrard", name: "Steven Gerrard", nickname: "Stevie G", role: "Captain", years: "1998–2015", apps: 710, goals: 186,
        trophies: { euro: 1, uefa: 1, fa: 2, leaguecup: 3, super: 2 },
        moment: "His header started the comeback in Istanbul. A year later his late equaliser in Cardiff got the 2006 FA Cup final named after him.",
        momentDate: "25 May 2005",
      },
      {
        key: "alonso", name: "Xabi Alonso", role: "Midfielder", years: "2004–2009", apps: 210, goals: 19,
        trophies: { euro: 1, fa: 1, super: 1 },
        moment: "Had his penalty saved in Istanbul, then scored the rebound to make it 3-3.",
        momentDate: "25 May 2005",
      },
      {
        key: "torres", name: "Fernando Torres", nickname: "El Niño", role: "Striker", years: "2007–2011", apps: 142, goals: 81,
        trophies: {},
        moment: "Bullied Vidić at Old Trafford in the 4-1 win. The quickest Liverpool player to 50 league goals.",
        momentDate: "14 Mar 2009",
      },
      {
        key: "suarez", name: "Luis Suárez", role: "Striker", years: "2011–2014", apps: 133, goals: 82,
        trophies: { leaguecup: 1 },
        moment: "31 league goals in 2013–14. The title almost came with them.",
        momentDate: "2013–14",
      },
    ],
  },
  {
    key: "recent",
    title: "Klopp-era icons",
    span: "2015 – today",
    legends: [
      {
        key: "salah", name: "Mohamed Salah", nickname: "The Egyptian King", role: "Forward", years: "2017–", apps: 394, goals: 243,
        statsNote: "to the end of 2024/25",
        trophies: { league: 2, euro: 1, fa: 1, leaguecup: 2, super: 1, cwc: 1 },
        moment: "44 goals in his first season. Nobody saw it coming, and he kept going for years.",
        momentDate: "2017–18",
      },
      {
        key: "firmino", name: "Roberto Firmino", nickname: "Bobby", role: "Forward", years: "2015–2023", apps: 362, goals: 111,
        trophies: { league: 1, euro: 1, fa: 1, leaguecup: 1, super: 1, cwc: 1 },
        moment: "The false nine who made the front three work. He scored the extra-time winner in Doha to win the Club World Cup.",
        momentDate: "21 Dec 2019",
      },
      {
        key: "mane", name: "Sadio Mané", role: "Forward", years: "2016–2022", apps: 269, goals: 120,
        trophies: { league: 1, euro: 1, fa: 1, leaguecup: 1, super: 1, cwc: 1 },
        moment: "Scored twice in Istanbul, this time to win the 2019 UEFA Super Cup.",
        momentDate: "14 Aug 2019",
      },
      {
        key: "henderson", name: "Jordan Henderson", nickname: "Hendo", role: "Captain", years: "2011–2023", apps: 492, goals: 33,
        trophies: { league: 1, euro: 1, fa: 1, leaguecup: 2, super: 1, cwc: 1 },
        moment: "The shuffle, then the lift. He raised the first league trophy in 30 years.",
        momentDate: "22 July 2020",
      },
      {
        key: "matip", name: "Joël Matip", role: "Centre-back", years: "2016–2024", apps: 201, goals: 11,
        trophies: { league: 1, euro: 1, fa: 1, leaguecup: 2, super: 1, cwc: 1 },
        moment: "The centre-back who kept dribbling out from the back. The Kop loved it every time.",
        momentDate: "2016–2024",
      },
      {
        key: "thiago", name: "Thiago Alcântara", role: "Midfielder", years: "2020–2024", apps: 98, goals: 4,
        trophies: { fa: 1, leaguecup: 1 },
        moment: "Made the midfield look easy, and the first-time volley against Porto is still on repeat.",
        momentDate: "2020–2024",
      },
    ],
  },
];
