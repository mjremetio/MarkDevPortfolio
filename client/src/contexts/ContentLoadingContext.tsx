import { Loader2 } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type ContentLoadingContextValue = {
  beginLoading: () => void;
  endLoading: () => void;
  trackLoading: <T>(operation: () => Promise<T>) => Promise<T>;
};

const noop = async <T,>(operation?: () => Promise<T>) =>
  operation ? operation() : (undefined as unknown as T);

const defaultValue: ContentLoadingContextValue = {
  beginLoading: () => {},
  endLoading: () => {},
  trackLoading: noop,
};

const ContentLoadingContext = createContext<ContentLoadingContextValue>(
  defaultValue,
);

export const ContentLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [pendingRequests, setPendingRequests] = useState(0);

  const beginLoading = useCallback(() => {
    setPendingRequests((count) => count + 1);
  }, []);

  const endLoading = useCallback(() => {
    setPendingRequests((count) => Math.max(0, count - 1));
  }, []);

  const trackLoading = useCallback(
    async <T,>(operation: () => Promise<T>) => {
      beginLoading();
      try {
        return await operation();
      } finally {
        endLoading();
      }
    },
    [beginLoading, endLoading],
  );

  const contextValue = useMemo(
    () => ({
      beginLoading,
      endLoading,
      trackLoading,
    }),
    [beginLoading, endLoading, trackLoading],
  );

  const isLoading = pendingRequests > 0;

  return (
    <ContentLoadingContext.Provider value={contextValue}>
      {children}
      <LoadingOverlay visible={isLoading} />
    </ContentLoadingContext.Provider>
  );
};

export const useContentLoading = () => useContext(ContentLoadingContext);

const LoadingOverlay = ({ visible }: { visible: boolean }) => (
  <div
    className={cn(
      "fixed inset-0 z-[60] flex items-center justify-center bg-white/85 dark:bg-gray-950/80 backdrop-blur-sm transition-opacity duration-300",
      visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
    )}
    aria-hidden={!visible}
  >
    <div className="flex flex-col items-center gap-3 text-gray-700 dark:text-gray-200">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm font-medium">Loading content…</p>
    </div>
  </div>
);
