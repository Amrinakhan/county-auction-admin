"use client";

import { useParams, useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return res.json();
};

interface Bid {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  bidder?: {
    name: string;
    email: string;
  };
  property?: {
    name: string;
    county: string;
  };
}

export default function AuctionBidsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const auctionId = params?.id as string;

  const { data: bids, isLoading, error, mutate } = useSWR<Bid[]>(
    auctionId ? `/api/bids?auctionId=${auctionId}` : null,
    fetcher
  );

  const { data: auction } = useSWR(
    auctionId ? `/api/auctions/${auctionId}` : null,
    fetcher
  );

  const bidsArray = Array.isArray(bids) ? bids : [];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
        );
    }
  };

  const handleStatusChange = async (bidId: number, newStatus: string) => {
    try {
      await axios.patch("/api/bids", { id: bidId, status: newStatus });
      await mutate();
      toast({
        title: "Success",
        description: `Bid ${newStatus} successfully`,
      });
    } catch (error: any) {
      console.error("Error updating bid status:", error);
      const errorMessage =
        error?.response?.data?.error || "Failed to update bid status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/auctions")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Auction Bids</h1>
          {auction && (
            <p className="text-muted-foreground">
              Property: {auction.property?.name} | Status: {auction.status}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bids for Auction #{auctionId}</CardTitle>
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
              Error loading bids: {error.message || "Unknown error"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Bidder</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bidsArray.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No bids found for this auction
                    </TableCell>
                  </TableRow>
                ) : (
                  bidsArray.map((bid) => (
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

