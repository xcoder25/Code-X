'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Files, 
  Search, 
  GitBranch, 
  Play, 
  Terminal, 
  Settings, 
  User, 
  ChevronRight, 
  ChevronDown, 
  Code2, 
  Zap, 
  Download, 
  RefreshCw,
  FolderOpen,
  FileCode,
  FileJson,
  FlaskConical,
  Activity,
  History,
  X,
  Plus,
  Box,
  Layers,
  Cpu,
  Monitor,
  MoreHorizontal,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import Editor from '@monaco-editor/react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/app/auth-provider';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

export default function LabPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [activeFile, setActiveFile] = useState('index.html');
    const [files, setFiles] = useState({
        'index.html': '<!-- Code-X Visual Studio V2.5 -->\n<div class="vsc-container">\n  <div class="aura-glow"></div>\n  <header>\n    <h1>CODE-X LAB</h1>\n    <p>Neural Sandbox Protocol Active.</p>\n  </header>\n  <main>\n    <button id="execute">INITIALIZE SYSTEM</button>\n  </main>\n</div>',
        'styles.css': 'body {\n  background: #09090b;\n  color: #fafafa;\n  font-family: "Inter", sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n  overflow: hidden;\n}\n\n.vsc-container {\n  text-align: center;\n  padding: 5rem;\n  border: 1px solid rgba(59, 130, 246, 0.1);\n  background: rgba(9, 9, 11, 0.5);\n  backdrop-filter: blur(40px);\n  border-radius: 3rem;\n  position: relative;\n  z-index: 10;\n  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);\n}\n\n.aura-glow {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  width: 500px;\n  height: 500px;\n  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);\n  filter: blur(60px);\n  z-index: -1;\n}\n\nh1 {\n  font-weight: 900;\n  letter-spacing: -4px;\n  background: linear-gradient(to right, #3b82f6, #8b5cf6, #22c55e);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  font-size: 5rem;\n  margin-bottom: 0.5rem;\n  text-transform: uppercase;\n  font-style: italic;\n}\n\nbutton {\n  margin-top: 3rem;\n  padding: 1rem 3rem;\n  background: #3b82f6;\n  border: none;\n  color: white;\n  border-radius: 1rem;\n  font-weight: 900;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  cursor: pointer;\n  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  font-size: 0.8rem;\n}\n\nbutton:hover {\n  background: #2563eb;\n  box-shadow: 0 0 30px rgba(37, 99, 235, 0.4);\n  transform: scale(1.05);\n}',
        'script.js': '// Neural Action Logic\ndocument.getElementById("execute").addEventListener("click", () => {\n  console.log("Neural link status: OK");\n  alert("CODE-X Protocol Execution Successful.");\n});'
    });

    const runCodeInNewTab = useCallback(() => {
        const fullDoc = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Code-X Preview - ${activeFile}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
                <style>${files['styles.css']}</style>
            </head>
            <body>
                ${files['index.html']}
                <script>${files['script.js']}</script>
            </body>
            </html>
        `;
        
        const win = window.open('', '_blank');
        if (win) {
            win.document.open();
            win.document.write(fullDoc);
            win.document.close();
            toast({ title: 'Protocol Executed', description: 'Real-time project launched in separate browser branch.' });
        } else {
            toast({ variant: 'destructive', title: 'Window Blocked', description: 'Please enable pop-ups to run your code.' });
        }
    }, [files, activeFile, toast]);

    const handleFileChange = (content: string | undefined) => {
        setFiles(prev => ({
            ...prev,
            [activeFile]: content || ''
        }));
    };

    const handleClear = () => {
        if (confirm('Purge neural buffers? All unsaved logic will be lost.')) {
            setFiles({
                'index.html': '',
                'styles.css': '',
                'script.js': ''
            });
            toast({ title: 'Buffer Purged', description: 'Sectors reset to default state.' });
        }
    };

    return (
        <main className="flex h-screen bg-[#09090b] overflow-hidden text-[#a1a1aa] font-sans selection:bg-blue-500/30">
            {/* CINEMATIC ACTIVITY BAR */}
            <nav className="w-16 bg-[#09090b] border-r border-white/5 flex flex-col items-center py-6 gap-8 shrink-0 z-50">
                <Link href="/dashboard" className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl mb-2 group cursor-pointer hover:bg-blue-600/20 transition-all shadow-lg hover:shadow-blue-500/10" title="Back to Dashboard">
                    <LayoutDashboard className="h-6 w-6 text-blue-500 group-hover:rotate-12 transition-transform" />
                </Link>
                {[
                  { icon: <Files className="h-5 w-5" />, active: true, label: 'Files' },
                  { icon: <Search className="h-5 w-5" />, active: false, label: 'Search' },
                  { icon: <GitBranch className="h-5 w-5" />, active: false, label: 'Source' },
                  { icon: <Layers className="h-5 w-5" />, active: false, label: 'Modules' },
                  { icon: <Cpu className="h-5 w-5" />, active: false, label: 'Terminal' }
                ].map((item, i) => (
                    <div key={i} className={cn(
                        "relative group cursor-pointer p-2 rounded-xl transition-all",
                        item.active ? "text-white bg-white/5" : "text-[#52525b] hover:text-white hover:bg-white/5"
                    )} title={item.label}>
                        {item.icon}
                        {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[2px_0_10px_rgba(59,130,246,0.5)]" />}
                    </div>
                ))}
                <div className="mt-auto flex flex-col gap-6 pb-2">
                    <User className="h-5 w-5 text-[#52525b] hover:text-white cursor-pointer transition-colors" />
                    <Settings className="h-5 w-5 text-[#52525b] hover:text-white cursor-pointer transition-colors" />
                </div>
            </nav>

            <ResizablePanelGroup direction="horizontal">
                {/* EXPLORER PANE: HIGH END GLASSMQRPHISM */}
                <ResizablePanel defaultSize={18} minSize={12} maxSize={25}>
                    <div className="h-full bg-[#09090b] border-r border-white/5 flex flex-col group/sidebar">
                        <div className="p-5 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#52525b]">Protocol Explorer</span>
                            <div className="flex gap-2 opacity-0 group-hover/sidebar:opacity-100 transition-opacity">
                                <Plus className="h-3.5 w-3.5 text-[#52525b] cursor-pointer hover:text-white" />
                                <Download className="h-3.5 w-3.5 text-[#52525b] cursor-pointer hover:text-white" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-2">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 p-2 px-3 hover:bg-white/5 rounded-xl cursor-default transition-all group/node">
                                    <ChevronDown className="h-4 w-4 text-blue-500" />
                                    <FolderOpen className="h-4 w-4 text-amber-500" />
                                    <span className="text-xs font-black text-white/90 uppercase tracking-tighter">Code-X Workflow</span>
                                </div>
                                <div className="ml-6 space-y-1 mt-2">
                                    {[
                                        { name: 'index.html', icon: <FileCode className="h-3.5 w-3.5 text-[#ff5a22]" />, sub: 'HTML5' },
                                        { name: 'styles.css', icon: <Code2 className="h-3.5 w-3.5 text-[#30b9f1]" />, sub: 'CSS3' },
                                        { name: 'script.js', icon: <FileJson className="h-3.5 w-3.5 text-[#f7df1e]" />, sub: 'ES13' }
                                    ].map(file => (
                                        <motion.div 
                                            key={file.name}
                                            whileHover={{ x: 4 }}
                                            onClick={() => setActiveFile(file.name)}
                                            className={cn(
                                                "flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all px-4 group/item",
                                                activeFile === file.name ? "bg-blue-600/10 text-white shadow-[0_0_20px_rgba(37,99,235,0.1)] ring-1 ring-blue-500/20" : "hover:bg-white/5 text-[#71717a]"
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                {file.icon}
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold tracking-tight leading-none mb-0.5">{file.name}</span>
                                                    <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">{file.sub}</span>
                                                </div>
                                            </div>
                                            {activeFile === file.name && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]" />}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-blue-600/5 mt-auto border-t border-white/5 relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                             <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Neural Sync</span>
                                <span className="text-[9px] font-black text-blue-500/60 uppercase">Active</span>
                             </div>
                             <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                                    animate={{ width: ['40%', '98%', '40%'] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                />
                             </div>
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle className="w-[1px] bg-white/5 hover:bg-blue-600 transition-colors" />

                {/* EDITOR CANVAS: CINEMATIC WORKSPACE */}
                <ResizablePanel defaultSize={82}>
                    <div className="h-full flex flex-col bg-[#09090b]">
                        {/* PREMIUM TAB BAR */}
                        <div className="flex bg-[#09090b] border-b border-white/5 overflow-x-auto no-scrollbar h-11 px-4 items-center gap-1">
                            {Object.keys(files).map(fileName => (
                                <div 
                                    key={fileName}
                                    onClick={() => setActiveFile(fileName)}
                                    className={cn(
                                        "min-w-fit px-5 h-8 flex items-center gap-3 rounded-full cursor-pointer transition-all relative group selection:bg-none",
                                        activeFile === fileName 
                                            ? "bg-white/5 text-white ring-1 ring-white/10" 
                                            : "text-[#52525b] hover:bg-white/[0.02] hover:text-[#a1a1aa]"
                                    )}
                                >
                                    <div className="scale-75 opacity-70">
                                        {fileName === 'index.html' && <FileCode className="h-3.5 w-3.5 text-[#ff5a22]" />}
                                        {fileName === 'styles.css' && <Code2 className="h-3.5 w-3.5 text-[#30b9f1]" />}
                                        {fileName === 'script.js' && <FileJson className="h-3.5 w-3.5 text-[#f7df1e]" />}
                                    </div>
                                    <span className="text-xs font-bold tracking-tight italic">{fileName}</span>
                                    {activeFile === fileName && <X className="h-3 w-3 text-[#52525b] hover:text-rose-500 transition-colors" />}
                                </div>
                            ))}
                            
                            <div className="ml-auto flex items-center gap-3 pr-2">
                                <Button 
                                    size="sm" 
                                    onClick={runCodeInNewTab}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-black italic tracking-tighter uppercase rounded-xl h-8 px-6 shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] group transition-all active:scale-95"
                                >
                                    <Play className="h-3 w-3 mr-2 fill-white group-hover:scale-110 transition-transform" /> Execute
                                </Button>
                            </div>
                        </div>

                        {/* BREADCRUMBS & HUD */}
                        <div className="flex items-center gap-3 px-8 py-2.5 bg-[#09090b] text-[9px] text-[#52525b] border-b border-white/5">
                            <Monitor className="h-3 w-3" />
                            <span className="uppercase font-black tracking-widest opacity-40">Localhost &gt; Workspace &gt;</span>
                            <span className="text-blue-500/80 font-black italic uppercase tracking-widest">{activeFile}</span>
                            
                            <div className="ml-auto flex items-center gap-8">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {[1,2,3].map(bit => <div key={bit} className="w-0.5 h-2.5 bg-blue-500/30 rounded-full" />)}
                                    </div>
                                    <span className="font-mono text-[8px] font-black uppercase text-[#3f3f46]">Buffer Capacity: 1.2MB</span>
                                </div>
                                <div className="flex items-center gap-1.5 transition-opacity hover:opacity-100 cursor-default opacity-60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                                    <span className="font-mono text-[8px] font-black uppercase text-blue-500/80">Active Neural Stream</span>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    onClick={handleClear}
                                    className="h-6 text-[8px] font-black tracking-[0.2em] text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 px-3 uppercase rounded-lg"
                                >
                                   Purge Context
                                </Button>
                            </div>
                        </div>

                        {/* MONACO CANVAS: IMMERSIVE EDITOR */}
                        <div className="flex-1 overflow-hidden relative group/canvas">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none" />
                            <Editor
                                height="100%"
                                language={activeFile.endsWith('.html') ? 'html' : activeFile.endsWith('.css') ? 'css' : 'javascript'}
                                theme="vs-dark"
                                value={files[activeFile as keyof typeof files]}
                                onChange={handleFileChange}
                                options={{
                                    minimap: { enabled: true, side: 'right' },
                                    fontSize: 18,
                                    fontFamily: 'JetBrains Mono, monospace',
                                    lineNumbers: 'on',
                                    padding: { top: 40, bottom: 40 },
                                    scrollBeyondLastLine: false,
                                    cursorSmoothCaretAnimation: 'on',
                                    smoothScrolling: true,
                                    formatOnPaste: true,
                                    wordWrap: 'on',
                                    scrollbar: {
                                        verticalScrollbarSize: 0,
                                        horizontalScrollbarSize: 0
                                    },
                                    renderLineHighlight: 'all',
                                    lineDecorationsWidth: 30,
                                    cursorBlinking: 'smooth',
                                    cursorWidth: 3
                                }}
                            />
                        </div>

                        {/* VSC STATUS BAR: DEEP BLUE */}
                        <footer className="h-7 bg-[#007acc] text-white px-5 flex items-center justify-between text-[10px] font-bold tracking-tight shadow-[0_-10px_30px_rgba(0,0,0,0.3)] z-50">
                            <div className="flex items-center gap-6 h-full">
                                <div className="flex items-center gap-2 hover:bg-white/10 px-3 h-full cursor-pointer transition-colors bg-white/5">
                                    <GitBranch className="h-3.5 w-3.5" />
                                    <span className="tracking-tighter">main*</span>
                                </div>
                                <div className="flex items-center gap-2 hover:bg-white/10 px-3 h-full cursor-pointer transition-colors">
                                    <RefreshCw className="h-3 w-3 animate-[spin_4s_linear_infinite]" />
                                    <span className="tracking-tighter">Neural Sync</span>
                                </div>
                                <div className="flex items-center gap-2 hover:bg-white/10 px-3 h-full cursor-pointer transition-colors">
                                    <X className="h-3.5 w-3.5 border-2 border-white rounded-full p-[1px] scale-75" />
                                    <span className="tracking-tighter">0 Errors</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 h-full">
                                <div className="flex items-center gap-2 px-3 h-full">
                                    <Activity className="h-3 w-3 text-white/50" />
                                    <span>Latency: 0.12ms</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 h-full hover:bg-white/10 cursor-pointer">
                                    <span className="uppercase text-white/60 tracking-widest">{activeFile.split('.').pop()} (Neural)</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 px-4 h-full">
                                    <div className="flex gap-0.5">
                                        {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 bg-white/40 rounded-full" />)}
                                    </div>
                                    <span className="italic uppercase tracking-tighter">Health: 100.00%</span>
                                </div>
                            </div>
                        </footer>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </main>
    );
}

