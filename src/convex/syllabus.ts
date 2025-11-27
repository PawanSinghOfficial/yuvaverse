import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getSubjects = query({
  args: {
    course: v.string(),
    stream: v.string(),
    semester: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const subjects = await ctx.db
      .query("syllabus_subjects")
      .withIndex("by_stream_semester", (q) => 
        q.eq("stream", args.stream).eq("semester", args.semester)
      )
      .filter((q) => q.eq(q.field("course"), args.course))
      .collect();

    if (!userId) {
      return subjects.map(s => ({ ...s, progress: 0, totalTopics: 0, completedTopics: 0 }));
    }

    const allUserProgress = await ctx.db
      .query("syllabus_progress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const completedTopicIds = new Set(allUserProgress.filter(p => p.isCompleted).map(p => p.topicId));

    return await Promise.all(subjects.map(async (subject) => {
      const units = await ctx.db
        .query("syllabus_units")
        .withIndex("by_subject", (q) => q.eq("subjectId", subject._id))
        .collect();
      
      let totalTopics = 0;
      let completedTopics = 0;

      for (const unit of units) {
        const topics = await ctx.db
          .query("syllabus_topics")
          .withIndex("by_unit", (q) => q.eq("unitId", unit._id))
          .collect();
        
        totalTopics += topics.length;
        topics.forEach(topic => {
          if (completedTopicIds.has(topic._id)) {
            completedTopics++;
          }
        });
      }

      const progress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
      return { ...subject, progress, totalTopics, completedTopics };
    }));
  },
});

export const getSubjectDetails = query({
  args: { subjectId: v.id("syllabus_subjects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const units = await ctx.db
      .query("syllabus_units")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();

    const unitsWithTopics = await Promise.all(
      units.map(async (unit) => {
        const topics = await ctx.db
          .query("syllabus_topics")
          .withIndex("by_unit", (q) => q.eq("unitId", unit._id))
          .collect();
        
        // Sort topics by order
        topics.sort((a, b) => a.order - b.order);

        // Get progress if user is logged in
        const topicsWithProgress = await Promise.all(
          topics.map(async (topic) => {
            let isCompleted = false;
            if (userId) {
              const progress = await ctx.db
                .query("syllabus_progress")
                .withIndex("by_user_topic", (q) => 
                  q.eq("userId", userId).eq("topicId", topic._id)
                )
                .first();
              isCompleted = !!progress?.isCompleted;
            }
            return { ...topic, isCompleted };
          })
        );

        return { ...unit, topics: topicsWithProgress };
      })
    );

    // Sort units by unitNumber
    unitsWithTopics.sort((a, b) => a.unitNumber - b.unitNumber);

    return unitsWithTopics;
  },
});

export const toggleTopicCompletion = mutation({
  args: { topicId: v.id("syllabus_topics"), isCompleted: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("syllabus_progress")
      .withIndex("by_user_topic", (q) => 
        q.eq("userId", userId).eq("topicId", args.topicId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { isCompleted: args.isCompleted });
    } else {
      await ctx.db.insert("syllabus_progress", {
        userId,
        topicId: args.topicId,
        isCompleted: args.isCompleted,
      });
    }
  },
});

export const getUserTotalProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const progress = await ctx.db
      .query("syllabus_progress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    return progress.filter(p => p.isCompleted).length;
  },
});

// Seed function to populate initial data
export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    const addSubject = async (name: string, code: string, stream: string, semester: number, units: {title: string, topics: string[]}[]) => {
        // Check if subject already exists to avoid duplicates
        const existingSubject = await ctx.db
            .query("syllabus_subjects")
            .withIndex("by_stream_semester", (q) => q.eq("stream", stream).eq("semester", semester))
            .filter((q) => q.eq(q.field("name"), name))
            .first();
        
        if (existingSubject) return;

        const subjectId = await ctx.db.insert("syllabus_subjects", {
            name,
            code,
            course: "B.Tech",
            stream,
            semester,
        });
        
        for (let i = 0; i < units.length; i++) {
            const unitId = await ctx.db.insert("syllabus_units", {
                subjectId,
                unitNumber: i + 1,
                title: units[i].title,
            });
            
            for (let j = 0; j < units[i].topics.length; j++) {
                await ctx.db.insert("syllabus_topics", {
                    unitId,
                    title: units[i].topics[j],
                    order: j + 1,
                });
            }
        }
    };

    // --- SEMESTER 1 (Common) ---
    await addSubject("Applied Mathematics-I", "BAS-101", "Common", 1, [
        { title: "Matrices and Determinants", topics: ["Types of matrices", "Rank of a Matrix", "Inverse using Elementary Operations", "System of Linear Equations", "Eigenvalues and Eigenvectors", "Cayley-Hamilton Theorem"] },
        { title: "Differential Calculus", topics: ["Successive Differentiation", "Leibniz Theorem", "Partial Differentiation", "Euler's Theorem", "Jacobians", "Taylor's and Maclaurin's Series", "Maxima and Minima"] },
        { title: "Integral Calculus", topics: ["Definite Integrals", "Beta and Gamma Functions", "Multiple Integrals", "Change of Order of Integration", "Applications to Area and Volume"] }
    ]);

    await addSubject("Applied Physics-I", "BAS-103", "Common", 1, [
        { title: "Interference", topics: ["Coherent Sources", "Interference in Thin Films", "Newton's Rings", "Michelson Interferometer"] },
        { title: "Diffraction", topics: ["Single Slit Diffraction", "Double Slit Diffraction", "Diffraction Grating", "Resolving Power"] },
        { title: "Polarization", topics: ["Production of Polarized Light", "Brewster's Law", "Double Refraction", "Nicol Prism"] },
        { title: "Lasers and Fiber Optics", topics: ["Concept of Laser", "Ruby Laser", "He-Ne Laser", "Optical Fibers: Principle and Types", "Numerical Aperture"] }
    ]);

    await addSubject("Manufacturing Processes", "BEC-105", "Common", 1, [
        { title: "Casting", topics: ["Pattern Making", "Moulding Sands", "Casting Defects", "Die Casting"] },
        { title: "Welding", topics: ["Gas Welding", "Arc Welding", "Resistance Welding", "Soldering and Brazing"] },
        { title: "Metal Forming", topics: ["Forging", "Rolling", "Extrusion", "Drawing"] },
        { title: "Machining", topics: ["Lathe Operations", "Drilling", "Milling", "Shaping", "Grinding"] }
    ]);

    await addSubject("Electrical Science", "BEC-107", "Common", 1, [
        { title: "DC Circuits", topics: ["Kirchhoff's Laws", "Mesh and Nodal Analysis", "Thevenin's Theorem", "Norton's Theorem", "Superposition Theorem"] },
        { title: "AC Circuits", topics: ["RL, RC, RLC Circuits", "Resonance", "Power and Power Factor", "Three Phase Systems"] },
        { title: "Transformers", topics: ["Construction and Working", "EMF Equation", "Losses and Efficiency", "Open and Short Circuit Tests"] },
        { title: "Electrical Machines", topics: ["DC Machines: Motor and Generator", "Induction Motors", "Synchronous Machines"] }
    ]);

    // --- SEMESTER 2 (Common) ---
    await addSubject("Applied Mathematics-II", "BAS-102", "Common", 2, [
        { title: "Ordinary Differential Equations", topics: ["First Order Exact Differential Equations", "Linear Differential Equations of Higher Order", "Method of Variation of Parameters", "Cauchy-Euler Equations"] },
        { title: "Partial Differential Equations", topics: ["Formation of PDE", "Solution of Linear PDE of First Order", "Lagrange's Method", "Charpit's Method"] },
        { title: "Complex Analysis", topics: ["Analytic Functions", "Cauchy-Riemann Equations", "Complex Integration", "Cauchy's Integral Formula", "Power Series"] }
    ]);

    await addSubject("Applied Physics-II", "BAS-104", "Common", 2, [
        { title: "Electromagnetic Theory", topics: ["Maxwell's Equations", "Poynting Vector", "EM Wave Propagation"] },
        { title: "Quantum Mechanics", topics: ["De Broglie Hypothesis", "Schrodinger Wave Equation", "Particle in a Box", "Tunnel Effect"] },
        { title: "Solid State Physics", topics: ["Crystal Structure", "Band Theory of Solids", "Semiconductors", "Superconductivity"] }
    ]);

    await addSubject("Programming in C", "BCS-106", "Common", 2, [
        { title: "Introduction to C", topics: ["Data Types", "Operators", "Control Structures (if-else, loops)", "Functions"] },
        { title: "Arrays and Pointers", topics: ["1D and 2D Arrays", "String Handling", "Pointers and Address Arithmetic", "Dynamic Memory Allocation"] },
        { title: "Structures and Unions", topics: ["Defining Structures", "Array of Structures", "Unions", "File Handling in C"] }
    ]);

    await addSubject("Engineering Mechanics", "BME-108", "Common", 2, [
        { title: "Force Systems", topics: ["Coplanar Forces", "Resultant and Equilibrium", "Free Body Diagrams", "Friction"] },
        { title: "Centroid and Moment of Inertia", topics: ["Centroid of Plane Figures", "Moment of Inertia of Area and Mass", "Parallel and Perpendicular Axis Theorems"] },
        { title: "Kinematics and Kinetics", topics: ["Rectilinear Motion", "Curvilinear Motion", "Newton's Laws", "Work and Energy", "Impulse and Momentum"] }
    ]);

    // --- SEMESTER 3 (CSE) ---
    await addSubject("Data Structures", "BCS-201", "CSE", 3, [
        { title: "Introduction", topics: ["Arrays", "Linked Lists (Singly, Doubly, Circular)", "Stacks and Queues"] },
        { title: "Trees", topics: ["Binary Trees", "BST", "AVL Trees", "B-Trees", "Heaps"] },
        { title: "Graphs", topics: ["Graph Representations", "BFS and DFS", "Shortest Path Algorithms (Dijkstra, Floyd-Warshall)", "MST (Prim, Kruskal)"] },
        { title: "Sorting and Searching", topics: ["Bubble, Selection, Insertion Sort", "Quick Sort, Merge Sort", "Linear and Binary Search", "Hashing"] }
    ]);

    await addSubject("Computer Graphics", "BCS-203", "CSE", 3, [
        { title: "Basics", topics: ["Scan Conversion Algorithms (Line, Circle)", "Anti-aliasing"] },
        { title: "Transformations", topics: ["2D Transformations (Translation, Rotation, Scaling)", "Homogeneous Coordinates", "3D Transformations"] },
        { title: "Projections and Clipping", topics: ["Parallel and Perspective Projections", "Line Clipping (Cohen-Sutherland)", "Polygon Clipping"] },
        { title: "Rendering", topics: ["Hidden Surface Removal", "Illumination Models", "Shading (Gouraud, Phong)"] }
    ]);

    await addSubject("Switching Theory & Logic Design", "BEC-205", "CSE", 3, [
        { title: "Number Systems", topics: ["Binary, Octal, Hexadecimal", "Complements", "Codes (BCD, Gray, Excess-3)"] },
        { title: "Boolean Algebra", topics: ["Logic Gates", "K-Map Minimization", "Quine-McCluskey Method"] },
        { title: "Combinational Circuits", topics: ["Adders/Subtractors", "Multiplexers/Demultiplexers", "Encoders/Decoders"] },
        { title: "Sequential Circuits", topics: ["Flip-Flops (SR, JK, D, T)", "Counters", "Registers", "State Machines"] }
    ]);

    await addSubject("Electronic Devices and Circuits", "BEC-207", "CSE", 3, [
        { title: "Semiconductor Diodes", topics: ["PN Junction", "Zener Diode", "Rectifiers and Filters", "Clippers and Clampers"] },
        { title: "Transistors", topics: ["BJT Characteristics", "Biasing Circuits", "FET and MOSFET"] },
        { title: "Amplifiers", topics: ["CE, CB, CC Configurations", "Operational Amplifiers (Op-Amp)", "Oscillators"] }
    ]);

    // --- SEMESTER 4 (CSE) ---
    await addSubject("Applied Mathematics-IV", "BAS-202", "CSE", 4, [
        { title: "Probability", topics: ["Conditional Probability", "Bayes Theorem", "Random Variables", "Probability Distributions (Binomial, Poisson, Normal)"] },
        { title: "Statistics", topics: ["Correlation and Regression", "Curve Fitting", "Sampling Theory", "Hypothesis Testing"] },
        { title: "Numerical Methods", topics: ["Solution of Algebraic Equations", "Interpolation", "Numerical Integration", "Numerical Solution of ODEs"] }
    ]);

    await addSubject("Computer Organization & Architecture", "BCS-204", "CSE", 4, [
        { title: "Basic Structure", topics: ["Bus Structures", "Memory Locations and Addresses", "Instruction Formats", "Addressing Modes"] },
        { title: "Processing Unit", topics: ["Register Transfer Logic", "Arithmetic Logic Unit", "Control Unit Design (Hardwired, Microprogrammed)"] },
        { title: "Memory Organization", topics: ["Memory Hierarchy", "Cache Memory", "Virtual Memory", "Secondary Storage"] },
        { title: "I/O Organization", topics: ["Interrupts", "DMA", "I/O Interfaces", "Pipelining"] }
    ]);

    await addSubject("Theory of Computation", "BCS-206", "CSE", 4, [
        { title: "Finite Automata", topics: ["DFA and NFA", "Equivalence of DFA and NFA", "Mealy and Moore Machines", "Minimization of FA"] },
        { title: "Regular Expressions", topics: ["Regular Languages", "Pumping Lemma", "Closure Properties"] },
        { title: "Context-Free Grammars", topics: ["CFG", "Parse Trees", "Ambiguity", "Simplification of CFG", "Pushdown Automata"] },
        { title: "Turing Machines", topics: ["Construction of TM", "Variations of TM", "Undecidability", "Halting Problem"] }
    ]);

    await addSubject("Database Management Systems", "BCS-208", "CSE", 4, [
        { title: "Introduction", topics: ["Database Architecture", "Data Models", "ER Diagrams"] },
        { title: "Relational Model", topics: ["Relational Algebra", "SQL (DDL, DML, DCL)", "Views", "Normalization (1NF, 2NF, 3NF, BCNF)"] },
        { title: "Transaction Management", topics: ["ACID Properties", "Concurrency Control", "Locking Protocols", "Deadlocks"] },
        { title: "Storage and Indexing", topics: ["File Organization", "Indexing (B+ Trees)", "Hashing"] }
    ]);

    // --- SEMESTER 5 (CSE) ---
    await addSubject("Algorithms Design and Analysis", "BCS-301", "CSE", 5, [
        { title: "Divide and Conquer", topics: ["Merge Sort", "Quick Sort", "Strassen's Matrix Multiplication"] },
        { title: "Greedy Method", topics: ["Knapsack Problem", "Job Sequencing", "Huffman Coding", "Minimum Spanning Trees"] },
        { title: "Dynamic Programming", topics: ["Matrix Chain Multiplication", "LCS", "0/1 Knapsack", "Floyd-Warshall"] },
        { title: "Backtracking & Branch and Bound", topics: ["N-Queens Problem", "Graph Coloring", "Hamiltonian Cycles", "Traveling Salesman Problem"] }
    ]);

    await addSubject("Software Engineering", "BCS-303", "CSE", 5, [
        { title: "Introduction", topics: ["Software Crisis", "SDLC Models (Waterfall, Spiral, Agile)", "Software Metrics"] },
        { title: "Requirement Engineering", topics: ["SRS", "Requirement Elicitation", "Data Flow Diagrams"] },
        { title: "Design", topics: ["Cohesion and Coupling", "UML Diagrams", "User Interface Design"] },
        { title: "Testing", topics: ["Black Box vs White Box", "Unit, Integration, System Testing", "Maintenance"] }
    ]);

    await addSubject("Java Programming", "BCS-305", "CSE", 5, [
        { title: "Core Java", topics: ["OOP Concepts", "Inheritance", "Polymorphism", "Interfaces", "Packages"] },
        { title: "Exception Handling & Multithreading", topics: ["Try-Catch", "Throw/Throws", "Thread Life Cycle", "Synchronization"] },
        { title: "Collections & File I/O", topics: ["ArrayList, HashMap, HashSet", "File Streams", "Serialization"] },
        { title: "GUI & Networking", topics: ["AWT/Swing Basics", "Event Handling", "Socket Programming"] }
    ]);

    // --- SEMESTER 6 (CSE) ---
    await addSubject("Compiler Design", "BCS-302", "CSE", 6, [
        { title: "Lexical Analysis", topics: ["Role of Lexical Analyzer", "Input Buffering", "Specification of Tokens"] },
        { title: "Syntax Analysis", topics: ["Top-Down Parsing", "Bottom-Up Parsing", "LR Parsers", "YACC"] },
        { title: "Semantic Analysis", topics: ["Syntax Directed Translation", "Type Checking", "Symbol Tables"] },
        { title: "Code Generation", topics: ["Intermediate Code Generation", "Code Optimization", "Target Code Generation"] }
    ]);

    await addSubject("Operating Systems", "BCS-304", "CSE", 6, [
        { title: "Process Management", topics: ["Process States", "Scheduling Algorithms", "Threads", "Inter-process Communication"] },
        { title: "Synchronization", topics: ["Semaphores", "Monitors", "Classical Problems (Producer-Consumer, Dining Philosophers)"] },
        { title: "Memory Management", topics: ["Paging", "Segmentation", "Virtual Memory", "Page Replacement Algorithms"] },
        { title: "File Systems", topics: ["File Organization", "Directory Structure", "Disk Scheduling"] }
    ]);

    await addSubject("Computer Networks", "BCS-306", "CSE", 6, [
        { title: "Physical & Data Link Layer", topics: ["OSI Model", "Transmission Media", "Error Detection/Correction", "Flow Control", "MAC Protocols"] },
        { title: "Network Layer", topics: ["IP Addressing", "Subnetting", "Routing Algorithms (Distance Vector, Link State)", "ARP/RARP"] },
        { title: "Transport Layer", topics: ["TCP/UDP", "Congestion Control", "Flow Control"] },
        { title: "Application Layer", topics: ["DNS", "HTTP", "FTP", "SMTP", "Network Security Basics"] }
    ]);

    // --- SEMESTER 7 (CSE) ---
    await addSubject("Information Security", "BCS-401", "CSE", 7, [
        { title: "Cryptography", topics: ["Classical Encryption Techniques", "Symmetric Key Algo (DES, AES)", "Asymmetric Key Algo (RSA)"] },
        { title: "Network Security", topics: ["Key Distribution", "Digital Signatures", "Authentication Protocols", "Firewalls"] },
        { title: "Web Security", topics: ["SSL/TLS", "SET", "Email Security (PGP)"] },
        { title: "System Security", topics: ["Intruders", "Viruses and Worms", "Buffer Overflow"] }
    ]);

    await addSubject("Artificial Intelligence", "BCS-403", "CSE", 7, [
        { title: "Introduction", topics: ["AI Definitions", "Turing Test", "Intelligent Agents"] },
        { title: "Problem Solving", topics: ["Search Algorithms (BFS, DFS, A*)", "Heuristic Search", "Game Playing (Minimax)"] },
        { title: "Knowledge Representation", topics: ["Propositional Logic", "First Order Logic", "Inference Rules"] },
        { title: "Learning", topics: ["Supervised Learning", "Unsupervised Learning", "Neural Networks Basics"] }
    ]);

    // --- SEMESTER 8 (CSE) ---
    await addSubject("Mobile Computing", "BCS-402", "CSE", 8, [
        { title: "Wireless Communication", topics: ["Cellular Concept", "GSM Architecture", "Handover", "GPRS"] },
        { title: "Mobile Network Layer", topics: ["Mobile IP", "DHCP", "Ad-hoc Networks", "Routing Protocols (DSDV, DSR)"] },
        { title: "Mobile Transport Layer", topics: ["Traditional TCP", "Indirect TCP", "Snooping TCP", "Mobile TCP"] },
        { title: "Mobile Applications", topics: ["WAP", "Android Basics", "Mobile Databases"] }
    ]);

    await addSubject("Machine Learning", "BCS-404", "CSE", 8, [
        { title: "Supervised Learning", topics: ["Linear Regression", "Logistic Regression", "Decision Trees", "SVM"] },
        { title: "Unsupervised Learning", topics: ["Clustering (K-Means, Hierarchical)", "PCA", "Association Rules"] },
        { title: "Neural Networks", topics: ["Perceptron", "Backpropagation", "Deep Learning Basics (CNN, RNN)"] },
        { title: "Evaluation", topics: ["Cross Validation", "Confusion Matrix", "Precision/Recall", "Bias-Variance Tradeoff"] }
    ]);
  },
});