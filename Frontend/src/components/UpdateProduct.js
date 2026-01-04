import React, { useEffect, useState } from 'react'
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';

export default function UpdateProduct() {
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState();
    const [productBarcode, setProductBarcode] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate("");

    const setName = (e) => {
        setProductName(e.target.value);
    };
    
    const setPrice = (e) => {
        setProductPrice(e.target.value);
    };
    
    const setBarcode = (e) => {
        const value = e.target.value.slice(0, 12);
        setProductBarcode(value);
    };

    const {id} = useParams("");

    useEffect(() => {
        const getProduct = async () => {
            try {
                const response = await productAPI.getById(id);
                
                if (response.status === 200 && response.data.success) {
                    console.log("Data Retrieved.");
                    const product = response.data.data;
                    setProductName(product.ProductName);
                    setProductPrice(product.ProductPrice);
                    setProductBarcode(product.ProductBarcode);
                } else {
                    const errorMessage = response.data?.message || "Something went wrong. Please try again.";
                    setError(errorMessage);
                }
            } catch (err) {
                console.error("Error fetching product:", err);
                const errorMessage = err.response?.data?.message || "Failed to fetch product details.";
                setError(errorMessage);
            }
        };
        
        if (id) {
            getProduct();
        }
    }, [id]);

    const updateProduct = async (e) => {
        e.preventDefault();

        if (!productName || !productPrice || !productBarcode) {
            setError("*Please fill in all the required fields.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const productData = {
                ProductName: productName,
                ProductPrice: productPrice,
                ProductBarcode: productBarcode
            };
            
            const response = await productAPI.update(id, productData);

            if (response.status === 200 && response.data.success) {
                alert("Data Updated");
                navigate('/products');
            } else {
                const errorMessage = response.data?.message || "Something went wrong. Please try again.";
                setError(errorMessage);
            }
        } catch (err) {
            console.error("Error updating product:", err);
            if (err.response?.status === 422) {
                const errorMessage = err.response.data?.message || "Another product already has this barcode.";
                setError(errorMessage);
            } else if (err.response?.status === 400) {
                const errorMessage = err.response.data?.message || "Please fill in all required fields.";
                setError(errorMessage);
            } else if (err.response?.status === 404) {
                setError("Product not found.");
            } else {
                setError("An error occurred. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='container-fluid p-5'>
            <h1 className=''>Enter Product Information</h1>
            <div className="mt-5 col-lg-6 col-md-6 col-12">
                <label htmlFor="product_name" className="form-label fs-4 fw-bold">Product Name</label>
                <input type="text" onChange={setName} value={productName} className="form-control fs-5" id="product_name" placeholder="Enter Product Name" required />
            </div>
            <div className="mt-3 col-lg-6 col-md-6 col-12">
                <label htmlFor="product_price" className="form-label fs-4 fw-bold">Product Price</label>
                <input type="number" onChange={setPrice} value={productPrice} className="form-control fs-5" id="product_price" placeholder="Enter Product Price" required />
            </div>
            <div className="mt-3 mb-5 col-lg-6 col-md-6 col-12">
                <label htmlFor="product_barcode" className="form-label fs-4 fw-bold">Product Barcode</label>
                <input type="number" onChange={setBarcode} value={productBarcode} maxLength={12} className="form-control fs-5" id="product_barcode" placeholder="Enter Product Barcode" required />
            </div>
            <div className='d-flex justify-content-center col-lg-6 col-md-6'>
                <NavLink to="/products" className='btn btn-primary me-5 fs-4'>Cancel</NavLink>
                <button type="submit" onClick={updateProduct} className="btn btn-primary fs-4" disabled={loading}>{loading ? 'Updating...' : 'Update'}</button>
            </div>
            <div className="col text-center col-lg-6 ">
                {error && <div className="text-danger mt-3 fs-5 fw-bold">{error}</div>}
            </div>
        </div>
    )
}
