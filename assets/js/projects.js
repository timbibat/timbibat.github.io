const projects = [
    {
        id: 1,
        title: "Anime Royale Rumble",
        description: "An immersive 2D fighting game featuring head-to-head combat between iconic anime characters. Built with Python and modern game development principles.",
        image: "assets/img/WD/Screenshot (270).png",
        badges: ["Python", "Game Development"],
        badgeColors: ["bg-warning text-dark", "bg-success text-white"],
        category: "game", // Game development project
        demoUrl: null,
        githubUrl: "https://github.com/timbibat/Anime-Royale-Rumble.git"
    },
    {
        id: 2,
        title: "PUP Classroom Reservation",
        description: "A web-based classroom reservation system for Polytechnic University of the Philippines. Built with HTML, CSS, Bootstrap, and PHP for optimal user experience and functionality.",
        image: "assets/img/WD/Screenshot 2025-10-28 181400.png",
        badges: ["PHP", "Web Design", "Bootstrap"],
        badgeColors: ["bg-warning text-dark", "bg-info text-white", "bg-primary text-white"],
        category: "web", // Web development project
        demoUrl: null,
        githubUrl: "https://github.com/timbibat/pup_classroom_reservation.git"
    },
    {
        id: 3,
        title: "DBTK",
        description: "A website dedicated to showcase our final group project for OOP using Python Flask framework. Built with HTML, CSS, Bootstrap, and Flask for optimal user experience. This project is inspired by Don't Blame the Kids appareling brand.",
        image: "assets/img/WD/Screenshot 2025-10-28 182118.png",
        badges: ["Python", "Flask", "Web Design"],
        badgeColors: ["bg-warning text-dark", "bg-success text-white", "bg-info text-white"],
        category: "web", // Web development project
        demoUrl: "https://dbtkco.vercel.app/",
        githubUrl: "https://github.com/timbibat/dbtkco"
    },
    {
        id: 4,
        title: "Samsung S25 Ultra",
        description: "A responsive web showcase highlighting the features and specifications of the Samsung S25 Ultra. Built with HTML, CSS, and Bootstrap for optimal user experience.",
        image: "assets/img/WD/Screenshot 2025-10-28 181959.png",
        badges: ["HTML/CSS", "Bootstrap", "Responsive"],
        badgeColors: ["bg-danger text-white", "bg-primary text-white", "bg-success text-white"],
        category: "activities", // Activities project
        demoUrl: "https://timbibat.github.io/S25Ultra/",
        githubUrl: "https://github.com/timbibat/S25Ultra"
    },
    {
        id: 5,
        title: "Stay Tuned!",
        description: "More exciting projects are coming soon! This space is reserved for upcoming web development, multimedia, and design projects that showcase continuous learning and growth.",
        image: null,
        badges: ["Coming Soon"],
        badgeColors: ["bg-secondary text-white"],
        category: "multimedia", // Multimedia project
        demoUrl: null,
        githubUrl: null
    },
    {
        id: 6,
        title: "Disorientation",
        description: "A surreal digital artwork created using Adobe Photoshop, exploring themes of confusion and altered perception through layered imagery and effects.",
        image: "assets/img/Design/Disorientation/Bibat_After.jpg",
        badges: ["Photoshop"],
        badgeColors: ["bg-info text-white",],
        category: "design", // Design project
        demoUrl: "https://drive.google.com/file/d/1oQ4kRh3CfgDrqFRNeKhzmbAdXoOMVh9A/view?usp=sharing",
        githubUrl: null
    },
    {
        id: 7,
        title: " Data Science Essentials with Python",
        description: "Certificate awarded for completing the Data Science Essentials with Python course, demonstrating proficiency in data analysis, visualization, and machine learning using Python programming.",
        image: "assets/img/Certificates/Data Science.png",
        badges: ["Certificates"],
        badgeColors: ["bg-success text-white"],
        category: "certificates", // Certificates project
        demoUrl: "https://drive.google.com/file/d/10rlhjbomL6pM3c6-RnZpuRic5IQR-EnD/view?usp=sharing",
        githubUrl: null
    },
    {
        id: 8,
        title: "Pelikula Cinema",
        description: "A website that uses Gmail API to send email notifications for booking confirmations. Built with HTML, CSS, Bootstrap, and PHP for optimal user experience and functionality.",
        image: "assets/img/WD/Screenshot 2025-10-07 230422.png",
        badges: ["HTML/CSS", "Bootstrap", "PHP"],
        badgeColors: ["bg-danger text-white", "bg-primary text-white", "bg-warning text-dark"],
        category: "web", // Activities project
        demoUrl: null,
        githubUrl: "https://github.com/timbibat/Pelikula-Cinema.git"
    },
    {
        id: 9,
        title: "Out of Bounds",
        description: "Out of Bounds is a digital artwork created using Adobe Photoshop, exploring themes of freedom and breaking limitations through imaginative visuals and effects.",
        image: "assets/img/Design/Out of bounds/Bibat_After.jpg",
        badges: ["Photoshop"],
        badgeColors: ["bg-info text-white",],
        category: "design", // Design project
        demoUrl: "https://drive.google.com/file/d/1SSZ37MIzBijxNg9_bb-YyVo_4un-66qw/view",
        githubUrl: null
    },
    {
        id: 10,
        title: "Sketch",
        description: "Sketch is a digital artwork created using Adobe Photoshop, showcasing the beauty of simplicity and creativity through minimalistic design and artistic expression.",
        image: "assets/img/Design/Sketch/Bibat_After.jpg",
        badges: ["Photoshop"],
        badgeColors: ["bg-info text-white",],
        category: "design", // Design project
        demoUrl: "https://drive.google.com/file/d/1toxfsOR8NlrQ6he8vi2wCKQb4TOsFRRi/view?usp=sharing",
        githubUrl: null
    },
    {
        id: 11,
        title: "Calling Card",
        description: "Calling Card is a digital artwork created using Adobe Photoshop, representing the concept of communication and connection through visually engaging design and creative elements.",
        image: "assets/img/Design/Calling card/Bibat_front.jpg",
        badges: ["Photoshop"],
        badgeColors: ["bg-info text-white",],
        category: "design", // Design project
        demoUrl: "https://drive.google.com/file/d/1tzVSUPNTI3Vr56oy91bE_8HqPAa1pFRa/view?usp=sharing",
        githubUrl: null
    },
    {
        id: 11,
        title: "Movie Poster (Joker)",
        description: "Movie Poster is a digital artwork created using Adobe Photoshop, showcasing the iconic character and themes of the film through visually striking design and creative elements.",
        image: "assets/img/Design/Movie poster/Bibat_poster.jpg",
        badges: ["Photoshop"],
        badgeColors: ["bg-info text-white",],
        category: "design", // Design project
        demoUrl: "https://drive.google.com/file/d/14LKxQ0cMt9RCpa5K0mfBY7ETN7zuw4Za/view?usp=sharing",
        githubUrl: null
    },
    {
        id: 12,
        title: "Japan",
        description: "A responsive web showcase highlighting the culture and attractions of Japan. Built with HTML, CSS, and Bootstrap for optimal user experience.",
        image: "assets/img/WD/Screenshot 2025-10-31 122216.png",
        badges: ["HTML/CSS", "Bootstrap"],
        badgeColors: ["bg-danger text-white", "bg-primary text-white"],
        category: "activities", // Activities project
        demoUrl: "https://timbibat.github.io/Japan/",
        githubUrl: "https://github.com/timbibat/Japan.git"
    },
];

let isExpanded = false;