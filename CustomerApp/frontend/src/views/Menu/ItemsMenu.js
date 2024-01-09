import React ,{useState, useEffect} from 'react'
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import {Box, Card, Grid, CardContent, Typography, CardActions, Button, CardMedia, CardHeader, Stack, 
    Dialog, DialogTitle, DialogContent, 
    DialogActions,
    DialogContentText,
    TextField, IconButton,
    Accordion, AccordionSummary, CircularProgress, AccordionDetails} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteForeverSharpIcon from '@mui/icons-material/DeleteForeverSharp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useNavigate, useSearchParams  } from 'react-router-dom';
import axios from 'axios';

const ItemsMenu = () => {
    let [typeOfItems, setTypeOfItems] = useState([]);
    let [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    let [itemSelected , selectItem] = useState();
    let [category, setCategory] = useState(''); 
    let [cart, setCart] = useState([]);
    const [open,setOpen] = useState(false);
    const [orderOpen, setOrderOpen] = useState(false)
    let location = useLocation();
    let navigate = useNavigate();
    let reservation_id = location.state.reservation_id ;
    let restaurant_id = location.state.restaurantId;
    const userInfo = JSON.parse(window.localStorage.getItem("user"));
    let customerName = ''
    if (userInfo.displayName) {
        customerName = userInfo.displayName;
      } else {
        customerName = userInfo.email.split("@")[0];
      }
    let restaurant_name = location.state.restaurant_name;

    useEffect(()=>{
      setCategory(location.state.data.menu_category.S)
      setIsLoading(true)
       axios.get("https://jte4w8ro6k.execute-api.us-east-1.amazonaws.com/dev")
       .then((response) => {
        if(response.data.body)
        {
            setIsLoading(false)
             setTypeOfItems([...typeOfItems,location.state.data])    
        }
        else{
            setIsLoading(false)
        
        }
       })
       .catch((error) => {
        setIsLoading(false)
         console.log(error)
         
       })
       if(location.state.cart){
        setCart([])    
        location.state.cart.forEach(element => {  
            setCart(prevData =>[...prevData,element]);
        });  
        
       }
      
              const formattedReqObj1 = {
                body: JSON.stringify({
                    order_id: "124555",
                    user_id: "007",
                    restaurant_id : restaurant_id,
                    reservation_id: reservation_id,
                    order_items: cart
                  }),
              };
               
    },[])
    let addItemToCart = ()=>{
      setOpen(false) 
      setCart([...cart,itemSelected]);
     
    }

    let viewItem=(item)=>{
        setOpen(true);
        selectItem(item)
      
    }

    let backToMenu = ()=>{
        
        navigate(`/menu/${restaurant_id}`, { state: { orders: cart, data: reservation_id,restaurantName: restaurant_name, fromBackClick:true } });
    }
    let viewOrders = ()=>{
        setOrderOpen(true)
    }

    let checkout = ()=>{
       
        setOrderOpen(false)
        
        setIsLoading(true)
        const formattedReqObj = {
            body: JSON.stringify({
                order_id: "124555",
                user_id: "007",
                reservation_id: reservation_id,
                restaurant_id: restaurant_id,
                restaurant_name: restaurant_name,
                customerName: customerName,
                order_items: cart
              }),
          };
        axios.post("https://ai4ux2td24.execute-api.us-east-1.amazonaws.com/dev", JSON.stringify(formattedReqObj))
       .then((response) => {
        if(response.data.body)
        {
         
             setIsLoading(false)
             navigate("/mybookings");
            
        }
        else{
         console.log("Incorrect Details")
        }
       })
       .catch((error) => {
         console.log(error)
         navigate("/mybookings");
         
       })
       
    }

    let removeItem = (itemToRemove)=>{
        const updatedObjects = cart.filter(item => item.menu_item_id.S !== itemToRemove.menu_item_id.S);
        setCart([...updatedObjects]);
    }
  
  return (
    <>

    {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
                <Grid container spacing={5}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} my={2}>
                 <Stack sx={{border:'1px solid #ffffff', color:'#000000'}} spacing={35} direction='row'>
                    <Typography gutterBottom variant='h5' component='div'>{category}</Typography>
                    <Button size='medium' variant='outlined' startIcon={<ArrowBackIcon/>} onClick={()=>backToMenu()}>Menu</Button>
                    <Button size='medium' variant='contained' color='error'startIcon={<ShoppingCartIcon/>} onClick={()=>viewOrders()}>{cart.length}</Button>
                    {/* <IconButton>
                      <ShoppingCartIcon/>
                    </IconButton> */}
                 </Stack>
                </Grid>
                {typeOfItems.map((ItemType)=>(
                       <Grid key={ItemType?.menu_item_id?.S} item  xs={10} sm={5} md={5} lg={5} xl={5}>
                       <Box bgcolor='#ffffff' p={1}>
                       <Card variant="outlined">
                           <CardHeader
                            title={ItemType?.menu_item_name?.S}/>    
                           <CardMedia
                           component='img'
                           height='140'
                           image={ItemType?.img_url?.S}
                           alt='Appetizer Image'/>
                           <CardContent>
                               {/* <Typography gutterBottom variant='h5' component='div'>
                               Appetizers
                               </Typography> */}
                               <Typography variant='body2' color='text.secondary'>
                                {ItemType?.menu_ingredients?.S}
                                {ItemType?.img_url?.S}
               
                               </Typography>
                               <Typography variant='body2' color='text.secondary'>
                                {ItemType?.menu_offer?.S}
               
                               </Typography>
                               <Typography variant='body2' color='text.secondary'>
                                CA${ItemType?.menu_price?.S}
                               </Typography>
                           </CardContent>
                           <CardActions>
                               <Button size='small' variant='text' endIcon={<ShoppingBasketIcon/>} 
                                onClick={()=>viewItem(ItemType)} disabled={!ItemType?.menu_item_availability?.S}>Add Item</Button>
                               {/* <Button size='small' variant='text' endIcon={<MenuBookIcon/>} onClick={()=>{itemTypenClicked(ItemType)}}>View Menu</Button> */}
                           </CardActions>
                       </Card>
                       </Box>
                       </Grid>   
                ))
                     
                }       
                </Grid>
            )}


    <Dialog
        open={open}
        onClose={()=>setOpen(false)} 
        aria-labelledby='item-title' 
        aria-describedby='item-description'
        >
        <DialogTitle id='item-title'>{itemSelected?.menu_item_name?.S}</DialogTitle>
        <DialogContent>
            <DialogContentText id='item-content'>
                <img
                src={itemSelected?.img_url?.S}
                alt='item Img'
                />
        </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Stack direction='row'>
                {/* <Stack direction='row'>
                <IconButton onClick={()=>setQuantity(quantity-1)} disabled={quantity <= 1}>
                    <RemoveIcon  autoFocus />
                </IconButton> 
                <TextField value={quantity} 
                    variant='outlined' 
                    size='small' 
                    color='primary'
                    sx={{width:'50px'}}
                    required 
                    />
                <IconButton onClick={()=>setQuantity(quantity+1)}>
                    <AddIcon />
                </IconButton>    
                </Stack> */}

                <Button onClick={()=>addItemToCart()} autoFocus>Add to Cart</Button>
                <Button onClick={()=>setOpen(false)}>Back</Button>
            </Stack>
           
        </DialogActions>
    </Dialog>

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
                        {/* <img src="test.JPG" alt="Your Description" /> */}
                        <Typography>{cartItem?.menu_item_name?.S}</Typography>
                        <IconButton onClick={()=>{removeItem(cartItem)}}>
                            <DeleteForeverSharpIcon/>
                        </IconButton>   
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
                <Button onClick={()=>checkout()} autoFocus>Checkout</Button>
                <Button onClick={()=>setOrderOpen(false)}>Back</Button>
            </Stack>
           
        </DialogActions>
    </Dialog>




    </>
  )
}

export default ItemsMenu