import React, {useState, useEffect} from 'react'
import {Box, Card, Grid, CardContent, Typography, CardActions, Button, CardMedia, CardHeader, 
  Stack, IconButton,Dialog, DialogTitle, DialogContent, 
  DialogActions,DialogContentText,Accordion, AccordionSummary, AccordionDetails, CircularProgress,} from '@mui/material';
  import { useLocation } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteForeverSharpIcon from '@mui/icons-material/DeleteForeverSharp';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from 'axios';
const MenuComponent = () => {
let [typeOfMenu, setTypeOfMenu] = useState([]);
let location = useLocation();
let reservation_id = '';
//let user_name = '';
let restaurant_name = '';
if(location && location.state && location.state.data){
   reservation_id = location.state.data;
}
if(location && location.state && location.state.restaurantName){
  restaurant_name = location.state.restaurantName;
}


 const userInfo = JSON.parse(window.localStorage.getItem("user"));
 let user_name =  userInfo.displayName

const [isLoading, setIsLoading] = useState(true);
const [orderOpen, setOrderOpen] = useState(false);
let [cart, setCart] = useState([]);
let navigate = useNavigate();
const { id } = useParams();
 useEffect(()=>{
 

   let fetchRestaurantData = async ()=>{
    try{
      const apiUrl = 'https://i6morut7a6.execute-api.us-east-1.amazonaws.com/restaurantdetails/restaurants';
      setIsLoading(true)
      const response = await fetch(apiUrl);
      const data = await response.json();
      const restaurantData = JSON.parse(data.body.replace(/"(\s+)(\w+)(?=")/g, '"$2'));
      const selectedRestaurant = restaurantData.find((item) => item.restaurant_id.S === id);
      if(selectedRestaurant){
       
        setTypeOfMenu([...selectedRestaurant.restaurant_food_menu.L])
        setIsLoading(false)

      }
      else{
        setIsLoading(false)
        return <div>Incorrect Details</div>
        
      }
    }
    catch(err){
      console.error('Error fetching data: ', err);
      setIsLoading(false)
    }
   
   }
   if(location && location.state && location.state.orders){
     setCart([])       
     location.state.orders.forEach(element => {  
     setCart(prevData =>[...prevData,element]);
    });  
   }
      
    setIsLoading(true)
    const formattedReqObj1 = {
      body: JSON.stringify({
          order_id: "124555",
          user_id: userInfo.uid,
          order_items: cart,
          restaurantId : id,
          reservation_id: location.state.data
        }),
    };
    if(!location.state.fromBackClick)
     axios.post("https://4cahqjtcg2.execute-api.us-east-1.amazonaws.com/dev",JSON.stringify(formattedReqObj1))
     .then((response) => {
      if(response.data.body)
      {
          let orderReceived = JSON.parse(response.data.body);
        
          if(response.data.body !== '"No order found."')
          {
            setCart([])
            orderReceived.forEach(element => {
                
                setCart(prevData =>[...prevData,element]);
               
              });  
              setIsLoading(false)
              
          }
          else{
            setIsLoading(false)
          }
      }
      else{
        setIsLoading(false)
      
      }
     })
     .catch((error) => {
       
       setIsLoading(false)
     }) 

      fetchRestaurantData();

 },[])

 let viewOrders = ()=>{
  setOrderOpen(true)
}
 let editMenu = ()=>{
  setOrderOpen(true)
}
 


 let menTypeClicked = (menuType)=>{
  
    navigate("/itemMenu", { state: { restaurantId: id, data: menuType, reservation_id : reservation_id, restaurant_name: restaurant_name, cart:cart} });
 }
  
 return (
    <>
     {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <Grid container spacing={5}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} my={2}>
                      <Stack sx={{border:'1px solid #ffffff', color:'#000000'}} spacing={35} direction='row'>
                      <Typography gutterBottom variant='h5' component='div'>Our Menu</Typography>
                      <Button size='medium' variant='outlined' startIcon={<ArrowBackIcon/>} onClick={()=>navigate("/mybookings")}>Menu</Button>
                      <Button size='medium' variant='contained' color='error'startIcon={<ShoppingCartIcon/>} onClick={()=>viewOrders()}>{cart.length}</Button>
                   </Stack>
                  </Grid>
                  {typeOfMenu.map((menuType)=>(
                         <Grid key={menuType['M']?.menu_category?.S} item  xs={10} sm={5} md={5} lg={5} xl={5} >
                         <Box bgcolor='#ffffff' p={1}>
                         <Card variant="outlined">
                             <CardHeader
                              title={menuType['M']?.menu_category?.S}/>    
                             <CardMedia
                             component='img'
                             height='140'
                             image="https://media.istockphoto.com/id/1081422898/cs/fotografie/pan-sma%C5%BEen%C3%A1-kachna.jpg?s=1024x1024&w=is&k=20&c=oYcNdZBZgn8KP3EmLPhwRmQpcIWn1dhRXOCDYm9zgxU="
                             alt='Menu Type Image'/>
                             <CardActions>
                                 <Button size='small' variant='text' endIcon={<MenuBookIcon/>} onClick={()=>{menTypeClicked(menuType?.M)}}>View Menu</Button>
                             </CardActions>
                         </Card>
                         </Box>
                         </Grid>   
                  ))
                       
                  }       
              </Grid>

            )}

 

    <Dialog
        open={orderOpen}
        onClose={()=>setOrderOpen(false)} 
        aria-labelledby='order-title' 
        aria-describedby='order-description'
        >
        <DialogTitle id='order-title'>Order</DialogTitle>
        <DialogContent>
            <Stack>
            {cart.map((cartItem)=>(
             <Accordion key={cartItem?.menu_item_id?.S} expanded={false}>
                    <AccordionSummary id='order-items' aria-controls='order-items'>
                    <Stack direction='row'>
                        
                        <Typography>{cartItem?.menu_item_name?.S}</Typography>
                      
                    </Stack>
                        
                    </AccordionSummary>
                    <AccordionDetails>
                        
                    </AccordionDetails>
             </Accordion>
                 
        ))
             
        }
            </Stack>
        </DialogContent>
        <DialogActions>
            <Stack direction='row'>
                {/* <Button onClick={()=>editMenu()} autoFocus>Edit Menu</Button> */}
                <Button onClick={()=>setOrderOpen(false)}>Back</Button>
            </Stack>
           
        </DialogActions>
    </Dialog>
    </>
  )
}

export default MenuComponent