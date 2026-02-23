import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Upload, RefreshCw } from 'lucide-react';
import { avatarOptions } from '@/app/constants/avatarOptions';
import { useState } from 'react';

interface AvatarSelectorProps {
    currentAvatar: string | null;
    onSelect: (avatar: string | File) => void;
    preview: string | null;
}

export function AvatarSelector({ currentAvatar, onSelect, preview }: AvatarSelectorProps) {
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onSelect(file);
        }
    };

    const handleRandomAvatar = () => {
        const randomIndex = Math.floor(Math.random() * avatarOptions.length);
        onSelect(avatarOptions[randomIndex]);
    };

    return (
        <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
                <Avatar className="w-32 h-32 ring-4 ring-[#a855f7]/50">
                    <AvatarImage src={preview || currentAvatar} />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <button
                    onClick={handleRandomAvatar}
                    className="absolute bottom-0 right-0 p-2 rounded-full glass-card hover:bg-secondary/80 transition-colors"
                    style={{ borderColor: '#a855f7' }}
                    type="button"
                >
                    <RefreshCw size={18} className="text-[#a855f7]" />
                </button>
            </div>

            <div className="grid grid-cols-6 gap-2 mb-4">
                {avatarOptions.map((avatar, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(avatar)}
                        className={`rounded-full overflow-hidden transition-all ${(currentAvatar === avatar && !preview)
                            ? 'ring-2 ring-[#a855f7] scale-110'
                            : 'opacity-50 hover:opacity-100'
                            }`}
                        type="button"
                    >
                        <img src={avatar} alt={`Avatar ${index + 1}`} className="w-10 h-10 object-cover" />
                    </button>
                ))}
            </div>

            <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg hover:bg-secondary/80 transition-colors">
                    <Upload size={16} className="text-[#a855f7]" />
                    <span className="text-sm">Upload Custom Avatar</span>
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                />
            </label>
        </div>
    );
}
