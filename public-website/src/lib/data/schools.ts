import type { Need, School } from "@/lib/types";

const image = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`;

export const schools: School[] = [
  {
    id: "lagos-bright-path",
    name: "Bright Path Community School",
    type: "Public School",
    description:
      "A low-fee community primary school serving children from riverine and market worker families. The school has strong attendance but limited classroom furniture and reading resources.",
    state: "Lagos",
    city: "Makoko",
    address: "Makoko Waterfront, Lagos Mainland",
    latitude: 6.4969,
    longitude: 3.3904,
    totalStudents: 428,
    totalTeachers: 14,
    totalClassrooms: 9,
    foundedYear: 2008,
    images: [
      image("photo-1509062522246-3755977927d7"),
      image("photo-1497633762265-9d179a990aa6"),
      image("photo-1577896851231-70ef18881754"),
    ],
    contactPerson: "Mrs. Amina Lawal",
    verificationStatus: "Verified",
    lastUpdated: "2026-05-12",
    needs: [
      {
        id: "need-lagos-desks",
        schoolId: "lagos-bright-path",
        title: "Durable classroom desks",
        category: "Furniture",
        description:
          "Replace broken benches and add desks for Primary 1 to 4 pupils.",
        urgency: "High",
        estimatedCost: 3200000,
        quantityRequired: 80,
        quantityFunded: 26,
        status: "Partially Funded",
        images: [image("photo-1524995997946-a1c2e315a42f")],
      },
      {
        id: "need-lagos-books",
        schoolId: "lagos-bright-path",
        title: "Literacy corner books",
        category: "Learning Materials",
        description:
          "Create classroom reading corners with graded storybooks and phonics cards.",
        urgency: "Medium",
        estimatedCost: 1450000,
        quantityRequired: 12,
        quantityFunded: 4,
        status: "Open",
        images: [image("photo-1481627834876-b7833e8f5570")],
      },
    ],
  },
  {
    id: "kano-al-falah",
    name: "Al-Falah Madrasa and Basic School",
    type: "Madrasa",
    description:
      "Integrated madrasa and basic education center supporting children in Qur'anic studies, numeracy, and Hausa literacy. The learning rooms need ventilation and safe water access.",
    state: "Kano",
    city: "Fagge",
    address: "Fagge Local Government Area, Kano",
    latitude: 12.0022,
    longitude: 8.5919,
    totalStudents: 612,
    totalTeachers: 22,
    totalClassrooms: 13,
    foundedYear: 1997,
    images: [
      image("photo-1588075592446-265fd1e6e76f"),
      image("photo-1542810634-71277d95dcbb"),
      image("photo-1503676260728-1c00da094a0b"),
    ],
    contactPerson: "Mallam Yusuf Abdullahi",
    verificationStatus: "Verified",
    lastUpdated: "2026-05-08",
    needs: [
      {
        id: "need-kano-water",
        schoolId: "kano-al-falah",
        title: "Solar borehole repair",
        category: "Water",
        description:
          "Repair pump, replace storage tank, and reconnect water points used by pupils.",
        urgency: "Critical",
        estimatedCost: 5800000,
        quantityRequired: 1,
        quantityFunded: 0,
        status: "Open",
        images: [image("photo-1541919329513-35f7af297129")],
      },
      {
        id: "need-kano-teachers",
        schoolId: "kano-al-falah",
        title: "Teacher monthly support",
        category: "Teacher Support",
        description:
          "Bridge stipend gap for volunteer female literacy teachers for one term.",
        urgency: "High",
        estimatedCost: 2400000,
        quantityRequired: 6,
        quantityFunded: 2,
        status: "Partially Funded",
        images: [image("photo-1573497491208-6b1acb260507")],
      },
    ],
  },
  {
    id: "abuja-unity-basic",
    name: "Unity Basic Education Centre",
    type: "Public School",
    description:
      "A fast-growing school on the edge of Abuja serving internally displaced and host community children. The school prioritizes safe classrooms and psychosocial learning spaces.",
    state: "FCT",
    city: "Gwagwalada",
    address: "Kutunku Extension, Gwagwalada",
    latitude: 8.939,
    longitude: 7.075,
    totalStudents: 537,
    totalTeachers: 18,
    totalClassrooms: 10,
    foundedYear: 2013,
    images: [
      image("photo-1571260899304-425eee4c7efc"),
      image("photo-1596495578065-6e0763fa1178"),
      image("photo-1519452575417-564c1401ecc0"),
    ],
    contactPerson: "Mr. Daniel Musa",
    verificationStatus: "Field Review",
    lastUpdated: "2026-05-03",
    needs: [
      {
        id: "need-abuja-classroom",
        schoolId: "abuja-unity-basic",
        title: "Temporary classroom roofing",
        category: "Classrooms",
        description:
          "Replace leaking zinc sheets and reinforce the timber frame before rainy season.",
        urgency: "Critical",
        estimatedCost: 4750000,
        quantityRequired: 3,
        quantityFunded: 1,
        status: "Partially Funded",
        images: [image("photo-1497486751825-1233686d5d80")],
      },
      {
        id: "need-abuja-food",
        schoolId: "abuja-unity-basic",
        title: "School meal support",
        category: "Food",
        description:
          "Provide beans, rice, and fortified cereal for vulnerable pupils for eight weeks.",
        urgency: "High",
        estimatedCost: 3600000,
        quantityRequired: 8,
        quantityFunded: 3,
        status: "Partially Funded",
        images: [image("photo-1547592180-85f173990554")],
      },
    ],
  },
  {
    id: "kaduna-gidan-ilimi",
    name: "Gidan Ilimi Girls Madrasa",
    type: "Madrasa",
    description:
      "A girls learning center combining Islamic studies, numeracy, and life skills. Families requested more seating, sanitation privacy, and solar lighting for late afternoon lessons.",
    state: "Kaduna",
    city: "Zaria",
    address: "Kofar Gayan, Zaria",
    latitude: 11.0855,
    longitude: 7.7199,
    totalStudents: 286,
    totalTeachers: 11,
    totalClassrooms: 7,
    foundedYear: 2004,
    images: [
      image("photo-1544717305-2782549b5136"),
      image("photo-1594608661623-aa0bd3a69d98"),
      image("photo-1604881991720-f91add269bed"),
    ],
    contactPerson: "Hajiya Safiya Bello",
    verificationStatus: "Verified",
    lastUpdated: "2026-04-28",
    needs: [
      {
        id: "need-kaduna-sanitation",
        schoolId: "kaduna-gidan-ilimi",
        title: "Girls sanitation block",
        category: "Sanitation",
        description:
          "Build two privacy stalls, washing area, and handwashing station.",
        urgency: "Critical",
        estimatedCost: 6900000,
        quantityRequired: 1,
        quantityFunded: 0,
        status: "Open",
        images: [image("photo-1600585154340-be6161a56a0c")],
      },
      {
        id: "need-kaduna-solar",
        schoolId: "kaduna-gidan-ilimi",
        title: "Solar study lights",
        category: "Technology",
        description:
          "Install safe LED lighting for classrooms and evening reading circles.",
        urgency: "Medium",
        estimatedCost: 1800000,
        quantityRequired: 7,
        quantityFunded: 2,
        status: "Open",
        images: [image("photo-1509391366360-2e959784a276")],
      },
    ],
  },
  {
    id: "borno-new-horizon",
    name: "New Horizon Learning Shelter",
    type: "Community School",
    description:
      "A displacement-area learning shelter providing catch-up education for children who missed years of schooling. Supplies are shared across multiple shifts.",
    state: "Borno",
    city: "Maiduguri",
    address: "Muna Garage Community, Maiduguri",
    latitude: 11.8469,
    longitude: 13.1571,
    totalStudents: 744,
    totalTeachers: 19,
    totalClassrooms: 12,
    foundedYear: 2016,
    images: [
      image("photo-1503676382389-4809596d5290"),
      image("photo-1577896852618-80c1a2925a5e"),
      image("photo-1610484826967-09c5720778c7"),
    ],
    contactPerson: "Mr. Ibrahim Grema",
    verificationStatus: "Verified",
    lastUpdated: "2026-05-15",
    needs: [
      {
        id: "need-borno-kits",
        schoolId: "borno-new-horizon",
        title: "Catch-up learning kits",
        category: "Learning Materials",
        description:
          "Exercise books, pencils, slates, and numeracy charts for accelerated classes.",
        urgency: "Critical",
        estimatedCost: 5100000,
        quantityRequired: 744,
        quantityFunded: 210,
        status: "Partially Funded",
        images: [image("photo-1512820790803-83ca734da794")],
      },
      {
        id: "need-borno-classroom",
        schoolId: "borno-new-horizon",
        title: "Shade classroom tents",
        category: "Classrooms",
        description:
          "Provide two durable tents for overflow afternoon learning groups.",
        urgency: "High",
        estimatedCost: 3800000,
        quantityRequired: 2,
        quantityFunded: 0,
        status: "Open",
        images: [image("photo-1562774053-701939374585")],
      },
    ],
  },
  {
    id: "oyo-hope-primary",
    name: "Hope Primary School Ibadan",
    type: "Public School",
    description:
      "A public primary school with strong community leadership and a growing early grade reading program. Current needs focus on classroom renewal and teacher resources.",
    state: "Oyo",
    city: "Ibadan",
    address: "Molete Road, Ibadan",
    latitude: 7.3775,
    longitude: 3.947,
    totalStudents: 391,
    totalTeachers: 16,
    totalClassrooms: 8,
    foundedYear: 1989,
    images: [
      image("photo-1523580846011-d3a5bc25702b"),
      image("photo-1516321497487-e288fb19713f"),
      image("photo-1509062522246-3755977927d7"),
    ],
    contactPerson: "Mrs. Funke Adeyemi",
    verificationStatus: "Verified",
    lastUpdated: "2026-04-19",
    needs: [
      {
        id: "need-oyo-library",
        schoolId: "oyo-hope-primary",
        title: "Mini library renovation",
        category: "Learning Materials",
        description:
          "Repair shelving, add reading mats, and stock beginner books.",
        urgency: "Medium",
        estimatedCost: 2600000,
        quantityRequired: 1,
        quantityFunded: 1,
        status: "Funded",
        images: [image("photo-1521587760476-6c12a4b040da")],
      },
      {
        id: "need-oyo-chairs",
        schoolId: "oyo-hope-primary",
        title: "Teacher chairs and cabinets",
        category: "Furniture",
        description:
          "Secure teacher materials and replace unsafe chairs in lower primary rooms.",
        urgency: "Medium",
        estimatedCost: 980000,
        quantityRequired: 16,
        quantityFunded: 5,
        status: "Open",
        images: [image("photo-1580582932707-520aed937b7b")],
      },
    ],
  },
  {
    id: "sokoto-salam",
    name: "Darus Salam Integrated Madrasa",
    type: "Madrasa",
    description:
      "A community-supported madrasa expanding into basic literacy and numeracy for children in surrounding settlements. The school needs water storage and mats.",
    state: "Sokoto",
    city: "Sokoto",
    address: "Runjin Sambo Area, Sokoto",
    latitude: 13.0059,
    longitude: 5.2476,
    totalStudents: 354,
    totalTeachers: 10,
    totalClassrooms: 6,
    foundedYear: 2001,
    images: [
      image("photo-1509062522246-3755977927d7"),
      image("photo-1571260898933-d1d1d3d642f6"),
      image("photo-1513258496099-48168024aec0"),
    ],
    contactPerson: "Mallam Haruna Sani",
    verificationStatus: "Pending",
    lastUpdated: "2026-05-01",
    needs: [
      {
        id: "need-sokoto-water",
        schoolId: "sokoto-salam",
        title: "Water tank and taps",
        category: "Water",
        description:
          "Install a 2,000 liter tank and three child-safe taps for daily use.",
        urgency: "High",
        estimatedCost: 1900000,
        quantityRequired: 1,
        quantityFunded: 0,
        status: "Open",
        images: [image("photo-1523362628745-0c100150b504")],
      },
      {
        id: "need-sokoto-mats",
        schoolId: "sokoto-salam",
        title: "Learning mats",
        category: "Furniture",
        description:
          "Provide washable mats for early learners currently sitting on bare floors.",
        urgency: "High",
        estimatedCost: 840000,
        quantityRequired: 60,
        quantityFunded: 18,
        status: "Partially Funded",
        images: [image("photo-1604881991720-f91add269bed")],
      },
    ],
  },
  {
    id: "rivers-creek",
    name: "Creekside Community School",
    type: "Community School",
    description:
      "A community school for fishing settlements near Port Harcourt. Attendance rises when learning materials and transport support are available.",
    state: "Rivers",
    city: "Port Harcourt",
    address: "Borokiri Waterfront, Port Harcourt",
    latitude: 4.8156,
    longitude: 7.0498,
    totalStudents: 267,
    totalTeachers: 9,
    totalClassrooms: 5,
    foundedYear: 2011,
    images: [
      image("photo-1517486808906-6ca8b3f04846"),
      image("photo-1588072432836-e10032774350"),
      image("photo-1503676260728-1c00da094a0b"),
    ],
    contactPerson: "Mr. Timi Okoro",
    verificationStatus: "Verified",
    lastUpdated: "2026-05-10",
    needs: [
      {
        id: "need-rivers-tech",
        schoolId: "rivers-creek",
        title: "Shared digital learning tablet",
        category: "Technology",
        description:
          "One rugged tablet and projector kit for teacher-led lessons.",
        urgency: "Medium",
        estimatedCost: 2100000,
        quantityRequired: 1,
        quantityFunded: 0,
        status: "Open",
        images: [image("photo-1516321318423-f06f85e504b3")],
      },
      {
        id: "need-rivers-raincoats",
        schoolId: "rivers-creek",
        title: "Rainy season attendance kits",
        category: "Learning Materials",
        description:
          "Waterproof school bags, sandals, and notebooks for vulnerable pupils.",
        urgency: "High",
        estimatedCost: 3150000,
        quantityRequired: 120,
        quantityFunded: 44,
        status: "Partially Funded",
        images: [image("photo-1503676382389-4809596d5290")],
      },
    ],
  },
];

export const allNeeds: Need[] = schools.flatMap((school) => school.needs);

export function getSchoolById(id: string) {
  return schools.find((school) => school.id === id);
}

export function getNeedById(id: string) {
  return allNeeds.find((need) => need.id === id);
}

export function getUrgentNeeds(limit = 6) {
  const rank = { Critical: 0, High: 1, Medium: 2, Completed: 3 };
  return [...allNeeds]
    .filter((need) => need.status !== "Completed")
    .sort((a, b) => rank[a.urgency] - rank[b.urgency])
    .slice(0, limit);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getNeedProgress(need: Need) {
  if (need.quantityRequired === 0) return 0;
  return Math.min(
    100,
    Math.round((need.quantityFunded / need.quantityRequired) * 100),
  );
}

// Replace these mock exports with API/database calls when the admin backend is connected.
