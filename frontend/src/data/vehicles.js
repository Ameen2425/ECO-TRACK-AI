export const VEHICLE_DATA = {
    car: [
        { brand: 'Tesla', models: [
            { name: 'Model 3', fuel: 'Electric', factor: 0.03, ref_mileage: 6.2, ref_unit: 'km/kWh' },
            { name: 'Model S', fuel: 'Electric', factor: 0.035, ref_mileage: 5.8, ref_unit: 'km/kWh' },
            { name: 'Model Y', fuel: 'Electric', factor: 0.032, ref_mileage: 6.0, ref_unit: 'km/kWh' }
        ]},
        { brand: 'Honda', models: [
            { name: 'Civic', fuel: 'Petrol', factor: 0.12, ref_mileage: 15.5, ref_unit: 'km/L' },
            { name: 'City', fuel: 'Petrol', factor: 0.11, ref_mileage: 17.8, ref_unit: 'km/L' },
            { name: 'Accord', fuel: 'Hybrid', factor: 0.08, ref_mileage: 21.0, ref_unit: 'km/L' }
        ]},
        { brand: 'Toyota', models: [
            { name: 'Corolla', fuel: 'Petrol', factor: 0.11, ref_mileage: 16.0, ref_unit: 'km/L' },
            { name: 'Prius', fuel: 'Hybrid', factor: 0.07, ref_mileage: 24.5, ref_unit: 'km/L' },
            { name: 'Fortuner', fuel: 'Diesel', factor: 0.17, ref_mileage: 10.5, ref_unit: 'km/L' }
        ]},
        { brand: 'Maruti Suzuki', models: [
            { name: 'Swift', fuel: 'Petrol', factor: 0.10, ref_mileage: 22.0, ref_unit: 'km/L' },
            { name: 'Dzire', fuel: 'CNG', factor: 0.08, ref_mileage: 31.0, ref_unit: 'km/kg' },
            { name: 'Brezza', fuel: 'Petrol', factor: 0.12, ref_mileage: 18.5, ref_unit: 'km/L' }
        ]},
        { brand: 'Hyundai', models: [
            { name: 'i20', fuel: 'Petrol', factor: 0.10, ref_mileage: 20.0, ref_unit: 'km/L' },
            { name: 'Creta', fuel: 'Diesel', factor: 0.14, ref_mileage: 18.0, ref_unit: 'km/L' },
            { name: 'Kona', fuel: 'Electric', factor: 0.03, ref_mileage: 7.2, ref_unit: 'km/kWh' }
        ]},
        { brand: 'BMW', models: [
            { name: '3 Series', fuel: 'Petrol', factor: 0.14, ref_mileage: 12.5, ref_unit: 'km/L' },
            { name: 'iX', fuel: 'Electric', factor: 0.04, ref_mileage: 4.8, ref_unit: 'km/kWh' }
        ]}
    ],
    bike: [
        { brand: 'Honda', models: [
            { name: 'Activa', fuel: 'Petrol', factor: 0.05, ref_mileage: 50.0, ref_unit: 'km/L' },
            { name: 'Shine', fuel: 'Petrol', factor: 0.045, ref_mileage: 65.0, ref_unit: 'km/L' },
            { name: 'Hornet', fuel: 'Petrol', factor: 0.06, ref_mileage: 45.0, ref_unit: 'km/L' }
        ]},
        { brand: 'Royal Enfield', models: [
            { name: 'Classic 350', fuel: 'Petrol', factor: 0.07, ref_mileage: 35.0, ref_unit: 'km/L' },
            { name: 'Himalayan', fuel: 'Petrol', factor: 0.08, ref_mileage: 30.0, ref_unit: 'km/L' },
            { name: 'Interceptor', fuel: 'Petrol', factor: 0.09, ref_mileage: 25.0, ref_unit: 'km/L' }
        ]},
        { brand: 'TVS', models: [
            { name: 'iQube', fuel: 'Electric', factor: 0.02, ref_mileage: 75.0, ref_unit: 'km/charge' },
            { name: 'Apache', fuel: 'Petrol', factor: 0.06, ref_mileage: 40.0, ref_unit: 'km/L' },
            { name: 'Jupiter', fuel: 'Petrol', factor: 0.05, ref_mileage: 55.0, ref_unit: 'km/L' }
        ]},
        { brand: 'Revolt', models: [
            { name: 'RV400', fuel: 'Electric', factor: 0.02, ref_mileage: 150.0, ref_unit: 'km/charge' }
        ]},
        { brand: 'Yamaha', models: [
            { name: 'R15', fuel: 'Petrol', factor: 0.06, ref_mileage: 42.0, ref_unit: 'km/L' },
            { name: 'MT-15', fuel: 'Petrol', factor: 0.055, ref_mileage: 48.0, ref_unit: 'km/L' }
        ]}
    ]
};

export const YEAR_DATA = [
    { label: '0–2 years (New)', multiplier: 1.0,  val: 1 },
    { label: '3–5 years (Good)', multiplier: 1.1,  val: 4 },
    { label: '6–10 years (Oldish)', multiplier: 1.25, val: 8 },
    { label: '10+ years (Old)', multiplier: 1.5,  val: 12 }
];

export const CONDITION_FACTORS = {
    city:    1.2,
    mixed:   1.0,
    highway: 0.85
};
