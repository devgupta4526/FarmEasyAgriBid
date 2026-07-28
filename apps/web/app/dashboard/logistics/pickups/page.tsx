'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LogisticsPickupsPage() {
  const { toast } = useToast();
  const pickups = [
    { id: 'pck-1', farm: 'Sunrise Organic Farm', location: 'Nashik, Maharashtra', crop: '10 Quintals Rice', distance: '12 km' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-agri-600" />
          Available Farm Pickups
        </h1>
        <p className="text-muted-foreground text-sm">
          Browse nearby farm harvest pickup requests ready for transport
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 divide-y">
          {pickups.map((pck) => (
            <div key={pck.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">{pck.farm}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{pck.crop} • {pck.location} ({pck.distance})</p>
              </div>
              <Button size="sm" className="bg-agri-600 hover:bg-agri-700" onClick={() => toast({ title: 'Pickup order accepted!' })}>
                Accept Pickup Job
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
