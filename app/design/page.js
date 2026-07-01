"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from './components/sidebars/Sidebar';
import CanvasEditor from './components/canvas/CanvasEditor';
import PromptBox from './lib/utils/promptBox';
import ContextMenu from './lib/utils/contexMenu';
import { parseFont } from './lib/objects/path';

export default function DesignPage() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    parseFont()
      .then(() => {
        setFontsLoaded(true);
      })
      .catch(err => {
        console.error("Failed to load fonts on page init:", err);
        setFontsLoaded(true); // Load UI anyway even if fonts fail
      });
  }, []);

  if (!fontsLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#2f2f2f] text-white">
        <p>Loading fonts...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#2f2f2f]">
      <CanvasEditor />
      <Sidebar />
      <ContextMenu />
      <PromptBox />
    </div>
  );
}
