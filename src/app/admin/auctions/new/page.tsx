"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return res.json();
};

export default function NewAuctionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: properties, isLoading } = useSWR("/api/properties", fetcher);
  const [form, setForm] = useState({
    propertyId: "",
    start_date: "",
    end_date: "",
    status: "UPCOMING",
  });

  const propertiesArray = Array.isArray(properties) ? properties : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.propertyId || !form.start_date || !form.end_date) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post("/api/auctions", form);
      
      toast({
        title: "Success",
        description: "Auction created successfully!",
      });

      router.push("/admin/auctions");
    } catch (error: any) {
      console.error("Error creating auction:", error);
      const errorMessage =
        error?.response?.data?.error || "Failed to create auction";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Auction</h1>
        <p className="text-muted-foreground">
          Set up a new auction for a property
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auction Details</CardTitle>
          <CardDescription>
            Fill in the information below to create a new auction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyId">Property *</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={form.propertyId}
                  onValueChange={(value) =>
                    handleSelectChange("propertyId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertiesArray.length === 0 ? (
                      <SelectItem value="no-properties" disabled>
                        No properties available
                      </SelectItem>
                    ) : (
                      propertiesArray.map((property: any) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.name} - {property.county} (${property.price})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                name="start_date"
                type="datetime-local"
                value={form.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                name="end_date"
                type="datetime-local"
                value={form.end_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ENDED">Ended</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Status will be automatically updated based on dates
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit">Create Auction</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

