import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}