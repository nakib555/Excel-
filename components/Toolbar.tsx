import React, { useState, useRef } from 'react';
import { 
  // Common & Home
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Download, Undo, Redo, ChevronDown, Palette, FileSpreadsheet, 
  Clipboard, Scissors, Copy, Paintbrush,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
  WrapText, Merge, DollarSign, Percent, MoveLeft, MoveRight,
  Table, LayoutList, Plus, X, Eraser, Sigma, ArrowUpDown, Search,
  Grid3X3, Type, PaintBucket, Layout, Printer,
  
  // Insert
  Table2, TableProperties, FormInput, Image as ImageIcon, CheckSquare, 
  BarChart, BarChart3, LineChart, PieChart, ScatterChart, 
  Map, BarChart4, Activity, BarChart2, Filter, History, 
  Link2, MessageSquare, BoxSelect, TrendingUp,
  
  // Draw
  MousePointer2, MousePointerClick, PenTool, Highlighter, PlusCircle, 
  Shapes, Pi, PlayCircle, RotateCcw,
  
  // Formulas
  Calculator, BookOpen, Binary, Calendar, Tag, ArrowRightFromLine, 
  ArrowLeftFromLine, Eye, Settings, FileDigit, Divide, FunctionSquare,
  Variable, Triangle,
  
  // Review
  SpellCheck, Book, FileBarChart, Gauge, Accessibility, Languages, 
  MessageSquarePlus, MessageSquareX, ChevronLeft, ChevronRight, Lock, 
  EyeOff, UserCheck, ShieldAlert, FileSearch, Mic,
  
  // Automate
  ScrollText, Play, List, Workflow, Bot, FileJson, FileCode,
  
  // Page Layout
  File, Maximize, Layers, ArrowUp, ArrowDown, 
  Move, Minimize2, Sliders, Smartphone, Image, Grid,
  BringToFront, SendToBack, Group, RotateCw, Sparkles,
  
  // Data
  Database, RefreshCw, Landmark, Coins, Columns, ShieldCheck, 
  Ungroup, FileUp, FileDown, Globe, ListFilter,
  ArrowDownUp, FileAxis3d, Split, Merge as MergeIcon,
  
  // View
  ZoomIn, Maximize2, Code, Monitor, Columns2, 
  PanelLeftClose, AppWindow, Eye as ViewEye,
  
  // File
  FileText, Save,
  
  // Added
  Home, Menu
} from 'lucide-react';
import { CellStyle } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolbarProps {
  currentStyle: CellStyle;
  onToggleStyle: (key: keyof CellStyle, value?: any) => void;
  onExport: () => void;
  onClear: () => void;
  onResetLayout: () => void;
}

// --- Components ---

const RibbonGroup: React.FC<{ label: string; children: React.ReactNode; className