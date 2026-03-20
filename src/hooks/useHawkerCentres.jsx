import { useState, useEffect } from "react";
import { fetchHawkerCentres } from "../services/sgHawkerCentreService";

export const useHawkerCentres = () => {
  const [hawkerCentres, setHawkerCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getHawkerCentres = async () => {
      try {
        const data = await fetchHawkerCentres();
        setHawkerCentres(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getHawkerCentres();
  }, []);

  return { hawkerCentres, loading, error };
};
