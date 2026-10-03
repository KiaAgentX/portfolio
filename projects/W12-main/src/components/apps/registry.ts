import type { ComponentType } from "react";
import Terminal from "@/components/apps/Terminal";
import Settings from "@/components/apps/Settings";
import FileExplorer from "@/components/apps/FileExplorer";
import Store from "@/components/apps/Store";
import {
  Notepad,
  Calculator,
  Browser,
  Paint,
  Clock,
  Calendar,
  Music,
  Photos,
  CodeEditor,
  Weather,
  Mail,
  Chat,
  Games,
  Maps,
  Notes,
  TaskManager,
  Camera,
  RecycleBin,
} from "@/components/apps/SimpleApps";

export const APP_COMPONENTS: Record<string, ComponentType<{ appId: string }>> = {
  terminal: Terminal,
  settings: Settings,
  files: FileExplorer,
  store: Store,
  notepad: Notepad,
  calculator: Calculator,
  browser: Browser,
  paint: Paint,
  clock: Clock,
  calendar: Calendar,
  music: Music,
  photos: Photos,
  code: CodeEditor,
  weather: Weather,
  mail: Mail,
  chat: Chat,
  games: Games,
  maps: Maps,
  notes: Notes,
  taskmgr: TaskManager,
  camera: Camera,
  recycle: RecycleBin,
};
