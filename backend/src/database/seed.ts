import bcrypt from 'bcryptjs';
import db from './connection.js';
import { initSchema } from './schema.js';

export async function seedDatabase() {
  console.log('--- Initializing Librixa Database Schema ---');
  initSchema();

  // Clear existing data in correct foreign key order
  db.exec(`
    DELETE FROM fines;
    DELETE FROM notifications;
    DELETE FROM library_events;
    DELETE FROM reservations;
    DELETE FROM borrowings;
    DELETE FROM books;
    DELETE FROM categories;
    DELETE FROM users;
  `);

  console.log('--- Seeding Categories ---');
  const categories = [
    { name: 'Programming', slug: 'programming', description: 'Software engineering, design patterns, languages, and clean code practices.' },
    { name: 'AI & Machine Learning', slug: 'ai-ml', description: 'Artificial intelligence, neural networks, machine learning algorithms, and deep learning.' },
    { name: 'Computer Networks', slug: 'networking', description: 'Networking architectures, protocols, distributed communications, and cloud infrastructure.' },
    { name: 'Database', slug: 'database', description: 'Relational databases, SQL, NoSQL, data warehousing, and distributed storage systems.' },
    { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Information security, network defense, ethical hacking, and cryptographic protocols.' },
    { name: 'Cloud Computing', slug: 'cloud-computing', description: 'Cloud architectures, containerization, microservices, and modern DevOps.' },
    { name: 'Mathematics', slug: 'mathematics', description: 'Discrete mathematics, linear algebra, calculus, probability, and statistics.' },
    { name: 'Science', slug: 'science', description: 'Fundamental physics, electronics, computing principles, and quantum technology.' },
    { name: 'Management', slug: 'management', description: 'Project management, product leadership, agile development, and organizational behavior.' },
    { name: 'Literature', slug: 'literature', description: 'Classic literature, technical writing, scientific communication, and academic papers.' },
  ];

  const catInsert = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
  const catMap = new Map<string, number>();

  for (const cat of categories) {
    const res = catInsert.run(cat.name, cat.slug, cat.description);
    catMap.set(cat.slug, Number(res.lastInsertRowid));
  }

  console.log('--- Seeding Users ---');
  const studentPassword = await bcrypt.hash('student123', 10);
  const librarianPassword = await bcrypt.hash('library123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  const userInsert = db.prepare(`
    INSERT INTO users (name, email, student_id, department, password_hash, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const studentUserRes = userInsert.run(
    'Shivanand K',
    'student@librixa.edu',
    'CSE2026042',
    'Computer Science & Engineering',
    studentPassword,
    'student'
  );
  const studentId = Number(studentUserRes.lastInsertRowid);

  const librarianUserRes = userInsert.run(
    'Dr. Eleanor Vance',
    'librarian@librixa.edu',
    null,
    'Library & Information Science',
    librarianPassword,
    'librarian'
  );
  const librarianId = Number(librarianUserRes.lastInsertRowid);

  const adminUserRes = userInsert.run(
    'Chief Administrator',
    'admin@librixa.edu',
    null,
    'Information Technology Services',
    adminPassword,
    'admin'
  );

  const arjunRes = userInsert.run(
    'Arjun Sharma',
    'arjun.sharma@librixa.edu',
    'CSE2026015',
    'Computer Science & Engineering',
    studentPassword,
    'student'
  );

  const priyaRes = userInsert.run(
    'Priya Patel',
    'priya.patel@librixa.edu',
    'IT2026089',
    'Information Technology',
    studentPassword,
    'student'
  );

  const rahulRes = userInsert.run(
    'Rahul Verma',
    'rahul.verma@librixa.edu',
    'ECE2026033',
    'Electronics & Communication',
    studentPassword,
    'student'
  );

  console.log('--- Seeding Books ---');
  const books = [
    {
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      category: 'programming',
      publisher: 'Prentice Hall',
      publication_year: 2008,
      pages: 464,
      language: 'English',
      description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. Clean Code is divided into three parts: principles, patterns, and practices of writing clean code; several case studies of increasing complexity; and a collection of heuristics and "smells" gathered while creating the case studies.',
      total_copies: 5,
      available_copies: 2,
      rating: 4.8,
      cover_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Introduction to Algorithms (CLRS)',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
      isbn: '978-0262033848',
      category: 'programming',
      publisher: 'MIT Press',
      publication_year: 2009,
      pages: 1292,
      language: 'English',
      description: 'Some books on algorithms are rigorous but incomplete; others cover masses of material but lack rigor. Introduction to Algorithms uniquely combines rigor and comprehensiveness. The book covers a broad range of algorithms in depth, yet makes their design and analysis accessible to all levels of readers.',
      total_copies: 6,
      available_copies: 3,
      rating: 4.9,
      cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Computer Networking: A Top-Down Approach',
      author: 'James F. Kurose, Keith W. Ross',
      isbn: '978-0133594140',
      category: 'networking',
      publisher: 'Pearson',
      publication_year: 2021,
      pages: 864,
      language: 'English',
      description: 'Motivate your study of both network hardware and software through a top-down approach to computer networking. Kurose and Ross convey the core principles of networking through the lens of applications down to the physical layer, illuminating protocols like HTTP, DNS, TCP, and BGP.',
      total_copies: 4,
      available_copies: 2,
      rating: 4.7,
      cover_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell, Peter Norvig',
      isbn: '978-0136042594',
      category: 'ai-ml',
      publisher: 'Pearson',
      publication_year: 2020,
      pages: 1152,
      language: 'English',
      description: 'The authoritative, most widely used and comprehensive guide to the theory and practice of artificial intelligence. Used in over 1,400 universities worldwide, this definitive volume covers search algorithms, probabilistic reasoning, machine learning, deep learning, NLP, and robotics.',
      total_copies: 3,
      available_copies: 0, // Set to 0 so reserve flow can be demonstrated
      rating: 4.9,
      cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
      isbn: '978-0078022159',
      category: 'database',
      publisher: 'McGraw-Hill Education',
      publication_year: 2019,
      pages: 1376,
      language: 'English',
      description: 'Database System Concepts presents the fundamental concepts of database management in an intuitive manner geared toward allowing students to begin working with databases as quickly as possible. Covers relational model, SQL, transactions, query optimization, and distributed systems.',
      total_copies: 4,
      available_copies: 3,
      rating: 4.6,
      cover_url: 'https://images.unsplash.com/photo-1507842229451-7f01be7ff612?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Python Crash Course: A Hands-On, Project-Based Introduction',
      author: 'Eric Matthes',
      isbn: '978-1593279288',
      category: 'programming',
      publisher: 'No Starch Press',
      publication_year: 2019,
      pages: 544,
      language: 'English',
      description: 'Python Crash Course is the world\'s best-selling guide to the Python programming language. This fast-paced, thorough introduction to programming with Python will have you writing programs, solving problems, and making things that work in no time.',
      total_copies: 5,
      available_copies: 4,
      rating: 4.8,
      cover_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Operating System Concepts',
      author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
      isbn: '978-1119800361',
      category: 'programming',
      publisher: 'Wiley',
      publication_year: 2018,
      pages: 1024,
      language: 'English',
      description: 'Operating System Concepts provides a solid theoretical foundation for understanding operating systems. Authors combine state-of-the-art topics with key principles, covering process management, memory management, storage management, security, and virtualization.',
      total_copies: 5,
      available_copies: 3,
      rating: 4.7,
      cover_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Machine Learning',
      author: 'Tom M. Mitchell',
      isbn: '978-0070428072',
      category: 'ai-ml',
      publisher: 'McGraw-Hill Education',
      publication_year: 1997,
      pages: 432,
      language: 'English',
      description: 'This book covers the field of machine learning, which is the study of algorithms that allow computer programs to automatically improve through experience. Key topics include decision trees, neural networks, Bayesian learning, computational learning theory, and reinforcement learning.',
      total_copies: 3,
      available_copies: 1,
      rating: 4.5,
      cover_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      isbn: '978-1449373320',
      category: 'database',
      publisher: 'O\'Reilly Media',
      publication_year: 2017,
      pages: 616,
      language: 'English',
      description: 'Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability. In this practical and comprehensive guide, author Martin Kleppmann helps you navigate this diverse landscape.',
      total_copies: 4,
      available_copies: 2,
      rating: 4.95,
      cover_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'The Pragmatic Programmer: Your Journey to Mastery',
      author: 'David Thomas, Andrew Hunt',
      isbn: '978-0135957059',
      category: 'programming',
      publisher: 'Addison-Wesley Professional',
      publication_year: 2019,
      pages: 352,
      language: 'English',
      description: 'The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development to examine the core process—taking a requirement and producing working, maintainable code that delights its users.',
      total_copies: 4,
      available_copies: 3,
      rating: 4.85,
      cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Deep Learning',
      author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
      isbn: '978-0262035613',
      category: 'ai-ml',
      publisher: 'MIT Press',
      publication_year: 2016,
      pages: 800,
      language: 'English',
      description: 'An introduction to a broad range of topics in deep learning, covering mathematical and conceptual background, deep learning techniques used in industry, and research perspectives. Endorsed by Elon Musk and Yann LeCun.',
      total_copies: 3,
      available_copies: 2,
      rating: 4.75,
      cover_url: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Structure and Interpretation of Computer Programs (SICP)',
      author: 'Harold Abelson, Gerald Jay Sussman',
      isbn: '978-0262510875',
      category: 'programming',
      publisher: 'MIT Press',
      publication_year: 1996,
      pages: 657,
      language: 'English',
      description: 'Structure and Interpretation of Computer Programs has had a dramatic impact on computer science curricula over the past decades. The book teaches computational problem solving using the Scheme dialect of Lisp.',
      total_copies: 2,
      available_copies: 1,
      rating: 4.9,
      cover_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Cryptography and Network Security: Principles and Practice',
      author: 'William Stallings',
      isbn: '978-0134444284',
      category: 'cybersecurity',
      publisher: 'Pearson',
      publication_year: 2017,
      pages: 768,
      language: 'English',
      description: 'In an age of viruses and hackers, of electronic eavesdropping and electronic fraud, security is paramount. This book provides a practical survey of both the principles and practice of cryptography and network security.',
      total_copies: 3,
      available_copies: 2,
      rating: 4.6,
      cover_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Cloud Native Patterns: Designing High-Availability Systems',
      author: 'Cornelia Davis',
      isbn: '978-1617294297',
      category: 'cloud-computing',
      publisher: 'Manning Publications',
      publication_year: 2019,
      pages: 408,
      language: 'English',
      description: 'Cloud Native Patterns teaches the mental model you need to understand cloud native architectures and build software that thrives in the unpredictable cloud environment. Covers containerization, loose coupling, and resiliency.',
      total_copies: 3,
      available_copies: 2,
      rating: 4.7,
      cover_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Discrete Mathematics and Its Applications',
      author: 'Kenneth H. Rosen',
      isbn: '978-1259676512',
      category: 'mathematics',
      publisher: 'McGraw-Hill Education',
      publication_year: 2018,
      pages: 1120,
      language: 'English',
      description: 'Rosen\'s Discrete Mathematics and its Applications presents a precise, relevant, comprehensive approach to mathematical concepts. This world-renowned text was written to accommodate the needs across a variety of majors, including computer science and engineering.',
      total_copies: 4,
      available_copies: 3,
      rating: 4.65,
      cover_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Linear Algebra and Its Applications',
      author: 'David C. Lay, Steven R. Lay, Judi J. McDonald',
      isbn: '978-0321982384',
      category: 'mathematics',
      publisher: 'Pearson',
      publication_year: 2015,
      pages: 576,
      language: 'English',
      description: 'Linear algebra is relatively easy for students during the early stages of the course, when the material is presented in a familiar, concrete setting. Lay\'s text introduces concepts early in a familiar setting and develops them gradually.',
      total_copies: 4,
      available_copies: 3,
      rating: 4.7,
      cover_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Compilers: Principles, Techniques, and Tools (Dragon Book)',
      author: 'Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman',
      isbn: '978-0321486813',
      category: 'programming',
      publisher: 'Pearson',
      publication_year: 2006,
      pages: 1040,
      language: 'English',
      description: 'Known to professors, students, and developers worldwide as the "Dragon Book," every edition has defined the standard for compiler construction. Topics include lexical analysis, syntax analysis, code generation, and garbage collection.',
      total_copies: 2,
      available_copies: 1,
      rating: 4.85,
      cover_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Computer Architecture: A Quantitative Approach',
      author: 'John L. Hennessy, David A. Patterson',
      isbn: '978-0128119051',
      category: 'science',
      publisher: 'Morgan Kaufmann',
      publication_year: 2017,
      pages: 936,
      language: 'English',
      description: 'The computing world today is in the midst of a revolution: mobile clients and cloud computing have emerged as the dominant paradigms. Written by Turing Award winners Hennessy and Patterson, this classic text guides you through pipeline design and domain-specific architectures.',
      total_copies: 3,
      available_copies: 2,
      rating: 4.9,
      cover_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Cracking the Coding Interview: 189 Programming Questions & Solutions',
      author: 'Gayle Laakmann McDowell',
      isbn: '978-0984782857',
      category: 'programming',
      publisher: 'CareerCup',
      publication_year: 2015,
      pages: 708,
      language: 'English',
      description: 'Cracking the Coding Interview gives you the interview preparation you need to get the top software developer jobs. 189 programming interview questions, ranging from the basics to the trickiest algorithm problems.',
      total_copies: 5,
      available_copies: 3,
      rating: 4.8,
      cover_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Head First Design Patterns: Building Extensible and Maintainable Software',
      author: 'Eric Freeman, Elisabeth Robson',
      isbn: '978-1492078005',
      category: 'programming',
      publisher: 'O\'Reilly Media',
      publication_year: 2020,
      pages: 672,
      language: 'English',
      description: 'You\'re not alone. At any given moment, someone is trying to survive the same software design problems that you\'re having. Learn the best practices and experience of other software developers who have faced identical software design hurdles.',
      total_copies: 4,
      available_copies: 2,
      rating: 4.75,
      cover_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Site Reliability Engineering: How Google Runs Production Systems',
      author: 'Betsy Beyer, Chris Jones, Jennifer Petoff, Niall Richard Murphy',
      isbn: '978-1491929124',
      category: 'cloud-computing',
      publisher: 'O\'Reilly Media',
      publication_year: 2016,
      pages: 550,
      language: 'English',
      description: 'In this collection of essays and articles, key members of Google\'s Site Reliability Engineering team explain how and why their commitment to the entire lifecycle has enabled the company to successfully build, deploy, monitor, and maintain some of the largest software systems in the world.',
      total_copies: 3,
      available_copies: 2,
      rating: 4.8,
      cover_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Project Management for the Unofficial Project Manager',
      author: 'Kory Kogon, Suzette Blakemore, James Wood',
      isbn: '978-1941631102',
      category: 'management',
      publisher: 'BenBella Books',
      publication_year: 2015,
      pages: 248,
      language: 'English',
      description: 'Project management has become a critical skill for everyday business leaders. Authors provide a practical, proven process to initiate, execute, monitor, and close any collaborative project successfully.',
      total_copies: 3,
      available_copies: 3,
      rating: 4.55,
      cover_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
    }
  ];

  const bookInsert = db.prepare(`
    INSERT INTO books (
      title, author, isbn, category_id, publisher, publication_year,
      pages, language, description, total_copies, available_copies,
      rating, cover_url
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const bookIds: { [key: string]: number } = {};

  for (const book of books) {
    const categoryId = catMap.get(book.category) || 1;
    const res = bookInsert.run(
      book.title,
      book.author,
      book.isbn,
      categoryId,
      book.publisher,
      book.publication_year,
      book.pages,
      book.language,
      book.description,
      book.total_copies,
      book.available_copies,
      book.rating,
      book.cover_url
    );
    bookIds[book.title] = Number(res.lastInsertRowid);
  }

  console.log('--- Seeding Borrowing Records ---');
  const borrowInsert = db.prepare(`
    INSERT INTO borrowings (user_id, book_id, borrowed_at, due_at, returned_at, status, fine_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Today is in Oct 2026 as per calendar context
  // Shivanand's borrowings:
  // 1. Clean Code: due Oct 8 (2 days remaining) -> active 'borrowed'
  borrowInsert.run(
    studentId,
    bookIds['Clean Code: A Handbook of Agile Software Craftsmanship'],
    '2026-09-24 10:30:00',
    '2026-10-08 23:59:59',
    null,
    'borrowed',
    0
  );

  // 2. Introduction to Algorithms: due Oct 11 (5 days remaining) -> active 'borrowed'
  borrowInsert.run(
    studentId,
    bookIds['Introduction to Algorithms (CLRS)'],
    '2026-09-27 14:15:00',
    '2026-10-11 23:59:59',
    null,
    'borrowed',
    0
  );

  // 3. Computer Networking: due Oct 15 -> active 'borrowed'
  borrowInsert.run(
    studentId,
    bookIds['Computer Networking: A Top-Down Approach'],
    '2026-10-01 09:00:00',
    '2026-10-15 23:59:59',
    null,
    'borrowed',
    0
  );

  // 4. Designing Data-Intensive Applications: due Oct 17 -> active 'borrowed'
  borrowInsert.run(
    studentId,
    bookIds['Designing Data-Intensive Applications'],
    '2026-10-03 16:45:00',
    '2026-10-17 23:59:59',
    null,
    'borrowed',
    0
  );

  // 5. Python Crash Course: previously returned
  const returnedRecord = borrowInsert.run(
    studentId,
    bookIds['Python Crash Course: A Hands-On, Project-Based Introduction'],
    '2026-09-10 11:00:00',
    '2026-09-24 23:59:59',
    '2026-09-22 15:20:00',
    'returned',
    0
  );

  // Other users' borrowings
  borrowInsert.run(
    Number(arjunRes.lastInsertRowid),
    bookIds['Operating System Concepts'],
    '2026-09-28 11:20:00',
    '2026-10-12 23:59:59',
    null,
    'borrowed',
    0
  );

  borrowInsert.run(
    Number(priyaRes.lastInsertRowid),
    bookIds['Artificial Intelligence: A Modern Approach'],
    '2026-09-20 15:00:00',
    '2026-10-04 23:59:59',
    null,
    'overdue',
    10 // ₹5 per day, 2 days overdue
  );

  borrowInsert.run(
    Number(rahulRes.lastInsertRowid),
    bookIds['Deep Learning'],
    '2026-09-25 14:00:00',
    '2026-10-09 23:59:59',
    null,
    'borrowed',
    0
  );

  borrowInsert.run(
    Number(arjunRes.lastInsertRowid),
    bookIds['Cryptography and Network Security: Principles and Practice'],
    '2026-09-15 10:00:00',
    '2026-09-29 23:59:59',
    '2026-09-28 17:00:00',
    'returned',
    0
  );

  borrowInsert.run(
    Number(priyaRes.lastInsertRowid),
    bookIds['The Pragmatic Programmer: Your Journey to Mastery'],
    '2026-09-18 13:00:00',
    '2026-10-02 23:59:59',
    '2026-10-01 12:00:00',
    'returned',
    0
  );

  console.log('--- Seeding Reservations ---');
  const resInsert = db.prepare(`
    INSERT INTO reservations (user_id, book_id, reserved_at, status)
    VALUES (?, ?, ?, ?)
  `);

  // Shivanand reserved Artificial Intelligence (which has 0 available copies)
  resInsert.run(
    studentId,
    bookIds['Artificial Intelligence: A Modern Approach'],
    '2026-10-04 08:30:00',
    'active'
  );

  resInsert.run(
    Number(arjunRes.lastInsertRowid),
    bookIds['Compilers: Principles, Techniques, and Tools (Dragon Book)'],
    '2026-10-02 11:20:00',
    'active'
  );

  resInsert.run(
    Number(rahulRes.lastInsertRowid),
    bookIds['Structure and Interpretation of Computer Programs (SICP)'],
    '2026-10-03 14:15:00',
    'active'
  );

  resInsert.run(
    Number(priyaRes.lastInsertRowid),
    bookIds['Machine Learning'],
    '2026-10-01 09:40:00',
    'active'
  );

  resInsert.run(
    studentId,
    bookIds['Site Reliability Engineering: How Google Runs Production Systems'],
    '2026-09-20 16:00:00',
    'fulfilled'
  );

  console.log('--- Seeding Fines ---');
  const fineInsert = db.prepare(`
    INSERT INTO fines (user_id, borrowing_id, amount, status, created_at, paid_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Shivanand has past paid fine of ₹15, outstanding fine is ₹0
  fineInsert.run(
    studentId,
    Number(returnedRecord.lastInsertRowid),
    15,
    'paid',
    '2026-09-22 15:20:00',
    '2026-09-22 15:25:00'
  );

  // Priya has an overdue fine of ₹10 (pending)
  fineInsert.run(
    Number(priyaRes.lastInsertRowid),
    null,
    10,
    'pending',
    '2026-10-05 00:01:00',
    null
  );

  console.log('--- Seeding Notifications ---');
  const notifInsert = db.prepare(`
    INSERT INTO notifications (user_id, title, message, is_read, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  notifInsert.run(
    studentId,
    'Due Date Reminder: Clean Code',
    'Clean Code: A Handbook of Agile Software Craftsmanship is due in 2 days (Oct 8). Please return or renew on time.',
    0,
    '2026-10-06 08:00:00'
  );

  notifInsert.run(
    studentId,
    'Reservation Update',
    'Your reservation for "Artificial Intelligence: A Modern Approach" is currently #1 in queue. You will be notified when it is checked in.',
    0,
    '2026-10-05 14:30:00'
  );

  notifInsert.run(
    studentId,
    'Book Successfully Returned',
    '"Python Crash Course" was successfully returned. Thank you for maintaining campus library guidelines.',
    1,
    '2026-09-22 15:25:00'
  );

  notifInsert.run(
    studentId,
    'New Resources Available',
    'New AI & Machine Learning resources and ACM publications have been added to the LIBRIXA catalog.',
    1,
    '2026-10-01 10:00:00'
  );

  notifInsert.run(
    studentId,
    'Welcome to LIBRIXA',
    'Welcome to the LIBRIXA Smart Library Management platform. Explore catalog search, digital borrowing, and reserve services.',
    1,
    '2026-09-10 09:00:00'
  );

  console.log('--- Seeding Library Events ---');
  const eventInsert = db.prepare(`
    INSERT INTO library_events (title, description, event_date, location, category)
    VALUES (?, ?, ?, ?, ?)
  `);

  eventInsert.run(
    'Library Orientation & Digital Resources Tour',
    'Hands-on session for students to navigate IEEE Xplore, ScienceDirect, and LIBRIXA reservation tools.',
    '2026-10-07 10:00:00',
    'Main Auditorium, Level 2',
    'Orientation'
  );

  eventInsert.run(
    'Database Workshop: Distributed Systems at Scale',
    'Deep dive into transaction isolation, consensus protocols, and modern high-availability databases.',
    '2026-10-12 14:00:00',
    'Computer Science Lab 3',
    'Workshop'
  );

  eventInsert.run(
    'Annual University Book Fair 2026',
    'Explore thousands of newly arrived books, monographs, and academic publications with exclusive campus discounts.',
    '2026-10-18 09:30:00',
    'Central Library Quadrangle',
    'Book Fair'
  );

  eventInsert.run(
    'AI Research Seminar: Generative Models in Academia',
    'Distinguished guest lecture on multimodal transformers and ethical implications in scientific discovery.',
    '2026-10-24 15:00:00',
    'Conference Hall B',
    'Seminar'
  );

  eventInsert.run(
    'Mid-Term 24/7 Library Study Recess',
    'Continuous 24-hour study hall access, quiet zones, and complimentary refreshments for exam preparation.',
    '2026-10-15 00:00:00',
    'Central Library Wings A & B',
    'Academic Recess'
  );

  console.log('=====================================================');
  console.log('LIBRIXA DATABASE SEEDED SUCCESSFULLY!');
  console.log('Demo student:   student@librixa.edu / student123');
  console.log('Demo librarian: librarian@librixa.edu / library123');
  console.log('Demo admin:     admin@librixa.edu / admin123');
  console.log('=====================================================');
}

// Execute directly if run as main
if (process.argv[1]?.includes('seed')) {
  seedDatabase().catch((err) => {
    console.error('Database seeding failed:', err);
    process.exit(1);
  });
}
