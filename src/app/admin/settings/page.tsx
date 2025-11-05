"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Save } from "lucide-react";
import axios from "axios";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    const savedEmailNotifications = localStorage.getItem("emailNotifications") !== "false";
    const savedCompanyName = localStorage.getItem("companyName") || "";
    const savedCompanyLogo = localStorage.getItem("companyLogo") || "";

    setDarkMode(savedDarkMode);
    setEmailNotifications(savedEmailNotifications);
    setCompanyName(savedCompanyName);
    setCompanyLogo(savedCompanyLogo);

    // Apply dark mode class on mount
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem("darkMode", checked.toString());
    // Apply dark mode class to document
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleEmailNotificationsChange = (checked: boolean) => {
    setEmailNotifications(checked);
    localStorage.setItem("emailNotifications", checked.toString());
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, create a data URL (in production, upload to S3 or server)
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCompanyLogo(dataUrl);
        localStorage.setItem("companyLogo", dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem("darkMode", darkMode.toString());
      localStorage.setItem("emailNotifications", emailNotifications.toString());
      localStorage.setItem("companyName", companyName);
      if (companyLogo) {
        localStorage.setItem("companyLogo", companyLogo);
      }

      // Also send to API (for future DB storage)
      await axios.post("/api/settings", {
        darkMode,
        emailNotifications,
        companyName,
        companyLogo,
      });

      if ((window as any).toast) {
        (window as any).toast({
          title: "Settings saved successfully",
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      if ((window as any).toast) {
        (window as any).toast({
          title: "Error",
          description: "Failed to save settings",
          variant: "error",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Preferences Card */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Manage your application preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle dark mode for the application
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={handleDarkModeChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={handleEmailNotificationsChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Company / Platform Information</CardTitle>
            <CardDescription>Configure your company branding and details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-logo">Company Logo</Label>
              <div className="flex items-center gap-4">
                {companyLogo && (
                  <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="h-20 w-20 object-contain border rounded"
                  />
                )}
                <div className="flex-1">
                  <label
                    htmlFor="logo-upload"
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed rounded-md cursor-pointer hover:bg-accent"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">
                      {companyLogo ? "Change Logo" : "Upload Logo"}
                    </span>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload company logo (PNG, JPG, SVG). In production, this will be stored on S3 or your server.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
