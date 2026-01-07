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
// v1.2.0 New Docs
import { Slices } from '@/pages/docs/Slices';
import { Computed } from '@/pages/docs/Computed';
import { Federation } from '@/pages/docs/Federation';
import { Effects } from '@/pages/docs/Effects';
import { Validation } from '@/pages/docs/Validation';
import { Testing } from '@/pages/docs/Testing';
// API Pages
import { ApiOverview } from '@/pages/api/ApiOverview';
import { CreateStore } from '@/pages/api/CreateStore';
import { UseStore } from '@/pages/api/UseStore';
import { Batch } from '@/pages/api/Batch';
import { StoreMethods } from '@/pages/api/StoreMethods';
import { Persist } from '@/pages/api/Persist';
import { Devtools } from '@/pages/api/Devtools';
import { History } from '@/pages/api/History';
import { Sync } from '@/pages/api/Sync';
// v1.2.0 New API Pages
import { UseShallow } from '@/pages/api/UseShallow';
import { UseAction } from '@/pages/api/UseAction';
import { UseStoreSelector } from '@/pages/api/UseStoreSelector';
import { UseSetState } from '@/pages/api/UseSetState';
import { Logger } from '@/pages/api/Logger';
import { EffectsApi } from '@/pages/api/EffectsApi';
import { ValidateApi } from '@/pages/api/ValidateApi';
// v1.2.0 Pattern API Pages
import { CreateSlice } from '@/pages/api/CreateSlice';
import { ComputedApi } from '@/pages/api/ComputedApi';
import { CreateFederation } from '@/pages/api/CreateFederation';
// Other Pages
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
            {/* v1.2.0 Patterns */}
            <Route path="slices" element={<Slices />} />
            <Route path="computed" element={<Computed />} />
            <Route path="federation" element={<Federation />} />
            {/* Advanced */}
            <Route path="plugins" element={<PluginsDoc />} />
            <Route path="effects" element={<Effects />} />
            <Route path="validation" element={<Validation />} />
            <Route path="testing" element={<Testing />} />
            <Route path="typescript" element={<TypeScript />} />
            <Route path="best-practices" element={<BestPractices />} />
          </Route>

          <Route path="/api" element={<DocsLayout type="api" />}>
            <Route index element={<ApiOverview />} />
            <Route path="create-store" element={<CreateStore />} />
            <Route path="use-store" element={<UseStore />} />
            <Route path="batch" element={<Batch />} />
            {/* v1.2.0 React Hooks */}
            <Route path="use-shallow" element={<UseShallow />} />
            <Route path="use-action" element={<UseAction />} />
            <Route path="use-store-selector" element={<UseStoreSelector />} />
            <Route path="use-set-state" element={<UseSetState />} />
            {/* v1.2.0 Patterns API */}
            <Route path="create-slice" element={<CreateSlice />} />
            <Route path="computed" element={<ComputedApi />} />
            <Route path="create-federation" element={<CreateFederation />} />
            {/* Store Methods */}
            <Route path="get-state" element={<StoreMethods />} />
            <Route path="set-state" element={<StoreMethods />} />
            <Route path="subscribe" element={<StoreMethods />} />
            <Route path="merge" element={<StoreMethods />} />
            <Route path="reset" element={<StoreMethods />} />
            {/* Plugins */}
            <Route path="persist" element={<Persist />} />
            <Route path="devtools" element={<Devtools />} />
            <Route path="history" element={<History />} />
            <Route path="sync" element={<Sync />} />
            {/* v1.2.0 New Plugins */}
            <Route path="logger" element={<Logger />} />
            <Route path="effects" element={<EffectsApi />} />
            <Route path="validate" element={<ValidateApi />} />
          </Route>

          {/* Catch-all 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
