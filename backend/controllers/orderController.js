const Order = require('../model/Order');
const sendEmail = require('../utils/sendEmail');

// Create new order
const createOrder = async (req, res) =>{
    try{
        const { items, totalAmount, address, paymentId } = req.body;
        if (!items || items.length===0 || !totalAmount || !address){
            return res.status(400).json({ message: 'No order items' });
        }else {
        const order = new Order({
            user: req.user._id,
            items,
            totalAmount,
            address,
            paymentId
        });
        const createdOrder = await order.save();
        
        const message = "corder ";
        await sendEmail(req.user.email,'Order Confermation',message);
        res.status(201).json({message:'Order created successfully', order});
        }
    }catch(error){
        res.status(500).json({message:'Error creating order', error});
    }
};


const getMyOrders = async (req, res)=>{
    try {
        const orders = await Order.find({ userId: req.user._id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { 
    createOrder, 
    getMyOrders, 
    getOrders, 
    updateOrderStatus
};