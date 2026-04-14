const products = [
    // Specialty Coffee (Base Beans)
    { id: 'b1', name: 'Gayo Classic (Washed/Natural)', category: 'specialty', requiresBrew: true, price: 25000, img: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=300&q=80' },
    { id: 'b2', name: 'Gayo Honey (Yellow/Red)', category: 'specialty', requiresBrew: true, price: 30000, img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=80' },
    { id: 'b3', name: 'Gayo Wine (Long Fermentation)', category: 'specialty', requiresBrew: true, price: 40000, img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&q=80' },
    { id: 'b4', name: 'Toraja Sapan', category: 'specialty', requiresBrew: true, price: 30000, img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80' },
    { id: 'b5', name: 'Flores Bajawa', category: 'specialty', requiresBrew: true, price: 28000, img: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=300&q=80' },
    { id: 'b6', name: 'Bali Kintamani', category: 'specialty', requiresBrew: true, price: 32000, img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=300&q=80' },
    { id: 'b7', name: 'Jawa Preanger', category: 'specialty', requiresBrew: true, price: 30000, img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&q=80' },
    { id: 'b8', name: 'Papua Wamena', category: 'specialty', requiresBrew: true, price: 35000, img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80' },

    // Milky Series
    { id: 'm1', name: 'Kopi Susu Gula Aren', category: 'milky', price: 28000, img: 'https://images.unsplash.com/photo-1550974868-6c84c7e6c935?w=300&q=80' },
    { id: 'm2', name: 'Caramel Macchiato', category: 'milky', price: 35000, img: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=300&q=80' },
    { id: 'm3', name: 'Matcha Latte Espresso', category: 'milky', price: 38000, img: 'https://images.unsplash.com/photo-1536514072410-5019a3c69182?w=300&q=80' },
    { id: 'm4', name: 'Hazelnut Latte', category: 'milky', price: 35000, img: 'https://images.unsplash.com/photo-1572442388741-ee7c10b27af8?w=300&q=80' },

    // Cemilan
    { id: 's1', name: 'Kentang Goreng', category: 'snack', price: 20000, img: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=300&q=80' },
    { id: 's2', name: 'Pisang Goreng Keju', category: 'snack', price: 22000, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=300&q=80' },
    { id: 's3', name: 'Dimsum Ayam (4 pcs)', category: 'snack', price: 25000, img: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300&q=80' },
    { id: 's4', name: 'Platter Serambi (Mix)', category: 'snack', price: 40000, img: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300&q=80' },

    // Makanan Berat
    { id: 'f1', name: 'Nasi Goreng Spesial', category: 'food', price: 35000, img: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=300&q=80' },
    { id: 'f2', name: 'Rice Bowl Chicken Katsu', category: 'food', price: 38000, img: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=300&q=80' },
    { id: 'f3', name: 'Mie Goreng Gila', category: 'food', price: 30000, img: 'https://images.unsplash.com/photo-1612929633738-8fe01f7c8166?w=300&q=80' },
    { id: 'f4', name: 'Nasi Ayam Geprek', category: 'food', price: 32000, img: 'https://images.unsplash.com/photo-1626082896492-766af4eb6501?w=300&q=80' }
];

const brewingMethods = [
    { id: 'brew1', name: 'V60 / Kalita Wave', price: 10000 },
    { id: 'brew2', name: 'Aeropress', price: 8000 },
    { id: 'brew3', name: 'Syphon', price: 15000 },
    { id: 'brew4', name: 'French Press', price: 7000 },
    { id: 'brew5', name: 'Japanese Iced Coffee', price: 12000 }
];

// Formatting helper
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};
