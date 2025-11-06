"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Mail, Shield, MapPin, Phone, Edit, Save, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [adminData, setAdminData] = useState({
    name: "Admin",
    email: "admin123@gmail.com",
    role: "Administrator",
    county: "Hudson County",
    phone: "+1 (555) 123-4567",
  });

  const [editForm, setEditForm] = useState(adminData);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/login");
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        if (isMounted && data?.user) {
          setAdminData((prev) => ({
            ...prev,
            name: data.user.name ?? prev.name,
            email: data.user.email ?? prev.email,
          }));
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Error loading profile", message);
        toast({
          title: "Unable to load profile",
          description: message,
          variant: "error",
        });
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router, toast]);

  useEffect(() => {
    setEditForm(adminData);
  }, [adminData]);

  const handleEdit = () => {
    setEditForm(adminData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const message = typeof result?.error === "string" ? result.error : "Failed to update profile";
        throw new Error(message);
      }

      setAdminData((prev) => ({
        ...prev,
        name: result.user.name,
        email: result.user.email,
      }));
      setIsEditing(false);
      router.refresh();
      toast({
        title: "Profile updated successfully",
        variant: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again";
      toast({
        title: "Update failed",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(adminData);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Profile</h1>
        <Button onClick={handleEdit} variant="outline" disabled={isLoadingProfile}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 pb-4">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                {adminData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{adminData.name}</h2>
                <p className="text-muted-foreground">{adminData.email}</p>
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  <Shield className="h-3 w-3" />
                  {adminData.role}
                </span>
              </div>
            </div>

            <Separator />

            {/* Details Section */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </Label>
                  <p className="text-base font-medium mt-1">{adminData.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </Label>
                  <p className="text-base font-medium mt-1">{adminData.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </Label>
                  <p className="text-base font-medium mt-1">{adminData.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    County
                  </Label>
                  <p className="text-base font-medium mt-1">{adminData.county}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Role
                  </Label>
                  <p className="text-base font-medium mt-1">{adminData.role}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-2xl font-bold text-blue-600">Active</p>
              <p className="text-sm text-muted-foreground mt-1">Account Status</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm font-medium">Jan 2024</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Login</span>
                <span className="text-sm font-medium">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={editForm.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={editForm.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                name="county"
                value={editForm.county}
                onChange={handleChange}
                placeholder="Enter county name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                value={editForm.role}
                onChange={handleChange}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Role cannot be changed
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
