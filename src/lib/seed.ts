export type Category = "Government" | "Private Foundation" | "University" | "Local Government";
export type AppStatus = "Submitted" | "Under Review" | "Approved" | "Rejected";

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  category: Category;
  location: string;
  description: string;
  benefits: string;
  eligibility: string[];
  documents: string[];
  instructions: string;
  deadline: string; // YYYY-MM-DD
  active: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  institution: string;
  date: string;
  content: string;
}

export interface Application {
  id: string;
  scholarshipId: string;
  scholarshipTitle: string;
  name: string;
  email: string;
  school: string;
  course: string;
  yearLevel: string;
  statement: string;
  documents: string[];
  status: AppStatus;
  submittedAt: string;
}

export interface Profile {
  name: string;
  email: string;
  school: string;
  course: string;
  yearLevel: string;
}

export const CATEGORIES: Category[] = ["Government", "Private Foundation", "University", "Local Government"];
export const STATUSES: AppStatus[] = ["Submitted", "Under Review", "Approved", "Rejected"];
export const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

export const seedScholarships: Scholarship[] = [
  {
    id: "s1",
    title: "Merit Scholarship Program (Demo)",
    provider: "Department of Science and Technology - SEI",
    category: "Government",
    location: "Nationwide",
    description:
      "A sample government scholarship for incoming college students taking priority science, technology, engineering, and mathematics courses.",
    benefits: "Full tuition, PHP 8,000 monthly stipend, book allowance of PHP 10,000 per year.",
    eligibility: ["Filipino citizen", "Incoming first-year college student", "Top 5% of graduating senior high class", "Enrolled in a priority STEM program"],
    documents: ["Birth Certificate (PSA)", "Form 138 / Report Card", "Certificate of Good Moral Character", "2x2 ID Photo"],
    instructions: "Complete the online form, attach the required documents, and wait for the qualifying exam schedule.",
    deadline: "2026-11-30",
    active: true,
    createdAt: "2026-10-01",
  },
  {
    id: "s2",
    title: "Tertiary Education Subsidy (Demo)",
    provider: "Commission on Higher Education",
    category: "Government",
    location: "Nationwide",
    description: "Financial assistance for students from low-income households enrolled in state universities and colleges.",
    benefits: "PHP 40,000 per academic year for living and learning expenses.",
    eligibility: ["Enrolled in a SUC or LUC", "Household listed in the Listahanan registry", "No other government scholarship"],
    documents: ["Certificate of Registration", "Certificate of Indigency", "Valid School ID"],
    instructions: "Submit the documents to your university scholarship office through this portal.",
    deadline: "2026-12-15",
    active: true,
    createdAt: "2026-09-20",
  },
  {
    id: "s3",
    title: "Future Leaders Grant (Demo)",
    provider: "Bayanihan Education Foundation",
    category: "Private Foundation",
    location: "Metro Manila",
    description: "A private foundation grant for student leaders with strong academic records and community involvement.",
    benefits: "PHP 60,000 per semester, mentorship program, and summer internship placement.",
    eligibility: ["GWA of 1.75 or better", "Active member of a student organization", "Family income below PHP 400,000 per year"],
    documents: ["Transcript of Records", "Income Tax Return of parents", "Recommendation Letter", "Essay on leadership"],
    instructions: "Upload all documents and prepare for a panel interview if shortlisted.",
    deadline: "2026-11-10",
    active: true,
    createdAt: "2026-10-10",
  },
  {
    id: "s4",
    title: "Iskolar ng Bayan Entrance Scholarship (Demo)",
    provider: "Sample State University",
    category: "University",
    location: "Quezon City",
    description: "An entrance scholarship for freshmen with outstanding admission test results.",
    benefits: "Free tuition and miscellaneous fees for four years.",
    eligibility: ["Passed the university admission test", "Top 100 qualifiers", "Maintain GWA of 2.0 or better"],
    documents: ["Admission Test Result", "Form 138", "Birth Certificate (PSA)"],
    instructions: "Apply within the enrollment period and confirm your slot with the registrar.",
    deadline: "2026-10-31",
    active: true,
    createdAt: "2026-09-05",
  },
  {
    id: "s5",
    title: "Cebu City Educational Assistance (Demo)",
    provider: "Cebu City Scholarship Office",
    category: "Local Government",
    location: "Cebu City",
    description: "Educational assistance for bona fide residents of Cebu City enrolled in any accredited college.",
    benefits: "PHP 15,000 per semester.",
    eligibility: ["Resident of Cebu City for at least 3 years", "Registered voter or child of registered voter", "Enrolled in an accredited institution"],
    documents: ["Barangay Certificate of Residency", "Voter's Certificate", "Certificate of Enrollment"],
    instructions: "Submit documents online and claim your assistance at the City Hall once approved.",
    deadline: "2026-12-05",
    active: true,
    createdAt: "2026-10-12",
  },
  {
    id: "s6",
    title: "Davao Engineering Scholars (Demo)",
    provider: "Mindanao Industry Foundation",
    category: "Private Foundation",
    location: "Davao City",
    description: "Support for engineering students in Mindanao who commit to working in the region after graduation.",
    benefits: "Full tuition, PHP 5,000 monthly allowance, and guaranteed job interview.",
    eligibility: ["Enrolled in an engineering program", "Resident of Mindanao", "GWA of 2.25 or better"],
    documents: ["Transcript of Records", "Certificate of Residency", "Statement of Commitment"],
    instructions: "Submit the application form and attend the online orientation.",
    deadline: "2027-01-20",
    active: true,
    createdAt: "2026-10-14",
  },
  {
    id: "s7",
    title: "Pasig City Scholarship Program (Demo)",
    provider: "Pasig City Government",
    category: "Local Government",
    location: "Pasig City",
    description: "City scholarship for academically deserving residents of Pasig City.",
    benefits: "PHP 20,000 per semester and book allowance.",
    eligibility: ["Resident of Pasig City", "GWA of 85% or better"],
    documents: ["Certificate of Residency", "Report Card", "Certificate of Enrollment"],
    instructions: "Applications are reviewed by the City Scholarship Board.",
    deadline: "2026-09-30",
    active: false,
    createdAt: "2026-08-01",
  },
];

export const seedAnnouncements: Announcement[] = [
  {
    id: "a1",
    title: "Merit Scholarship applications now open",
    institution: "Department of Science and Technology - SEI",
    date: "2026-10-15",
    content:
      "Applications for the Merit Scholarship Program are now open until November 30, 2026. Qualified applicants will be scheduled for the qualifying exam in January. Prepare your PSA birth certificate and report card ahead of time.",
  },
  {
    id: "a2",
    title: "Reminder: Entrance Scholarship deadline on October 31",
    institution: "Sample State University",
    date: "2026-10-12",
    content: "Freshmen who qualified for the Iskolar ng Bayan Entrance Scholarship must confirm their slots before October 31, 2026. Late submissions will not be accepted.",
  },
  {
    id: "a3",
    title: "Updated document requirements for Educational Assistance",
    institution: "Cebu City Scholarship Office",
    date: "2026-10-08",
    content: "Applicants must now submit a Voter's Certificate in addition to the Barangay Certificate of Residency. Applications without the new document will be marked incomplete.",
  },
];

export const seedApplications: Application[] = [
  {
    id: "ap1",
    scholarshipId: "s3",
    scholarshipTitle: "Future Leaders Grant (Demo)",
    name: "Maria Santos (Demo)",
    email: "maria.santos@example.com",
    school: "Sample State University",
    course: "BS Psychology",
    yearLevel: "2nd Year",
    statement: "I want to continue serving my community through student leadership.",
    documents: ["Transcript of Records", "Income Tax Return of parents", "Recommendation Letter", "Essay on leadership"],
    status: "Under Review",
    submittedAt: "2026-10-13",
  },
  {
    id: "ap2",
    scholarshipId: "s5",
    scholarshipTitle: "Cebu City Educational Assistance (Demo)",
    name: "Paolo Reyes (Demo)",
    email: "paolo.reyes@example.com",
    school: "Sample University of Cebu",
    course: "BS Accountancy",
    yearLevel: "3rd Year",
    statement: "This assistance will help me finish my accountancy degree.",
    documents: ["Barangay Certificate of Residency", "Voter's Certificate", "Certificate of Enrollment"],
    status: "Submitted",
    submittedAt: "2026-10-15",
  },
];

export const seedProfile: Profile = {
  name: "Juan Dela Cruz",
  email: "juan.delacruz@example.com",
  school: "Sample State University",
  course: "BS Computer Science",
  yearLevel: "2nd Year",
};
