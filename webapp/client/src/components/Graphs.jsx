/**
* @file Graph components for visualizing CO2 reduction and emission data.
* Provides bar and pie chart components to display CO2 reduction by material, reduction ratio, contribution percentages, and total emissions.
* Each component fetches data from the backend based on the provided project ID.
* 
* @component <ReductionBarChart /> - Bar chart for CO2 reduction per material
* @component <RatioBarChart /> - Bar chart for CO2 reduction ratio
* @component <ContributionPieChart /> - Pie chart for contribution percentage of CO2 reduction per material
* @component <EmmissionPieChart /> - Pie chart for total CO2 emission
*
* @param {string} projectID - Project ID for fetching data
* @param {int} width - Width of the chart (optional)
* @param {int} height - Height of the chart (optional)
*/

import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, PieChart } from '@mui/x-charts';
import '../theme.css';  // Import the CSS file

//colormap
const colorMap = {
    'Concrete': '#96ED89',
    'Brick': '#DBA507',
    'Black Iron': '#8EC7D2',
    'PVC': '#0D6986',
    'Copper': '#E74C3C',
    'Mixed Metal Scrap': '#673AB7',
    'Asbestos': '#1778b0',
    'Asbestos Soil': '#799AE0',
    'Mixed Waste': '#4C1B1B',
    'VENM': '#82b31b',
    'Recycling': '#96ED89',
    'Transportation': '#DBA507',
    'Production': '#8EC7D2'
}

const labels = ['Concrete', 'Brick', 'Black Iron', 'PVC', 'Copper', 'Mixed Metal Scrap', 'Asbestos', 'Asbestos Soil', 'Mixed Waste', 'VENM'];
const labelTypes = ['Recycling', 'Transportation', 'Production']
let colorsMapped = labels.map(l=> colorMap[l]);
let colorsMappedTypes = labelTypes.map(l=> colorMap[l]);


// Settings for bar graphs
const barSetting = {
    grid: { vertical: true },
    borderRadius: 10,
    margin: { left: 150 },
    layout: 'horizontal',
    colors: ['#8EC7D2'],
    skipAnimation: true
  };

// settings for pie charts
const pieSetting = {
    margin: { right: 200 },
    skipAnimation: true,
};

// Formatter for bar chart values
const valueFormatterBarTon = (value) => `${value} Ton`;
const valueFormatterBarTonTon = (value) => `${value} Ton/Ton`;
// Formatter for pie chart values
const valueFormatterPiePercent = (value) => `${value.value}%`;
const valueFormatterPieTon = (value) => `${value.value} Ton`;

// Helper function to ensure we get a valid value or a default (0) if undefined
const getValue = (array, index) => (array?.[index] === undefined || array?.[index] === null ? 0 : array[index]);

/** 
* Generates C02 reduction chart
* @param {string} projectID - Project ID
* @param {int} width - element width (optional)
* @param {int} height - element height (optional)
* @returns {Component} - Graph Component
*/
export const ReductionBarChart = React.forwardRef(({ projectID, width = 500, height = 400, hiddenElements=null }, ref) => {

    const [rawMaterials, setRawMaterials] = useState([]);
    const [rawValues, setRawValues] = useState([]);
    const [graphMaterials, setGraphMaterials] = useState([]);
    const [graphValues, setGraphValues] = useState([]);

    //retrieve graph data from backend
    useEffect(() => {

        async function getData() {
            try {
                
                const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/graphs/reductionChart`, {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({projectID}),
                });
        
                const result = await response.json();
        
                if (response.ok) {
                    const materialData = result.materials || [];
                    const valueData = materialData.map((_, i) => getValue(result.values, i));


                    setRawValues(valueData);
                    setGraphValues(valueData.slice())
                    setRawMaterials(materialData);
                    setGraphMaterials(materialData.slice())
                } else {
                    console.error(result.message);
                    alert(result.message);
                }
            } catch (err) {
                console.error('Error:', err);
            }        
        }

        getData();
    
    }, [])

    

    //Interactive graphs
    useMemo(() => {

        //Reset graph data to default
        let newGraphMaterials = rawMaterials.slice();
        let newGraphValues = rawValues.slice()
                
        //remove elements from graphData that are present in hiddenElements
        for (let element of hiddenElements) {
            for (let data of newGraphMaterials) {
                 if (data == element) {
                    let index = newGraphMaterials.indexOf(data);
                      newGraphMaterials.splice(index, 1);
                     newGraphValues.splice(index, 1);
                }
            }
        }

        setGraphMaterials(newGraphMaterials);
        setGraphValues(newGraphValues);

    }, [hiddenElements])

    
    return (
        <div ref={ref} className="chart-container">
            <b>CO2 Reduction per Material</b>
            <BarChart
                yAxis={[{ scaleType: 'band', data: graphMaterials}]}
                xAxis = {[{label: 'Reduction in CO2 Emissions [Tons]', min:0}]}
                series={[{
                    data: graphValues, 
                    valueFormatter: valueFormatterBarTon,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { color: 'gray'}
                }]}  
                width={width}
                height={height}
                {...barSetting}
            />
        </div>
    )
});

// RatioBarChart Component
export const RatioBarChart = React.forwardRef(({ projectID, width = 500, height = 400, hiddenElements = []}, ref) => {

    const [rawMaterials, setRawMaterials] = useState([]);
    const [rawValues, setRawValues] = useState([]);
    const [graphMaterials, setGraphMaterials] = useState([]);
    const [graphValues, setGraphValues] = useState([]);

    //retrieve graph data from backend
    useEffect(() => {

        async function getData() {
            try {
                
                const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/graphs/ratioChart`, {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({projectID}),
                });
        
                const result = await response.json();
        
                if (response.ok) {
                    const materialData = result.materials || [];
                    const valueData = materialData.map((_, i) => getValue(result.values, i));

                    setRawValues(valueData);
                    setGraphValues(valueData.slice())
                    setRawMaterials(materialData);
                    setGraphMaterials(materialData.slice())
                } else {
                    console.error(result.message);
                    alert(result.message);
                }
            } catch (err) {
                console.error('Error:', err);
            }        
        }

        getData();

    }, [])

    //Interactive graphs
    useMemo(() => {

        //Reset graph data to default
        let newGraphMaterials = rawMaterials.slice();
        let newGraphValues = rawValues.slice()

        //remove elements from graphData that are present in hiddenElements
        for (let element of hiddenElements) {
            for (let data of newGraphMaterials) {
                if (data == element) {
                    let index = newGraphMaterials.indexOf(data);
                    newGraphMaterials.splice(index, 1);
                    newGraphValues.splice(index, 1);
                }
            }
        }

        setGraphMaterials(newGraphMaterials);
        setGraphValues(newGraphValues);

    }, [hiddenElements])
    
    return (
        <div ref={ref} className="chart-container">
            <b>CO2 Reduction Ratio</b>
            <BarChart
                yAxis={[{ scaleType: 'band', data: graphMaterials, min:0 }]}
                xAxis={[{ label: 'Reduction in CO2 Ratio (Ton/Ton)', min:0}]}
                series={[{ 
                    data: graphValues,
                    valueFormatter: valueFormatterBarTonTon,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { color: 'gray'}
                }]}
                width={width}
                height={height}            
                {...barSetting}
            />
        </div>
    )
});

/** 
* Generates contribution graph for all materials
* @param {string} projectID - Project ID
* @param {int} width - element width (optional)
* @param {int} height - element height (optional)
* @returns {Component} - Graph Component
*/
export const ContributionPieChart = React.forwardRef(({ projectID, width = 500, height = 450, hiddenElements = []}, ref) => {

    const [rawData, setRawData] = useState([]);
    const [graphData, setGraphData] = useState([]);

    //retrieve graph data from backend
    useEffect(() => {

        async function getData() {
            try {
                
                const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/graphs/reductionPie`, {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ projectID}),
                });
        
                const result = await response.json();
        
                if (response.ok) {
                    const data = result.data;

                    setRawData(data);
                    setGraphData(data.slice());
                } else {
                    console.error(result.message);
                    alert(result.message);
                }
            } catch (err) {
                console.error('Error:', err);
            }        
        }

        getData();

        //map graph colors to data
        colorsMapped = labels.map(l=> colorMap[l]);

    }, [])

    //Interactive graphs
    useMemo(() => {

        //Reset graph data to default
        let newGraphData = rawData.slice();


        //remove elements from graphData that are present in hiddenElements
        for (let element of hiddenElements) {
            for (let data of newGraphData) {
                if (data.label == element) {
                    let index = newGraphData.indexOf(data);
                    newGraphData.splice(index, 1);
                }
            }
        }

        //update color mapping so each material has consistent color
        let newLabels = [];
        for (let data of newGraphData) {
            newLabels.push(data.label);
        }
        colorsMapped = newLabels.map(l=> colorMap[l])

        setGraphData(newGraphData);

    }, [hiddenElements])

    //generate chart
    return (
        <div ref={ref} className="chart-container">
            <b>Reduction Contribution in CO2 Emmision %</b>
            <PieChart
                series={[{ 
                    data: graphData,
                    valueFormatter: valueFormatterPiePercent,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 0, additionalRadius: -20, color: 'gray'},
                    label: {
                        show: true,
                        position: 'outside',
                        formatter: '{b}: {d}%',
                        fontSize: 8,
                      },
                      labelLine: { show: true, length: 10 },
                }]}
                colors = {colorsMapped}
                width={width}
                height={height}
                {...pieSetting}
            />
        </div>
    )
});

/** 
* Generates contribution graph for all materials
* @param {string} projectID - Project ID
* @param {int} width - element width (optional)
* @param {int} height - element height (optional)
* @returns {Component} - Graph Component
*/
export const EmmissionPieChart = React.forwardRef(({ projectID, width = 500, height = 450, hiddenElements = []}, ref) => {

    const [rawData, setRawData] = useState([]);
    const [graphData, setGraphData] = useState([]);

    //retrieve graph data from backend
    useEffect(() => {

        async function getData() {
            try {
                
                const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/graphs/emissionPie`, {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ projectID}),
                });
        
                const result = await response.json();
        
                if (response.ok) {
                    const chartData = result.data || [];

                    setRawData(chartData);
                    setGraphData(chartData.slice());
                } else {
                    console.error(result.message);
                    alert(result.message);
                }
            } catch (err) {
                console.error('Error:', err);
            }        
        }

        getData();

        //map graph colors to data
        colorsMappedTypes = labelTypes.map(l=> colorMap[l]);

    }, [])

    //Interactive graphs
    useMemo(() => {

        //Reset graph data to default
        let newGraphData = rawData.slice();

        //remove elements from graphData that are present in hiddenElements
        for (let element of hiddenElements) {
            for (let data of newGraphData) {
                if (data.label == element) {
                    let index = newGraphData.indexOf(data);
                    newGraphData.splice(index, 1);
                }
            }
        }

        //update color mapping so each material has consistent color
        let newLabels = [];
        for (let data of newGraphData) {
            newLabels.push(data.label);
        }
        colorsMapped = newLabels.map(l=> colorMap[l])

        setGraphData(newGraphData);

    }, [hiddenElements])

    //generate chart
    return (
        <div ref={ref} className="chart-container">
            <b>Total CO2 Emission (Ton)</b>
            <PieChart
                series={[{ 
                    data: graphData, 
                    valueFormatter: valueFormatterPieTon, 
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 0, additionalRadius: -20, color: 'gray'}}]}
                colors = {colorsMapped}
                width={width}
                height={height}
                {...pieSetting}
            />
        </div>
    )
});

/** 
* Generates contribution graph for all materials
* @param {string} projectID - Project ID
* @returns {Array} - Array of all material componenets for given project
*/
export function getMaterials (projectID) {
    
    const [materials, setMaterials] = useState([]);

    //retrieve graph data from backend
    useEffect(() => {

        async function getData() {
            try {
                        
                const response = await fetch(`${import.meta.env.REACT_APP_BASE_URL}/graphs/getMaterials`, {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({projectID}),
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    setMaterials(result.data);
                } else {
                    console.error(result.message);
                    alert(result.message);
                }
            } catch (err) {
                console.error('Error:', err);
            }
        }

        getData();
        
    }, [])

    return materials;

}
