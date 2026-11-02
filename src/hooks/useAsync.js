import { useState, useEffect } from "react";

// Runs an async function on mount (and when `deps` change), tracking
// loading/data/error. The `active` guard prevents setting state after unmount
// or after a superseded call (e.g. rapid id changes on the detail page).
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    // Intentional: reset to loading whenever deps change (e.g. the job id on the
    // detail page) so stale data isn't shown during the next fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ data: null, loading: true, error: null });
    fn().then(
      (data) => {
        if (active) setState({ data, loading: false, error: null });
      },
      (error) => {
        if (active) setState({ data: null, loading: false, error });
      },
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
