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
import { Switch } from "@/components/ui/switch";
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

const countySchema = z.object({
  name: z.string().min(1, "County name is required"),
  state: z.string().optional(),
  visible: z.boolean(),
});

type CountyFormData = z.infer<typeof countySchema>;

interface County {
  id: number;
  name: string;
  state: string | null;
  visible: boolean;
  created_at: string;
}

export default function CountiesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCounty, setEditingCounty] = useState<County | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data: counties, isLoading, mutate } = useSWR<County[]>("/api/counties", fetcher);
  
  const countiesArray = Array.isArray(counties) ? counties : [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CountyFormData>({
    resolver: zodResolver(countySchema),
    defaultValues: {
      name: "",
      state: "",
      visible: true,
    },
  });

  const visibleValue = watch("visible");

  const onSubmit = async (data: CountyFormData) => {
    try {
      if (editingCounty) {
        await axios.put(`/api/counties/${editingCounty.id}`, data);
        if ((window as any).toast) {
          (window as any).toast({ title: "County updated successfully", variant: "success" });
        }
      } else {
        await axios.post("/api/counties", data);
        if ((window as any).toast) {
          (window as any).toast({ title: "County created successfully", variant: "success" });
        }
      }
      await mutate();
      setIsModalOpen(false);
      reset();
      setEditingCounty(null);
    } catch (error: any) {
      console.error("Error saving county:", error);
      const errorMessage = error?.response?.data?.error || "Failed to save county";
      if ((window as any).toast) {
        (window as any).toast({ 
          title: "Error", 
          description: errorMessage, 
          variant: "error" 
        });
      }
    }
  };

  const handleEdit = (county: County) => {
    setEditingCounty(county);
    setValue("name", county.name);
    setValue("state", county.state || "");
    setValue("visible", county.visible);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/api/counties/${deleteId}`);
      await mutate();
      setDeleteId(null);
      if ((window as any).toast) {
        (window as any).toast({ title: "County deleted successfully", variant: "success" });
      }
    } catch (error) {
      console.error("Error deleting county:", error);
      if ((window as any).toast) {
        (window as any).toast({ title: "Error", description: "Failed to delete county", variant: "error" });
      }
    }
  };

  const handleToggleVisibility = async (county: County) => {
    try {
      await axios.patch(`/api/counties/${county.id}`, {
        visible: !county.visible,
      });
      await mutate();
      if ((window as any).toast) {
        (window as any).toast({
          title: "Visibility Updated",
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      if ((window as any).toast) {
        (window as any).toast({
          title: "Error",
          description: "Failed to update visibility",
          variant: "error",
        });
      }
    }
  };

  const handleAdd = () => {
    reset();
    setEditingCounty(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Counties</h1>
        <Button onClick={handleAdd}>➕ Add County</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Counties</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countiesArray.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No counties found
                    </TableCell>
                  </TableRow>
                ) : (
                  countiesArray.map((county) => (
                    <TableRow key={county.id}>
                      <TableCell className="font-medium">{county.name}</TableCell>
                      <TableCell>{county.state || "N/A"}</TableCell>
                      <TableCell>
                        <Switch
                          checked={county.visible}
                          onCheckedChange={() => handleToggleVisibility(county)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(county)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(county.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the county
                                  "{county.name}" and all associated data.
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
              {editingCounty ? "Edit County" : "Add County"}
            </DialogTitle>
            <DialogDescription>
              {editingCounty
                ? "Update the county information below."
                : "Add a new county to the system."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">County Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter county name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  {...register("state")}
                  placeholder="Enter state"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="visible"
                  checked={visibleValue}
                  onCheckedChange={(checked) => setValue("visible", checked)}
                />
                <Label htmlFor="visible">Visible</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  reset();
                  setEditingCounty(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{editingCounty ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
