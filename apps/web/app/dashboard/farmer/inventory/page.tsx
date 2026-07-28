'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Package, AlertTriangle, Plus } from 'lucide-react';

export default function FarmerInventoryPage() {
  const stockItems = [
    { id: 'stk-1', crop: 'Organic Wheat', category: 'Grains', stock: 450, unit: 'Quintals', alertLevel: 'low', status: 'In Stock' },
    { id: 'stk-2', crop: 'Basmati Rice', category: 'Grains', stock: 1200, unit: 'Quintals', alertLevel: 'ok', status: 'Optimal' },
    { id: 'stk-3', crop: 'Hybrid Tomatoes', category: 'Vegetables', stock: 35, unit: 'Crates', alertLevel: 'critical', status: 'Low Stock' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-agri-600" />
            Inventory & Stock Log
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor real-time crop stock levels, storage batches, and re-order alerts
          </p>
        </div>
        <Button className="bg-agri-600 hover:bg-agri-700">
          <Plus className="h-4 w-4 mr-2" /> Add Stock Batch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-agri-100 dark:bg-agri-900/40 rounded-xl text-agri-700 dark:text-agri-300">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Managed Stock</p>
              <p className="text-2xl font-bold">1,685 Units</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Low Stock Alerts</p>
              <p className="text-2xl font-bold">1 Crop</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-3 px-2">Crop Name</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Available Stock</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stockItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-2 font-medium">{item.crop}</td>
                    <td className="py-3 px-2 text-muted-foreground">{item.category}</td>
                    <td className="py-3 px-2 font-bold">{item.stock} {item.unit}</td>
                    <td className="py-3 px-2">
                      <Badge variant={item.alertLevel === 'critical' ? 'destructive' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
