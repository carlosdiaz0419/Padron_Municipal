import { useState, useEffect } from 'react';

/**
 * useFetch — Hook genérico para llamadas GET a la API.
 *
 * @param {Function} fetchFn — Función del servicio api.js a ejecutar
 * @param {Array}    deps    — Dependencias que vuelven a lanzar la petición
 *
 * @returns {{ data, loading, error, refetch }}
 *
 * Uso:
 *   const { data, loading, error } = useFetch(getBeneficiarios, []);
 */
function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, deps);

  return { data, loading, error, refetch: fetchData };
}

export default useFetch;
