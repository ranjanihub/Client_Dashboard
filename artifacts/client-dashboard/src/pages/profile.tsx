import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGetClientProfile, useUpdateClientProfile, getGetClientProfileQueryKey } from '@workspace/api-client-react';
import { pageTransition, PageHeader } from '@/components/shared';
import { Camera, User, Mail, Phone, Globe, CalendarHeart, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const MOCK_PROFILE = {
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  phone: '+1 (555) 234-5678',
  age: 29,
  gender: 'Female',
  preferredLanguage: 'English',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
};

export default function ProfilePage() {
  const { data: apiProfile, isLoading } = useGetClientProfile();
  const profile = apiProfile || MOCK_PROFILE;
  const updateMutation = useUpdateClientProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    preferredLanguage: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || 'Alex Morgan',
        email: profile.email || 'alex.morgan@example.com',
        phone: profile.phone || '+1 (555) 234-5678',
        age: profile.age ? String(profile.age) : '29',
        gender: profile.gender || 'Female',
        preferredLanguage: profile.preferredLanguage || 'English'
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      age: formData.age ? parseInt(formData.age, 10) : undefined,
    };

    updateMutation.mutate({ data: payload }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetClientProfileQueryKey() });
        toast({
          title: "Profile updated",
          description: "Your information has been saved successfully.",
        });
      },
      onError: (err) => {
        toast({
          title: "Update failed",
          description: "Could not save profile changes. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <PageHeader title="Profile Settings" />
        <div className="h-96 bg-muted rounded-[24px]"></div>
      </div>
    );
  }

  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto space-y-8 pb-12">
      <PageHeader 
        title="Profile Settings" 
        description="Manage your personal details, contact info, and care preferences." 
      />

      <div className="hex-card">
        {/* Profile Header / Avatar */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 mb-8 border-b border-border">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-accent flex items-center justify-center text-primary text-2xl font-bold">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile.name?.slice(0, 2).toUpperCase()
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-md hover:brightness-110 transition-all">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="px-3 py-1 bg-accent text-primary font-bold text-xs rounded-full">
                Client ID: #CL-8921
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                <User className="w-4 h-4 text-primary" /> Full Name
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="hex-input w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Mail className="w-4 h-4 text-primary" /> Email Address
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="hex-input w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Phone className="w-4 h-4 text-primary" /> Phone Number
              </label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="hex-input w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                <CalendarHeart className="w-4 h-4 text-primary" /> Age
              </label>
              <input 
                type="number" 
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="hex-input w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                <User className="w-4 h-4 text-primary" /> Gender
              </label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="hex-input w-full bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Globe className="w-4 h-4 text-primary" /> Preferred Language
              </label>
              <select 
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                className="hex-input w-full bg-white"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Mandarin">Mandarin</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
            <button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="hex-button-primary min-w-[160px]"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
