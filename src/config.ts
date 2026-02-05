export const SITE = {
  website: "https://raxshasa.github.io/raxplays/", // replace this with your deployed domain
  author: "raxshasa",
  desc: "Howdy, I'm raxshasa. This is a personal blog about games I play.",
  title: "raxplays",
  base: "/raxplays",
  profile: "https://raxshasa.github.io/",
  ogImage: "ocarina-in-the-analogue.jpg",
  lightAndDarkMode: false,
  postPerIndex: 3,
  postPerPage: 5,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: false,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/satnaing/astro-paper/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "Europe/London", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
