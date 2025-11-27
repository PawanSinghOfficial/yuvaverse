import { mutation } from "./_generated/server";

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

    // --- CSE STREAM ---
    // Semester 3
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

    // Semester 4
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

    // Semester 5
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

    // Semester 6
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

    // Semester 7
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

    // Semester 8
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

    // --- IT STREAM ---
    // Semester 3
    await addSubject("Data Structures", "BIT-201", "IT", 3, [
        { title: "Introduction", topics: ["Arrays", "Linked Lists", "Stacks and Queues"] },
        { title: "Trees", topics: ["Binary Trees", "BST", "AVL Trees", "Heaps"] },
        { title: "Graphs", topics: ["Graph Representations", "BFS and DFS", "Shortest Path Algorithms"] },
        { title: "Sorting", topics: ["Bubble, Selection, Insertion Sort", "Quick Sort, Merge Sort", "Hashing"] }
    ]);
    await addSubject("Digital Electronics", "BIT-203", "IT", 3, [
        { title: "Number Systems", topics: ["Binary, Octal, Hexadecimal", "Logic Gates"] },
        { title: "Combinational Circuits", topics: ["Adders", "Multiplexers", "Encoders"] },
        { title: "Sequential Circuits", topics: ["Flip-Flops", "Counters", "Registers"] }
    ]);
    await addSubject("Circuits & Systems", "BIT-205", "IT", 3, [
        { title: "Circuit Analysis", topics: ["Nodal and Mesh Analysis", "Network Theorems"] },
        { title: "Signals", topics: ["Laplace Transform", "Fourier Series"] },
        { title: "Two Port Networks", topics: ["Z, Y, ABCD Parameters", "Interconnection of Networks"] }
    ]);
    await addSubject("Analog Electronics", "BIT-207", "IT", 3, [
        { title: "Diodes", topics: ["PN Junction", "Rectifiers", "Clippers"] },
        { title: "Transistors", topics: ["BJT Biasing", "FET Characteristics"] },
        { title: "Op-Amps", topics: ["Ideal Op-Amp", "Inverting/Non-inverting Amplifiers"] }
    ]);

    // Semester 4
    await addSubject("Applied Mathematics-IV", "BAS-202", "IT", 4, [
        { title: "Probability", topics: ["Conditional Probability", "Random Variables", "Distributions"] },
        { title: "Statistics", topics: ["Correlation", "Regression", "Hypothesis Testing"] },
        { title: "Numerical Methods", topics: ["Roots of Equations", "Numerical Integration"] }
    ]);
    await addSubject("Computer Organization", "BIT-204", "IT", 4, [
        { title: "Basic Structure", topics: ["Bus Structures", "Instruction Cycles"] },
        { title: "CPU", topics: ["ALU", "Control Unit", "Registers"] },
        { title: "Memory", topics: ["Cache", "Virtual Memory", "RAM/ROM"] }
    ]);
    await addSubject("Object Oriented Programming", "BIT-206", "IT", 4, [
        { title: "C++ Basics", topics: ["Classes and Objects", "Constructors", "Destructors"] },
        { title: "Inheritance", topics: ["Single, Multiple, Multilevel", "Polymorphism"] },
        { title: "Advanced Features", topics: ["Templates", "Exception Handling", "File I/O"] }
    ]);
    await addSubject("Database Management Systems", "BIT-208", "IT", 4, [
        { title: "Intro to DBMS", topics: ["Data Models", "ER Diagrams"] },
        { title: "SQL", topics: ["DDL", "DML", "Joins", "Subqueries"] },
        { title: "Normalization", topics: ["1NF, 2NF, 3NF", "BCNF"] }
    ]);

    // Semester 5
    await addSubject("Algorithms Design", "BIT-301", "IT", 5, [
        { title: "Analysis", topics: ["Asymptotic Notation", "Recurrence Relations"] },
        { title: "Strategies", topics: ["Divide and Conquer", "Greedy", "Dynamic Programming"] },
        { title: "Graph Algorithms", topics: ["BFS/DFS", "MST", "Shortest Paths"] }
    ]);
    await addSubject("Software Engineering", "BIT-303", "IT", 5, [
        { title: "Process Models", topics: ["Waterfall", "Agile", "Spiral"] },
        { title: "Requirements", topics: ["SRS", "Elicitation"] },
        { title: "Testing", topics: ["Unit Testing", "Integration Testing", "System Testing"] }
    ]);
    await addSubject("Java Programming", "BIT-305", "IT", 5, [
        { title: "Java Basics", topics: ["Data Types", "Control Flow", "Arrays"] },
        { title: "OOP in Java", topics: ["Classes", "Inheritance", "Interfaces"] },
        { title: "Advanced Java", topics: ["Exception Handling", "Multithreading", "Collections"] }
    ]);

    // Semester 6
    await addSubject("Operating Systems", "BIT-302", "IT", 6, [
        { title: "Processes", topics: ["Scheduling", "Threads", "Synchronization"] },
        { title: "Memory", topics: ["Paging", "Segmentation", "Virtual Memory"] },
        { title: "Storage", topics: ["File Systems", "Disk Scheduling"] }
    ]);
    await addSubject("Web Technology", "BIT-304", "IT", 6, [
        { title: "HTML/CSS", topics: ["Tags", "Styling", "Layouts"] },
        { title: "JavaScript", topics: ["DOM Manipulation", "Events", "ES6 Features"] },
        { title: "Backend", topics: ["Server-side Scripting", "Database Connectivity"] }
    ]);
    await addSubject("Computer Networks", "BIT-306", "IT", 6, [
        { title: "Layers", topics: ["OSI Model", "TCP/IP Model"] },
        { title: "Protocols", topics: ["IP", "TCP", "UDP", "HTTP", "DNS"] },
        { title: "Security", topics: ["Encryption", "Firewalls"] }
    ]);

    // Semester 7
    await addSubject("Information Security", "BIT-401", "IT", 7, [
        { title: "Cryptography", topics: ["Symmetric Key", "Asymmetric Key", "Hashing"] },
        { title: "Network Security", topics: ["Authentication", "Key Exchange", "VPNs"] },
        { title: "Cyber Laws", topics: ["IT Act", "Intellectual Property"] }
    ]);
    await addSubject("Advanced Java", "BIT-403", "IT", 7, [
        { title: "J2EE", topics: ["Servlets", "JSP", "JDBC"] },
        { title: "Frameworks", topics: ["Spring Basics", "Hibernate"] },
        { title: "Web Services", topics: ["REST", "SOAP"] }
    ]);

    // Semester 8
    await addSubject("Mobile Computing", "BIT-402", "IT", 8, [
        { title: "Wireless Networks", topics: ["GSM", "CDMA", "LTE"] },
        { title: "Mobile IP", topics: ["Agent Discovery", "Registration", "Tunneling"] },
        { title: "Mobile TCP", topics: ["Congestion Control", "Retransmission"] }
    ]);
    await addSubject("Human Computer Interaction", "BIT-404", "IT", 8, [
        { title: "Design Process", topics: ["User Centered Design", "Prototyping"] },
        { title: "Evaluation", topics: ["Heuristic Evaluation", "User Testing"] },
        { title: "Models", topics: ["GOMS", "Cognitive Models"] }
    ]);

    // --- ECE STREAM ---
    // Semester 3
    await addSubject("Applied Mathematics-III", "BAS-201", "ECE", 3, [
        { title: "Fourier Series", topics: ["Periodic Functions", "Euler's Formulae"] },
        { title: "Fourier Transforms", topics: ["Fourier Integral", "Properties"] },
        { title: "Laplace Transforms", topics: ["Existence", "Inverse Transform", "Applications"] }
    ]);
    await addSubject("Analog Electronics-I", "BEC-201", "ECE", 3, [
        { title: "Diodes", topics: ["PN Junction", "Zener", "Applications"] },
        { title: "BJT", topics: ["Configurations", "Biasing", "Small Signal Analysis"] },
        { title: "FET", topics: ["JFET", "MOSFET", "Biasing"] }
    ]);
    await addSubject("Signals & Systems", "BEC-203", "ECE", 3, [
        { title: "Signals", topics: ["Classification", "Basic Operations"] },
        { title: "Systems", topics: ["LTI Systems", "Convolution", "Stability"] },
        { title: "Transforms", topics: ["Z-Transform", "Fourier Transform"] }
    ]);
    await addSubject("Network Analysis", "BEC-205", "ECE", 3, [
        { title: "Graph Theory", topics: ["Trees", "Cut-sets", "Incidence Matrix"] },
        { title: "Network Theorems", topics: ["Thevenin", "Norton", "Superposition"] },
        { title: "Two Port Networks", topics: ["Parameters", "Interconnections"] }
    ]);

    // Semester 4
    await addSubject("Analog Electronics-II", "BEC-202", "ECE", 4, [
        { title: "Multistage Amplifiers", topics: ["Coupling Methods", "Frequency Response"] },
        { title: "Feedback Amplifiers", topics: ["Topologies", "Stability"] },
        { title: "Power Amplifiers", topics: ["Class A, B, AB, C", "Efficiency"] }
    ]);
    await addSubject("Digital Electronics", "BEC-204", "ECE", 4, [
        { title: "Logic Families", topics: ["TTL", "CMOS", "ECL"] },
        { title: "Combinational Logic", topics: ["Adders", "Decoders", "MUX"] },
        { title: "Sequential Logic", topics: ["Flip-Flops", "Counters", "Shift Registers"] }
    ]);
    await addSubject("Communication Systems", "BEC-206", "ECE", 4, [
        { title: "Amplitude Modulation", topics: ["DSB-SC", "SSB", "VSB"] },
        { title: "Angle Modulation", topics: ["FM", "PM", "Bandwidth"] },
        { title: "Pulse Modulation", topics: ["PAM", "PWM", "PPM"] }
    ]);
    await addSubject("EMFT", "BEC-208", "ECE", 4, [
        { title: "Electrostatics", topics: ["Coulomb's Law", "Gauss's Law"] },
        { title: "Magnetostatics", topics: ["Biot-Savart Law", "Ampere's Law"] },
        { title: "Maxwell's Equations", topics: ["Differential Form", "Integral Form"] }
    ]);

    // Semester 5
    await addSubject("Microprocessors", "BEC-301", "ECE", 5, [
        { title: "8085 Architecture", topics: ["Registers", "Pin Diagram", "Instruction Set"] },
        { title: "Programming", topics: ["Assembly Language", "Addressing Modes"] },
        { title: "Interfacing", topics: ["Memory Interfacing", "I/O Interfacing"] }
    ]);
    await addSubject("Control Systems", "BEC-303", "ECE", 5, [
        { title: "Modeling", topics: ["Transfer Function", "Block Diagrams", "Signal Flow Graphs"] },
        { title: "Time Response", topics: ["Transient Analysis", "Steady State Error"] },
        { title: "Stability", topics: ["Routh-Hurwitz", "Root Locus", "Bode Plots"] }
    ]);
    await addSubject("Digital System Design", "BEC-305", "ECE", 5, [
        { title: "VHDL/Verilog", topics: ["Syntax", "Data Types", "Operators"] },
        { title: "Combinational Design", topics: ["Adders", "Decoders", "ALU"] },
        { title: "Sequential Design", topics: ["Flip-Flops", "Counters", "FSM"] }
    ]);

    // Semester 6
    await addSubject("VLSI Design", "BEC-302", "ECE", 6, [
        { title: "MOS Transistor", topics: ["Structure", "Operation", "Scaling"] },
        { title: "Inverters", topics: ["CMOS Inverter", "DC Characteristics"] },
        { title: "Fabrication", topics: ["Lithography", "Etching", "Deposition"] }
    ]);
    await addSubject("Digital Signal Processing", "BEC-304", "ECE", 6, [
        { title: "DFT", topics: ["Properties", "FFT Algorithms"] },
        { title: "Filter Design", topics: ["IIR Filters", "FIR Filters"] },
        { title: "DSP Processors", topics: ["Architecture", "Applications"] }
    ]);
    await addSubject("Microwave Engineering", "BEC-306", "ECE", 6, [
        { title: "Waveguides", topics: ["Rectangular", "Circular", "Modes"] },
        { title: "Components", topics: ["Tees", "Couplers", "Isolators"] },
        { title: "Tubes", topics: ["Klystron", "Magnetron", "TWT"] }
    ]);

    // Semester 7
    await addSubject("Embedded Systems", "BEC-401", "ECE", 7, [
        { title: "Microcontrollers", topics: ["8051 Architecture", "Instruction Set"] },
        { title: "RTOS", topics: ["Tasks", "Scheduling", "Inter-task Communication"] },
        { title: "Interfacing", topics: ["Sensors", "Actuators", "Communication Protocols"] }
    ]);
    await addSubject("Optical Communication", "BEC-403", "ECE", 7, [
        { title: "Optical Fibers", topics: ["Structure", "Modes", "Attenuation"] },
        { title: "Sources & Detectors", topics: ["LED", "Laser", "PIN", "APD"] },
        { title: "Systems", topics: ["Link Budget", "WDM", "Networks"] }
    ]);

    // Semester 8
    await addSubject("Satellite Communication", "BEC-402", "ECE", 8, [
        { title: "Orbits", topics: ["Kepler's Laws", "Orbital Parameters", "Geostationary Orbit"] },
        { title: "Space Segment", topics: ["Subsystems", "Power", "Attitude Control"] },
        { title: "Link Analysis", topics: ["Uplink", "Downlink", "C/N Ratio"] }
    ]);
    await addSubject("Wireless Communication", "BEC-404", "ECE", 8, [
        { title: "Cellular Concept", topics: ["Frequency Reuse", "Handoff", "Interference"] },
        { title: "Propagation", topics: ["Path Loss", "Fading", "Multipath"] },
        { title: "Standards", topics: ["GSM", "CDMA", "LTE", "5G"] }
    ]);

    // --- ME STREAM ---
    // Semester 3
    await addSubject("Strength of Materials", "BME-201", "ME", 3, [
        { title: "Stress and Strain", topics: ["Hooke's Law", "Elastic Constants", "Thermal Stresses"] },
        { title: "Beams", topics: ["Shear Force", "Bending Moment", "Bending Stresses"] },
        { title: "Torsion", topics: ["Circular Shafts", "Power Transmission"] }
    ]);
    await addSubject("Thermodynamics", "BME-203", "ME", 3, [
        { title: "Basic Concepts", topics: ["Systems", "Properties", "Processes"] },
        { title: "Laws", topics: ["Zeroth Law", "First Law", "Second Law"] },
        { title: "Entropy", topics: ["Concept", "Change in Entropy", "Availability"] }
    ]);
    await addSubject("Material Science", "BME-205", "ME", 3, [
        { title: "Crystal Structure", topics: ["Unit Cells", "Imperfections", "Diffusion"] },
        { title: "Phase Diagrams", topics: ["Iron-Carbon Diagram", "Heat Treatment"] },
        { title: "Properties", topics: ["Mechanical", "Electrical", "Magnetic"] }
    ]);
    await addSubject("Machine Drawing", "BME-207", "ME", 3, [
        { title: "Conventions", topics: ["Lines", "Sections", "Dimensioning"] },
        { title: "Fasteners", topics: ["Bolts", "Nuts", "Rivets"] },
        { title: "Assembly", topics: ["Couplings", "Bearings", "Valves"] }
    ]);

    // Semester 4
    await addSubject("Fluid Mechanics", "BME-202", "ME", 4, [
        { title: "Properties", topics: ["Viscosity", "Surface Tension", "Pressure"] },
        { title: "Dynamics", topics: ["Bernoulli's Equation", "Momentum Equation"] },
        { title: "Flow", topics: ["Laminar", "Turbulent", "Boundary Layer"] }
    ]);
    await addSubject("Kinematics of Machines", "BME-204", "ME", 4, [
        { title: "Mechanisms", topics: ["Links", "Pairs", "Inversions"] },
        { title: "Velocity & Acceleration", topics: ["Relative Velocity", "Coriolis Component"] },
        { title: "Cams & Gears", topics: ["Profiles", "Trains", "Analysis"] }
    ]);
    await addSubject("Manufacturing Technology", "BME-206", "ME", 4, [
        { title: "Metal Cutting", topics: ["Tool Geometry", "Chip Formation", "Tool Life"] },
        { title: "Machine Tools", topics: ["Lathe", "Milling", "Drilling"] },
        { title: "Unconventional", topics: ["EDM", "ECM", "LBM"] }
    ]);
    await addSubject("Electrical Machines", "BME-208", "ME", 4, [
        { title: "DC Machines", topics: ["Generators", "Motors", "Speed Control"] },
        { title: "AC Machines", topics: ["Induction Motors", "Synchronous Machines"] },
        { title: "Transformers", topics: ["Construction", "Testing", "Efficiency"] }
    ]);

    // Semester 5
    await addSubject("Dynamics of Machines", "BME-301", "ME", 5, [
        { title: "Balancing", topics: ["Rotating Masses", "Reciprocating Masses"] },
        { title: "Vibrations", topics: ["Free", "Damped", "Forced"] },
        { title: "Governors & Gyroscopes", topics: ["Types", "Stability", "Effect"] }
    ]);
    await addSubject("Heat Transfer", "BME-303", "ME", 5, [
        { title: "Conduction", topics: ["Fourier's Law", "1D Steady State", "Fins"] },
        { title: "Convection", topics: ["Natural", "Forced", "Nusselt Number"] },
        { title: "Radiation", topics: ["Laws", "View Factor", "Shields"] }
    ]);
    await addSubject("Solid Mechanics", "BME-305", "ME", 5, [
        { title: "Stress Analysis", topics: ["Principal Stresses", "Mohr's Circle"] },
        { title: "Theories of Failure", topics: ["Tresca", "Von Mises", "Rankine"] },
        { title: "Columns", topics: ["Euler's Theory", "Rankine's Formula"] }
    ]);

    // Semester 6
    await addSubject("Machine Design", "BME-302", "ME", 6, [
        { title: "Design Basics", topics: ["Factor of Safety", "Stress Concentration"] },
        { title: "Joints", topics: ["Riveted", "Welded", "Bolted"] },
        { title: "Elements", topics: ["Shafts", "Keys", "Couplings", "Springs"] }
    ]);
    await addSubject("RAC", "BME-304", "ME", 6, [
        { title: "Refrigeration", topics: ["Cycles", "Refrigerants", "Components"] },
        { title: "Psychrometry", topics: ["Properties", "Processes", "Charts"] },
        { title: "Air Conditioning", topics: ["Load Estimation", "Systems"] }
    ]);
    await addSubject("ICE", "BME-306", "ME", 6, [
        { title: "Cycles", topics: ["Otto", "Diesel", "Dual"] },
        { title: "Systems", topics: ["Fuel Injection", "Ignition", "Cooling"] },
        { title: "Performance", topics: ["Testing", "Emissions", "Control"] }
    ]);

    // Semester 7
    await addSubject("CAD/CAM", "BME-401", "ME", 7, [
        { title: "CAD", topics: ["Geometric Modeling", "Transformations", "Graphics Standards"] },
        { title: "CAM", topics: ["NC/CNC", "Part Programming", "Robotics"] },
        { title: "Integration", topics: ["CIM", "FMS", "Group Technology"] }
    ]);
    await addSubject("Automobile Engineering", "BME-403", "ME", 7, [
        { title: "Chassis & Body", topics: ["Layout", "Frames", "Suspension"] },
        { title: "Transmission", topics: ["Clutch", "Gearbox", "Differential"] },
        { title: "Systems", topics: ["Braking", "Steering", "Electrical"] }
    ]);

    // Semester 8
    await addSubject("Power Plant Engineering", "BME-402", "ME", 8, [
        { title: "Steam Power", topics: ["Boilers", "Turbines", "Condensers"] },
        { title: "Nuclear Power", topics: ["Reactors", "Safety", "Waste Disposal"] },
        { title: "Economics", topics: ["Load Curves", "Tariffs", "Site Selection"] }
    ]);
    await addSubject("Mechatronics", "BME-404", "ME", 8, [
        { title: "Sensors", topics: ["Transducers", "Signal Conditioning"] },
        { title: "Actuators", topics: ["Hydraulic", "Pneumatic", "Electric"] },
        { title: "Control", topics: ["PLC", "Microcontrollers", "Feedback"] }
    ]);
  },
});
