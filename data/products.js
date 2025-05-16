const products = [
    // MediHealth Products
    {
        id: 101,
        companyId: 1,
        name: "كارديو بلس 50 مجم",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
        q1: 85000,
        q2: 92000,
        q3: 88000,
        q4: 95000,
        patients_q1: 1200,
        patients_q2: 1300,
        patients_q3: 1250,
        patients_q4: 1400
    },
    {
        id: 102,
        companyId: 1,
        name: "ديابيتس كونترول SR",
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
        q1: 120000,
        q2: 115000,
        q3: 125000,
        q4: 130000
    },
    // BioGen Labs Products
    {
        id: 201,
        companyId: 2,
        name: "أونكو تارجيت 100 مجم",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
        q1: 150000,
        q2: 145000,
        q3: 155000,
        q4: 160000,
        patients_q1: 350,
        patients_q2: 375,
        patients_q3: 400,
        patients_q4: 425
    },
    {
        id: 301,
        companyId: 3,
        name: "فيتامين سي 1000 مجم",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
        q1: 85000,
        q2: 92000,
        q3: 88000,
        q4: 95000
    },
    {
        id: 401,
        companyId: 4,
        name: "نيوروكير 20 مجم",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
        q1: 85000,
        q2: 92000,
        q3: 88000,
        q4: 95000,
        patients_q1: 1200,
        patients_q2: 1300,
        patients_q3: 1250,
        patients_q4: 1400
    }
];

// Connect products to companies
companies.forEach(company => {
    company.products = products.filter(product => product.companyId === company.id);
});