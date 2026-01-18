import React from 'react';
import {
  Send,
  Square,
  Download,
  Sparkles,
  User,
  ChevronLeft,
  Copy,
  Trash2,
  Code,
  Plus,
  MessageSquare,
  ChevronDown,
  Settings,
  Sun,
  Moon,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

export const SendIcon = () => <Send className="w-5 h-5" />;
export const StopIcon = () => <Square className="w-5 h-5" />;
export const DownloadIcon = () => <Download className="w-5 h-5" />;
export const SparklesIcon = () => <Sparkles className="w-4 h-4" />;
export const UserIcon = () => <User className="w-4 h-4" />;
export const CollapseIcon = () => <ChevronLeft className="w-5 h-5" />;
export const CopyIcon = () => <Copy className="w-4 h-4" />;
export const TrashIcon = () => <Trash2 className="w-4 h-4" />;
export const CodeIcon = () => <Code className="w-4 h-4" />;
export const PlusIcon = () => <Plus className="w-4 h-4" />;
export const ChatIcon = () => <MessageSquare className="w-4 h-4" />;
export const ChevronDownIcon = () => <ChevronDown className="w-4 h-4" />;
export const SettingsIcon = () => <Settings className="w-4 h-4" />;
export const SunIcon = () => <Sun className="w-4 h-4" />;
export const MoonIcon = () => <Moon className="w-4 h-4" />;
export const RefreshIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <RotateCcw className={`w-3 h-3 ${className}`} />
);
export const ZoomInIcon = () => <ZoomIn className="w-5 h-5" />;
export const ZoomOutIcon = () => <ZoomOut className="w-5 h-5" />;
export const ResetIcon = () => <RotateCcw className="w-4 h-4" />;
