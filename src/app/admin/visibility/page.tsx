"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch");
  }
  return Array.isArray(data) ? data : [];
};

interface VisibilityControl {
  id: number;
  field_name: string;
  county_id: number;
  county: { name: string };
  is_visible: boolean;
}

export default function VisibilityPage() {
  const { data: visibilityControls, isLoading, error } = useSWR<VisibilityControl[]>(
    "/api/visibility",
    fetcher
  );
  
  // Ensure visibilityControls is always an array
  const controlsArray = Array.isArray(visibilityControls) ? visibilityControls : [];

  const handleToggle = async (id: number, currentValue: boolean) => {
    try {
      await axios.patch(`/api/visibility/${id}`, {
        is_visible: !currentValue,
      });
      mutate("/api/visibility");
      if ((window as any).toast) {
        (window as any).toast({
          title: "Visibility Updated",
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
      if ((window as any).toast) {
        (window as any).toast({
          title: "Error",
          description: "Failed to update visibility",
          variant: "error",
        });
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Visibility Control</h1>

      <Card>
        <CardHeader>
          <CardTitle>Field Visibility by County</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field Name</TableHead>
                  <TableHead>County Name</TableHead>
                  <TableHead>Is Visible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {error ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-red-500">
                      Error loading visibility controls
                    </TableCell>
                  </TableRow>
                ) : controlsArray.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No visibility controls found
                    </TableCell>
                  </TableRow>
                ) : (
                  controlsArray.map((control) => (
                    <TableRow key={control.id}>
                      <TableCell className="font-medium">{control.field_name}</TableCell>
                      <TableCell>{control.county?.name || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={control.is_visible}
                            onCheckedChange={() =>
                              handleToggle(control.id, control.is_visible)
                            }
                          />
                          <Label>
                            {control.is_visible ? "Visible" : "Hidden"}
                          </Label>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

