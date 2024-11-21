
/**
* @file Get request used by TableVisualition.jsx and exportToExcel.jsx. 
* View information, charts and data table for a specific project. 
*/

export const fetchData = async (projectId) => {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/table-data/table_data`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({projectId}),
        });

    const result = await response.json();
    return result;
    
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

