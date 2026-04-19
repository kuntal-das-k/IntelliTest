// Board-class mapping configuration
export const BOARDS = {
  WBBSE: {
    label: "WBBSE (West Bengal Board of Secondary Education)",
    classes: ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
  },
  WBCHSE: {
    label: "WBCHSE (West Bengal Council of Higher Secondary Education)",
    classes: ["Class 11", "Class 12"],
  },
  "JEE Mains": {
    label: "JEE Mains",
    classes: ["Class 11", "Class 12"],
  },
  "JEE Advanced": {
    label: "JEE Advanced",
    classes: ["Class 11", "Class 12"],
  },
  WBJEE: {
    label: "WBJEE",
    classes: ["Class 11", "Class 12"],
  },
};

export const QUESTION_TYPES = [
  { id: "mcq", label: "MCQ", value: "MCQ" },
  { id: "short", label: "Short Answer", value: "Short Answer" },
  { id: "long", label: "Long Answer", value: "Long Answer" },
  { id: "proof", label: "Proof-based", value: "Proof-based" },
];

export const DURATIONS = [
  { label: "1 Hour", value: "1 hour" },
  { label: "1.5 Hours", value: "1.5 hours" },
  { label: "2 Hours", value: "2 hours" },
  { label: "3 Hours", value: "3 hours" },
];

export const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"];
