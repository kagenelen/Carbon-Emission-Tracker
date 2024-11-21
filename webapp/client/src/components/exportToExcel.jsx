/**
* Utilises XLSX to export the table data as an excel spreadsheet. 
* Handles both default and custom materials.
* @component Part of <ProjectDashboard/>
*/

import * as XLSX from 'xlsx';
import { fetchData } from './api/fetchData';

export async function exportToExcel({ projectId }) {
  let data = await fetchData(projectId);
  if (!data) {
    return;
  }

  const getValue = (value) => (value === undefined || value === null || value === 0 ? 0 : value);

  const ws = XLSX.utils.json_to_sheet(
    data.material.map((material, index) => ({
      'Material': material,
      'Total Recycled Material [tons]': getValue(data.total_recycled_material?.[index]),
      'Total Deposited Material [tons]': getValue(data.total_deposited_material?.[index]),
      'CO2 Emission by Transportation (landfill) [kg]': getValue(data.co2_emmission_by_trans_landfield?.[index]),
      'CO2 Emission by Transportation (recycling) [kg]': getValue(data.co2_emmission_by_trans_recyc?.[index]),
      'CO2 Emission for Production [kg]': getValue(data.co2_emm_for_production?.[index]),
      'CO2 Emission for Recycling [kg]': getValue(data.co2_emm_for_recycling?.[index]),
      'Reduction in CO2 Emission [ton]': getValue(data.reduction_co2_tons?.[index]),
      'Contribution': getValue(data.contribution?.[index]),
      'Reduction in CO2 Ratio [ton/ton]': getValue(data.reduction_ratio?.[index]),
      'Recycle Percentage': getValue(data.recycled_percent?.[index]),
    }))
  );

  const totalsRow = {
    Material: 'Totals',
    'Total Recycled Material': getValue(data.total_co2_reduction),
    'Total Deposited Material': getValue(data.recyc_total),
    'CO2 Emission Landfill': getValue(data.trans_total),
    'CO2 Emission Recycling': getValue(data.prod_total),
  };

  const wsTotals = XLSX.utils.json_to_sheet([totalsRow]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.utils.book_append_sheet(wb, wsTotals, 'CO2 Emission Totals');

  XLSX.writeFile(wb, 'table_data.xlsx');
};
