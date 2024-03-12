import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { useParams } from "react-router-dom";
import {type Params } from "./types";
import styled from "@emotion/styled";

 const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  }; 

  type SaveSearchDataModalProps = {
    open:boolean
    handleClose: () =>void
}

const ButtonsContainer = styled(Typography)`
    margin-top: 2em;
    display: flex;
    gap: 2em
`

const SaveSearchDataModal = ({open, handleClose}:SaveSearchDataModalProps) =>{
    const {
        quarterStart = '2009K1', 
        quarterEnd='2024K1',
        houseType ='00'
    } = useParams<Params>()


    const handleSaveSearchParams = () =>{
        localStorage.setItem(`Search ${new Date()}`, `quarterStart ${quarterStart} quarterEnd ${quarterEnd} houseType ${houseType}`);
        handleClose()
    }
  
    return (
     <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Do you want to save your search history?
            </Typography>
            <ButtonsContainer id="modal-modal-description" >
             <Button variant="outlined" onClick={handleSaveSearchParams}>Yes</Button>
             <Button variant="outlined" onClick={handleClose}>No</Button>
            </ButtonsContainer>
          </Box>
        </Modal>
    );
}

export {SaveSearchDataModal}