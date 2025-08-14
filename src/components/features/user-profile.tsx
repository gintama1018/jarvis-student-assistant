"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Camera, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Trash2,
  User,
  Mail,
  Globe,
  Clock,
  Bell,
  Shield,
  Settings,
  Eye,
  EyeOff
} from "lucide-react"

interface UserStats {
  tasksCompleted: number
  notesCreated: number
  chatsSaved: number
  daysActive: number
}

interface UserProfile {
  name: string
  email: string
  bio: string
  avatar: string
}

interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
}

interface NotificationSettings {
  email: boolean
  push: boolean
  inApp: boolean
  taskReminders: boolean
  noteSharing: boolean
}

interface AppSettings {
  defaultTaskPriority: "low" | "medium" | "high"
  noteFormatting: "markdown" | "rich" | "plain"
  autoSave: boolean
  compactView: boolean
}

export default function UserProfile() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error", message: string } | null>(null)

  // Sample data - in real app this would come from API/database
  const [userStats] = useState<UserStats>({
    tasksCompleted: 247,
    notesCreated: 89,
    chatsSaved: 34,
    daysActive: 156
  })

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Alex Chen",
    email: "alex.chen@example.com",
    bio: "Computer Science student passionate about productivity and learning. Always looking for ways to optimize my workflow and help others succeed.",
    avatar: ""
  })

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "dark",
    language: "en",
    timezone: "America/New_York"
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    inApp: true,
    taskReminders: true,
    noteSharing: false
  })

  const [appSettings, setAppSettings] = useState<AppSettings>({
    defaultTaskPriority: "medium",
    noteFormatting: "markdown",
    autoSave: true,
    compactView: false
  })

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const handleSave = async (section: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setActiveSection(null)
      setAlertMessage({ type: "success", message: "Settings saved successfully!" })
      setTimeout(() => setAlertMessage(null), 3000)
    } catch (error) {
      setAlertMessage({ type: "error", message: "Failed to save settings. Please try again." })
      setTimeout(() => setAlertMessage(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = (section: string) => {
    setActiveSection(null)
    // Reset form data if needed
    if (section === "password") {
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    }
  }

  const handleAvatarUpload = () => {
    // In real app, this would trigger file upload
    setAlertMessage({ type: "success", message: "Avatar upload functionality would be implemented here." })
    setTimeout(() => setAlertMessage(null), 3000)
  }

  const handleDataExport = () => {
    setAlertMessage({ type: "success", message: "Data export started. You'll receive an email when ready." })
    setTimeout(() => setAlertMessage(null), 3000)
  }

  const handleAccountDeletion = () => {
    setAlertMessage({ type: "success", message: "Account deletion process would be implemented here." })
    setShowDeleteDialog(false)
    setTimeout(() => setAlertMessage(null), 3000)
  }

  const StatCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: number }) => (
    <div className="bg-surface rounded-lg p-4 border border-border">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Icon className="h-4 w-4 text-text-secondary" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className="text-2xl font-semibold text-text-primary">{value}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Alert Messages */}
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className={alertMessage.type === "success" ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}>
              {alertMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription className={alertMessage.type === "success" ? "text-green-400" : "text-red-400"}>
                {alertMessage.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Profile Header */}
        <Card className="bg-surface border-border">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                    <AvatarFallback className="text-2xl bg-accent text-accent-foreground">
                      {userProfile.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleAvatarUpload}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-text-primary">{userProfile.name}</h1>
                  <p className="text-text-secondary">{userProfile.email}</p>
                </div>
                
                <p className="text-text-secondary leading-relaxed">{userProfile.bio}</p>

                <Button 
                  variant="outline" 
                  onClick={() => setActiveSection("profile")}
                  className="mt-4"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 lg:min-w-[300px]">
                <StatCard icon={CheckCircle2} label="Tasks Completed" value={userStats.tasksCompleted} />
                <StatCard icon={Edit3} label="Notes Created" value={userStats.notesCreated} />
                <StatCard icon={Globe} label="Chats Saved" value={userStats.chatsSaved} />
                <StatCard icon={Clock} label="Days Active" value={userStats.daysActive} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        <div className="grid gap-6">
          {/* Personal Information */}
          <Card className="bg-surface border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-text-secondary" />
                <CardTitle className="text-text-primary">Personal Information</CardTitle>
              </div>
              {activeSection !== "profile" && (
                <Button variant="ghost" size="sm" onClick={() => setActiveSection("profile")}>
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSection === "profile" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={userProfile.bio}
                      onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                      rows={3}
                      className="bg-background"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave("profile")} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={() => handleCancel("profile")}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Name</span>
                    <span className="text-text-primary">{userProfile.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Email</span>
                    <span className="text-text-primary">{userProfile.email}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-text-secondary">Bio</span>
                    <span className="text-text-primary text-right max-w-md">{userProfile.bio}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="bg-surface border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-text-secondary" />
                <CardTitle className="text-text-primary">Preferences</CardTitle>
              </div>
              {activeSection !== "preferences" && (
                <Button variant="ghost" size="sm" onClick={() => setActiveSection("preferences")}>
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSection === "preferences" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select value={preferences.theme} onValueChange={(value: any) => setPreferences({ ...preferences, theme: value })}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select value={preferences.language} onValueChange={(value) => setPreferences({ ...preferences, language: value })}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select value={preferences.timezone} onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave("preferences")} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={() => handleCancel("preferences")}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Theme</span>
                    <span className="text-text-primary capitalize">{preferences.theme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Language</span>
                    <span className="text-text-primary">English</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Timezone</span>
                    <span className="text-text-primary">Eastern Time</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-surface border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-text-secondary" />
                <CardTitle className="text-text-primary">Notifications</CardTitle>
              </div>
              {activeSection !== "notifications" && (
                <Button variant="ghost" size="sm" onClick={() => setActiveSection("notifications")}>
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSection === "notifications" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-text-secondary">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Push Notifications</Label>
                        <p className="text-sm text-text-secondary">Receive push notifications in browser</p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">In-App Notifications</Label>
                        <p className="text-sm text-text-secondary">Show notifications within the app</p>
                      </div>
                      <Switch
                        checked={notifications.inApp}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, inApp: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Task Reminders</Label>
                        <p className="text-sm text-text-secondary">Get reminders for upcoming tasks</p>
                      </div>
                      <Switch
                        checked={notifications.taskReminders}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, taskReminders: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Note Sharing</Label>
                        <p className="text-sm text-text-secondary">Notifications when notes are shared with you</p>
                      </div>
                      <Switch
                        checked={notifications.noteSharing}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, noteSharing: checked })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave("notifications")} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={() => handleCancel("notifications")}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Email Notifications</span>
                    <span className={`text-sm px-2 py-1 rounded ${notifications.email ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {notifications.email ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Push Notifications</span>
                    <span className={`text-sm px-2 py-1 rounded ${notifications.push ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {notifications.push ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Task Reminders</span>
                    <span className={`text-sm px-2 py-1 rounded ${notifications.taskReminders ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {notifications.taskReminders ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* App Settings */}
          <Card className="bg-surface border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-text-secondary" />
                <CardTitle className="text-text-primary">App Settings</CardTitle>
              </div>
              {activeSection !== "appSettings" && (
                <Button variant="ghost" size="sm" onClick={() => setActiveSection("appSettings")}>
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSection === "appSettings" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Task Priority</Label>
                      <Select value={appSettings.defaultTaskPriority} onValueChange={(value: any) => setAppSettings({ ...appSettings, defaultTaskPriority: value })}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Note Formatting</Label>
                      <Select value={appSettings.noteFormatting} onValueChange={(value: any) => setAppSettings({ ...appSettings, noteFormatting: value })}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="markdown">Markdown</SelectItem>
                          <SelectItem value="rich">Rich Text</SelectItem>
                          <SelectItem value="plain">Plain Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Auto Save</Label>
                        <p className="text-sm text-text-secondary">Automatically save changes as you type</p>
                      </div>
                      <Switch
                        checked={appSettings.autoSave}
                        onCheckedChange={(checked) => setAppSettings({ ...appSettings, autoSave: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Compact View</Label>
                        <p className="text-sm text-text-secondary">Use compact layout to fit more content</p>
                      </div>
                      <Switch
                        checked={appSettings.compactView}
                        onCheckedChange={(checked) => setAppSettings({ ...appSettings, compactView: checked })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave("appSettings")} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={() => handleCancel("appSettings")}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Default Task Priority</span>
                    <span className="text-text-primary capitalize">{appSettings.defaultTaskPriority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Note Formatting</span>
                    <span className="text-text-primary capitalize">{appSettings.noteFormatting}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Auto Save</span>
                    <span className={`text-sm px-2 py-1 rounded ${appSettings.autoSave ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {appSettings.autoSave ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="bg-surface border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-text-secondary" />
                <CardTitle className="text-text-primary">Privacy & Security</CardTitle>
              </div>
              {activeSection !== "security" && (
                <Button variant="ghost" size="sm" onClick={() => setActiveSection("security")}>
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSection === "security" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          className="bg-background pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave("security")} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                    <Button variant="outline" onClick={() => handleCancel("security")}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Password</span>
                    <Button variant="outline" size="sm" onClick={() => setActiveSection("security")}>
                      Change Password
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Data Export</span>
                    <Button variant="outline" size="sm" onClick={handleDataExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-surface border-red-500/50">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-text-primary">Delete Account</h4>
                  <p className="text-sm text-text-secondary">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-surface border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-text-primary">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAccountDeletion}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}