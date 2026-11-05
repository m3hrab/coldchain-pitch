export type Member = { name: string; role: string; photo: string | null };

export const members: Member[] = [
  {
    name: "Md Zehad Khan",
    role: "Team Lead & IoT Architect",
    photo: "team/zehad.jpeg",
  },
  {
    name: "Mehrab Hossain",
    role: "Backend & Security",
    photo: "team/mehrab.png",
  },
  { name: "Kishan Modhu", role: "Frontend & UX", photo: null },
  { name: "Kazi Majedul Islam", role: "AI/ML", photo: null },
  { name: "Raihana Ferdosh", role: "PM & Pitch", photo: null },
];
