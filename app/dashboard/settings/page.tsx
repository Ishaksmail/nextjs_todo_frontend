"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/hooks/use-api"
import { useAuth } from "@/components/providers/auth-provider"
import { Settings, User, Sparkles, Bell, Palette, Shield, ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const [newUsername, setNewUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [emailUpdates, setEmailUpdates] = useState(true)
  const { toast } = useToast()
  const { post } = useApi()
  const { user } = useAuth()

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername.trim()) return

    setIsLoading(true)
    try {
      await post("/api/user/reset-username", { new_username: newUsername })
      toast({
        title: "Success",
        description: "Username updated successfully!",
      })
      setNewUsername("")
    } catch (error) {
      toast({
        title: "Demo Mode",
        description: "This is demo data. Connect to your backend to enable full functionality.",
        variant: "default",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationToggle = (checked: boolean) => {
    setNotifications(checked)
    toast({
      title: checked ? "Notifications Enabled" : "Notifications Disabled",
      description: checked ? "You'll receive task reminders" : "Task reminders are turned off",
    })
  }

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked)
    toast({
      title: checked ? "Dark Mode Enabled" : "Light Mode Enabled",
      description: "Theme preference updated",
    })
  }

  const handleEmailToggle = (checked: boolean) => {
    setEmailUpdates(checked)
    toast({
      title: checked ? "Email Updates Enabled" : "Email Updates Disabled",
      description: checked ? "You'll receive email notifications" : "Email notifications are turned off",
    })
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Settings className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Manage your Climdo account and preferences</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="p-0 grid w-full grid-cols-4 h-16 border border-gray-200 overflow-hidden">
            <TabsTrigger
              value="profile"
              className="w-full h-full flex items-center space-x-2 data-[state=active]:bg-gray-100 rounded-none"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="w-full h-full flex items-center space-x-2 data-[state=active]:bg-gray-100 rounded-none"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="w-full h-full flex items-center space-x-2 data-[state=active]:bg-gray-100 rounded-none"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="w-full h-full flex items-center space-x-2 data-[state=active]:bg-gray-100 rounded-none"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-8 animate-in slide-in-from-left-4 duration-300">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Profile Information</CardTitle>
                    <CardDescription>Update your account details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Current Info */}
                  <div className="bg-gray-50 rounded-lg p-4 transition-all duration-200 hover:bg-gray-100">
                    <div className="flex items-center mb-2">
                      <User className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-700">Current Username</span>
                    </div>
                    <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {user?.username}
                    </p>
                  </div>

                  {/* Update Form */}
                  <form onSubmit={handleUsernameChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-username" className="text-gray-700 font-medium">
                        New Username
                      </Label>
                      <Input
                        id="new-username"
                        type="text"
                        placeholder="Enter new username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !newUsername.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 px-8 transition-all duration-200 hover:scale-105"
                    >
                      {isLoading ? "Updating..." : "Update Username"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-8 animate-in slide-in-from-left-4 duration-300">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-600" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified about your tasks</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-600">Receive notifications about task deadlines and updates</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={handleNotificationToggle} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Email Updates</h3>
                    <p className="text-sm text-gray-600">Get weekly summaries and important updates via email</p>
                  </div>
                  <Switch checked={emailUpdates} onCheckedChange={handleEmailToggle} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Task Reminders</h3>
                    <p className="text-sm text-gray-600">Get reminded about upcoming due dates</p>
                  </div>
                  <Switch checked={true} onCheckedChange={() => { }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-8 animate-in slide-in-from-left-4 duration-300">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-blue-600" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>Customize how Climdo looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Dark Mode</h3>
                    <p className="text-sm text-gray-600">Switch to a darker theme for better night viewing</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Compact View</h3>
                    <p className="text-sm text-gray-600">Show more tasks in less space</p>
                  </div>
                  <Switch checked={false} onCheckedChange={() => { }} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Animations</h3>
                    <p className="text-sm text-gray-600">Enable smooth transitions and animations</p>
                  </div>
                  <Switch checked={true} onCheckedChange={() => { }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="mt-8 animate-in slide-in-from-left-4 duration-300">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>Manage your privacy settings and account security</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100 cursor-pointer">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100 cursor-pointer">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100 cursor-pointer">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Data Export</h3>
                    <p className="text-sm text-gray-600">Download a copy of your data</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg transition-all duration-200 hover:bg-red-100 cursor-pointer border border-red-200">
                  <div className="flex-1">
                    <h3 className="font-medium text-red-900">Delete Account</h3>
                    <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
