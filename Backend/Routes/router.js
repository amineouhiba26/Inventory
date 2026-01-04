const express = require('express');
const router = express.Router();
const products = require('../Models/Products');

// Helper function for structured logging
const logInfo = (message, data = null) => {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

const logError = (message, error) => {
    console.error(`[ERROR] ${message}`, error);
};

//Inserting(Creating) Data:
router.post("/insertproduct", async (req, res) => {
    const { ProductName, ProductPrice, ProductBarcode } = req.body;

    try {
        // Input validation
        if (!ProductName || !ProductPrice || !ProductBarcode) {
            return res.status(400).json({
                success: false,
                message: "All fields are required: ProductName, ProductPrice, ProductBarcode"
            });
        }

        const pre = await products.findOne({ ProductBarcode: ProductBarcode });
        
        if (pre) {
            logInfo(`Product creation failed - duplicate barcode: ${ProductBarcode}`);
            return res.status(422).json({
                success: false,
                message: "Product is already added with this barcode."
            });
        }

        const addProduct = new products({ ProductName, ProductPrice, ProductBarcode });
        await addProduct.save();
        
        logInfo(`Product created successfully: ${ProductName}`);
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: addProduct
        });
    }
    catch (err) {
        logError("Error creating product", err);
        res.status(500).json({
            success: false,
            message: "Internal server error while creating product"
        });
    }
})

//Getting(Reading) Data:
router.get('/products', async (req, res) => {
    try {
        const getProducts = await products.find({});
        logInfo(`Retrieved ${getProducts.length} products`);
        
        res.status(200).json({
            success: true,
            count: getProducts.length,
            data: getProducts
        });
    }
    catch (err) {
        logError("Error fetching products", err);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching products"
        });
    }
})

//Getting(Reading) individual Data:
router.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        const getProduct = await products.findById(id);
        
        if (!getProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        logInfo(`Retrieved product: ${getProduct.ProductName}`);
        res.status(200).json({
            success: true,
            data: getProduct
        });
    }
    catch (err) {
        logError("Error fetching product", err);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching product"
        });
    }
})

//Editing(Updating) Data:
router.put('/updateproduct/:id', async (req, res) => {
    const { ProductName, ProductPrice, ProductBarcode } = req.body;
    const { id } = req.params;

    try {
        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        // Input validation
        if (!ProductName || !ProductPrice || !ProductBarcode) {
            return res.status(400).json({
                success: false,
                message: "All fields are required: ProductName, ProductPrice, ProductBarcode"
            });
        }

        // Check if another product has the same barcode (excluding current product)
        const existingProduct = await products.findOne({ 
            ProductBarcode: ProductBarcode,
            _id: { $ne: id }
        });
        
        if (existingProduct) {
            return res.status(422).json({
                success: false,
                message: "Another product already has this barcode"
            });
        }

        const updateProducts = await products.findByIdAndUpdate(
            id, 
            { ProductName, ProductPrice, ProductBarcode }, 
            { new: true }
        );
        
        if (!updateProducts) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        logInfo(`Product updated successfully: ${ProductName}`);
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updateProducts
        });
    }
    catch (err) {
        logError("Error updating product", err);
        res.status(500).json({
            success: false,
            message: "Internal server error while updating product"
        });
    }
})

//Deleting Data:
router.delete('/deleteproduct/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        const deleteProduct = await products.findByIdAndDelete(id);
        
        if (!deleteProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        logInfo(`Product deleted successfully: ${deleteProduct.ProductName}`);
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: deleteProduct
        });
    }
    catch (err) {
        logError("Error deleting product", err);
        res.status(500).json({
            success: false,
            message: "Internal server error while deleting product"
        });
    }
})

module.exports = router;