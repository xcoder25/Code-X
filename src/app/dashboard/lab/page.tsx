'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Code2, 
  Eye, 
  Play, 
  Save, 
  Share2, 
  Settings, 
  Trash2, 
  Maximize2,
  Layout,
  PanelLeft,
  Settings2,
  Sparkles,
  Zap,
  RotateCcw,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/app/auth-provider';

export default function LabPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [html, setHtml] = useState('<!-- Code-X Cinematic Lab -->\n<div class="hero">\n  <h1>NEURAL SANDBOX</h1>\n  <p>Live Protocol Synchronization Active.</p>\n  <button id="mainBtn">INITIALIZE</button>\n</div>');
    const [css, setCss] = useState('body {\n  background: #020617;\n  color: #fff;\n  font-family: sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n  overflow: hidden;\n}\n\n.hero {\n  text-align: center;\n  padding: 3rem;\n  border: 1px solid rgba(59, 130, 246, 0.2);\n  background: rgba(15, 23, 42, 0.5);\n  backdrop-filter: blur(20px);\n  border-radius: 2rem;\n}\n\nh1 {\n  font-weight: 900;\n  margin: 0;\n  background: linear-gradient(to right, #3b82f6, #8b5cf6);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  letter-spacing: -2px;\n}\n\nbutton {\n  margin-top: 2rem;\n  padding: 0.75rem 2rem;\n  background: #2563eb;\n  border: none;\n  color: white;\n  border-radius: 0.75rem;\n  font-weight: bold;\n  cursor: pointer;\n  transition: all 0.3s;\n}\n\nbutton:hover {\n  transform: scale(1.05);\n  box-shadow: 0 0 20px rgba(37, 99, 235, 0.4);\n}');
    const [js, setJs] = useState('// Scripting Module\ndocument.getElementById("mainBtn").addEventListener("click", () => {\n  alert("Neural connection established.");\n});');
    
    const [srcDoc, setSrcDoc] = useState('');
    const [activeTab, setActiveTab] = useState('html');
    const [theme, setTheme] = useState('vs-dark');

    const updatePreview = useCallback(() => {
        const fullDoc = `
            <html>
                <head>
                    <style>${css}</style>
                </head>
                <body>
                    ${html}
                    <script>${js}</script>
                </body>
            </html>
        `;
        setSrcDoc(fullDoc);
    }, [html, css, js]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            updatePreview();
        }, 800);
        return () => clearTimeout(timeout);
    }, [html, css, js, updatePreview]);

    const handleClear = () => {
        if (confirm('Clear neural buffers? This cannot be undone.')) {
            setHtml('');
            setCss('');
            setJs('');
            toast({ title: 'Buffer Cleared', description: 'Development environment reset.' });
        }
    };

    const handleDownload = () => {
        const blob = new Blob([srcDoc], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'codex_lab_export.html';
        a.click();
        toast({ title: 'Export Generated', description: 'Your code protocol has been locally archived.' });
    };

    return (
        <main className="flex flex-col h-[calc(100vh-64px)] bg-slate-950 overflow-hidden">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-slate-900/40 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-200">Neural Lab V2</h2>
                            <p className="text-[10px] text-slate-500 font-bold italic tracking-tight">Status: Isolated Sandbox</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={handleClear} className="text-slate-400 hover:text-rose-400 rounded-xl h-9 hover:bg-rose-500/10">
                        <Trash2 className="h-4 w-4 mr-2" /> Reset
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload} className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl h-9">
                        <Download className="h-4 w-4 mr-2" /> Archive
                    </Button>
                    <div className="h-4 w-[1px] bg-white/10 mx-2" />
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-9 px-6 rounded-xl shadow-lg shadow-blue-500/20">
                        <Play className="h-4 w-4 mr-2 fill-white" /> Deploy
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    {/* Editor Panel */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <div className="h-full flex flex-col bg-slate-950/20 border-r border-white/5">
                            <div className="flex items-center bg-slate-900/60 p-1 m-4 rounded-2xl border border-white/5">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setActiveTab('html')}
                                    className={cn("flex-1 h-10 rounded-xl transition-all", activeTab === 'html' ? "bg-slate-800 text-blue-400 font-bold shadow-xl" : "text-slate-500")}
                                >
                                    <Code2 className="h-4 w-4 mr-2" /> HTML
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setActiveTab('css')}
                                    className={cn("flex-1 h-10 rounded-xl transition-all", activeTab === 'css' ? "bg-slate-800 text-emerald-400 font-bold shadow-xl" : "text-slate-500")}
                                >
                                    <Layout className="h-4 w-4 mr-2" /> CSS
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setActiveTab('js')}
                                    className={cn("flex-1 h-10 rounded-xl transition-all", activeTab === 'js' ? "bg-slate-800 text-amber-400 font-bold shadow-xl" : "text-slate-500")}
                                >
                                    <Zap className="h-4 w-4 mr-2" /> JS
                                </Button>
                            </div>

                            <div className="flex-1 px-4 pb-4">
                                <div className="h-full rounded-2xl border border-white/5 bg-slate-900/60 overflow-hidden shadow-2xl relative group">
                                    <Editor
                                        height="100%"
                                        language={activeTab}
                                        value={activeTab === 'html' ? html : activeTab === 'css' ? css : js}
                                        theme="vs-dark"
                                        onChange={(val) => {
                                            if (activeTab === 'html') setHtml(val || '');
                                            else if (activeTab === 'css') setCss(val || '');
                                            else if (activeTab === 'js') setJs(val || '');
                                        }}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            fontFamily: 'JetBrains Mono, monospace',
                                            lineNumbers: 'on',
                                            padding: { top: 20 },
                                            smoothScrolling: true,
                                            cursorSmoothCaretAnimation: 'on',
                                            formatOnType: true,
                                        }}
                                    />
                                    {/* Glass Overlay on hover */}
                                    <div className="absolute top-4 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10">
                                            <Sparkles className="h-3 w-3 text-blue-400" />
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Intellisense Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle className="w-1 bg-white/5 hover:bg-blue-600/50 transition-colors" />

                    {/* Preview Panel */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <div className="h-full flex flex-col bg-slate-950 p-4">
                            <div className="flex items-center justify-between mb-4 px-4 bg-slate-900/40 py-2.5 rounded-2xl border border-white/5 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                        <Eye className="h-3.5 w-3.5" /> Neural Live Preview
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => <div key={i} className="w-2.5 h-1 bg-slate-800 rounded-full" />)}
                                </div>
                            </div>
                            
                            <div className="flex-1 rounded-3xl bg-white overflow-hidden shadow-2xl relative">
                                <iframe 
                                    srcDoc={srcDoc}
                                    className="w-full h-full border-none"
                                    title="Protocol Preview"
                                    sandbox="allow-scripts allow-modals"
                                />
                            </div>

                            {/* Analytics Overlay (Visual fluff for agentic feel) */}
                            <div className="mt-4 grid grid-cols-3 gap-4">
                                {[
                                    { label: 'DOM Nodes', value: '42' },
                                    { label: 'Script Load', value: '0.04ms' },
                                    { label: 'Hyper-CSS', value: 'Optimized' }
                                ].map((m, i) => (
                                    <div key={i} className="px-4 py-2 rounded-xl bg-slate-900/40 border border-white/5">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{m.label}</p>
                                        <p className="text-xs font-bold text-slate-400 italic font-mono">{m.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </main>
    );
}
