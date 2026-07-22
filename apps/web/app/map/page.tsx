'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
);

interface Farm {
  id: string;
  lat: number;
  lng: number;
  name: string;
  farmer: string;
  products: string[];
}

// Demo farm data
const demoFarms: Farm[] = [
  { id: '1', lat: 20.0059, lng: 73.7898, name: 'Rajesh Organic Farm', farmer: 'Rajesh Kumar', products: ['Onions', 'Tomatoes', 'Grapes'] },
  { id: '2', lat: 19.9975, lng: 73.8039, name: 'Green Valley Farm', farmer: 'Sunita Patil', products: ['Mangoes', 'Pomegranate'] },
  { id: '3', lat: 20.0224, lng: 73.7706, name: 'Sai Agri', farmer: 'Anand Shinde', products: ['Onions', 'Garlic'] },
  { id: '4', lat: 19.9856, lng: 73.7934, name: 'Nature Fresh', farmer: 'Pooja More', products: ['Spinach', 'Methi', 'Coriander'] },
];

export default function FarmMapPage() {
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="page-container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Nearby Farms</h1>
          <p className="text-muted-foreground">Find fresh produce close to you using OpenStreetMap</p>
        </div>

        <div className="rounded-2xl overflow-hidden border" style={{ height: '600px' }}>
          {!isMounted ? (
            <div className="h-full flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <MapContainer
              center={[20.0059, 73.7898]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {demoFarms.map((farm) => (
                <Marker key={farm.id} position={[farm.lat, farm.lng]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{farm.name}</p>
                      <p className="text-gray-600">{farm.farmer}</p>
                      <div className="mt-1">
                        {farm.products.map((p) => (
                          <span key={p} className="inline-block bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded mr-1 mb-1">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoFarms.map((farm) => (
            <div key={farm.id} className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-agri-100 dark:bg-agri-900/30 flex items-center justify-center text-xl shrink-0">
                  🌾
                </div>
                <div>
                  <p className="font-semibold text-sm">{farm.name}</p>
                  <p className="text-xs text-muted-foreground">{farm.farmer}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {farm.products.map((p) => (
                      <span key={p} className="text-xs bg-agri-100 dark:bg-agri-900/30 text-agri-700 dark:text-agri-300 px-1.5 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
