"use client";

import { useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Edit } from "lucide-react";
import axios from "axios";
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const bidderSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  county: z.string().optional(),
});

type BidderFormData = z.infer<typeof bidderSchema>;

interface Bidder {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  county: string | null;
  created_at: string;
}

export default function BiddersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBidder, setEditingBidder] = useState<Bidder | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data: bidders, isLoading, mutate } = useSWR<Bidder[]>("/api/bidders", fetcher);
  const { data: counties } = useSWR("/api/counties", fetcher);
  
  // Ensure data is always an array
  const biddersArray = Array.isArray(bidders) ? bidders : [];
  const countiesArray = Array.isArray(counties) ? counties : [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BidderFormData>({
    resolver: zodResolver(bidderSchema),
  });

  const onSubmit = async (data: BidderFormData) => {
    try {
      if (editingBidder) {
        await axios.put(`/api/bidders/${editingBidder.id}`, data);
        if ((window as any).toast) {
          (window as any).toast({ title: "Bidder updated successfully", variant: "success" });
        }
      } else {
        await axios.post("/api/bidders", data);
        if ((window as any).toast) {
          (window as any).toast({ title: "Bidder created successfully", variant: "success" });
        }
      }
      // Revalidate the data to refresh the table
      await mutate();
      setIsModalOpen(false);
      reset();
      setEditingBidder(null);
    } catch (error: any) {
      console.error("Error saving bidder:", error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.details || "Failed to save bidder";
      console.error("Error details:", error?.response?.data);
      alert(`Error: ${errorMessage}`); // Temporary alert until toast is set up
      if ((window as any).toast) {
        (window as any).toast({ 
          title: "Error", 
          description: errorMessage, 
          variant: "error" 
        });
      }
    }
  };

  const handleEdit = (bidder: Bidder) => {
    setEditingBidder(bidder);
    setValue("name", bidder.name);
    setValue("email", bidder.email);
    setValue("phone", bidder.phone || "");
    setValue("county", bidder.county || "");
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/bidders/${deleteId}`);
      await mutate();
      setDeleteId(null);
      if ((window as any).toast) {
        (window as any).toast({ 
          title: "Bidder deleted successfully", 
          variant: "success" 
        });
      }
    } catch (error: any) {
      console.error("Error deleting bidder:", error);
      const errorMessage = error?.response?.data?.error || "Failed to delete bidder";
      
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
    reset();
    setEditingBidder(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bidders</h1>
        <Button onClick={handleAdd}>Add Bidder</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bidders</CardTitle>
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
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>County</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {biddersArray.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No bidders found
                    </TableCell>
                  </TableRow>
                ) : (
                  biddersArray.map((bidder) => (
                    <TableRow key={bidder.id}>
                      <TableCell className="font-medium">{bidder.name}</TableCell>
                      <TableCell>{bidder.email}</TableCell>
                      <TableCell>{bidder.phone || "N/A"}</TableCell>
                      <TableCell>{bidder.county || "N/A"}</TableCell>
                      <TableCell>
                        {new Date(bidder.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(bidder)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(bidder.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the bidder
                                  "{bidder.name}" and all associated data.
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
              {editingBidder ? "Edit Bidder" : "Add Bidder"}
            </DialogTitle>
            <DialogDescription>
              {editingBidder
                ? "Update the bidder information below."
                : "Add a new bidder to the system."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Select
                  value={watch("county") || undefined}
                  onValueChange={(value) => setValue("county", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {countiesArray.length === 0 ? (
                      <SelectItem value="no-counties" disabled>
                        No counties available
                      </SelectItem>
                    ) : (
                      countiesArray.map((county: any) => (
                        <SelectItem key={county.id} value={county.name}>
                          {county.name}
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
                  reset();
                  setEditingBidder(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{editingBidder ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
