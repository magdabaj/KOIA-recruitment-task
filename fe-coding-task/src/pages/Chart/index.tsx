import { useEffect, useMemo, useState } from "react"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
  } from 'chart.js';
import { Bar } from "react-chartjs-2";
import { useNavigate, useParams } from "react-router-dom"
import { fetchHouseData, type houseTypeValue } from "./fetchHouseData";
import { generateQuartersInRange } from "../../utils/generateQuartersInRange";
import { SaveSearchDataModal } from "./SaveSearchDataModal";
import Button from "@mui/material/Button";


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
  );
  

 const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Average price per sqaure meter (Norway)',
      },
    },
  };

type Params = {quarterStart:string,quarterEnd:'string',houseType:houseTypeValue }
  

const Chart = () => {
    const [data, setData] = useState([])
    const [openSaveSearchModal, setOpenSaveSearchModal] = useState(true)
    const navigate = useNavigate();
    //todo move houseType to enum
    const {quarterStart = '2009K1', quarterEnd='2024K1',houseType ='00'} = useParams<Params>()

    const handleModalClose = () => {
        setOpenSaveSearchModal(false)
    }

    const quarters = useMemo(() => 
        generateQuartersInRange(quarterStart, quarterEnd),
    [quarterStart,quarterEnd])
        console.log("quarters",quarters)


    useEffect( () => {
        const getData = async () => {
            const data = await fetchHouseData(quarters, houseType)
            setData(data)
        }
        getData()
    },[quarters, houseType])


    console.log("data use state", data)

    //todo map data in fetch function
    const chartData = useMemo(() => ({
        labels:quarters,
        datasets: [
          {  
            label: "",
            data,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          }
        ]
      }),[data]) 

        
    console.log("chart data", chartData)


   return (
    <>
        <div style={{height: "50vh", width: "50vw"}}>
        <div style={{ margin: '0 auto'}}>
            <Bar
                options={options}
                data={chartData}
                fallbackContent={<div>Loading data...</div>}
            />   
        </div>
        <Button variant='contained' style={{margin: 12}} onClick={() => navigate('/')}>Go back to search</Button>
    </div>
    <SaveSearchDataModal open={openSaveSearchModal} handleClose={handleModalClose}/>
    </>

  
   )
}

export default Chart