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
import { fetchHouseData } from "./fetchHouseData";
import { generateQuartersInRange } from "../../utils/generateQuartersInRange";
import { SaveSearchDataModal } from "./SaveSearchDataModal";
import Button from "@mui/material/Button";
import styled from '@emotion/styled';
import {type Params } from "./types";

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


const Container = styled.div`
    width: 50vw;
    height: 50vh;
`
  
const ChartWrapper = styled.div`
    margin: 0 auto
`

const Chart = () => {
    const [data, setData] = useState<Array<number>>([])
    const [openSaveSearchModal, setOpenSaveSearchModal] = useState(true)
    const navigate = useNavigate();
    //todo move houseType to enum
    const {
        quarterStart = '2009K1', 
        quarterEnd='2023K4',
        houseType ='00'
    } = useParams<Params>()

    const handleModalClose = () => {
        setOpenSaveSearchModal(false)
    }

    const quarters = useMemo(() => 
        generateQuartersInRange(quarterStart, quarterEnd),
    [quarterStart,quarterEnd])

    useEffect( () => {
        const getData = async () => {
            const data = await fetchHouseData(quarters, houseType)
            setData(data ?? [])
        }
        getData()
    },[quarters, houseType])

    //todo might map data in fetch function to avoid additional rerender
    const chartData = useMemo(() => ({
        labels:quarters,
        datasets: [
          {  
            data,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          }
        ]
      }),[data]) 

//todo return loader if no data

   return (
    <>
        <Container>
            <ChartWrapper>
                <Bar
                    options={options}
                    data={chartData}
                    fallbackContent={<div>Loading data...</div>}
                />   
            </ChartWrapper>
        <Button variant='contained' style={{margin: 12}} onClick={() => navigate('/')}>Go back to search</Button>
        </Container>
        <SaveSearchDataModal open={openSaveSearchModal} handleClose={handleModalClose}/>
    </>

  
   )
}

export default Chart