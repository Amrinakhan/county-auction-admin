"use client";

import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return res.json();
};

interface Auction {
  id: number;
  propertyId: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  property: {
    id: number;
    name: string;
    location: string;
    county: string;
    price: number;
  };
  bids: Array<{
    id: number;
    amount: number;
    bidder: {
      name: string;
      email: string;
    };
  }>;
}

export default function AuctionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: auctions, isLoading, error, mutate } = useSWR<Auction[]>(
    "/api/auctions",
    fetcher
  );
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const auctionsArray = Array.isArray(auctions) ? auctions : [];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      UPCOMING: { label: "Upcoming", variant: "outline" },
      ACTIVE: { label: "Active", variant: "default" },
      ENDED: { label: "Ended", variant: "secondary" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/auctions/${deleteId}`);
      await mutate();
      setDeleteId(null);
      toast({
        title: "Success",
        description: "Auction deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting auction:", error);
      const errorMessage =
        error?.response?.data?.error || "Failed to delete auction";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.post("/api/auctions/update-status");
      await mutate();
      toast({
        title: "Success",
        description: "Auction statuses updated",
      });
    } catch (error: any) {
      console.error("Error updating statuses:", error);
      toast({
        title: "Error",
        description: "Failed to update auction statuses",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Auctions</h1>
        <div className="flex gap-2">
          <Button onClick={handleUpdateStatus} variant="outline">
            Update Statuses
          </Button>
          <Button onClick={() => router.push("/admin/auctions/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Auction
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Auctions</CardTitle>
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
              Error loading auctions: {error.message || "Unknown error"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bids Count</TableHead>
                  <TableHead>Highest Bid</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auctionsArray.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No auctions found
                    </TableCell>
                  </TableRow>
                ) : (
                  auctionsArray.map((auction) => {
                    const highestBid = auction.bids?.length > 0
                      ? Math.max(...auction.bids.map((b) => b.amount))
                      : null;
                    return (
                      <TableRow key={auction.id}>
                        <TableCell>{auction.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{auction.property.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {auction.property.county}, {auction.property.location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(auction.start_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(auction.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(auction.status)}</TableCell>
                        <TableCell>{auction.bids?.length || 0}</TableCell>
                        <TableCell>
                          {highestBid ? `$${highestBid.toFixed(2)}` : "No bids"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/admin/auctions/${auction.id}/bids`)
                              }
                            >
                              Open Bids
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/admin/auctions/${auction.id}`)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteId(auction.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently
                                    delete the auction for property "{auction.property.name}".
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
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

