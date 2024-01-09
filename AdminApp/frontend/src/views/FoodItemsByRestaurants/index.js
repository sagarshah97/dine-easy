import { Grid, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom"; 
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; 

const TopFoodItems = () => {
  return (
    <Grid container spacing={2}>
      <Grid
        item
        xs={12}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <Button
          component={Link} 
          to="/home" 
          variant="contained"
          align="center"
          color="primary"
          style={{
            margin: "20px",
            alignSelf: "flex-start", // Align the button to the left
          }}
          startIcon={<ArrowBackIcon />}
        >        back     
        </Button>
        <iframe
          title="Food Order Report"
          width="100%"
          height="550"
          src="https://lookerstudio.google.com/embed/reporting/6ee07fde-0361-45be-b8aa-3bd6355a4ae2/page/lT3jD"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
        ></iframe>
      </Grid>
    </Grid>
  );
};

export default TopFoodItems;
