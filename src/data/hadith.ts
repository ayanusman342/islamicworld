export type HadithItem = {
  id: string;
  collection: string;
  book: string;
  number: string;
  narrator: string;
  arabic: string;
  english: string;
  grade: string;
};

export const HADITHS: HadithItem[] = [
  {
    id: "b1-1",
    collection: "Sahih al-Bukhari",
    book: "Book of Revelation",
    number: "1",
    narrator: "Umar ibn al-Khattab (رضي الله عنه)",
    arabic:
      "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    english:
      "Actions are but by intention, and every man shall have only that which he intended.",
    grade: "Sahih",
  },
  {
    id: "n13",
    collection: "40 Hadith of an-Nawawi",
    book: "Hadith 13",
    number: "13",
    narrator: "Anas ibn Malik (رضي الله عنه)",
    arabic:
      "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    english:
      "None of you truly believes until he loves for his brother what he loves for himself.",
    grade: "Sahih",
  },
  {
    id: "b6018",
    collection: "Sahih al-Bukhari",
    book: "Book of Manners",
    number: "6018",
    narrator: "Abu Hurairah (رضي الله عنه)",
    arabic:
      "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    english:
      "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    grade: "Sahih",
  },
  {
    id: "m2564",
    collection: "Sahih Muslim",
    book: "Book of Righteousness",
    number: "2564",
    narrator: "Abu Hurairah (رضي الله عنه)",
    arabic:
      "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ",
    english:
      "Verily, Allah does not look at your appearance or wealth, but rather He looks at your hearts and actions.",
    grade: "Sahih",
  },
  {
    id: "t2517",
    collection: "Jami' at-Tirmidhi",
    book: "Book of Description of the Day of Judgment",
    number: "2517",
    narrator: "Abu Muhammad al-Hasan ibn Ali (رضي الله عنهما)",
    arabic:
      "دَعْ مَا يَرِيبُكَ إِلَى مَا لَا يَرِيبُكَ",
    english:
      "Leave that which makes you doubt for that which does not make you doubt.",
    grade: "Sahih",
  },
  {
    id: "n34",
    collection: "40 Hadith of an-Nawawi",
    book: "Hadith 34",
    number: "34",
    narrator: "Abu Sa'id al-Khudri (رضي الله عنه)",
    arabic:
      "مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِلِسَانِهِ، فَإِنْ لَمْ يَسْتَطِعْ فَبِقَلْبِهِ، وَذَلِكَ أَضْعَفُ الْإِيمَانِ",
    english:
      "Whoever among you sees an evil, let him change it with his hand; if he cannot, then with his tongue; if he cannot, then with his heart — and that is the weakest of faith.",
    grade: "Sahih",
  },
  {
    id: "b52",
    collection: "Sahih al-Bukhari",
    book: "Book of Faith",
    number: "52",
    narrator: "an-Nu'man ibn Bashir (رضي الله عنه)",
    arabic:
      "أَلَا وَإِنَّ فِي الْجَسَدِ مُضْغَةً، إِذَا صَلَحَتْ صَلَحَ الْجَسَدُ كُلُّهُ، وَإِذَا فَسَدَتْ فَسَدَ الْجَسَدُ كُلُّهُ، أَلَا وَهِيَ الْقَلْبُ",
    english:
      "Indeed in the body there is a piece of flesh which, if sound, the entire body is sound, and if corrupt, the entire body is corrupt — indeed it is the heart.",
    grade: "Sahih",
  },
  {
    id: "m2699",
    collection: "Sahih Muslim",
    book: "Book of Remembrance",
    number: "2699",
    narrator: "Abu Hurairah (رضي الله عنه)",
    arabic:
      "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا، نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ",
    english:
      "Whoever relieves a believer of a hardship of this world, Allah will relieve him of a hardship on the Day of Resurrection.",
    grade: "Sahih",
  },
];

export const HADITH_COLLECTIONS = [
  "All",
  "Sahih al-Bukhari",
  "Sahih Muslim",
  "40 Hadith of an-Nawawi",
  "Jami' at-Tirmidhi",
];
