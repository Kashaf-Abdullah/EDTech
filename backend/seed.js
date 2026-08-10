const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('\n🔌 MongoDB connected\n');

    try { await mongoose.connection.db.dropCollection('users');       } catch(e) {}
    try { await mongoose.connection.db.dropCollection('courses');     } catch(e) {}
    try { await mongoose.connection.db.dropCollection('entrytests');  } catch(e) {}
    try { await mongoose.connection.db.dropCollection('entrytestattempts'); } catch(e) {}
    console.log('🗑️  Collections cleared\n');

    const users = [
      { name:'Super Admin',  email:'admin@edupak.com',   password:'admin123',   role:'admin',   isVerified:true, approvalStatus:'approved', isBanned:false },
      { name:'Ali Hassan',   email:'ali@edupak.com',     password:'tutor123',   role:'tutor',   isVerified:true, approvalStatus:'approved', isBanned:false, bio:'Mathematics aur Physics ka 8 saal ka experience.', subjects:['Math','Physics'], experience:'8 years teaching', profilePic:'https://api.dicebear.com/7.x/avataaars/svg?seed=ali', totalEarnings:0, pendingPayout:0 },
      { name:'Sara Khan',    email:'sara@edupak.com',    password:'tutor123',   role:'tutor',   isVerified:true, approvalStatus:'approved', isBanned:false, bio:'IELTS aur English specialist. 500+ students.', subjects:['English','IELTS'], experience:'6 years IELTS trainer', profilePic:'https://api.dicebear.com/7.x/avataaars/svg?seed=sara', totalEarnings:0, pendingPayout:0 },
      { name:'Usman Tariq',  email:'usman@edupak.com',   password:'tutor123',   role:'tutor',   isVerified:true, approvalStatus:'approved', isBanned:false, bio:'Full Stack Developer aur CS instructor.', subjects:['Coding','Python'], experience:'5 years industry + 3 years teaching', profilePic:'https://api.dicebear.com/7.x/avataaars/svg?seed=usman', totalEarnings:0, pendingPayout:0 },
      { name:'Hamza Rauf',   email:'hamza@student.com',  password:'student123', role:'student', isVerified:true, approvalStatus:'approved', isBanned:false },
      { name:'Ayesha Malik', email:'ayesha@student.com', password:'student123', role:'student', isVerified:true, approvalStatus:'approved', isBanned:false },
    ];

    // Insert one-by-one using insertOne — avoids insertMany's iterable/destructuring issues entirely
    const insertedUsers = [];
    for (const u of users) {
      const hashed = await bcrypt.hash(u.password, 12);
      const result = await mongoose.connection.db.collection('users').insertOne({
        ...u,
        password: hashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      insertedUsers.push({ ...u, _id: result.insertedId });
      console.log(`✅ User: ${u.name} (${u.role})`);
    }

    const tutors = insertedUsers.filter(u => u.role === 'tutor');
    const adminUser = insertedUsers.find(u => u.role === 'admin');

    console.log('\n📚 Creating courses...\n');

    const courses = [
      {
        title: 'Complete Mathematics Matric and Intermediate',
        description: 'Pakistan ke matric aur intermediate syllabus. Algebra, Geometry, Calculus sab cover hoga.',
        tutor: tutors[0]._id,
        price: 1500, category: 'Math', level: 'beginner', language: 'Urdu',
        thumbnail: 'https://placehold.co/800x450/4F46E5/ffffff?text=Mathematics',
        isPublished: true, isApproved: true, isFeatured: false,
        rating: 4.8, totalReviews: 124, totalStudents: 340,
        tags: ['math', 'matric', 'algebra'],
        whatYouLearn: ['Basic Algebra', 'Quadratic Equations', 'Geometry'],
        requirements: ['Basic arithmetic knowledge'],
        sections: [],
        lessons: [
          { title: 'Course Introduction', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 0, isFree: true,  duration: 10 },
          { title: 'Basic Algebra',        type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 1, isFree: true,  duration: 45 },
          { title: 'Quadratic Equations',  type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 2, isFree: false, duration: 50 },
          { title: 'Geometry Basics',      type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 3, isFree: false, duration: 55 },
          { title: 'Practice Problems',    type: 'pdf',   url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf', order: 4, isFree: true, duration: 0 },
        ],
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        title: 'Physics Mastery FSc Part 1 and 2',
        description: 'FSc Physics complete course — Mechanics, Waves, Optics, Electricity. Past papers bhi cover honge.',
        tutor: tutors[0]._id,
        price: 2000, category: 'Physics', level: 'intermediate', language: 'Urdu',
        thumbnail: 'https://placehold.co/800x450/7C3AED/ffffff?text=Physics',
        isPublished: true, isApproved: true, isFeatured: false,
        rating: 4.6, totalReviews: 89, totalStudents: 210,
        tags: ['physics', 'fsc', 'mechanics'],
        whatYouLearn: ['Kinematics', 'Newton Laws', 'Waves and Optics'],
        requirements: ['FSc Part 1 Math'],
        sections: [],
        lessons: [
          { title: 'Physics Introduction', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 0, isFree: true,  duration: 15 },
          { title: 'Kinematics',           type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 1, isFree: true,  duration: 60 },
          { title: 'Newton Laws',          type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 2, isFree: false, duration: 55 },
          { title: 'Numericals PDF',       type: 'pdf',   url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf', order: 3, isFree: false, duration: 0 },
        ],
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        title: 'IELTS Complete Preparation Band 7 Plus',
        description: 'IELTS ke sare 4 modules: Reading, Writing, Listening, Speaking. Band 7+ target.',
        tutor: tutors[1]._id,
        price: 3500, category: 'IELTS', level: 'intermediate', language: 'English',
        thumbnail: 'https://placehold.co/800x450/059669/ffffff?text=IELTS',
        isPublished: true, isApproved: true, isFeatured: true,
        rating: 4.9, totalReviews: 203, totalStudents: 512,
        tags: ['ielts', 'english', 'band7'],
        whatYouLearn: ['Reading strategies', 'Writing Task 1 and 2', 'Speaking tips'],
        requirements: ['Intermediate English level'],
        sections: [],
        lessons: [
          { title: 'IELTS Overview',       type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 0, isFree: true,  duration: 20 },
          { title: 'Reading Strategies',   type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 1, isFree: true,  duration: 50 },
          { title: 'Writing Task 1',       type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 2, isFree: false, duration: 65 },
          { title: 'Writing Task 2',       type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 3, isFree: false, duration: 70 },
          { title: 'Speaking Practice',    type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 4, isFree: false, duration: 45 },
        ],
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        title: 'Complete MERN Stack Zero to Hero',
        description: 'MongoDB, Express, React, Node.js — poora MERN stack ek course mein. Real projects banayenge.',
        tutor: tutors[2]._id,
        price: 4500, category: 'Coding', level: 'beginner', language: 'Urdu',
        thumbnail: 'https://placehold.co/800x450/DC2626/ffffff?text=MERN+Stack',
        isPublished: true, isApproved: true, isFeatured: true,
        rating: 4.7, totalReviews: 156, totalStudents: 423,
        tags: ['mern', 'react', 'nodejs', 'mongodb'],
        whatYouLearn: ['Node.js aur Express', 'React aur Redux', 'MongoDB database'],
        requirements: ['Basic JavaScript knowledge'],
        sections: [],
        lessons: [
          { title: 'Setup aur Overview',   type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 0, isFree: true,  duration: 15 },
          { title: 'JavaScript Basics',    type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 1, isFree: true,  duration: 90 },
          { title: 'Node.js Express',      type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 2, isFree: false, duration: 75 },
          { title: 'MongoDB Mongoose',     type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 3, isFree: false, duration: 80 },
          { title: 'React Components',     type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 4, isFree: false, duration: 95 },
          { title: 'Redux Toolkit',        type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 5, isFree: false, duration: 60 },
          { title: 'Full Blog Project',    type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 6, isFree: false, duration: 120 },
        ],
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        title: 'Python for Beginners in Urdu',
        description: 'Python bilkul zero se seekho. Variables, loops, functions, OOP — sab kuch simple tarike se.',
        tutor: tutors[2]._id,
        price: 2500, category: 'Coding', level: 'beginner', language: 'Urdu',
        thumbnail: 'https://placehold.co/800x450/D97706/ffffff?text=Python',
        isPublished: true, isApproved: true, isFeatured: false,
        rating: 4.5, totalReviews: 98, totalStudents: 287,
        tags: ['python', 'beginners', 'programming'],
        whatYouLearn: ['Variables aur Data Types', 'Loops aur Functions', 'OOP Concepts'],
        requirements: ['Koi bhi programming knowledge nahi chahiye'],
        sections: [],
        lessons: [
          { title: 'Python Installation',  type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 0, isFree: true,  duration: 20 },
          { title: 'Variables Data Types', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 1, isFree: true,  duration: 40 },
          { title: 'Loops for and while',  type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 2, isFree: false, duration: 45 },
          { title: 'Functions Modules',    type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 3, isFree: false, duration: 50 },
          { title: 'OOP Classes Objects',  type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 4, isFree: false, duration: 55 },
          { title: 'Calculator Project',   type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 5, isFree: false, duration: 35 },
        ],
        createdAt: new Date(), updatedAt: new Date(),
      },
    ];

    for (const c of courses) {
      await mongoose.connection.db.collection('courses').insertOne(c);
      console.log(`✅ Course: "${c.title}" — PKR ${c.price}`);
    }

    console.log('\n🧠 Creating entry tests...\n');
    const entryTests = [
      {
        title: 'ECAT Physics Practice Test',
        examType: 'ECAT',
        subject: 'Physics',
        description: 'ECAT physics preparation with conceptual MCQs and explanations.',
        freeQuestionCount: 10,
        price: 500,
        isPublished: true,
        createdBy: adminUser._id,
        questions: [
          { text: 'What is the SI unit of force?', options: ['Newton','Joule','Watt','Pascal'], correctAnswer: 'Newton', explanation: 'Force is measured in newtons in SI.', isFree: true },
          { text: 'Which quantity is measured in joules?', options: ['Energy','Power','Pressure','Velocity'], correctAnswer: 'Energy', explanation: 'Energy is measured in joules.', isFree: true },
          { text: 'Speed of light in vacuum is approximately:', options: ['3 × 10^8 m/s','3 × 10^5 m/s','3 × 10^6 m/s','3 × 10^7 m/s'], correctAnswer: '3 × 10^8 m/s', explanation: 'Light travels at about 3 × 10^8 m/s in vacuum.', isFree: false },
          { text: 'Acceleration is the rate of change of:', options: ['Velocity','Distance','Time','Mass'], correctAnswer: 'Velocity', explanation: 'Acceleration measures change in velocity per unit time.', isFree: false },
        ],
        totalAttempts: 0,
        averageScore: 0,
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        title: 'ECAT Mathematics Mock Test',
        examType: 'ECAT',
        subject: 'Mathematics',
        description: 'ECAT math practice with algebra, trigonometry, and calculus questions.',
        freeQuestionCount: 10,
        price: 600,
        isPublished: true,
        createdBy: adminUser._id,
        questions: [
          { text: 'If 2x + 5 = 15, what is x?', options: ['3','5','7','10'], correctAnswer: '5', explanation: 'Subtract 5 then divide by 2.', isFree: true },
          { text: 'sin 90° equals:', options: ['0','1','-1','1/2'], correctAnswer: '1', explanation: 'Sine of 90° is 1.', isFree: true },
          { text: 'The derivative of x^2 is:', options: ['2x','x','x^3','2'], correctAnswer: '2x', explanation: 'The derivative of x^2 is 2x.', isFree: false },
          { text: 'The value of log10(100) is:', options: ['1','2','10','100'], correctAnswer: '2', explanation: '10^2 = 100, so the log is 2.', isFree: false },
        ],
        totalAttempts: 0,
        averageScore: 0,
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        title: 'MCAT Biology Foundation Test',
        examType: 'MCAT',
        subject: 'Biology',
        description: 'MCAT biology MCQs focusing on cell biology and genetics.',
        freeQuestionCount: 10,
        price: 700,
        isPublished: true,
        createdBy: adminUser._id,
        questions: [
          { text: 'The basic unit of life is the:', options: ['Cell','Atom','Molecule','Tissue'], correctAnswer: 'Cell', explanation: 'Cells are the basic structural and functional units of life.', isFree: true },
          { text: 'DNA is found in which organelle?', options: ['Nucleus','Ribosome','Golgi apparatus','Lysosome'], correctAnswer: 'Nucleus', explanation: 'DNA is stored primarily in the nucleus of eukaryotic cells.', isFree: true },
          { text: 'Which process produces gametes?', options: ['Meiosis','Mitosis','Fertilization','Respiration'], correctAnswer: 'Meiosis', explanation: 'Meiosis reduces chromosome number to form gametes.', isFree: false },
          { text: 'Enzymes are mainly:', options: ['Proteins','Lipids','Carbohydrates','Nucleic acids'], correctAnswer: 'Proteins', explanation: 'Most enzymes are proteins that catalyze reactions.', isFree: false },
        ],
        totalAttempts: 0,
        averageScore: 0,
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        title: 'MCAT Chemistry Practice Test',
        examType: 'MCAT',
        subject: 'Chemistry',
        description: 'MCAT chemistry practice covering atomic structure and bonding.',
        freeQuestionCount: 10,
        price: 800,
        isPublished: true,
        createdBy: adminUser._id,
        questions: [
          { text: 'Which subatomic particle has a negative charge?', options: ['Electron','Proton','Neutron','Photon'], correctAnswer: 'Electron', explanation: 'Electrons carry a negative charge.', isFree: true },
          { text: 'The atomic number represents the number of:', options: ['Protons','Neutrons','Electrons','Isotopes'], correctAnswer: 'Protons', explanation: 'Atomic number equals the number of protons.', isFree: true },
          { text: 'Which bond is formed by sharing electrons?', options: ['Covalent','Ionic','Metallic','Hydrogen'], correctAnswer: 'Covalent', explanation: 'Covalent bonds involve electron sharing.', isFree: false },
          { text: 'pH of a neutral solution is:', options: ['7','0','14','1'], correctAnswer: '7', explanation: 'A neutral solution has pH 7 at 25°C.', isFree: false },
        ],
        totalAttempts: 0,
        averageScore: 0,
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        title: 'ECAT English Comprehension Test',
        examType: 'ECAT',
        subject: 'English',
        description: 'ECAT English practice for vocabulary and grammar.',
        freeQuestionCount: 10,
        price: 400,
        isPublished: true,
        createdBy: adminUser._id,
        questions: [
          { text: 'Choose the correct synonym of “brave”.', options: ['Courageous','Shy','Weak','Angry'], correctAnswer: 'Courageous', explanation: 'Brave and courageous are synonyms.', isFree: true },
          { text: 'Which sentence is grammatically correct?', options: ['She goes to school daily.','She go to school daily.','She going to school daily.','She gone to school daily.'], correctAnswer: 'She goes to school daily.', explanation: 'The third-person singular uses “goes”.', isFree: true },
          { text: 'What is the plural of “child”?', options: ['Children','Childs','Childes','Childern'], correctAnswer: 'Children', explanation: 'The irregular plural of child is children.', isFree: false },
        ],
        totalAttempts: 0,
        averageScore: 0,
        createdAt: new Date(), updatedAt: new Date(),
      },
    ];

    for (const test of entryTests) {
      await mongoose.connection.db.collection('entrytests').insertOne(test);
      console.log(`✅ Entry Test: "${test.title}" (${test.examType} - ${test.subject})`);
    }

    console.log('\n' + '═'.repeat(52));
    console.log('🎉  SEED COMPLETE!\n');
    console.log('  🛡️  admin@edupak.com     / admin123');
    console.log('  👨‍🏫 ali@edupak.com       / tutor123  (Math & Physics)');
    console.log('  👨‍🏫 sara@edupak.com      / tutor123  (IELTS & English)');
    console.log('  👨‍🏫 usman@edupak.com     / tutor123  (Coding & Python)');
    console.log('  👨‍🎓 hamza@student.com    / student123');
    console.log('  👨‍🎓 ayesha@student.com   / student123');
    console.log('\n  📚 5 courses created (approved + published)');
    console.log('  🧠 5 entry tests created (ECAT + MCAT)');
    console.log('═'.repeat(52) + '\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
