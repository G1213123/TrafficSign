"use client";

import React, { useEffect, useState } from 'react';
import CanvasEditor from './components/canvas/CanvasEditor';
import Sidebar from './components/sidebars/Sidebar';
import PromptBox from './components/presentations/promptBox';
import ContextMenu from './components/presentations/contexMenu';
import PropertyPanel from './components/presentations/property';
import { parseFont } from './lib/objects/path';

export default function DesignPage() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [canvas, setCanvas] = useState(null);

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

  useEffect(() => {
    // define a custom handler function
    // for the contextmenu event
    const handleContextMenu = (e) => {
      // prevent the right-click menu from appearing
      e.preventDefault()
    }

    // attach the event listener to 
    // the document object
    document.addEventListener("contextmenu", handleContextMenu)

    // clean up the event listener when 
    // the component unmounts
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [])

  if (!fontsLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#2f2f2f] text-white">
        <p>Loading fonts...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#2f2f2f]">
      <CanvasEditor onCanvasReady={setCanvas} />
      <Sidebar canvas={canvas} />
      <ContextMenu />
      <PromptBox />
      <PropertyPanel />
    </div>
  );
}
