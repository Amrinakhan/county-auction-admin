"use client";

import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Trash2, CheckCircle2, XCircle, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch");
  }
  return Array.isArray(data) ? data : [];
};

interface Bid {
  id: number;
  amount: number;
  status: string;
  propertyId: number;
  auctionId?: number | null;
  bidderId: number;
  created_at: string;
  property?: {
    name: string;
    county: string;
    location?: string;
  };
  auction?: {
    id: number;
    status: string;
    start_date: string;
    end_date: string;
  } | null;
  bidder?: {
    name: string;
    email: string;
  };
}

export default function BidsPage() {
  const { data: bids, isLoading, mutate } = useSWR<Bid[]>("/api/bids", fetcher);
  const { data: properties } = useSWR("/api/properties", fetcher);
  const { data: bidders } = useSWR("/api/bidders", fetcher);
  const { data: auctions } = useSWR("/api/auctions", fetcher);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({
    amount: "",
    propertyId: "",
    bidderId: "",
    auctionId: "",
  });

  const bidsArray = Array.isArray(bids) ? bids : [];
  const propertiesArray = Array.isArray(properties) ? properties : [];
  const biddersArray = Array.isArray(bidders) ? bidders : [];
  const auctionsArray = Array.isArray(auctions) ? auctions : [];

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await axios.patch("/api/bids", { id, status });
      await mutate();
      
      if ((window as any).toast) {
        (window as any).toast({
          title: `Bid ${status}!`,
          variant: "success",
        });
      }
    } catch (error: any) {
      console.error("Error updating bid:", error);
      const errorMessage = error?.response?.data?.error || "Error updating bid";
      
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

  const handleAddBid = async () => {
    try {
      if (!form.amount || !form.propertyId || !form.bidderId) {
        if ((window as any).toast) {
          (window as any).toast({
            title: "Error",
            description: "All fields are required",
            variant: "error",
          });
        } else {
          alert("All fields are required");
        }
        return;
      }

      await axios.post("/api/bids", {
        amount: parseFloat(form.amount),
        propertyId: Number(form.propertyId),
        bidderId: Number(form.bidderId),
        auctionId: form.auctionId && form.auctionId !== "none" ? Number(form.auctionId) : null,
      });
      
      await mutate();
      setIsModalOpen(false);
      setForm({ amount: "", propertyId: "", bidderId: "", auctionId: "" });
      
      if ((window as any).toast) {
        (window as any).toast({
          title: "Bid created successfully!",
          variant: "success",
        });
      }
    } catch (error: any) {
      console.error("Error creating bid:", error);
      const errorMessage = error?.response?.data?.error || "Failed to create bid";
      
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

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete("/api/bids", { data: { id: deleteId } });
      await mutate();
      setDeleteId(null);
      
      if ((window as any).toast) {
        (window as any).toast({
          title: "Bid deleted successfully",
          variant: "success",
        });
      }
    } catch (error: any) {
      console.error("Error deleting bid:", error);
      const errorMessage = error?.response?.data?.error || "Failed to delete bid";
      
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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bids Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bid
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bids</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : bidsArray.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No bids found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Bidder</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Auction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bidsArray.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell>{bid.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bid.bidder?.name || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">
                          {bid.bidder?.email || ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bid.property?.name || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">
                          {bid.property?.county || ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {bid.auction ? (
                        <div>
                          <div className="font-medium">Auction #{bid.auction.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {bid.auction.status}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No auction</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${bid.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(bid.status)}</TableCell>
                    <TableCell>
                      {new Date(bid.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {bid.status.toLowerCase() !== "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(bid.id, "approved")}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {bid.status.toLowerCase() !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(bid.id, "rejected")}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteId(bid.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this bid.
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Bid Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bid</DialogTitle>
            <DialogDescription>
              Create a new bid for a property.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="propertyId">Property *</Label>
              <Select
                value={form.propertyId}
                onValueChange={(value) => setForm({ ...form, propertyId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {propertiesArray.length === 0 ? (
                    <SelectItem value="no-properties" disabled>
                      No properties available
                    </SelectItem>
                  ) : (
                    propertiesArray.map((property: any) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.name} - {property.county}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bidderId">Bidder *</Label>
              <Select
                value={form.bidderId}
                onValueChange={(value) => setForm({ ...form, bidderId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bidder" />
                </SelectTrigger>
                <SelectContent>
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

            <div className="space-y-2">
              <Label htmlFor="auctionId">Auction (Optional)</Label>
              <Select
                value={form.auctionId}
                onValueChange={(value) => setForm({ ...form, auctionId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select auction (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No auction</SelectItem>
                  {auctionsArray.length === 0 ? (
                    <SelectItem value="no-auctions" disabled>
                      No auctions available
                    </SelectItem>
                  ) : (
                    auctionsArray
                      .filter((auction: any) => auction.status === "ACTIVE")
                      .map((auction: any) => (
                        <SelectItem key={auction.id} value={auction.id.toString()}>
                          Auction #{auction.id} - {auction.property?.name} ({auction.status})
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="Enter bid amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setForm({ amount: "", propertyId: "", bidderId: "", auctionId: "" });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddBid}>Add Bid</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

