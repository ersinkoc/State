import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { DocsLayout } from '@/components/layout/DocsLayout';
import { Home } from '@/pages/Home';
import { Introduction } from '@/pages/docs/Introduction';
import { Installation } from '@/pages/docs/Installation';
import { QuickStart } from '@/pages/docs/QuickStart';
import { CreatingStores } from '@/pages/docs/CreatingStores';
import { Actions } from '@/pages/docs/Actions';
import { Selectors } from '@/pages/docs/Selectors';
import { ReactIntegration } from '@/pages/docs/ReactIntegration';
import { PluginsDoc } from '@/pages/docs/PluginsDoc';
import { TypeScript } from '@/pages/docs/TypeScript';
import { BestPractices } from '@/pages/docs/BestPractices';
import { ApiOverview } from '@/pages/api/ApiOverview';
import { CreateStore } from '@/pages/api/CreateStore';
import { UseStore } from '@/pages/api/UseStore';
import { Batch } from '@/pages/api/Batch';
import { StoreMethods } from '@/pages/api/StoreMethods';
import { Persist } from '@/pages/api/Persist';
import { Devtools } from '@/pages/api/Devtools';
import { History } from '@/pages/api/History';
import { Sync } from '@/pages/api/Sync';
import { Examples } from '@/pages/Examples';
import { Plugins } from '@/pages/Plugins';
import { NotFound } from '@/pages/NotFound';
import { ThemeProvider } from '@/hooks/useTheme';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="examples" element={<Examples />} />
            <Route path="plugins" element={<Plugins />} />
          </Route>

          <Route path="/docs" element={<DocsLayout type="docs" />}>
            <Route index element={<Introduction />} />
            <Route path="introduction" element={<Introduction />} />
            <Route path="installation" element={<Installation />} />
            <Route path="quick-start" element={<QuickStart />} />
            <Route path="creating-stores" element={<CreatingStores />} />
            <Route path="actions" element={<Actions />} />
            <Route path="selectors" element={<Selectors />} />
            <Route path="react-integration" element={<ReactIntegration />} />
            <Route path="plugins" element={<PluginsDoc />} />
            <Route path="typescript" element={<TypeScript />} />
            <Route path="best-practices" element={<BestPractices />} />
          </Route>

          <Route path="/api" element={<DocsLayout type="api" />}>
            <Route index element={<ApiOverview />} />
            <Route path="create-store" element={<CreateStore />} />
            <Route path="use-store" element={<UseStore />} />
            <Route path="batch" element={<Batch />} />
            <Route path="get-state" element={<StoreMethods />} />
            <Route path="set-state" element={<StoreMethods />} />
            <Route path="subscribe" element={<StoreMethods />} />
            <Route path="merge" element={<StoreMethods />} />
            <Route path="reset" element={<StoreMethods />} />
            <Route path="persist" element={<Persist />} />
            <Route path="devtools" element={<Devtools />} />
            <Route path="history" element={<History />} />
            <Route path="sync" element={<Sync />} />
          </Route>

          {/* Catch-all 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
