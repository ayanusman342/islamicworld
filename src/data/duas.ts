export type Dua = {
  id: string;
  category: string;
  title: string;
  arabic: string;
  transliteration?: string;
  translation: string;
  reference: string;
};

export const DUAS: Dua[] = [
  {
    id: "morning-1",
    category: "Morning",
    title: "Upon waking",
    arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration:
      "Alhamdu lillāhi alladhī aḥyānā baʿda mā amātanā wa ilayhi al-nushūr",
    translation:
      "All praise is due to Allah, who gave us life after taking it from us, and to Him is the resurrection.",
    reference: "Sahih al-Bukhari 6312",
  },
  {
    id: "morning-2",
    category: "Morning",
    title: "Sayyid al-Istighfar",
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
    translation:
      "O Allah, You are my Lord. There is no god but You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can…",
    reference: "Sahih al-Bukhari 6306",
  },
  {
    id: "evening-1",
    category: "Evening",
    title: "Evening remembrance",
    arabic:
      "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    translation:
      "We have reached the evening and at this very time all sovereignty belongs to Allah. Praise is to Allah. There is no god but Allah, alone, without partner.",
    reference: "Sahih Muslim 2723",
  },
  {
    id: "food-1",
    category: "Food",
    title: "Before eating",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillāh",
    translation: "In the name of Allah.",
    reference: "Sunan Abu Dawud 3767",
  },
  {
    id: "food-2",
    category: "Food",
    title: "After eating",
    arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيهِ، مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    translation:
      "Praise is to Allah who has fed me this and provided it for me without any might or power on my part.",
    reference: "Sunan Abi Dawud 4023",
  },
  {
    id: "travel-1",
    category: "Travel",
    title: "When setting out",
    arabic:
      "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    translation:
      "Glory to Him who has subjected these to our (use), for we could never have accomplished this (by ourselves). And to our Lord, surely, must we turn back.",
    reference: "Qur'an 43:13–14",
  },
  {
    id: "prayer-1",
    category: "Prayer",
    title: "After the adhan",
    arabic:
      "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ",
    translation:
      "O Allah, Lord of this perfect call and this prayer to be established, grant Muhammad the intercession and favor…",
    reference: "Sahih al-Bukhari 614",
  },
  {
    id: "ramadan-1",
    category: "Ramadan",
    title: "Breaking the fast",
    arabic:
      "ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
    translation:
      "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.",
    reference: "Sunan Abi Dawud 2357",
  },
  {
    id: "ramadan-2",
    category: "Ramadan",
    title: "Laylat al-Qadr",
    arabic:
      "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    transliteration: "Allāhumma innaka ʿafuwwun tuḥibbu al-ʿafwa faʿfu ʿannī",
    translation:
      "O Allah, You are Most Forgiving, You love forgiveness — so forgive me.",
    reference: "Sunan al-Tirmidhi 3513",
  },
  {
    id: "general-1",
    category: "General",
    title: "For guidance",
    arabic:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
    translation:
      "O Allah, I ask You for guidance, piety, chastity, and self-sufficiency.",
    reference: "Sahih Muslim 2721",
  },
];

export const DUA_CATEGORIES = [
  "Morning",
  "Evening",
  "Prayer",
  "Food",
  "Travel",
  "Ramadan",
  "General",
];
