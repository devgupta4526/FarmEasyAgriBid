'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ShieldCheck, Upload } from 'lucide-react';

export default function FarmerDocumentsPage() {
  const documents = [
    { id: 'doc-1', title: 'Government Farmer ID / Aadhaar', type: 'Identity Verification', status: 'verified', date: '2026-06-10' },
    { id: 'doc-2', title: 'Land Ownership Certificate', type: 'Property Proof', status: 'verified', date: '2026-06-12' },
    { id: 'doc-3', title: 'Organic Certification License', type: 'Quality Standards', status: 'pending', date: '2026-07-20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-agri-600" />
            KYC & Farm Documents
          </h1>
          <p className="text-muted-foreground text-sm">
            Upload and manage identity credentials, farm land records, and organic certifications
          </p>
        </div>
        <Button className="bg-agri-600 hover:bg-agri-700">
          <Upload className="h-4 w-4 mr-2" /> Upload New Document
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 divide-y">
          {documents.map((doc) => (
            <div key={doc.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-agri-100 dark:bg-agri-900/40 text-agri-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{doc.title}</h3>
                  <p className="text-xs text-muted-foreground">{doc.type} • Uploaded {doc.date}</p>
                </div>
              </div>
              <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'} className={doc.status === 'verified' ? 'bg-agri-600' : ''}>
                {doc.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
