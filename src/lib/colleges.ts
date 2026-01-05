export const COLLEGES = [
  { value: "USICT", label: "University School of Information, Communication and Technology (USICT)" },
  { value: "MAIT", label: "Maharaja Agrasen Institute of Technology (MAIT)" },
  { value: "MSIT", label: "Maharaja Surajmal Institute of Technology (MSIT)" },
  { value: "BPIT", label: "Bhagwan Parshuram Institute of Technology (BPIT)" },
  { value: "BVCOE", label: "Bharati Vidyapeeth's College of Engineering (BVCOE)" },
  { value: "VIPS", label: "Vivekananda Institute of Professional Studies (VIPS)" },
  { value: "IITM", label: "Institute of Innovation in Technology and Management (IITM)" },
  { value: "GTBIT", label: "Guru Tegh Bahadur Institute of Technology (GTBIT)" },
  { value: "ADGITM", label: "Dr. Akhilesh Das Gupta Institute of Technology & Management (ADGITM)" },
  { value: "JIMS", label: "Jagan Institute of Management Studies (JIMS)" },
  { value: "USS", label: "University School of Studies (USS - Main Campus)" },
  { value: "Other", label: "Other / University Wide" },
] as const;

export type CollegeValue = typeof COLLEGES[number]["value"];
