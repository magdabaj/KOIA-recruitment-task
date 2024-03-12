import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { Button, FormGroup } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { generateQuartersInRange } from '../../utils/generateQuartersInRange';
import styled from '@emotion/styled';
import { houseTypeValue } from '../Chart/fetchHouseData';

export const houseTypes =  [
    {
     label: "Boliger i alt",
     value: '00'
   },
   {
     label: "Småhus",
     value: '02'
   },
 {
     label: 'Blokkleiligheter',
     value: '03'
   }
 ]
 
type FormData = {
    quarterStart:string
    quarterEnd:string
    houseTypes: houseTypeValue
  }

const SubmitButton = styled(Button)`
    margin-top: 2em;
  `

const StyledForm = styled(FormGroup)`
    display: flex;
    flex-direction: column;
    gap: 1em;
`

const ChartForm = () => {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm<FormData>()
    
    const onSubmit: SubmitHandler<FormData> =async (data) => {
      navigate(`/chart/quarterStart/${data.quarterStart}/quarterEnd/${data.quarterEnd}/houseType/${data.houseTypes}`)
    }

    const quarterValues =useMemo(() =>generateQuartersInRange("2009K1","2023K4"),[]) 


    return (
        <form onSubmit={handleSubmit(onSubmit)}>
        <StyledForm>
      
        {/* todo validation for quarter start and quarter end  */}
        {/* todo add validation messages */}
        <InputLabel id="quarter-start">Quarter start</InputLabel>
          <Select 
            defaultValue="2009K1"
            labelId='quarter-start'
            {...register("quarterStart",{required: true})} 
          >
            {quarterValues.map((quarter) =>
              <MenuItem key={quarter} value={quarter}>{quarter}</MenuItem>
            )}
          </Select>
  
  
  
        <InputLabel id="quarter-end">Quarter end</InputLabel>
        <Select 
            defaultValue="2023K4"
            labelId='quarter-end'
            {...register("quarterEnd",{required:true})} 
        >
            {quarterValues.map((quarter) =>
            <MenuItem key={quarter} value={quarter}>{quarter}</MenuItem>
            )}
        </Select>
  
    
     {/* todo multiple input */}
        <InputLabel id="house-types">House types</InputLabel>
        <Select
            defaultValue={houseTypes[0].value}
            labelId="house-types"
            id="house-types"
            {...register("houseTypes",{required:true})}
        >
            {houseTypes.map((type) => 
            <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
            )}
        </Select>        
      
        <SubmitButton 
            variant='contained' 
            type='submit'
        >
            Show chart
        </SubmitButton>
    
      </StyledForm>
      </form>
    )
}

export {ChartForm}