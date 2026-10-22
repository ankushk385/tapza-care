import type { Doctor, Prescription } from "../../types/config";

export const doctors: Doctor[] = [
  {
    id: "doc-ananya",
    name: "Dr. Ananya Rao",
    specialty: "General Physician",
    photoUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    feeInr: 400,
    languages: ["English", "Telugu", "Hindi"],
    clinicName: "Tapza Clinic, Jubilee Hills",
    nextAvailable: "Today · 4:30 pm",
  },
  {
    id: "doc-vikram",
    name: "Dr. Vikram Reddy",
    specialty: "Orthopaedics",
    photoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    feeInr: 650,
    languages: ["English", "Telugu"],
    clinicName: "Tapza Clinic, Jubilee Hills",
    nextAvailable: "Today · 6:00 pm",
  },
  {
    id: "doc-fatima",
    name: "Dr. Fatima Khan",
    specialty: "Paediatrics",
    photoUrl: "https://randomuser.me/api/portraits/women/68.jpg",
    feeInr: 500,
    languages: ["English", "Hindi", "Urdu"],
    clinicName: "Tapza Clinic, Banjara Hills",
    nextAvailable: "Tomorrow · 10:00 am",
  },
  {
    id: "doc-suresh",
    name: "Dr. Suresh Babu",
    specialty: "Cardiology",
    photoUrl: "https://randomuser.me/api/portraits/men/54.jpg",
    feeInr: 900,
    languages: ["English", "Telugu", "Hindi"],
    clinicName: "Tapza Heart Centre, Gachibowli",
    nextAvailable: "Tomorrow · 11:30 am",
  },
  {
    id: "doc-priya",
    name: "Dr. Priya Menon",
    specialty: "Dermatology",
    photoUrl: "https://randomuser.me/api/portraits/women/21.jpg",
    feeInr: 550,
    languages: ["English", "Malayalam", "Hindi"],
    clinicName: "Tapza Clinic, Jubilee Hills",
    nextAvailable: "Fri · 9:00 am",
  },
];

export function findDoctor(id: string): Doctor | undefined {
  return doctors.find((doctor) => doctor.id === id);
}

export const prescriptions: Prescription[] = [
  {
    id: "rx-1042",
    issuedAt: "2026-10-12T10:15:00.000Z",
    doctorName: "Dr. Ananya Rao",
    clinicName: "Tapza Clinic, Jubilee Hills",
    medicines: [
      {
        id: "med-metformin",
        name: "Metformin 500 mg",
        dose: "1 tablet",
        days: 30,
        timing: ["morning", "night"],
      },
      {
        id: "med-amlodipine",
        name: "Amlodipine 5 mg",
        dose: "1 tablet",
        days: 30,
        timing: ["night"],
      },
      {
        id: "med-vitd",
        name: "Vitamin D3 60K",
        dose: "1 sachet",
        days: 8,
        timing: ["morning"],
      },
    ],
  },
  {
    id: "rx-0987",
    issuedAt: "2026-10-02T16:40:00.000Z",
    doctorName: "Dr. Suresh Babu",
    clinicName: "Tapza Heart Centre, Gachibowli",
    medicines: [
      {
        id: "med-atorva",
        name: "Atorvastatin 10 mg",
        dose: "1 tablet",
        days: 30,
        timing: ["night"],
      },
      {
        id: "med-aspirin",
        name: "Aspirin 75 mg",
        dose: "1 tablet",
        days: 30,
        timing: ["morning"],
      },
      {
        id: "med-metoprolol",
        name: "Metoprolol 25 mg",
        dose: "1 tablet",
        days: 15,
        timing: ["morning", "night"],
      },
    ],
  },
  {
    id: "rx-0901",
    issuedAt: "2026-09-21T09:05:00.000Z",
    doctorName: "Dr. Fatima Khan",
    clinicName: "Tapza Clinic, Banjara Hills",
    medicines: [
      {
        id: "med-cetirizine",
        name: "Cetirizine syrup",
        dose: "5 ml",
        days: 5,
        timing: ["night"],
      },
      {
        id: "med-ors",
        name: "ORS sachet",
        dose: "1 sachet in 1 L water",
        days: 3,
        timing: ["morning", "afternoon"],
      },
    ],
  },
];
