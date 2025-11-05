"use client";

import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch");
  }
  return Array.isArray(data) ? data : [];
};

interface Property {
  id: number;
  name: string;
  location: string;
  county: string;
  price: number;
  status: string;
  bidderId?: number | null;
  bidder?: {
    name: string;
    email: string;
  };
  created_at: string;
}

export default function PropertiesPage() {
  const { data: properties, isLoading, error, mutate } = useSWR<Property[]>("/api/properties", fetcher);
  const { data: bidders } = useSWR("/api/bidders", fetcher);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    county: "",
    price: "",
    status: "available",
    bidderId: "",
  });

  const propertiesArray = Array.isArray(properties) ? properties : [];
  const biddersArray = Array.isArray(bidders) ? bidders : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (editingProperty) {
        await axios.put(`/api/properties/${editingProperty.id}`, form);
        if ((window as any).toast) {
          (window as any).toast({ title: "Property updated successfully", variant: "success" });
        }
      } else {
        await axios.post("/api/properties", form);
        if ((window as any).toast) {
          (window as any).toast({ title: "Property added successfully!", variant: "success" });
        }
      }
      
      // Revalidate the data to refresh the table
      await mutate();
      setIsModalOpen(false);
      setForm({ name: "", location: "", county: "", price: "", status: "available", bidderId: "" });
      setEditingProperty(null);
    } catch (error: any) {
      console.error("Error saving property:", error);
      const errorMessage = error?.response?.data?.error || "Failed to save property";
      
      if ((window as any).toast) {
        (window as any).toast({
          title: "Error",
          description: errorMessage,
          variant: "error",
        });
      } else {
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setForm({
      name: property.name,
      location: property.location,
      county: property.county,
      price: property.price.toString(),
      status: property.status,
      bidderId: property.bidderId?.toString() || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/properties/${deleteId}`);
      await mutate();
      setDeleteId(null);
      if ((window as any).toast) {
        (window as any).toast({ title: "Property deleted successfully", variant: "success" });
      }
    } catch (error: any) {
      console.error("Error deleting property:", error);
      const errorMessage = error?.response?.data?.error || "Failed to delete property";
      
      if ((window as any).toast) {
        (window as any).toast({
          title: "Error",
          description: errorMessage,
          variant: "error",
        });
      } else {
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const handleAdd = () => {
    setForm({ name: "", location: "", county: "", price: "", status: "available", bidderId: "" });
    setEditingProperty(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <Button onClick={handleAdd}>➕ Add Property</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">
              Error loading properties: {error.message || "Unknown error"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>County</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Bidder</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propertiesArray.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No properties found
                    </TableCell>
                  </TableRow>
                ) : (
                  propertiesArray.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.id}</TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.location}</TableCell>
                      <TableCell>{p.county}</TableCell>
                      <TableCell>${p.price}</TableCell>
                      <TableCell>{p.status}</TableCell>
                      <TableCell>
                        {p.bidder ? (
                          <div>
                            <div className="font-medium">{p.bidder.name}</div>
                            <div className="text-sm text-muted-foreground">{p.bidder.email}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(p)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(p.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the property
                                  "{p.name}" and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteId(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProperty ? "Edit Property" : "Add New Property"}
            </DialogTitle>
            <DialogDescription>
              {editingProperty
                ? "Update the property information below."
                : "Add a new property to the system."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Property Name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="county">County *</Label>
              <Input
                id="county"
                name="county"
                placeholder="County"
                value={form.county}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                name="status"
                placeholder="Status (default: available)"
                value={form.status}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bidderId">Assign Bidder (Optional)</Label>
              <Select
                value={form.bidderId ? form.bidderId : "none"}
                onValueChange={(value) => {
                  // Convert "none" to empty string for form submission
                  handleSelectChange("bidderId", value === "none" ? "" : value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a bidder (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    No bidder assigned
                  </SelectItem>
                  {biddersArray.length === 0 ? (
                    <SelectItem value="no-bidders" disabled>
                      No bidders available
                    </SelectItem>
                  ) : (
                    biddersArray.map((bidder: any) => (
                      <SelectItem key={bidder.id} value={bidder.id.toString()}>
                        {bidder.name} - {bidder.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setForm({ name: "", location: "", county: "", price: "", status: "available", bidderId: "" });
                setEditingProperty(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingProperty ? "Update" : "Add Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
