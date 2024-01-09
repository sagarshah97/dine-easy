import React from "react";
import { Card, Grid } from "@mui/material";

const DetailsCard = ({ data }) => {
  return (
    <Card>
      <Grid container alignItems="center" style={{ padding: "10px" }}>
        <Grid item xs={12}>
          <p>
            <b>Dish name:</b>
            {data?.M.menu_item_name?.S}
          </p>
        </Grid>

        <Grid item xs={12}>
          <p>
            <b>Category:</b>
            {data?.M.menu_category?.S}
          </p>
        </Grid>
        <Grid item xs={12}>
          <p>
            <b>Price:</b>
            {data?.M.menu_price?.S}
          </p>
        </Grid>
        <Grid item xs={12}>
          <p>
            <b>Ingredients:</b>
            {data?.M.menu_ingredients?.S}
          </p>
        </Grid>
        <Grid item xs={12}>
          <p>
            <b>Offers:</b>
            {data?.M.menu_offer?.S}
          </p>
        </Grid>
      </Grid>
    </Card>
  );
};

export default DetailsCard;
