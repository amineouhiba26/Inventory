import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { productAPI } from '../services/api'

export default function Products() {

    useEffect(() => {
        getProducts();
    }, [])

    const [productData, setProductData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getProducts = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await productAPI.getAll();
            
            if (response.status === 200 && response.data.success) {
                console.log("Data Retrieved.");
                setProductData(response.data.data);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } catch (err) {
            console.error("Error fetching products:", err);
            const errorMessage = err.response?.data?.message || "Failed to fetch products. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    const deleteProduct = async (id) => {
        try {
            const response = await productAPI.delete(id);
            
            if (response.status === 200 && response.data.success) {
                console.log("Product deleted");
                getProducts(); // Refresh the product list
            } else {
                const errorMessage = response.data?.message || "Error deleting product";
                setError(errorMessage);
            }
        } catch (err) {
            console.error("Error deleting product:", err);
            const errorMessage = err.response?.data?.message || "Failed to delete product. Please try again.";
            setError(errorMessage);
        }
    }

    return (
        <>
            <div className='container-fluid p-5'>
                <h1>Products Inventory</h1>
                <div className='add_button'>
                    <NavLink to="/insertproduct" className='btn btn-primary fs-5'> + Add New Product</NavLink>
                </div>
                
                {error && (
                    <div className="alert alert-danger mt-3" role="alert">
                        {error}
                    </div>
                )}
                
                {loading ? (
                    <div className="d-flex justify-content-center mt-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-auto mt-3" style={{ maxHeight: "38rem" }}>
                        <table className="table table-striped table-hover mt-3 fs-5">
                            <thead>
                                <tr className="tr_color">
                                    <th scope="col">#</th>
                                    <th scope="col">Product Name</th>
                                    <th scope="col">Product Price</th>
                                    <th scope="col">Product Barcode</th>
                                    <th scope="col">Update</th>
                                    <th scope="col">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productData.map((element, id) => (
                                    <tr key={element._id}>
                                        <th scope="row">{id + 1}</th>
                                        <td>{element.ProductName}</td>
                                        <td>{element.ProductPrice}</td>
                                        <td>{element.ProductBarcode}</td>
                                        <td>
                                            <NavLink 
                                                to={`/updateproduct/${element._id}`} 
                                                className="btn btn-primary"
                                            >
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </NavLink>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-danger" 
                                                onClick={() => deleteProduct(element._id)}
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}
