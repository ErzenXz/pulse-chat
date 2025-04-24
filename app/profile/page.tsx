"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ThemeSelector } from "@/components/theme-selector"
import { EnhancedThemeSelector } from "@/components/enhanced-theme-selector"
import { ChatSidebar } from "@/components/chat-sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, 
  ArrowLeft, 
  Loader2, 
  Camera, 
  PaintBucket,
  BellRing,
  Trash2,
  ChevronRight
} from "lucide-react"
import { getInitials } from "@/lib/utils"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Define our extended user type with optional bio
interface ExtendedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  image?: string;
  bio?: string;
}

// Tab interface
interface ProfileTab {
  id: 'profile' | 'appearance' | 'notifications' | 'danger';
  label: string;
  icon: React.ElementType;
}

const tabs: ProfileTab[] = [
  { id: 'profile', label: 'Personal Info', icon: User },
  { id: 'appearance', label: 'Appearance', icon: PaintBucket },
  { id: 'notifications', label: 'Notifications', icon: BellRing },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 }
];

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [activeTab, setActiveTab] = useState<ProfileTab['id']>('profile')
  
  // Form fields
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [profileImage, setProfileImage] = useState("")
  
  useEffect(() => {
    if (user) {
      setFullName(user.name || "")
      setBio((user as any).bio || "") 
      setProfileImage(user.image || "")
    }
  }, [user])
  
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      
      if (!user) return;
      
      const updatedUser = {
        ...user,
        name: fullName,
        bio: bio
      };
      
      updateUser(updatedUser as any);
      
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      setUploadingImage(true)
      toast.loading("Uploading image...")
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const localImageUrl = URL.createObjectURL(file)
      setProfileImage(localImageUrl)
      
      if (user) {
        const updatedUser = {
          ...user,
          image: localImageUrl
        };
        updateUser(updatedUser);
      }
      
      toast.success("Profile image updated")
    } catch (error) {
      console.error("Failed to upload image:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  // Render the content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="w-full md:w-1/3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <div className="relative group mb-4">
                          <Avatar className="h-24 w-24 border-2 border-background ring-2 ring-primary/10">
                            <AvatarImage src={profileImage} className="object-cover" />
                            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                              {user?.name ? getInitials(user.name) : user?.username?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <label 
                            htmlFor="profile-image" 
                            className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-all"
                          >
                            <Camera className="h-6 w-6" />
                          </label>
                          <input 
                            type="file" 
                            id="profile-image" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                          />
                          {uploadingImage && (
                            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/70 text-white">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold">{user?.name || "Your Name"}</h3>
                        <p className="text-sm text-muted-foreground">@{user?.username}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="w-full md:w-2/3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information and how you appear to others
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          placeholder="Your full name" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          value={user?.username || ""}
                          disabled
                          className="bg-muted/30 h-10"
                        />
                        <p className="text-xs text-muted-foreground">
                          Username cannot be changed
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio" 
                          placeholder="Write a short bio about yourself"
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {bio.length}/250 characters
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t py-3">
                      <Button 
                        onClick={handleSaveProfile} 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </motion.div>
        );
      
      case 'appearance':
        return (
          <motion.div
            key="appearance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>
                  Customize the appearance of your PulseChat experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center p-6 bg-muted/50 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Select Theme</h3>
                  <EnhancedThemeSelector />
                  <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
                    Choose from multiple themes to personalize your experience. 
                    Your selection will be saved across devices.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      
      case 'notifications':
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control what notifications you receive and how they are delivered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <label htmlFor="messages" className="font-medium">New messages</label>
                        <p className="text-sm text-muted-foreground">Receive email notifications for new messages</p>
                      </div>
                      <input type="checkbox" id="messages" className="h-5 w-5 rounded" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <label htmlFor="calls" className="font-medium">Missed calls</label>
                        <p className="text-sm text-muted-foreground">Get notified when you miss a call</p>
                      </div>
                      <input type="checkbox" id="calls" className="h-5 w-5 rounded" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <label htmlFor="updates" className="font-medium">PulseChat updates</label>
                        <p className="text-sm text-muted-foreground">Stay informed about new features and updates</p>
                      </div>
                      <input type="checkbox" id="updates" className="h-5 w-5 rounded" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t py-3">
                <Button className="ml-auto">Save Preferences</Button>
              </CardFooter>
            </Card>
          </motion.div>
        );
      
      case 'danger':
        return (
          <motion.div
            key="danger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  These actions cannot be undone. Proceed with caution.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-destructive/30 p-4 bg-destructive/5">
                  <h3 className="font-medium mb-2 text-destructive">Delete Your Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This will permanently delete your account, conversations, messages, and all associated data.
                  </p>
                  <Button variant="destructive">Delete Account Permanently</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar currentChatId="profile" />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="border-b py-3 px-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/conversations')}
                className="md:hidden mr-2 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="text-xl font-semibold">Profile Settings</h1>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="container max-w-5xl mx-auto py-6 px-4">
            {/* Tab navigation */}
            <div className="flex border rounded-lg mb-6 overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    className={cn(
                      "flex items-center py-2 px-4 gap-2 flex-1 transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted/60"
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Tab content with animation */}
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UserProfile() {
  return <ProfilePage />;
} 