import "../globals.css";
import "./components/presentations/contextMenu.css";
import { I18nProvider } from './lib/i18n/I18nProvider.js';

export default function DesignLayout({ children }) {
  return (
    <I18nProvider>
        <div>
            {children}
        </div>
    </I18nProvider>
  );
}
