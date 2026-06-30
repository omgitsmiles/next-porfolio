import { Terminal, FolderOpen, FileText, Mail, Gamepad2, type LucideIcon } from "lucide-react";

export const WINDOW_ICONS: Record<string, LucideIcon> = {
  terminal: Terminal,
  projects: FolderOpen,
  about:    FileText,
  contact:  Mail,
  snake:    Gamepad2,
};
