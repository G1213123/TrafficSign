"use client";

import React from 'react';
import Sidebar from './components/sidebars/Sidebar';
import CanvasEditor from './components/canvas/CanvasEditor';

export default function DesignPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#2f2f2f]">
      <Sidebar />
      <CanvasEditor />
    </div>
  );
}
