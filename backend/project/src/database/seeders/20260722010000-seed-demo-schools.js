'use strict';

const MongoDB = require('@core/util/classes/MongoDB');
const { hashPassword } = require('@src/services/auth/credentials');

const demoEmail = 'demo.schools@schoolsupportatlas.local';
const siteIds = [
  'ssa-demo-kano-al-falah',
  'ssa-demo-kano-nurul-huda',
  'ssa-demo-kano-sabon-gari',
  'ssa-demo-kano-gidan-ilimi',
];

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`;

const schools = [
  {
    uniqueSiteId: 'ssa-demo-kano-al-falah',
    schoolName: 'Al-Falah Madrasa and Basic School',
    localName: 'Makarantar Al-Falah',
    schoolType: 'integrated_madrasa',
    operatorName: 'Mallam Yusuf Abdullahi',
    phone: '+234 803 111 2244',
    urgency: 'high',
    description:
      'An integrated madrasa and basic education centre serving children in Fagge. The school combines Qur\'anic studies, numeracy, Hausa literacy, and remedial classes for learners who need extra support.',
    totalStudents: 612,
    totalTeachers: 22,
    totalClassrooms: 13,
    foundedYear: 1997,
    images: [
      img('photo-1588075592446-265fd1e6e76f'),
      img('photo-1542810634-71277d95dcbb'),
      img('photo-1503676260728-1c00da094a0b'),
    ],
    needs: [
      {
        id: 'need-kano-water',
        title: 'Safe water storage tanks',
        category: 'Water',
        description: 'Install two raised storage tanks and replace damaged taps so pupils have clean water through the school day.',
        urgency: 'Critical',
        estimatedCost: 850000,
        quantityRequired: 2,
        quantityFunded: 0,
        status: 'Open',
        images: [img('photo-1548856391-27f157cdc31f')],
      },
      {
        id: 'need-kano-mats',
        title: 'Learning mats for early classes',
        category: 'Learning Materials',
        description: 'Provide washable floor mats for Qur\'anic recitation, reading circles, and early-grade group lessons.',
        urgency: 'High',
        estimatedCost: 420000,
        quantityRequired: 35,
        quantityFunded: 8,
        status: 'Partially Funded',
        images: [img('photo-1497633762265-9d179a990aa6')],
      },
    ],
    location: {
      latitude: 12.0022,
      longitude: 8.5919,
      country: 'Nigeria',
      state: 'Kano',
      lga: 'Fagge',
      ward: 'Sabon Gari',
      community: 'Fagge Central',
      landmark: 'Near Friday mosque',
      address: 'Fagge Local Government Area, Kano',
    },
    childrenStats: {
      totalChildren: 612,
      residentialChildren: 180,
      nonResidentialChildren: 432,
      boysCount: 358,
      girlsCount: 254,
      age0to5: 42,
      age6to9: 196,
      age10to14: 286,
      age15plus: 88,
      ageGroups: ['0-5', '6-9', '10-14', '15+'],
      notes: 'Counts supplied by school operators during the latest verification visit.',
    },
    welfare: {
      feedingStatus: 'One meal most school days',
      shelterStatus: 'Mixed day and residential learning rooms',
      sanitationStatus: 'Functional latrine needs repair',
      waterAccess: 'Shared borehole and storage drums',
      healthAccess: 'Nearest clinic is ten minutes away',
      clothingStatus: 'Many pupils need uniforms and sandals',
      hasCleanWater: false,
      hasSanitation: true,
      hasHealthcare: true,
      hasNutritiousFood: false,
      hasEducationalMaterials: false,
      hasElectricity: true,
      hasInternet: false,
      additionalNotes: 'Water storage and learning materials are the highest priority items.',
    },
  },
  {
    uniqueSiteId: 'ssa-demo-kano-nurul-huda',
    schoolName: 'Nurul Huda Community School',
    localName: 'Nurul Huda Rijiyar Zaki',
    schoolType: 'community_school',
    operatorName: 'Hajiya Safiya Bello',
    phone: '+234 806 222 3377',
    urgency: 'medium',
    description:
      'A community-supported primary school in Rijiyar Zaki with strong enrolment from nearby households. Teachers need classroom materials, repairs, and reading support for lower-primary pupils.',
    totalStudents: 438,
    totalTeachers: 16,
    totalClassrooms: 9,
    foundedYear: 2009,
    images: [
      img('photo-1577896851231-70ef18881754'),
      img('photo-1524995997946-a1c2e315a42f'),
      img('photo-1509062522246-3755977927d7'),
    ],
    needs: [
      {
        id: 'need-nurul-books',
        title: 'Reading corner books',
        category: 'Learning Materials',
        description: 'Create nine class reading corners with graded readers, phonics cards, and Hausa storybooks.',
        urgency: 'High',
        estimatedCost: 640000,
        quantityRequired: 9,
        quantityFunded: 3,
        status: 'Partially Funded',
        images: [img('photo-1481627834876-b7833e8f5570')],
      },
      {
        id: 'need-nurul-roof',
        title: 'Classroom roof repairs',
        category: 'Classrooms',
        description: 'Repair leaking roof sheets over Primary 2 and Primary 3 before the next rainy season.',
        urgency: 'Critical',
        estimatedCost: 1350000,
        quantityRequired: 2,
        quantityFunded: 0,
        status: 'Open',
        images: [img('photo-1591123120675-6f7f1aae0e5b')],
      },
    ],
    location: {
      latitude: 12.0505,
      longitude: 8.5242,
      country: 'Nigeria',
      state: 'Kano',
      lga: 'Ungogo',
      ward: 'Rijiyar Zaki',
      community: 'Rijiyar Zaki',
      landmark: 'Behind community health post',
      address: 'Rijiyar Zaki, Ungogo, Kano',
    },
    childrenStats: {
      totalChildren: 438,
      residentialChildren: 0,
      nonResidentialChildren: 438,
      boysCount: 221,
      girlsCount: 217,
      age0to5: 34,
      age6to9: 174,
      age10to14: 198,
      age15plus: 32,
      ageGroups: ['0-5', '6-9', '10-14', '15+'],
      notes: 'High demand for early-grade literacy support.',
    },
    welfare: {
      feedingStatus: 'No regular feeding programme',
      shelterStatus: 'Permanent classrooms with some roof damage',
      sanitationStatus: 'Two latrines available',
      waterAccess: 'Community hand pump',
      healthAccess: 'Community health post nearby',
      clothingStatus: 'Uniform support needed for orphaned pupils',
      hasCleanWater: true,
      hasSanitation: true,
      hasHealthcare: true,
      hasNutritiousFood: false,
      hasEducationalMaterials: false,
      hasElectricity: false,
      hasInternet: false,
      additionalNotes: 'Roof repairs should be handled before books are stored in classrooms.',
    },
  },
  {
    uniqueSiteId: 'ssa-demo-kano-sabon-gari',
    schoolName: 'Sabon Gari Quranic Learning Centre',
    localName: 'Makarantar Sabon Gari',
    schoolType: 'traditional_quranic_school',
    operatorName: 'Mallam Ibrahim Sani',
    phone: '+234 809 876 5432',
    urgency: 'high',
    description:
      'A Quranic learning centre near the market that now runs basic literacy and numeracy lessons in the afternoons. The centre needs safer sleeping mats, food support, and solar lighting.',
    totalStudents: 286,
    totalTeachers: 8,
    totalClassrooms: 5,
    foundedYear: 1988,
    images: [
      img('photo-1544717305-2782549b5136'),
      img('photo-1519452575417-564c1401ecc0'),
      img('photo-1498243691581-b145c3f54a5a'),
    ],
    needs: [
      {
        id: 'need-sabon-food',
        title: 'Monthly feeding support',
        category: 'Food',
        description: 'Provide breakfast staples for residential learners and vulnerable day pupils for one month.',
        urgency: 'Critical',
        estimatedCost: 980000,
        quantityRequired: 1,
        quantityFunded: 0,
        status: 'Open',
        images: [img('photo-1542838132-92c53300491e')],
      },
      {
        id: 'need-sabon-solar',
        title: 'Solar study lights',
        category: 'Technology',
        description: 'Install rechargeable solar lamps for evening revision and safer hostel movement.',
        urgency: 'High',
        estimatedCost: 560000,
        quantityRequired: 16,
        quantityFunded: 4,
        status: 'Partially Funded',
        images: [img('photo-1509391366360-2e959784a276')],
      },
    ],
    location: {
      latitude: 12.0111,
      longitude: 8.5312,
      country: 'Nigeria',
      state: 'Kano',
      lga: 'Fagge',
      ward: 'Sabon Gari East',
      community: 'Kantin Kwari',
      landmark: 'Near textile market',
      address: 'Kantin Kwari axis, Sabon Gari, Kano',
    },
    childrenStats: {
      totalChildren: 286,
      residentialChildren: 174,
      nonResidentialChildren: 112,
      boysCount: 268,
      girlsCount: 18,
      age0to5: 11,
      age6to9: 88,
      age10to14: 151,
      age15plus: 36,
      ageGroups: ['0-5', '6-9', '10-14', '15+'],
      notes: 'Residential pupils require regular feeding and sleeping materials.',
    },
    welfare: {
      feedingStatus: 'Community donations, inconsistent',
      shelterStatus: 'Shared residential rooms',
      sanitationStatus: 'Basic latrine, water carried from nearby source',
      waterAccess: 'Public tap nearby',
      healthAccess: 'No regular health outreach',
      clothingStatus: 'Many pupils require sandals and bedding',
      hasCleanWater: false,
      hasSanitation: false,
      hasHealthcare: false,
      hasNutritiousFood: false,
      hasEducationalMaterials: true,
      hasElectricity: false,
      hasInternet: false,
      additionalNotes: 'Solar lights and feeding support will improve safety and attendance.',
    },
  },
  {
    uniqueSiteId: 'ssa-demo-kano-gidan-ilimi',
    schoolName: 'Gidan Ilimi Girls Primary School',
    localName: 'Gidan Ilimi Mata',
    schoolType: 'public_school',
    operatorName: 'Mrs. Zainab Garba',
    phone: '+234 802 444 7788',
    urgency: 'medium',
    description:
      'A girls primary school with a growing enrolment and a strong parent committee. Current priorities are desks, sanitation supplies, and teacher resource kits.',
    totalStudents: 524,
    totalTeachers: 19,
    totalClassrooms: 11,
    foundedYear: 2012,
    images: [
      img('photo-1503676260728-1c00da094a0b'),
      img('photo-1606761568499-6d2451b23c66'),
      img('photo-1588072432836-e10032774350'),
    ],
    needs: [
      {
        id: 'need-gidan-desks',
        title: 'Two-seater classroom desks',
        category: 'Furniture',
        description: 'Add durable two-seater desks for upper-primary classrooms where pupils currently share benches.',
        urgency: 'High',
        estimatedCost: 2100000,
        quantityRequired: 60,
        quantityFunded: 18,
        status: 'Partially Funded',
        images: [img('photo-1580582932707-520aed937b7b')],
      },
      {
        id: 'need-gidan-sanitation',
        title: 'Girls sanitation kits',
        category: 'Sanitation',
        description: 'Provide hygiene kits, bins, and handwashing supplies to support attendance for older girls.',
        urgency: 'Medium',
        estimatedCost: 380000,
        quantityRequired: 120,
        quantityFunded: 20,
        status: 'Partially Funded',
        images: [img('photo-1581578731548-c64695cc6952')],
      },
    ],
    location: {
      latitude: 11.9904,
      longitude: 8.5698,
      country: 'Nigeria',
      state: 'Kano',
      lga: 'Nassarawa',
      ward: 'Giginyu',
      community: 'Giginyu',
      landmark: 'Opposite community football field',
      address: 'Giginyu, Nassarawa, Kano',
    },
    childrenStats: {
      totalChildren: 524,
      residentialChildren: 0,
      nonResidentialChildren: 524,
      boysCount: 0,
      girlsCount: 524,
      age0to5: 28,
      age6to9: 212,
      age10to14: 251,
      age15plus: 33,
      ageGroups: ['0-5', '6-9', '10-14', '15+'],
      notes: 'Girls attendance improves when sanitation supplies are available.',
    },
    welfare: {
      feedingStatus: 'No routine feeding support',
      shelterStatus: 'Permanent classrooms',
      sanitationStatus: 'Functional toilets need supplies and maintenance',
      waterAccess: 'Borehole on site',
      healthAccess: 'Occasional public health visits',
      clothingStatus: 'Uniform support needed for vulnerable pupils',
      hasCleanWater: true,
      hasSanitation: true,
      hasHealthcare: true,
      hasNutritiousFood: false,
      hasEducationalMaterials: false,
      hasElectricity: true,
      hasInternet: false,
      additionalNotes: 'Furniture and sanitation support are the main barriers to a better learning day.',
    },
  },
];

async function schoolPhotoRows(school, schoolId, userId, now) {
  const rows = [];
  for (let index = 0; index < school.images.length; index += 1) {
    rows.push({
      id: await MongoDB.default.nextId('school_photos'),
      schoolId,
      uploadedByUserId: userId,
      clientId: `${school.uniqueSiteId}-photo-${index + 1}`,
      fileUrl: school.images[index],
      localPath: null,
      mediaKind: 'image',
      mimeType: 'image/jpeg',
      size: null,
      category: index === 0 ? 'profile' : 'classroom',
      caption: `${school.schoolName} photo ${index + 1}`,
      capturedAt: now,
      latitude: school.location.latitude,
      longitude: school.location.longitude,
      createdAt: now,
      updatedAt: now,
    });
  }
  return rows;
}

async function schoolNeedRows(school, schoolId, userId, now) {
  const rows = [];
  for (const need of school.needs) {
    rows.push({
      id: await MongoDB.default.nextId('school_needs'),
      schoolId,
      submittedByUserId: userId,
      originalNeedId: need.id,
      title: need.title,
      category: need.category,
      description: need.description,
      urgency: need.urgency,
      estimatedCost: need.estimatedCost,
      quantityRequired: need.quantityRequired,
      quantityFunded: need.quantityFunded || 0,
      images: Array.isArray(need.images) ? need.images : [],
      status: 'active',
      pausedAt: null,
      pausedByUserId: null,
      deletedAt: null,
      deletedByUserId: null,
      createdAt: now,
      updatedAt: now,
    });
  }
  return rows;
}

async function ensureSeedUser(queryInterface, now) {
  const users = queryInterface.db.collection('users');
  await users.deleteMany({ email: demoEmail });
  const { salt, hash } = hashPassword('Demo@123456');
  const user = {
    id: await MongoDB.default.nextId('users'),
    name: 'School Support Atlas Demo Admin',
    email: demoEmail,
    username: 'ssa_demo_admin',
    role: 'admin',
    status: 'active',
    permissions: [],
    passwordSalt: salt,
    passwordHash: hash,
    createdAt: now,
    updatedAt: now,
  };
  await users.insertOne(user);
  return user;
}

async function clearDemoRows(queryInterface) {
  const schoolRows = await queryInterface.db
    .collection('schools')
    .find({ uniqueSiteId: { $in: siteIds } })
    .project({ id: 1 })
    .toArray();
  const schoolIds = schoolRows.map((row) => row.id);

  await queryInterface.db.collection('schools').deleteMany({ uniqueSiteId: { $in: siteIds } });
  await queryInterface.db.collection('users').deleteMany({ email: demoEmail });
  if (schoolIds.length) {
    await Promise.all([
      queryInterface.db.collection('school_locations').deleteMany({ schoolId: { $in: schoolIds } }),
      queryInterface.db.collection('school_operators').deleteMany({ schoolId: { $in: schoolIds } }),
      queryInterface.db.collection('school_children_stats').deleteMany({ schoolId: { $in: schoolIds } }),
      queryInterface.db.collection('school_welfare_assessments').deleteMany({ schoolId: { $in: schoolIds } }),
      queryInterface.db.collection('school_photos').deleteMany({ schoolId: { $in: schoolIds } }),
      queryInterface.db.collection('school_needs').deleteMany({ schoolId: { $in: schoolIds } }),
      queryInterface.db.collection('school_reviews').deleteMany({ schoolId: { $in: schoolIds } }),
      queryInterface.db.collection('admin_notifications').deleteMany({ 'metadata.seedSiteId': { $in: siteIds } }),
    ]);
  }
}

/** MongoDB seeder */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await clearDemoRows(queryInterface);
    const user = await ensureSeedUser(queryInterface, now);

    for (const school of schools) {
      const schoolId = await MongoDB.default.nextId('schools');
      await queryInterface.db.collection('schools').insertOne({
        id: schoolId,
        submittedByUserId: user.id,
        approvedByUserId: user.id,
        uniqueSiteId: school.uniqueSiteId,
        schoolName: school.schoolName,
        localName: school.localName,
        schoolType: school.schoolType,
        operatorName: school.operatorName,
        phone: school.phone,
        status: 'approved',
        urgency: school.urgency,
        description: school.description,
        totalStudents: school.totalStudents,
        totalTeachers: school.totalTeachers,
        totalClassrooms: school.totalClassrooms,
        foundedYear: school.foundedYear,
        images: school.images,
        needs: school.needs,
        correctionIssues: [],
        adminFeedback: null,
        submittedAt: now,
        reviewedAt: now,
        archivedAt: null,
        archivedByUserId: null,
        createdAt: now,
        updatedAt: now,
      });

      await queryInterface.db.collection('school_locations').insertOne({
        id: await MongoDB.default.nextId('school_locations'),
        schoolId,
        ...school.location,
        createdAt: now,
        updatedAt: now,
      });

      await queryInterface.db.collection('school_operators').insertOne({
        id: await MongoDB.default.nextId('school_operators'),
        schoolId,
        name: school.operatorName,
        phone: school.phone,
        createdAt: now,
        updatedAt: now,
      });

      await queryInterface.db.collection('school_children_stats').insertOne({
        id: await MongoDB.default.nextId('school_children_stats'),
        schoolId,
        ...school.childrenStats,
        createdAt: now,
        updatedAt: now,
      });

      await queryInterface.db.collection('school_welfare_assessments').insertOne({
        id: await MongoDB.default.nextId('school_welfare_assessments'),
        schoolId,
        ...school.welfare,
        createdAt: now,
        updatedAt: now,
      });

      await queryInterface.db.collection('school_photos').insertMany(await schoolPhotoRows(school, schoolId, user.id, now));
      await queryInterface.db.collection('school_needs').insertMany(await schoolNeedRows(school, schoolId, user.id, now));

      await queryInterface.db.collection('school_reviews').insertOne({
        id: await MongoDB.default.nextId('school_reviews'),
        schoolId,
        reviewedByUserId: user.id,
        status: 'approved',
        comment: 'Seeded demo school approved for the public School Support Atlas website.',
        createdAt: now,
        updatedAt: now,
      });
    }
  },

  async down(queryInterface) {
    await clearDemoRows(queryInterface);
  },
};
