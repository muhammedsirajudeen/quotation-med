'use client';

import Image from "next/image";
import { useEffect, useState } from "react";

// Types
interface Specialty {
  id: number;
  name: string;
  category: string;
  description: string;
  availableDoctors: number;
  icon: string;
}

interface Hospital {
  id: number;
  name: string;
  type: 'hospital' | 'clinic' | 'diagnostic';
  address: string;
  distance?: number;
  rating: number;
  reviews: number;
  services: string[];
  specialties: Specialty[];
  isOpen: boolean;
  phone: string;
  email: string;
  website: string;
  operatingHours: string;
  lat: number;
  lng: number;
  image: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  image: string;
  inStock: boolean;
  rating: number;
  reviews: number;
}

interface UserLocation {
  lat: number;
  lng: number;
}

type NavTab = 'home' | 'store' | 'profile';

export default function Home() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('All');

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Mock hospital data
  const mockHospitals: Hospital[] = [
    {
      id: 1,
      name: "City General Hospital",
      type: "hospital",
      address: "123 Medical Center Drive, Downtown",
      rating: 4.8,
      reviews: 1250,
      services: ["Emergency", "Surgery", "ICU", "Cardiology"],
      specialties: [
        { id: 1, name: "Cardiology", category: "Cardiology", description: "Heart and cardiovascular care", availableDoctors: 8, icon: "❤️" },
        { id: 2, name: "Nephrology", category: "Nephrology", description: "Kidney disease treatment", availableDoctors: 5, icon: "🫘" },
        { id: 3, name: "Neurology", category: "Neurology", description: "Brain and nervous system", availableDoctors: 6, icon: "🧠" },
        { id: 4, name: "Orthopedics", category: "Orthopedics", description: "Bone and joint care", availableDoctors: 7, icon: "🦴" },
        { id: 5, name: "Emergency Medicine", category: "Emergency", description: "24/7 emergency care", availableDoctors: 12, icon: "🚑" },
      ],
      isOpen: true,
      phone: "+1 234-567-8900",
      email: "info@citygeneral.com",
      website: "www.citygeneral.com",
      operatingHours: "24/7",
      lat: 12.9716,
      lng: 77.5946,
      image: "/hospital-hero.png"
    },
    {
      id: 2,
      name: "St. Mary's Medical Center",
      type: "hospital",
      address: "456 Healthcare Boulevard, Midtown",
      rating: 4.6,
      reviews: 890,
      services: ["Pediatrics", "Maternity", "Orthopedics"],
      specialties: [
        { id: 6, name: "Pediatrics", category: "Pediatrics", description: "Child healthcare", availableDoctors: 10, icon: "👶" },
        { id: 7, name: "Obstetrics & Gynecology", category: "Maternity", description: "Women's health and maternity", availableDoctors: 8, icon: "🤰" },
        { id: 8, name: "Orthopedics", category: "Orthopedics", description: "Bone and joint care", availableDoctors: 6, icon: "🦴" },
        { id: 9, name: "Cardiology", category: "Cardiology", description: "Heart care", availableDoctors: 5, icon: "❤️" },
      ],
      isOpen: true,
      phone: "+1 234-567-8901",
      email: "contact@stmarys.com",
      website: "www.stmarys.com",
      operatingHours: "Mon-Sun: 6:00 AM - 10:00 PM",
      lat: 12.9816,
      lng: 77.6046,
      image: "/hospital-hero.png"
    },
    {
      id: 3,
      name: "HealthPlus Clinic",
      type: "clinic",
      address: "789 Wellness Street, Uptown",
      rating: 4.5,
      reviews: 456,
      services: ["General Medicine", "Vaccination", "Lab Tests"],
      specialties: [
        { id: 10, name: "General Medicine", category: "General", description: "Primary healthcare", availableDoctors: 4, icon: "⚕️" },
        { id: 11, name: "Dermatology", category: "Dermatology", description: "Skin care", availableDoctors: 2, icon: "🧴" },
        { id: 12, name: "Dentistry", category: "Dental", description: "Dental care", availableDoctors: 3, icon: "🦷" },
      ],
      isOpen: true,
      phone: "+1 234-567-8902",
      email: "info@healthplus.com",
      website: "www.healthplus.com",
      operatingHours: "Mon-Sat: 8:00 AM - 8:00 PM",
      lat: 12.9616,
      lng: 77.5846,
      image: "/hospital-hero.png"
    },
    {
      id: 4,
      name: "Metro Emergency Hospital",
      type: "hospital",
      address: "888 Urgent Care Road, South District",
      rating: 4.9,
      reviews: 1567,
      services: ["24/7 Emergency", "Trauma", "Critical Care"],
      specialties: [
        { id: 19, name: "Emergency Medicine", category: "Emergency", description: "24/7 emergency care", availableDoctors: 15, icon: "🚑" },
        { id: 20, name: "Trauma Surgery", category: "Surgery", description: "Trauma care", availableDoctors: 8, icon: "🏥" },
        { id: 21, name: "Critical Care", category: "ICU", description: "Intensive care", availableDoctors: 10, icon: "🩺" },
        { id: 22, name: "Cardiology", category: "Cardiology", description: "Heart emergencies", availableDoctors: 6, icon: "❤️" },
      ],
      isOpen: true,
      phone: "+1 234-567-8905",
      email: "emergency@metrohospital.com",
      website: "www.metrohospital.com",
      operatingHours: "24/7",
      lat: 12.9416,
      lng: 77.5946,
      image: "/hospital-hero.png"
    }
  ];

  // Product data
  const products: Product[] = [
    {
      id: 1,
      name: "Premium Knee Brace",
      category: "Knee Support",
      price: 2499,
      originalPrice: 3499,
      description: "Advanced knee brace with adjustable compression and gel padding for maximum support during recovery and daily activities.",
      features: [
        "Adjustable compression straps",
        "Medical-grade gel padding",
        "Breathable neoprene material",
        "Suitable for arthritis, sports injuries, and post-surgery recovery",
        "One size fits most"
      ],
      image: "/hospital-hero.png",
      inStock: true,
      rating: 4.8,
      reviews: 342
    },
    {
      id: 2,
      name: "Elbow Support Brace",
      category: "Arm Support",
      price: 1899,
      originalPrice: 2499,
      description: "Ergonomic elbow brace designed to provide targeted compression and support for tennis elbow, golfer's elbow, and tendonitis.",
      features: [
        "Dual compression technology",
        "Velcro adjustable straps",
        "Lightweight and comfortable",
        "Reduces pain and inflammation",
        "Suitable for sports and daily wear"
      ],
      image: "/arm_brace_product_1766575793622.png",
      inStock: true,
      rating: 4.6,
      reviews: 218
    },
    {
      id: 3,
      name: "Wrist Support with Thumb Stabilizer",
      category: "Wrist Support",
      price: 1599,
      description: "Professional-grade wrist brace with integrated thumb stabilizer for carpal tunnel syndrome, sprains, and repetitive strain injuries.",
      features: [
        "Thumb stabilizer included",
        "Removable metal splint",
        "Moisture-wicking fabric",
        "Ideal for typing and computer work",
        "Available in multiple sizes"
      ],
      image: "/wrist_support_product_1766575808426.png",
      inStock: true,
      rating: 4.7,
      reviews: 456
    },
    {
      id: 4,
      name: "Ankle Support Brace",
      category: "Ankle Support",
      price: 1799,
      originalPrice: 2299,
      description: "Figure-8 ankle support brace with adjustable compression for sprains, strains, and chronic ankle instability.",
      features: [
        "Figure-8 strap design",
        "Breathable mesh fabric",
        "Fits left or right ankle",
        "Provides stability without restricting movement",
        "Ideal for sports and recovery"
      ],
      image: "/ankle_support_product_1766575822188.png",
      inStock: true,
      rating: 4.5,
      reviews: 289
    },
    {
      id: 5,
      name: "Lumbar Back Support Belt",
      category: "Back Support",
      price: 2999,
      originalPrice: 3999,
      description: "Ergonomic lumbar support belt with dual adjustable straps for lower back pain relief and posture correction.",
      features: [
        "Dual adjustable compression straps",
        "Breathable mesh back panel",
        "Removable lumbar pad",
        "Helps with sciatica and herniated discs",
        "Suitable for work and exercise"
      ],
      image: "/back_support_product_1766575840111.png",
      inStock: true,
      rating: 4.9,
      reviews: 567
    },
    {
      id: 6,
      name: "Compression Calf Sleeves (Pair)",
      category: "Compression Wear",
      price: 1299,
      description: "Graduated compression sleeves for improved circulation, reduced muscle fatigue, and faster recovery.",
      features: [
        "Graduated compression (20-30 mmHg)",
        "Moisture-wicking fabric",
        "Anti-slip silicone band",
        "Reduces shin splints and calf pain",
        "Sold as a pair"
      ],
      image: "/compression_sleeve_product_1766575859259.png",
      inStock: true,
      rating: 4.4,
      reviews: 198
    },
    {
      id: 7,
      name: "Shoulder Support Brace",
      category: "Shoulder Support",
      price: 2799,
      description: "Adjustable shoulder brace for rotator cuff injuries, dislocations, and post-surgery immobilization.",
      features: [
        "Immobilizes shoulder joint",
        "Adjustable arm sling",
        "Padded shoulder strap",
        "Suitable for left or right shoulder",
        "Breathable fabric"
      ],
      image: "/hospital-hero.png",
      inStock: true,
      rating: 4.6,
      reviews: 134
    },
    {
      id: 8,
      name: "Posture Corrector",
      category: "Back Support",
      price: 1499,
      originalPrice: 1999,
      description: "Lightweight posture corrector brace to improve alignment and reduce back and neck pain.",
      features: [
        "Pulls shoulders back gently",
        "Adjustable straps",
        "Discreet under clothing",
        "Improves posture over time",
        "Unisex design"
      ],
      image: "/hospital-hero.png",
      inStock: false,
      rating: 4.3,
      reviews: 276
    }
  ];

  useEffect(() => {
    // Request user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);

          // Calculate distances and sort hospitals
          const hospitalsWithDistance = mockHospitals.map(hospital => ({
            ...hospital,
            distance: calculateDistance(
              location.lat,
              location.lng,
              hospital.lat,
              hospital.lng
            )
          })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

          setHospitals(hospitalsWithDistance);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setPermissionDenied(true);
          setHospitals(mockHospitals);
          setLoading(false);
        }
      );
    } else {
      setPermissionDenied(true);
      setHospitals(mockHospitals);
      setLoading(false);
    }
  }, []);

  const handleHospitalClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setSpecialtyFilter('All');
  };

  // Get unique specialty categories for filtering
  const getSpecialtyCategories = (hospital: Hospital): string[] => {
    const categories = new Set(hospital.specialties.map(s => s.category));
    return ['All', ...Array.from(categories)];
  };

  // Filter specialties based on selected filter
  const getFilteredSpecialties = (hospital: Hospital): Specialty[] => {
    if (specialtyFilter === 'All') {
      return hospital.specialties;
    }
    return hospital.specialties.filter(s => s.category === specialtyFilter);
  };

  // Hospital detail view
  if (selectedHospital) {
    const filteredSpecialties = getFilteredSpecialties(selectedHospital);
    const categories = getSpecialtyCategories(selectedHospital);

    return (
      <div className="min-h-screen bg-background pb-24 md:pb-8">
        {/* Header with Back Button */}
        <div className="bg-white shadow-md sticky top-0 z-40">
          <div className="px-4 md:px-8 lg:px-16 py-4">
            <button
              onClick={() => setSelectedHospital(null)}
              className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-semibold">Back to List</span>
            </button>
          </div>
        </div>

        {/* Hospital Hero Section */}
        <section className="relative h-[300px] w-full overflow-hidden">
          <Image
            src={selectedHospital.image}
            alt={selectedHospital.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
          <div className="absolute inset-0 flex flex-col justify-end px-4 md:px-8 lg:px-16 pb-8 text-white">
            <div className="flex items-center gap-2 mb-2">
              {selectedHospital.isOpen && (
                <span className="bg-secondary px-3 py-1 rounded-full text-sm font-semibold">
                  Open Now
                </span>
              )}
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                {selectedHospital.type}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{selectedHospital.name}</h1>
            <div className="flex items-center gap-4 text-lg">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span className="font-semibold">{selectedHospital.rating}</span>
                <span className="text-white/80">({selectedHospital.reviews} reviews)</span>
              </div>
              {selectedHospital.distance !== undefined && (
                <span className="text-white/90">📍 {selectedHospital.distance.toFixed(1)} km away</span>
              )}
            </div>
          </div>
        </section>

        {/* Hospital Information Cards */}
        <section className="px-4 md:px-8 lg:px-16 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-border">
              <div className="text-3xl mb-2">📞</div>
              <div className="text-sm text-gray-600 mb-1">Phone</div>
              <div className="font-semibold text-foreground">{selectedHospital.phone}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-border">
              <div className="text-3xl mb-2">📧</div>
              <div className="text-sm text-gray-600 mb-1">Email</div>
              <div className="font-semibold text-foreground">{selectedHospital.email}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-border">
              <div className="text-3xl mb-2">🌐</div>
              <div className="text-sm text-gray-600 mb-1">Website</div>
              <div className="font-semibold text-primary">{selectedHospital.website}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-border">
              <div className="text-3xl mb-2">🕐</div>
              <div className="text-sm text-gray-600 mb-1">Operating Hours</div>
              <div className="font-semibold text-foreground">{selectedHospital.operatingHours}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-border mb-8">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📍</div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Address</div>
                <div className="font-semibold text-foreground text-lg">{selectedHospital.address}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Specialties Section */}
        <section className="px-4 md:px-8 lg:px-16 py-8">
          <h2 className="text-3xl font-bold mb-6">Available Specialties</h2>

          {/* Specialty Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSpecialtyFilter(category)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${specialtyFilter === category
                  ? 'bg-primary text-white shadow-lg transform scale-105'
                  : 'bg-white text-foreground border border-border hover:border-primary hover:text-primary'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Specialty Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpecialties.map((specialty) => (
              <div
                key={specialty.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-border card-hover"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{specialty.icon}</div>
                    <div className="bg-blue-50 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                      {specialty.category}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{specialty.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{specialty.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-2xl">👨‍⚕️</span>
                    <span className="font-semibold text-foreground">
                      {specialty.availableDoctors} {specialty.availableDoctors === 1 ? 'Doctor' : 'Doctors'} Available
                    </span>
                  </div>
                  <button className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredSpecialties.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-gray-600">No specialties found for this category</p>
            </div>
          )}
        </section>

        {/* Mobile Bottom Navigation */}
        <nav className="bottom-nav md:hidden">
          <div className="grid grid-cols-3 max-w-md mx-auto">
            <button
              onClick={() => { setSelectedHospital(null); setActiveTab('home'); }}
              className="bottom-nav-item active"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => { setSelectedHospital(null); setActiveTab('store'); }}
              className="bottom-nav-item text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs font-medium">Store</span>
            </button>

            <button
              onClick={() => { setSelectedHospital(null); setActiveTab('profile'); }}
              className="bottom-nav-item text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  // Product detail view
  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pb-8">
        {/* Header with Back Button */}
        <div className="bg-white shadow-md sticky top-0 z-40">
          <div className="px-4 md:px-8 lg:px-16 py-4">
            <button
              onClick={() => setSelectedProduct(null)}
              className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-semibold">Back to Store</span>
            </button>
          </div>
        </div>

        {/* Product Detail Section */}
        <section className="px-4 md:px-8 lg:px-16 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Product Image */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
                <div className="relative h-[400px] md:h-[500px]">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    fill
                    className="object-contain p-8"
                  />
                </div>
                {!selectedProduct.inStock && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                    Out of Stock
                  </div>
                )}
                {selectedProduct.originalPrice && (
                  <div className="absolute top-4 left-4 bg-secondary text-white px-4 py-2 rounded-full font-semibold">
                    Save ₹{selectedProduct.originalPrice - selectedProduct.price}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="bg-blue-50 text-primary px-3 py-1 rounded-full text-sm font-semibold inline-block mb-3">
                {selectedProduct.category}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{selectedProduct.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="font-semibold text-lg">{selectedProduct.rating}</span>
                </div>
                <span className="text-gray-600">({selectedProduct.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">₹{selectedProduct.price}</span>
                  {selectedProduct.originalPrice && (
                    <span className="text-2xl text-gray-400 line-through">₹{selectedProduct.originalPrice}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">Inclusive of all taxes</p>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Key Features</h2>
                <ul className="space-y-3">
                  {selectedProduct.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-secondary text-xl mt-0.5">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  disabled={!selectedProduct.inStock}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${selectedProduct.inStock
                    ? 'bg-primary text-white hover:bg-primary-dark transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {selectedProduct.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button className="px-6 bg-white border-2 border-primary text-primary rounded-xl hover:bg-blue-50 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Bottom Navigation */}
        <nav className="bottom-nav md:hidden">
          <div className="grid grid-cols-3 max-w-md mx-auto">
            <button
              onClick={() => { setSelectedProduct(null); setActiveTab('home'); }}
              className="bottom-nav-item text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => setSelectedProduct(null)}
              className="bottom-nav-item active"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs font-medium">Store</span>
            </button>

            <button
              onClick={() => { setSelectedProduct(null); setActiveTab('profile'); }}
              className="bottom-nav-item text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  // Home Page with Hospital Finder
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-background pb-24 md:pb-8">
        {/* Advertisement Banner */}
        <div className="bg-gradient-to-r from-accent to-orange-500 text-white px-4 py-3 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 animate-pulse" />
          <div className="relative z-10 flex items-center justify-center gap-3 flex-wrap">
            <span className="text-2xl">🎉</span>
            <p className="font-bold text-lg">
              Special Offer: Get 20% OFF on all medical products! Use code: HEALTH20
            </p>
            <button
              onClick={() => setActiveTab('store')}
              className="bg-white text-accent px-4 py-1 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative h-[500px] w-full overflow-hidden">
          <Image
            src="/hospital-hero.png"
            alt="Modern Hospital"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center animate-fade-in">
              Find Healthcare Near You
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-center max-w-2xl animate-fade-in">
              Discover hospitals, clinics, and medical facilities in your area
            </p>
            {loading && (
              <div className="flex items-center gap-2 text-lg">
                <div className="animate-pulse">📍</div>
                <span>Detecting your location...</span>
              </div>
            )}
            {permissionDenied && (
              <div className="bg-yellow-500/90 text-black px-6 py-3 rounded-lg">
                ⚠️ Location access denied. Showing all facilities.
              </div>
            )}
          </div>
        </section>

        {/* Service Bar */}
        <section className="bg-white shadow-lg -mt-16 mx-4 md:mx-8 lg:px-16 rounded-xl p-6 relative z-10 animate-slide-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-gray-600">Emergency Care</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">500+</div>
              <div className="text-sm text-gray-600">Verified Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">1000+</div>
              <div className="text-sm text-gray-600">Facilities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">4.8★</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </section>

        {/* Featured Doctors */}
        <section className="px-4 md:px-8 lg:px-16 py-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Doctors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Dr. Sarah Johnson",
                specialty: "Cardiologist",
                experience: "15+ Years",
                rating: 4.9,
                reviews: 342,
                hospital: "City General Hospital",
                available: "Today",
                icon: "❤️"
              },
              {
                name: "Dr. Michael Chen",
                specialty: "Orthopedic Surgeon",
                experience: "12+ Years",
                rating: 4.8,
                reviews: 289,
                hospital: "St. Mary's Medical Center",
                available: "Tomorrow",
                icon: "🦴"
              },
              {
                name: "Dr. Emily Rodriguez",
                specialty: "Pediatrician",
                experience: "10+ Years",
                rating: 4.9,
                reviews: 456,
                hospital: "HealthPlus Clinic",
                available: "Today",
                icon: "👶"
              }
            ].map((doctor, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-border card-hover"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-3xl">
                      {doctor.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">{doctor.name}</h3>
                      <p className="text-primary font-semibold">{doctor.specialty}</p>
                      <p className="text-sm text-gray-600">{doctor.experience} Experience</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold">{doctor.rating}</span>
                    </div>
                    <span className="text-gray-600 text-sm">({doctor.reviews} reviews)</span>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">🏥 {doctor.hospital}</span>
                    </p>
                    <p className="text-sm text-secondary font-semibold mt-1">
                      ✓ Available {doctor.available}
                    </p>
                  </div>

                  <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Service Categories */}
        <section className="px-4 md:px-8 lg:px-16 py-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: "Hospitals", icon: "🏥", color: "bg-blue-100" },
              { name: "Clinics", icon: "⚕️", color: "bg-green-100" },
              { name: "Old Age Homes", icon: "🏡", color: "bg-purple-100" },
              { name: "Pharmacies", icon: "💊", color: "bg-red-100" },
              { name: "Diagnostics", icon: "🔬", color: "bg-yellow-100" },
              { name: "Blood Banks", icon: "🩸", color: "bg-pink-100" }
            ].map((category, index) => (
              <div
                key={index}
                className={`${category.color} p-6 rounded-xl text-center cursor-pointer icon-container card-hover`}
              >
                <div className="text-5xl mb-3">{category.icon}</div>
                <div className="font-semibold text-foreground">{category.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Nearby Hospitals */}
        <section className="px-4 md:px-8 lg:px-16 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              {userLocation ? "Nearby Facilities" : "All Facilities"}
            </h2>
            {userLocation && (
              <div className="text-sm text-gray-600">
                📍 Sorted by distance from your location
              </div>
            )}
          </div>

          {/* Featured Doctor Advertisement Banner */}
          <div className="mb-8 bg-gradient-to-r from-primary to-blue-600 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 md:p-8 text-white relative">
              <div className="absolute top-3 right-3 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold">
                FEATURED
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl flex-shrink-0">
                  ❤️
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">Dr. Sarah Johnson</h3>
                  <p className="text-lg mb-1 text-white/90">Cardiologist • 15+ Years Experience</p>
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-300">★</span>
                      <span className="font-semibold">4.9</span>
                    </div>
                    <span className="text-white/80">(342 reviews)</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">City General Hospital</span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">🏆 Top Rated</span>
                    <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">📅 Available Today</span>
                    <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">💬 Video Consultation</span>
                  </div>
                </div>
                <button className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex-shrink-0">
                  Book Now
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hospital) => (
              <div
                key={hospital.id}
                onClick={() => handleHospitalClick(hospital)}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer card-hover border border-border"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={hospital.image}
                    alt={hospital.name}
                    fill
                    className="object-cover"
                  />
                  {hospital.isOpen && (
                    <div className="absolute top-3 right-3 bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Open Now
                    </div>
                  )}
                  {hospital.distance !== undefined && (
                    <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {hospital.distance.toFixed(1)} km
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-foreground flex-1">
                      {hospital.name}
                    </h3>
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">{hospital.rating}</span>
                      <span className="text-gray-500 text-sm">({hospital.reviews})</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">
                    📍 {hospital.address}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {hospital.services.slice(0, 3).map((service, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-50 text-primary text-xs px-3 py-1 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                    {hospital.services.length > 3 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{hospital.services.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border">
                    <button className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                      View Details
                    </button>
                    <button className="px-4 bg-gray-100 text-foreground rounded-lg hover:bg-gray-200 transition-colors">
                      📞
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile Bottom Navigation */}
        <nav className="bottom-nav md:hidden">
          <div className="grid grid-cols-3 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('home')}
              className="bottom-nav-item active"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('store')}
              className="bottom-nav-item text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs font-medium">Store</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className="bottom-nav-item text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  // Store Page
  if (activeTab === 'store') {
    return (
      <div className="min-h-screen bg-background pb-24 md:pb-8">
        {/* Header */}
        <div className="bg-white shadow-md">
          <div className="px-4 md:px-8 lg:px-16 py-6">
            <h1 className="text-3xl md:text-4xl font-bold">Medical Utility Store</h1>
            <p className="text-gray-600 mt-2">Browse our collection of medical support products</p>
          </div>
        </div>

        {/* Products Grid */}
        <section className="px-4 md:px-8 lg:px-16 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer card-hover border border-border"
              >
                <div className="relative h-64 w-full bg-gray-50">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                  />
                  {!product.inStock && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Out of Stock
                    </div>
                  )}
                  {product.originalPrice && product.inStock && (
                    <div className="absolute top-3 left-3 bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Sale
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="text-xs text-primary font-semibold mb-2">{product.category}</div>
                  <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold text-sm">{product.rating}</span>
                    </div>
                    <span className="text-gray-500 text-xs">({product.reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                    )}
                  </div>

                  <button
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile Bottom Navigation */}
        <nav className="bottom-nav md:hidden">
          <div className="grid grid-cols-3 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('home')}
              className="bottom-nav-item text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('store')}
              className="bottom-nav-item active"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs font-medium">Store</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className="bottom-nav-item text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  // Profile Page
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="px-4 md:px-8 lg:px-16 py-6">
          <h1 className="text-3xl md:text-4xl font-bold">Profile</h1>
        </div>
      </div>

      {/* Profile Content */}
      <section className="px-4 md:px-8 lg:px-16 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-white text-4xl font-bold">
                JD
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">John Doe</h2>
                <p className="text-gray-600">john.doe@example.com</p>
                <p className="text-gray-600">+91 98765 43210</p>
              </div>
            </div>
            <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
              Edit Profile
            </button>
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {[
              { icon: "📦", label: "My Orders", badge: "3" },
              { icon: "❤️", label: "Wishlist", badge: "12" },
              { icon: "📍", label: "Saved Addresses", badge: null },
              { icon: "💳", label: "Payment Methods", badge: null },
              { icon: "🎁", label: "Offers & Coupons", badge: "5" },
              { icon: "⚙️", label: "Settings", badge: null },
              { icon: "❓", label: "Help & Support", badge: null },
              { icon: "🚪", label: "Logout", badge: null }
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-5 border-b border-border last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {item.badge && (
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {item.badge}
                    </span>
                  )}
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav md:hidden">
        <div className="grid grid-cols-3 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('home')}
            className="bottom-nav-item text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className="bottom-nav-item text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-xs font-medium">Store</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className="bottom-nav-item active"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
