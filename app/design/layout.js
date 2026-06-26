import "../globals.css";

export default function DesignLayout({ children }) {
  return (
    <html lang="en-US">
      <head>
        <meta name="description" content="Road Sign Factory - Create and customize road signs online. Professional design tool using template texts and symbols. Based on Hong Kong's TPDM standards." />
        <meta name="keywords" content="Road Sign Factory, road sign, traffic sign, generator, creator, custom sign, Hong Kong Standard, online tool, vector, SVG, DXF, PDF" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
