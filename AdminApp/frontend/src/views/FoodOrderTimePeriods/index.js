import { Grid } from "@mui/material";

const FoodOrderTimePeriods = () => {
  const iframe_src = process.env.REACT_APP_FOOD_ORDER_PERIODS_IFRAME_URL;

  return (
    <>
      <Grid container spacing={2}>
        <Grid
          item
          xs={12}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <iframe
            width="92%"
            height="1200"
            src={iframe_src}
            frameborder="0"
            style={{ border: 0, boxShadow: "none" }}
            allowfullscreen
          ></iframe>
        </Grid>
      </Grid>
    </>
  );
};

export default FoodOrderTimePeriods;
